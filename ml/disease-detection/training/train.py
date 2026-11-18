"""Production training pipeline for MobileNetV2 Plant Disease Detection.

Features:
- Relative project path resolution.
- Strict prevention of transform leakage between train, val, and test splits.
- Stratified splitting (70% train, 15% validation, 15% test) with reproducible seed.
- Transfer learning with MobileNetV2 and data augmentation.
- Epoch-wise validation tracking and best-checkpoint saving.
- Training curves plotting (loss and accuracy) and history JSON logging.
- Does not overwrite production model weights unless explicitly configured.
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
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Dynamic relative paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DISEASE_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(DISEASE_DIR, "data", "PlantVillage", "PlantVillage")
MODEL_DIR = os.path.join(DISEASE_DIR, "model")
EVAL_DIR = os.path.join(DISEASE_DIR, "evaluation")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.json")


class TransformedSamplesDataset(Dataset):
    """Custom dataset that applies distinct transforms per split without mutating parent dataset."""
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


def collect_dataset_samples(
    data_dir: str,
    classes: List[str],
    max_samples_per_class: int = None
) -> Tuple[List[Tuple[str, int]], Dict[str, int]]:
    """Discovers all valid image samples organized by alphabetical class labels."""
    samples = []
    class_to_idx = {c: i for i, c in enumerate(classes)}
    distribution = {}

    for c in classes:
        folder = os.path.join(data_dir, c)
        if not os.path.isdir(folder):
            distribution[c] = 0
            continue
        valid_files = sorted([
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ])
        if max_samples_per_class is not None:
            valid_files = valid_files[:max_samples_per_class]

        distribution[c] = len(valid_files)
        for fname in valid_files:
            samples.append((os.path.join(folder, fname), class_to_idx[c]))

    return samples, distribution


def prepare_data_loaders(
    samples: List[Tuple[str, int]],
    batch_size: int = 32,
    seed: int = 42
) -> Tuple[DataLoader, DataLoader, DataLoader, Dict[str, int]]:
    """Splits samples into Train (70%), Validation (15%), and Test (15%) with stratification."""
    paths = [s[0] for s in samples]
    labels = [s[1] for s in samples]

    # Split 1: 70% Train, 30% Held-out
    train_p, held_p, train_l, held_l = train_test_split(
        paths, labels, test_size=0.30, random_state=seed, stratify=labels
    )

    # Split 2: 15% Validation, 15% Test from Held-out
    val_p, test_p, val_l, test_l = train_test_split(
        held_p, held_l, test_size=0.50, random_state=seed, stratify=held_l
    )

    split_counts = {
        "train": len(train_p),
        "validation": len(val_p),
        "test": len(test_p),
        "total": len(samples)
    }

    # Distinct data augmentation for training
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Deterministic validation and test transforms
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_dataset = TransformedSamplesDataset(list(zip(train_p, train_l)), transform=train_transform)
    val_dataset = TransformedSamplesDataset(list(zip(val_p, val_l)), transform=val_transform)
    test_dataset = TransformedSamplesDataset(list(zip(test_p, test_l)), transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    return train_loader, val_loader, test_loader, split_counts


def plot_training_curves(history: dict, output_path: str):
    """Plots and saves epoch-wise training and validation curves."""
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Loss curve
    ax1.plot(epochs, history["train_loss"], "b-o", label="Training Loss")
    ax1.plot(epochs, history["val_loss"], "r-o", label="Validation Loss")
    ax1.set_title("Cross-Entropy Loss vs. Epochs", fontsize=12)
    ax1.set_xlabel("Epoch", fontsize=10)
    ax1.set_ylabel("Loss", fontsize=10)
    ax1.grid(True, linestyle="--", alpha=0.6)
    ax1.legend()

    # Accuracy curve
    ax2.plot(epochs, [a * 100 for a in history["train_acc"]], "b-o", label="Training Accuracy")
    ax2.plot(epochs, [a * 100 for a in history["val_acc"]], "r-o", label="Validation Accuracy")
    ax2.set_title("Accuracy vs. Epochs (%)", fontsize=12)
    ax2.set_xlabel("Epoch", fontsize=10)
    ax2.set_ylabel("Accuracy (%)", fontsize=10)
    ax2.grid(True, linestyle="--", alpha=0.6)
    ax2.legend()

    plt.tight_layout()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(fig)


def train_pipeline(
    data_dir: str = DATA_DIR,
    classes_path: str = CLASSES_PATH,
    output_dir: str = MODEL_DIR,
    eval_dir: str = EVAL_DIR,
    checkpoint_name: str = "checkpoint_best.pth",
    num_epochs: int = 5,
    batch_size: int = 32,
    learning_rate: float = 0.0003,
    max_samples_per_class: int = None,
    seed: int = 42,
    run_eval_after: bool = True
):
    """Executes the full reproducible MobileNetV2 training and evaluation pipeline."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    print(f"===========================================================")
    print(f"MobileNetV2 Plant Disease Training Pipeline")
    print(f"Device: {device}")
    print(f"Seed: {seed}")
    print(f"Epochs: {num_epochs} | Batch Size: {batch_size} | LR: {learning_rate}")
    print(f"===========================================================")

    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"PlantVillage dataset not found at {data_dir}")

    # Load classes
    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)
    print(f"Detected {len(classes)} target classes from {classes_path}")

    # Discover and split samples
    samples, class_dist = collect_dataset_samples(data_dir, classes, max_samples_per_class)
    print(f"Total samples collected: {len(samples)}")
    train_loader, val_loader, test_loader, split_counts = prepare_data_loaders(
        samples, batch_size=batch_size, seed=seed
    )
    print(f"Split sizes: Train={split_counts['train']}, Val={split_counts['validation']}, Test={split_counts['test']}")

    # Build model using transfer learning with pre-trained weights if available, otherwise initialized
    try:
        from torchvision.models import MobileNet_V2_Weights
        model = models.mobilenet_v2(weights=MobileNet_V2_Weights.DEFAULT)
        print("Initialized MobileNetV2 with ImageNet pretrained weights.")
    except Exception:
        model = models.mobilenet_v2(weights=None)
        print("Initialized MobileNetV2 architecture.")

    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(classes))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "best_epoch": 0,
        "best_val_acc": 0.0
    }

    best_val_acc = 0.0
    best_weights_path = os.path.join(output_dir, checkpoint_name)
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    start_time = time.time()

    for epoch in range(1, num_epochs + 1):
        epoch_start = time.time()

        # Training Phase
        model.train()
        running_train_loss = 0.0
        running_train_corrects = 0

        for inputs, labels in train_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            _, preds = torch.max(outputs, 1)
            running_train_loss += loss.item() * inputs.size(0)
            running_train_corrects += torch.sum(preds == labels.data).item()

        epoch_train_loss = running_train_loss / split_counts["train"]
        epoch_train_acc = running_train_corrects / split_counts["train"]

        # Validation Phase
        model.eval()
        running_val_loss = 0.0
        running_val_corrects = 0

        with torch.inference_mode():
            for inputs, labels in val_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                running_val_loss += loss.item() * inputs.size(0)
                running_val_corrects += torch.sum(preds == labels.data).item()

        epoch_val_loss = running_val_loss / split_counts["validation"]
        epoch_val_acc = running_val_corrects / split_counts["validation"]

        scheduler.step(epoch_val_acc)

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))

        epoch_duration = time.time() - epoch_start
        print(
            f"Epoch [{epoch:02d}/{num_epochs:02d}] ({epoch_duration:.1f}s) | "
            f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.2f}%"
        )

        # Checkpoint if best validation accuracy achieved
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            history["best_epoch"] = epoch
            history["best_val_acc"] = round(best_val_acc, 4)
            torch.save(model.state_dict(), best_weights_path)
            print(f"  >>> Checkpoint saved: New best val acc {best_val_acc*100:.2f}% to {best_weights_path}")

    total_duration = time.time() - start_time
    print(f"\nTraining completed in {total_duration/60:.2f} minutes.")
    print(f"Best Validation Accuracy: {best_val_acc*100:.2f}% (Epoch {history['best_epoch']})")

    # Save training curves and history JSON
    curves_path = os.path.join(eval_dir, "training_curves.png")
    plot_training_curves(history, curves_path)
    print(f"Training curves saved to: {curves_path}")

    history_json_path = os.path.join(eval_dir, "training_history.json")
    with open(history_json_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)
    print(f"Training history saved to: {history_json_path}")

    # Evaluate best checkpoint on held-out test set if requested
    if run_eval_after and os.path.exists(best_weights_path):
        print("\n--- Evaluating Best Checkpoint on Test Set ---")
        from evaluate import evaluate_model
        evaluate_model(
            model_weights_path=best_weights_path,
            data_dir=data_dir,
            classes_path=classes_path,
            output_dir=eval_dir,
            batch_size=batch_size,
            max_samples_per_class=max_samples_per_class,
            seed=seed
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train MobileNetV2 on PlantVillage Dataset")
    parser.add_argument("--epochs", type=int, default=2, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.0003, help="Learning rate")
    parser.add_argument("--max-samples-per-class", type=int, default=None, help="Cap samples per class for quick testing")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--checkpoint-name", type=str, default="checkpoint_best.pth", help="Checkpoint filename (not disease_model.pth)")
    parser.add_argument("--no-eval", action="store_true", help="Skip evaluation after training")
    args = parser.parse_args()

    train_pipeline(
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        max_samples_per_class=args.max_samples_per_class,
        seed=args.seed,
        checkpoint_name=args.checkpoint_name,
        run_eval_after=not args.no_eval
    )
