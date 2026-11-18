"""Evaluation script for MobileNetV2 plant disease detection models.

Computes comprehensive classification metrics:
- Overall Accuracy
- Macro and Weighted Precision, Recall, and F1-score
- Detailed per-class classification report
- Confusion matrix (saved as PNG plot and JSON data)
"""

import os
import json
import argparse
from typing import Dict, List, Tuple
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, models, transforms
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix
)
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Resolve paths relative to project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DISEASE_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(DISEASE_DIR, "data", "PlantVillage", "PlantVillage")
MODEL_DIR = os.path.join(DISEASE_DIR, "model")
EVAL_DIR = os.path.join(DISEASE_DIR, "evaluation")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.json")
DEFAULT_WEIGHTS = os.path.join(MODEL_DIR, "disease_model.pth")


class TransformedDataset(Dataset):
    """Wraps a list of (image, label) pairs with a custom transform pipeline."""
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


def get_test_split(
    data_dir: str,
    classes: List[str],
    seed: int = 42,
    test_ratio: float = 0.15,
    max_samples_per_class: int = None
) -> Tuple[List[Tuple[str, int]], Dict[str, int]]:
    """Generates a reproducible held-out test split identical to training pipeline."""
    all_samples: List[Tuple[str, int]] = []
    class_to_idx = {c: i for i, c in enumerate(classes)}

    for class_name in classes:
        folder = os.path.join(data_dir, class_name)
        if not os.path.isdir(folder):
            continue
        filenames = sorted([
            f for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ])
        if max_samples_per_class:
            filenames = filenames[:max_samples_per_class]

        for fname in filenames:
            all_samples.append((os.path.join(folder, fname), class_to_idx[class_name]))

    paths = [s[0] for s in all_samples]
    labels = [s[1] for s in all_samples]

    # Split: Train (70%), Val (15%), Test (15%)
    # First: Train (70%) vs Held-out (30%)
    _, test_paths, _, test_labels = train_test_split(
        paths, labels, test_size=0.30, random_state=seed, stratify=labels
    )
    # Second: Val (15%) vs Test (15%) from held-out
    _, final_test_paths, _, final_test_labels = train_test_split(
        test_paths, test_labels, test_size=0.50, random_state=seed, stratify=test_labels
    )

    test_samples = list(zip(final_test_paths, final_test_labels))
    class_dist = {c: 0 for c in classes}
    for _, lbl in test_samples:
        class_dist[classes[lbl]] += 1

    return test_samples, class_dist


