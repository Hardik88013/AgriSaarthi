import os
import io
import sys
import json
import base64
import asyncio
from contextlib import asynccontextmanager
from typing import List, Optional

import joblib
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pydantic import BaseModel, Field, ConfigDict
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# CPU safety: keep PyTorch threads at 2 (optimal for Core i5-4210U dual-core)
torch.set_num_threads(2)

# Resolve project paths relative to current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# Grad-CAM module path resolution
TRAINING_DIR = os.path.join(PROJECT_ROOT, 'ml', 'disease-detection', 'training')
if TRAINING_DIR not in sys.path:
    sys.path.insert(0, TRAINING_DIR)

try:
    from gradcam import MobileNetV2GradCAM
    GRADCAM_AVAILABLE = True
except ImportError:
    GRADCAM_AVAILABLE = False
    print("[AI Service] Warning: gradcam module could not be imported.")

CROP_MODEL_PATH = os.path.join(PROJECT_ROOT, 'ml', 'crop-recommendation', 'model', 'crop_rf_model.joblib')
DISEASE_MODEL_PATH = os.path.join(PROJECT_ROOT, 'ml', 'disease-detection', 'model', 'disease_model.pth')
CLASSES_PATH = os.path.join(PROJECT_ROOT, 'ml', 'disease-detection', 'model', 'classes.json')

# Global model state
crop_model = None
disease_model = None
disease_classes: List[str] = []
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# Standard normalization for MobileNetV2 (ImageNet statistics)
disease_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


def load_crop_model() -> bool:
    """Loads the Scikit-learn Random Forest model for crop recommendation."""
    global crop_model
    if os.path.exists(CROP_MODEL_PATH):
        try:
            crop_model = joblib.load(CROP_MODEL_PATH)
            print(f"[AI Service] Crop model loaded successfully from {CROP_MODEL_PATH}")
            return True
        except Exception as e:
            print(f"[AI Service] Error loading crop model: {e}")
            crop_model = None
            return False
    else:
        print(f"[AI Service] Warning: Crop model not found at {CROP_MODEL_PATH}")
        crop_model = None
        return False


