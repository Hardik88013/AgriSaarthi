"""Grad-CAM (Gradient-weighted Class Activation Mapping) for MobileNetV2.

Provides visual explanations for deep convolutional neural networks by highlighting
discriminative regions in leaf images corresponding to disease predictions.
"""

import os
from typing import Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
import matplotlib.pyplot as plt


class MobileNetV2GradCAM:
    """Computes Grad-CAM heatmaps for MobileNetV2."""

    def __init__(self, model: nn.Module, target_layer: Optional[nn.Module] = None):
        """Initializes Grad-CAM with a model and target convolutional layer.

        Default target layer is `model.features[-1]` (Conv2dNormActivation at depth 18).
        """
        self.model = model
        self.target_layer = target_layer if target_layer is not None else model.features[-1]
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None
        self._handles = []
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, inp, out):
            self.activations = out.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        self._handles.append(self.target_layer.register_forward_hook(forward_hook))
        self._handles.append(self.target_layer.register_full_backward_hook(backward_hook))

    def remove_hooks(self):
        for h in self._handles:
            h.remove()
        self._handles.clear()

    def generate_heatmap(
        self,
        input_tensor: torch.Tensor,
        target_class_idx: Optional[int] = None
    ) -> Tuple[np.ndarray, int, float]:
        """Generates a 2D normalized Grad-CAM heatmap for the given image tensor.

        Args:
            input_tensor: 4D tensor [1, 3, 224, 224]
            target_class_idx: Specific class index to explain (None = top predicted class)

        Returns:
            Tuple of (heatmap: 2D float ndarray [0..1], predicted_class_idx: int, confidence: float)
        """
        self.model.eval()
        self.model.zero_grad()

        # Forward pass with gradients enabled for backward hook
        output = self.model(input_tensor)
        probabilities = torch.softmax(output[0], dim=0)

        if target_class_idx is None:
            target_class_idx = int(torch.argmax(probabilities).item())

        confidence = float(probabilities[target_class_idx].item())

        score = output[0, target_class_idx]
        score.backward()

        if self.gradients is None or self.activations is None:
            raise RuntimeError("Gradients or activations were not captured. Check target layer hooks.")

        # Global average pooling of gradients: alpha_k = (1/Z) * sum(gradients)
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)  # [1, C, 1, 1]
        weighted_act = torch.sum(weights * self.activations, dim=1, keepdim=True)  # [1, 1, H, W]

        # Apply ReLU to focus on features having positive influence
        cam = torch.relu(weighted_act).squeeze().cpu().numpy()

        # Min-max normalization
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return cam, target_class_idx, confidence

    @staticmethod
    def overlay_heatmap(
        pil_image: Image.Image,
        heatmap: np.ndarray,
        alpha: float = 0.45,
        colormap: str = "jet"
    ) -> Image.Image:
        """Overlays the 2D heatmap onto the original PIL image.

        Args:
            pil_image: Original RGB PIL image.
            heatmap: 2D float ndarray normalized in [0, 1].
            alpha: Heatmap blend weight (0..1).
            colormap: Matplotlib colormap name.

        Returns:
            Blended PIL Image.
        """
        width, height = pil_image.size
        # Resize heatmap to match image dimensions
        heatmap_resized = Image.fromarray((heatmap * 255).astype(np.uint8)).resize(
            (width, height), resample=Image.Resampling.BILINEAR
        )
        heatmap_norm = np.array(heatmap_resized, dtype=np.float32) / 255.0

        # Apply colormap
        cmap = plt.get_cmap(colormap)
        colored_cam = cmap(heatmap_norm)[:, :, :3]  # Discard alpha channel -> RGB in [0, 1]

        # Convert original image to float in [0, 1]
        img_arr = np.array(pil_image.convert("RGB"), dtype=np.float32) / 255.0

        # Alpha blend: (1 - alpha) * original + alpha * heatmap
        blended = (1.0 - alpha) * img_arr + alpha * colored_cam
        blended = np.clip(blended * 255.0, 0, 255).astype(np.uint8)

        return Image.fromarray(blended)


def generate_gradcam_visualization(
    model: nn.Module,
    image_path: str,
    output_path: str,
    class_names: list,
    transform,
    device: torch.device = torch.device("cpu")
) -> dict:
    """Convenience function to generate and save a side-by-side Grad-CAM explanation.

    Args:
        model: Trained MobileNetV2 model.
        image_path: Path to leaf input image.
        output_path: Destination file path for visualization plot.
        class_names: List of disease class names.
        transform: Image preprocessing transform.
        device: Torch compute device.

    Returns:
        Dict with predicted disease, confidence, and paths.
    """
    raw_img = Image.open(image_path).convert("RGB")
    tensor = transform(raw_img).unsqueeze(0).to(device)

    gradcam = MobileNetV2GradCAM(model)
    heatmap, pred_idx, conf = gradcam.generate_heatmap(tensor)
    gradcam.remove_hooks()

    pred_label = class_names[pred_idx]
    blended_img = MobileNetV2GradCAM.overlay_heatmap(raw_img, heatmap)

    # Save visualization figure: Original, Heatmap, Blended
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))

    axes[0].imshow(raw_img)
    axes[0].set_title("Input Leaf Image", fontsize=12)
    axes[0].axis("off")

    heatmap_plot = axes[1].imshow(heatmap, cmap="jet")
    axes[1].set_title("Grad-CAM Heatmap", fontsize=12)
    axes[1].axis("off")
    plt.colorbar(heatmap_plot, ax=axes[1], fraction=0.046, pad=0.04)

    axes[2].imshow(blended_img)
    clean_label = pred_label.replace("___", " - ").replace("_", " ")
    axes[2].set_title(f"Prediction: {clean_label}\nConfidence: {conf*100:.1f}%", fontsize=11, color="darkgreen")
    axes[2].axis("off")

    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(fig)

    return {
        "image_path": image_path,
        "output_path": output_path,
        "predicted_class": pred_label,
        "predicted_idx": pred_idx,
        "confidence": conf
    }
