import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgriSaarthi AI Service",
    description="AI and Machine Learning API for AgriSaarthi Crop Advisory",
    version="1.0.0"
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

@app.get("/")
def root():
    return {"message": "Welcome to AgriSaarthi AI Service"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service", "version": "1.0.0"}

import os
import joblib
from pydantic import BaseModel
from fastapi import HTTPException

# Pydantic model for request validation
class CropRecommendationRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# Load the model on startup
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'crop-recommendation', 'model', 'crop_rf_model.joblib')
crop_model = None

def load_crop_model():
    global crop_model
    if os.path.exists(model_path):
        crop_model = joblib.load(model_path)
    else:
        print(f"Warning: Model not found at {model_path}")

@app.post("/predict/crop")
def predict_crop(request: CropRecommendationRequest):
    if crop_model is None:
        raise HTTPException(status_code=503, detail="Crop recommendation model is not loaded or unavailable.")
    
    # Feature ordering MUST match training exactly
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    
    # Create 2D array-like for prediction
    input_data = [[
        request.N,
        request.P,
        request.K,
        request.temperature,
        request.humidity,
        request.ph,
        request.rainfall
    ]]
    
    try:
        prediction = crop_model.predict(input_data)[0]
        
        # Get probabilities for confidence
        probabilities = crop_model.predict_proba(input_data)[0]
        max_prob = float(max(probabilities))
        
        return {
            "recommendedCrop": prediction,
            "confidence": round(max_prob, 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


from fastapi import UploadFile, File
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import json

disease_model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'disease-detection', 'model', 'disease_model.pth')
classes_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml', 'disease-detection', 'model', 'classes.json')

disease_model = None
disease_classes = []
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

def load_disease_model():
    global disease_model, disease_classes
    if os.path.exists(disease_model_path) and os.path.exists(classes_path):
        try:
            with open(classes_path, "r") as f:
                disease_classes = json.load(f)
            
            disease_model = models.mobilenet_v2(pretrained=False)
            num_ftrs = disease_model.classifier[1].in_features
            disease_model.classifier[1] = nn.Linear(num_ftrs, len(disease_classes))
            disease_model.load_state_dict(torch.load(disease_model_path, map_location=device))
            disease_model.to(device)
            disease_model.eval()
            print("Disease model loaded successfully.")
        except Exception as e:
            print(f"Failed to load disease model: {e}")
    else:
        print(f"Warning: Disease model or classes not found at {disease_model_path}")

@app.on_event("startup")
def startup_event():
    load_crop_model()
    load_disease_model()

disease_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    if disease_model is None:
        raise HTTPException(status_code=503, detail="Disease detection model is not loaded or unavailable.")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    try:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
            
        image = Image.open(io.BytesIO(content)).convert("RGB")
        input_tensor = disease_transforms(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = disease_model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        predicted_class = disease_classes[predicted_idx.item()]
        
        return {
            "predictedDisease": predicted_class,
            "confidence": round(confidence.item(), 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while processing the image.")