def evaluate_model(
    model_weights_path: str,
    data_dir: str = DATA_DIR,
    classes_path: str = CLASSES_PATH,
    output_dir: str = EVAL_DIR,
    batch_size: int = 32,
    max_samples_per_class: int = None,
    seed: int = 42,
    prefix: str = "",
    manifest_path: str = None
) -> dict:
    """Evaluates MobileNetV2 checkpoint on held-out test split."""
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"[Evaluation] Device: {device}")
    print(f"[Evaluation] Loading weights from: {model_weights_path}")

    with open(classes_path, "r", encoding="utf-8") as f:
        classes = json.load(f)

    # Reconstruct MobileNetV2 architecture matching checkpoint
    model = models.mobilenet_v2(weights=None)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(classes))

    state_dict = torch.load(model_weights_path, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    # Prepare held-out test dataset with deterministic validation transform
    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    if manifest_path and os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as mf:
            mdata = json.load(mf)
        base_data_dir = os.path.join(DISEASE_DIR, "data")
        test_samples = []
        test_dist = {c: 0 for c in classes}
        for item in mdata["test_samples"]:
            c_name = item["class_name"]
            if max_samples_per_class and test_dist[c_name] >= max_samples_per_class:
                continue
            full_p = os.path.join(base_data_dir, item["rel_path"])
            test_samples.append((full_p, item["label"]))
            test_dist[c_name] += 1
    else:
        test_samples, test_dist = get_test_split(
            data_dir, classes, seed=seed, max_samples_per_class=max_samples_per_class
        )
    print(f"[Evaluation] Test split size: {len(test_samples)} images across {len(classes)} classes")

    test_dataset = TransformedDataset(test_samples, transform=eval_transform)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    all_preds = []
    all_targets = []
    all_probs = []

    print("[Evaluation] Running inference over test set...")
    with torch.inference_mode():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=1)
            preds = torch.argmax(probs, dim=1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_targets.extend(labels.numpy().tolist())
            all_probs.extend(probs.cpu().numpy().tolist())

    y_true = np.array(all_targets)
    y_pred = np.array(all_preds)

    # Calculate metrics
    acc = accuracy_score(y_true, y_pred)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    
    report_dict = classification_report(y_true, y_pred, target_names=classes, output_dict=True, zero_division=0)
    report_text = classification_report(y_true, y_pred, target_names=classes, zero_division=0)
    conf_mat = confusion_matrix(y_true, y_pred, labels=list(range(len(classes))))

    os.makedirs(output_dir, exist_ok=True)

    # 1. Save Confusion Matrix Plot
    cm_name = f"{prefix}confusion_matrix.png" if prefix else "confusion_matrix.png"
    cm_plot_path = os.path.join(output_dir, cm_name)
    fig, ax = plt.subplots(figsize=(12, 10))
    im = ax.imshow(conf_mat, interpolation="nearest", cmap="Blues")
    ax.figure.colorbar(im, ax=ax)
    ax.set(
        xticks=np.arange(conf_mat.shape[1]),
        yticks=np.arange(conf_mat.shape[0]),
        xticklabels=[f"C{i}" for i in range(len(classes))],
        yticklabels=[f"C{i}" for i in range(len(classes))],
        title=f"Confusion Matrix ({prefix.strip('_') if prefix else 'Test'} Acc: {acc*100:.2f}%)",
        ylabel="True Label",
        xlabel="Predicted Label"
    )
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Annotate values inside cells
    thresh = conf_mat.max() / 2.0
    for i in range(conf_mat.shape[0]):
        for j in range(conf_mat.shape[1]):
            val = conf_mat[i, j]
            if val > 0:
                ax.text(j, i, format(val, "d"),
                        ha="center", va="center",
                        color="white" if val > thresh else "black",
                        fontsize=8)
    fig.tight_layout()
    plt.savefig(cm_plot_path, dpi=200, bbox_inches="tight")
    plt.close(fig)

    # 2. Save JSON metrics summary
    metrics_summary = {
        "model_weights": os.path.basename(model_weights_path),
        "test_samples_total": len(test_samples),
        "test_distribution": test_dist,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "macro_precision": round(float(macro_p), 4),
            "macro_recall": round(float(macro_r), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_precision": round(float(weighted_p), 4),
            "weighted_recall": round(float(weighted_r), 4),
            "weighted_f1": round(float(weighted_f1), 4)
        },
        "confusion_matrix_plot": cm_plot_path,
        "classification_report": report_dict
    }

    metrics_json_name = f"{prefix}evaluation_metrics.json" if prefix else "evaluation_metrics.json"
    metrics_json_path = os.path.join(output_dir, metrics_json_name)
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)

    # 3. Save text classification report
    report_txt_name = f"{prefix}classification_report.txt" if prefix else "classification_report.txt"
    report_txt_path = os.path.join(output_dir, report_txt_name)
    with open(report_txt_path, "w", encoding="utf-8") as f:
        f.write(f"=== MOBILENETV2 EVALUATION REPORT ===\n")
        f.write(f"Model Checkpoint: {model_weights_path}\n")
        f.write(f"Test Samples: {len(test_samples)}\n")
        f.write(f"Overall Accuracy: {acc*100:.2f}%\n")
        f.write(f"Macro F1-Score: {macro_f1*100:.2f}%\n")
        f.write(f"Weighted F1-Score: {weighted_f1*100:.2f}%\n\n")
        f.write("Class Mapping Legend:\n")
        for idx, c in enumerate(classes):
            f.write(f"  C{idx:02d}: {c}\n")
        f.write("\nDetailed Per-Class Performance:\n")
        f.write(report_text)

    print("\n=== EVALUATION RESULTS ===")
    print(f"Overall Accuracy: {acc*100:.2f}%")
    print(f"Macro Precision : {macro_p*100:.2f}%")
    print(f"Macro Recall    : {macro_r*100:.2f}%")
    print(f"Macro F1-Score  : {macro_f1*100:.2f}%")
    print(f"Weighted F1     : {weighted_f1*100:.2f}%")
    print(f"Confusion Matrix: {cm_plot_path}")
    print(f"Metrics JSON    : {metrics_json_path}")
    print(f"Full Report     : {report_txt_path}")

    return metrics_summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate MobileNetV2 Disease Detection Model")
    parser.add_argument("--weights", type=str, default=DEFAULT_WEIGHTS, help="Path to model .pth file")
    parser.add_argument("--max-samples-per-class", type=int, default=None, help="Cap test samples for fast testing")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output-dir", type=str, default=EVAL_DIR, help="Evaluation output folder")
    parser.add_argument("--prefix", type=str, default="", help="Prefix for output evaluation artifacts")
    parser.add_argument("--manifest-path", type=str, default=None, help="Path to split_manifest.json")
    args = parser.parse_args()

    evaluate_model(
        model_weights_path=args.weights,
        output_dir=args.output_dir,
        batch_size=args.batch_size,
        max_samples_per_class=args.max_samples_per_class,
        seed=args.seed,
        prefix=args.prefix,
        manifest_path=args.manifest_path
    )
