# Crop Recommendation ML Model

## Dataset Information
- **Dataset:** `Crop_recommendation.csv`
- **Location:** `D:\AgriSaarthi\ml\crop-recommendation\data\Crop_recommendation.csv`
- **Dimensions:** 2200 rows, 7 features.
- **Features (Order sensitive):** `N` (Nitrogen), `P` (Phosphorus), `K` (Potassium), `temperature`, `humidity`, `ph`, `rainfall`.
- **Target:** `label` (22 unique crops including rice, maize, chickpea, etc.)

## Model Details
- **Algorithm:** RandomForestClassifier (n_estimators=100, random_state=42)
- **Evaluation Accuracy:** 99.55%
- **Location:** `D:\AgriSaarthi\ml\crop-recommendation\model\crop_rf_model.joblib`

## How to Train
Run the Python script located in the `training` folder. It uses `csv` and `scikit-learn` to process the dataset and train the model.
```bash
cd D:\AgriSaarthi\ai-service
.\venv\Scripts\activate
python D:\AgriSaarthi\ml\crop-recommendation\training\train.py
```

## Running the Python AI Service
The model is served using FastAPI, running on port 8000.
```bash
cd D:\AgriSaarthi\ai-service
.\venv\Scripts\activate
python -m uvicorn main:app --port 8000 --reload
```

## API Endpoint (Python)
- **URL:** `POST http://localhost:8000/predict/crop`
- **Payload:**
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.8,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```
- **Response:**
```json
{
  "recommendedCrop": "rice",
  "confidence": 0.95
}
```

## ASP.NET Core Integration
The React frontend does not communicate directly with the Python service. Instead, it sends a request with a JWT to the ASP.NET Core API at `POST /api/crop-advisory/recommend`. The ASP.NET Core API validates the user token, and utilizes an injected `IAiService` (via `HttpClient`) to proxy the request to the underlying Python FastAPI service (`http://localhost:8000`), abstracting the ML complexity from the user interface.
