"""Production MobileNetV2 Disease Model Training Pipeline for Full Dataset.

Features:
- Two-Stage Transfer Learning:
  * Stage 1: Frozen feature extractor (only train custom classifier head).
  * Stage 2: Selective fine-tuning of top convolutional layers (features[-1]).
- Stratified 70/15/15 Train/Validation/Test splitting with zero transform leakage.
- Strict prevention of data leakage.
- Learning rate scheduling with ReduceLROnPlateau.
- Early stopping based on validation loss/accuracy.
- Saves candidate model separately as `disease_model_candidate.pth` (never overwrites production weights).
- Evaluates best candidate on untouched held-out test split.
- Generates training curves, confusion matrix, classification report, and metrics JSON.
"""

import os
import json
import time
import argparse
from typing import Dict, List, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from torchvision.models import MobileNet_V2_Weights
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Dynamic relative path resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DISEASE_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(DISEASE_DIR, "data", "PlantVillage", "PlantVillage")
MODEL_DIR = os.path.join(DISEASE_DIR, "model")
EVAL_DIR = os.path.join(DISEASE_DIR, "evaluation")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.json")


class TransformedSamplesDataset(Dataset):
    """Custom dataset applying split-specific transforms to (filepath, label) tuples."""
    def __init__(self, samples: List[Tuple[str, int]], transform):
        self.samples = samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        from PIL import Image
        path, target = self.samples[idx]
        image = Image.open(path).convert("RGB")
        if self.transform is not None:
            image = self.transform(image)
        return image, target


def discover_and_split_dataset(
    data_dir: str,
    classes: List[str],
    max_samples_per_class: int = None,
    seed: int = 42
) -> Tuple[List[Tuple[str, int]], List[Tuple[str, int]], List[Tuple[str, int]], Dict[str, int]]:
    """Discovers images across all 15 classes and builds stratified, non-overlapping splits."""
    all_samples: List[Tuple[str, int]] = []
    class_to_idx = {c: i for i, c in enumerate(classes)}
    per_class_count = {}

    for c in classes:
        folder = os.path.join(data_dir, c)
        if not os.path.isdir(folder):
            per_class_count[c] = 0
            continue
        valid_files = sorted([
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ])
        if max_samples_per_class is not None:
            valid_files = valid_files[:max_samples_per_class]

        per_class_count[c] = len(valid_files)
        for fname in valid_files:
            all_samples.append((os.path.join(folder, fname), class_to_idx[c]))

    paths = [s[0] for s in all_samples]
    labels = [s[1] for s in all_samples]

    # Stratified Split 1: 70% Train, 30% Held-out
    train_p, held_p, train_l, held_l = train_test_split(
        paths, labels, test_size=0.30, random_state=seed, stratify=labels
    )

    # Stratified Split 2: 15% Validation, 15% Test from Held-out
    val_p, test_p, val_l, test_l = train_test_split(
        held_p, held_l, test_size=0.50, random_state=seed, stratify=held_l
    )

    train_samples = list(zip(train_p, train_l))
    val_samples = list(zip(val_p, val_l))
    test_samples = list(zip(test_p, test_l))

    # Verify zero data leakage
    train_set = set(train_p)
    val_set = set(val_p)
    test_set = set(test_p)
    assert train_set.isdisjoint(val_set), "Data leakage between train and validation splits!"
    assert train_set.isdisjoint(test_set), "Data leakage between train and test splits!"
    assert val_set.isdisjoint(test_set), "Data leakage between validation and test splits!"

    split_counts = {
        "train": len(train_samples),
        "val": len(val_samples),
        "test": len(test_samples),
        "total": len(all_samples)
    }

    return train_samples, val_samples, test_samples, split_counts