def load_disease_model() -> bool:
    """Loads the PyTorch MobileNetV2 model for plant leaf disease detection."""
    global disease_model, disease_classes
    if os.path.exists(DISEASE_MODEL_PATH) and os.path.exists(CLASSES_PATH):
        try:
            with open(CLASSES_PATH, "r", encoding="utf-8") as f:
                disease_classes = json.load(f)

            # Modern initialization using weights=None for custom weights
            model = models.mobilenet_v2(weights=None)
            num_ftrs = model.classifier[1].in_features
            model.classifier[1] = nn.Linear(num_ftrs, len(disease_classes))

            # Load checkpoint weights
            state_dict = torch.load(DISEASE_MODEL_PATH, map_location=device)
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()

            disease_model = model
            print(f"[AI Service] Disease model loaded successfully ({len(disease_classes)} classes on {device}).")
            return True
        except Exception as e:
            print(f"[AI Service] Error loading disease model: {e}")
            disease_model = None
            return False
    else:
        print(f"[AI Service] Warning: Disease model or classes not found at {DISEASE_MODEL_PATH}")
        disease_model = None
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager for startup and shutdown events."""
    print("[AI Service] Initializing AI models...")
    load_crop_model()
    load_disease_model()
    yield
    print("[AI Service] Shutting down AI Service...")


app = FastAPI(
    title="AgriSaarthi AI Service",
    description="AI and Machine Learning API for AgriSaarthi Crop Advisory and Disease Detection",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend/backend access
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic schemas with domain validation
class CropRecommendationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    N: float = Field(..., ge=0, le=300, description="Nitrogen ratio in soil (0-300 kg/ha)")
    P: float = Field(..., ge=0, le=300, description="Phosphorus ratio in soil (0-300 kg/ha)")
    K: float = Field(..., ge=0, le=300, description="Potassium ratio in soil (0-300 kg/ha)")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in Celsius (-10 to 60)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity percentage (0-100)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level (0-14)")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall in mm (0-5000)")


@app.get("/")
def root():
    return {"message": "Welcome to AgriSaarthi AI Service"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0",
        "device": str(device),
        "cropModelLoaded": crop_model is not None,
        "diseaseModelLoaded": disease_model is not None,
        "numDiseaseClasses": len(disease_classes)
    }


@app.post("/predict/crop")
def predict_crop(request: CropRecommendationRequest):
    if crop_model is None:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model is not loaded or unavailable."
        )

    # Feature ordering MUST match training exactly: N, P, K, temperature, humidity, ph, rainfall
    input_data = [[
        float(request.N),
        float(request.P),
        float(request.K),
        float(request.temperature),
        float(request.humidity),
        float(request.ph),
        float(request.rainfall)
    ]]

    try:
        prediction = crop_model.predict(input_data)[0]

        # Calculate prediction confidence via predict_proba
        probabilities = crop_model.predict_proba(input_data)[0]
        max_prob = float(max(probabilities))

        return {
            "recommendedCrop": str(prediction),
            "confidence": round(max_prob, 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...), explain: bool = False):
    if disease_model is None or len(disease_classes) == 0:
        raise HTTPException(
            status_code=503,
            detail="Disease detection model is not loaded or unavailable."
        )

    # Validate content type header
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a valid image file (JPEG, PNG, WEBP)."
        )

    # Read and validate payload size (max 10MB)
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded image content.")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    # Validate image integrity with PIL
    try:
        test_img = Image.open(io.BytesIO(content))
        test_img.verify()
        # Re-open after verify() to get clean RGB raster image
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Corrupted or unrecognized image file. Please upload a valid photo."
        )

    # Tensor preprocessing
    input_tensor = disease_transforms(image).unsqueeze(0).to(device)

    # 1. Normal fast path (explain=False): strictly torch.inference_mode()
    if not explain or not GRADCAM_AVAILABLE:
        try:
            disease_model.eval()
            with torch.inference_mode():
                outputs = disease_model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                confidence, predicted_idx = torch.max(probabilities, 0)

            predicted_class = disease_classes[predicted_idx.item()]
            return {
                "predictedDisease": predicted_class,
                "confidence": round(float(confidence.item()), 4)
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Inference error during disease detection: {str(e)}"
            )

    # 2. Explainability path (explain=True): gradients required for Grad-CAM
    try:
        disease_model.eval()
        disease_model.zero_grad()

        gradcam = MobileNetV2GradCAM(disease_model)
        try:
            heatmap, pred_idx, conf = gradcam.generate_heatmap(input_tensor)
        finally:
            gradcam.remove_hooks()
            disease_model.zero_grad()

        predicted_class = disease_classes[pred_idx]
        confidence = float(conf)

        # Generate blended overlay image
        blended = MobileNetV2GradCAM.overlay_heatmap(image, heatmap, alpha=0.45, colormap="jet")
        buf = io.BytesIO()
        blended.save(buf, format="JPEG", quality=85)
        heatmap_base64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

        return {
            "predictedDisease": predicted_class,
            "confidence": round(confidence, 4),
            "heatmapBase64": heatmap_base64
        }
    except Exception as ex:
        print(f"[AI Service] Warning: Grad-CAM generation failed: {ex}. Falling back to standard inference.")
        # Fallback to standard inference without crashing
        try:
            disease_model.eval()
            with torch.inference_mode():
                outputs = disease_model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                confidence, predicted_idx = torch.max(probabilities, 0)

            predicted_class = disease_classes[predicted_idx.item()]
            return {
                "predictedDisease": predicted_class,
                "confidence": round(float(confidence.item()), 4)
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Inference error during disease detection: {str(e)}"
            )
