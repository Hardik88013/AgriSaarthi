from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgriSaarthi AI Service",
    description="AI and Machine Learning API for AgriSaarthi Crop Advisory",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

@app.on_event("startup")
def load_model():
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