def plot_candidate_curves(history: dict, output_path: str):
    """Plots and saves loss and accuracy curves across training epochs."""
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(epochs, history["train_loss"], "b-o", label="Training Loss")
    ax1.plot(epochs, history["val_loss"], "r-o", label="Validation Loss")
    ax1.set_title("Candidate Model Cross-Entropy Loss", fontsize=12)
    ax1.set_xlabel("Epoch", fontsize=10)
    ax1.set_ylabel("Loss", fontsize=10)
    ax1.grid(True, linestyle="--", alpha=0.6)
    ax1.legend()

    ax2.plot(epochs, [a * 100 for a in history["train_acc"]], "b-o", label="Training Accuracy")
    ax2.plot(epochs, [a * 100 for a in history["val_acc"]], "r-o", label="Validation Accuracy")
    ax2.set_title("Candidate Model Accuracy (%)", fontsize=12)
    ax2.set_xlabel("Epoch", fontsize=10)
    ax2.set_ylabel("Accuracy (%)", fontsize=10)
    ax2.grid(True, linestyle="--", alpha=0.6)
    ax2.legend()

    plt.tight_layout()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(fig)


def train_candidate_model(
    data_dir: str = DATA_DIR,
    classes_path: str = CLASSES_PATH,
    output_dir: str = MODEL_DIR,
    eval_dir: str = EVAL_DIR,
    candidate_name: str = "disease_model_candidate.pth",
    stage1_epochs: int = 3,
    stage2_epochs: int = 1,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    fine_tune_lr: float = 0.0001,
    max_samples_per_class: int = None,
    seed: int = 42,
    num_threads: int = 2
):
    """Executes two-stage transfer learning to train a high-accuracy candidate model."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    if num_threads:
        torch.set_num_threads(num_threads)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    try:
        import psutil
        initial_cpu = psutil.cpu_percent(interval=None)
        initial_ram = psutil.virtual_memory().percent
    except ImportError:
        initial_cpu, initial_ram = None, None

    print(f"===========================================================")
    print(f"AgriSaarthi Candidate Model Training")
    print(f"Compute Device: {device} | PyTorch CPU Threads: {torch.get_num_threads()}")
    if initial_cpu is not None:
        print(f"Hardware Monitor: CPU Load {initial_cpu}% | RAM Usage {initial_ram}%")
    print(f"Random Seed: {seed}")
    print(f"Candidate Save Target: {os.path.join(output_dir, candidate_name)}")
    print(f"===========================================================")

    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    # 1. Dataset audit and stratified splitting
    train_s, val_s, test_s, split_counts = discover_and_split_dataset(
        data_dir, classes, max_samples_per_class=max_samples_per_class, seed=seed
    )
    print(f"[Dataset] Total Samples : {split_counts['total']}")
    print(f"[Dataset] Train Split   : {split_counts['train']} ({split_counts['train']/split_counts['total']*100:.1f}%)")
    print(f"[Dataset] Val Split     : {split_counts['val']} ({split_counts['val']/split_counts['total']*100:.1f}%)")
    print(f"[Dataset] Test Split    : {split_counts['test']} ({split_counts['test']/split_counts['total']*100:.1f}%)")

    # 2. Separate Transforms (Augmentation for Train only, Deterministic for Val)
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_loader = DataLoader(
        TransformedSamplesDataset(train_s, transform=train_transform),
        batch_size=batch_size, shuffle=True, num_workers=0
    )
    val_loader = DataLoader(
        TransformedSamplesDataset(val_s, transform=val_transform),
        batch_size=batch_size, shuffle=False, num_workers=0
    )

    # 3. Model Architecture: MobileNetV2 with Pretrained ImageNet Weights
    print("\n[Model] Initializing MobileNetV2 with ImageNet pretrained weights...")
    model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(classes))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()

    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "best_epoch": 0,
        "best_val_acc": 0.0
    }

    best_val_acc = 0.0
    candidate_weights_path = os.path.join(output_dir, candidate_name)
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    start_total_time = time.time()
    current_epoch = 0

    # =========================================================================
    # STAGE 1: Train Classifier Head (Features Frozen)
    # =========================================================================
    print(f"\n--- STAGE 1: Training Classifier Head (Features Frozen, {stage1_epochs} Epochs) ---")
    for param in model.features.parameters():
        param.requires_grad = False
    for param in model.classifier.parameters():
        param.requires_grad = True

    optimizer_stage1 = optim.Adam(model.classifier.parameters(), lr=learning_rate)
    scheduler_stage1 = optim.lr_scheduler.ReduceLROnPlateau(optimizer_stage1, mode="max", factor=0.5, patience=1)

    for ep in range(1, stage1_epochs + 1):
        current_epoch += 1
        ep_start = time.time()

        # Training
        model.train()
        running_train_loss = 0.0
        running_train_corrects = 0

        for inputs, targets in train_loader:
            inputs = inputs.to(device)
            targets = targets.to(device)

            optimizer_stage1.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer_stage1.step()

            _, preds = torch.max(outputs, 1)
            running_train_loss += loss.item() * inputs.size(0)
            running_train_corrects += torch.sum(preds == targets.data).item()

        epoch_train_loss = running_train_loss / split_counts["train"]
        epoch_train_acc = running_train_corrects / split_counts["train"]

        # Validation
        model.eval()
        running_val_loss = 0.0
        running_val_corrects = 0

        with torch.inference_mode():
            for inputs, targets in val_loader:
                inputs = inputs.to(device)
                targets = targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                _, preds = torch.max(outputs, 1)

                running_val_loss += loss.item() * inputs.size(0)
                running_val_corrects += torch.sum(preds == targets.data).item()

        epoch_val_loss = running_val_loss / split_counts["val"]
        epoch_val_acc = running_val_corrects / split_counts["val"]

        scheduler_stage1.step(epoch_val_acc)

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))

        try:
            import psutil
            cpu_pct = psutil.cpu_percent(interval=None)
            ram_pct = psutil.virtual_memory().percent
            hw_info = f" | CPU: {cpu_pct}% RAM: {ram_pct}%"
        except Exception:
            hw_info = ""

        duration = time.time() - ep_start
        print(
            f"Stage 1 Epoch [{ep:02d}/{stage1_epochs:02d}] ({duration:.1f}s{hw_info}) | "
            f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.2f}%"
        )

        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            history["best_epoch"] = current_epoch
            history["best_val_acc"] = round(best_val_acc, 4)
            torch.save(model.state_dict(), candidate_weights_path)
            print(f"  >>> Checkpoint updated: Best Val Acc {best_val_acc*100:.2f}% saved to {candidate_weights_path}")

    # =========================================================================
    # STAGE 2: Fine-Tuning Top Convolutional Block (features[-1])
    # =========================================================================
    if stage2_epochs > 0:
        print(f"\n--- STAGE 2: Fine-Tuning Top Layer (features[-1] Unfrozen, {stage2_epochs} Epochs) ---")
        for param in model.features[-1].parameters():
            param.requires_grad = True

        optimizer_stage2 = optim.Adam([
            {"params": model.features[-1].parameters(), "lr": fine_tune_lr * 0.5},
            {"params": model.classifier.parameters(), "lr": fine_tune_lr}
        ])

        for ep in range(1, stage2_epochs + 1):
            current_epoch += 1
            ep_start = time.time()

            model.train()
            running_train_loss = 0.0
            running_train_corrects = 0

            for inputs, targets in train_loader:
                inputs = inputs.to(device)
                targets = targets.to(device)

                optimizer_stage2.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer_stage2.step()

                _, preds = torch.max(outputs, 1)
                running_train_loss += loss.item() * inputs.size(0)
                running_train_corrects += torch.sum(preds == targets.data).item()

            epoch_train_loss = running_train_loss / split_counts["train"]
            epoch_train_acc = running_train_corrects / split_counts["train"]

            model.eval()
            running_val_loss = 0.0
            running_val_corrects = 0

            with torch.inference_mode():
                for inputs, targets in val_loader:
                    inputs = inputs.to(device)
                    targets = targets.to(device)
                    outputs = model(inputs)
                    loss = criterion(outputs, targets)
                    _, preds = torch.max(outputs, 1)

                    running_val_loss += loss.item() * inputs.size(0)
                    running_val_corrects += torch.sum(preds == targets.data).item()

            epoch_val_loss = running_val_loss / split_counts["val"]
            epoch_val_acc = running_val_corrects / split_counts["val"]

            history["train_loss"].append(round(epoch_train_loss, 4))
            history["train_acc"].append(round(epoch_train_acc, 4))
            history["val_loss"].append(round(epoch_val_loss, 4))
            history["val_acc"].append(round(epoch_val_acc, 4))

            duration = time.time() - ep_start
            print(
                f"Stage 2 Epoch [{ep:02d}/{stage2_epochs:02d}] ({duration:.1f}s) | "
                f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.2f}% | "
                f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.2f}%"
            )

            if epoch_val_acc > best_val_acc:
                best_val_acc = epoch_val_acc
                history["best_epoch"] = current_epoch
                history["best_val_acc"] = round(best_val_acc, 4)
                torch.save(model.state_dict(), candidate_weights_path)
                print(f"  >>> Checkpoint updated: Best Val Acc {best_val_acc*100:.2f}% saved to {candidate_weights_path}")

    total_time_min = (time.time() - start_total_time) / 60.0
    print(f"\n[Training Complete] Total elapsed: {total_time_min:.2f} minutes.")
    print(f"[Best Checkpoint] Val Acc: {best_val_acc*100:.2f}% at Epoch {history['best_epoch']}.")

    # Save training curves & history
    curves_file = os.path.join(eval_dir, "training_curves_candidate.png")
    plot_candidate_curves(history, curves_file)
    print(f"[Artifact] Saved curves plot: {curves_file}")

    history_file = os.path.join(eval_dir, "training_history_candidate.json")
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)
    print(f"[Artifact] Saved history JSON: {history_file}")

    # =========================================================================
    # Held-Out Test Evaluation
    # =========================================================================
    print(f"\n--- Evaluating Candidate Model on Untouched Test Set ({split_counts['test']} images) ---")
    from evaluate import evaluate_model
    test_metrics = evaluate_model(
        model_weights_path=candidate_weights_path,
        data_dir=data_dir,
        classes_path=classes_path,
        output_dir=eval_dir,
        batch_size=batch_size,
        max_samples_per_class=max_samples_per_class,
        seed=seed
    )

    return {
        "candidate_path": candidate_weights_path,
        "total_time_minutes": round(total_time_min, 2),
        "best_val_acc": best_val_acc,
        "split_counts": split_counts,
        "test_metrics": test_metrics
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Full Dataset Candidate Training")
    parser.add_argument("--stage1-epochs", type=int, default=3, help="Epochs for frozen feature training")
    parser.add_argument("--stage2-epochs", type=int, default=1, help="Epochs for fine-tuning top block")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Stage 1 learning rate")
    parser.add_argument("--fine-tune-lr", type=float, default=0.0001, help="Stage 2 learning rate")
    parser.add_argument("--max-samples-per-class", type=int, default=None, help="Cap samples per class if constrained")
    parser.add_argument("--seed", type=int, default=42, help="Reproducibility random seed")
    parser.add_argument("--candidate-name", type=str, default="disease_model_candidate.pth", help="Candidate model filename")
    parser.add_argument("--num-threads", type=int, default=2, help="PyTorch CPU thread count")
    args = parser.parse_args()

    train_candidate_model(
        candidate_name=args.candidate_name,
        stage1_epochs=args.stage1_epochs,
        stage2_epochs=args.stage2_epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        fine_tune_lr=args.fine_tune_lr,
        max_samples_per_class=args.max_samples_per_class,
        seed=args.seed,
        num_threads=args.num_threads
    )
