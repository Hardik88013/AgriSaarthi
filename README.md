# AgriSaarthi

## Overview

AgriSaarthi is an AI-powered crop advisory and farmer companion platform designed to provide farmers with practical agricultural guidance using crop recommendation, weather advisory, plant disease detection, pest/disease information, farming tips, market reference information, and a centralized knowledge hub.

Tagline:
KNOW MORE GROW MORE

## Key Features

- **Farmer registration/login**: Secure authentication with JWT.
- **Farmer profile**: Manage personal details, location, and farm specifications.
- **Crop Recommendation**: Machine learning-based crop suitability suggestions based on soil and climate conditions.
- **Weather Advisory**: Current weather and 7-day forecast with automated agricultural rules and localized alerts.
- **Disease Detection**: AI-powered plant leaf image classification for early disease identification.
- **Pest & Disease Intelligence**: Interactive knowledge base of crop-specific risks and management strategies.
- **Reference Market Prices**: Snapshot of market commodity rates. (Note: Market prices are reference/sample information and are NOT real-time mandi prices).
- **Farming Tips**: Categorized best practices for irrigation, soil prep, and sustainable farming.
- **Knowledge Hub**: Centralized directory of agricultural resources.
- **Responsive dashboard**: A unified, mobile-friendly interface for quick access to all farm metrics.

*Disclaimer: Disease Detection uses a trained image-classification model and should be treated as an AI prediction, not a guaranteed agricultural diagnosis.*

## Architecture

Frontend
React + TypeScript + Vite + Tailwind CSS

Backend
ASP.NET Core Web API

AI/ML services
Python + FastAPI

Database
SQL Server + Entity Framework Core

ML
Scikit-learn Random Forest for Crop Recommendation
PyTorch MobileNetV2 for Disease Detection

External service
Open-Meteo for weather data

Knowledge
Local JSON agricultural knowledge base

```text
React Frontend
       |
       v
ASP.NET Core API
   |       |       |
   v       v       v
SQL DB   Open-Meteo   FastAPI
                    |
                    v
                 ML Models
```

## Project Structure

- `frontend/` - React frontend application
- `backend/AgriSaarthi.Api/` - ASP.NET Core Web API
- `ai-service/` - Python FastAPI for model inference
- `ml/`
  - `crop-recommendation/` - Random Forest training environment
  - `disease-detection/` - PyTorch training environment
  - `agri-knowledge/` - JSON reference data (crops, pests, diseases, market prices, farming tips)

## Setup

### Prerequisites
- Node.js & npm
- .NET 8 SDK
- Python 3.9+
- SQL Server (or LocalDB)

### Database Setup
```bash
cd backend/AgriSaarthi.Api
dotnet ef database update
```

### AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` in the root directory. Required variables:
- `JWT_KEY`
- `SQL_CONNECTION_STRING`

Update `appsettings.Development.json` in the backend to match your connection string.

## Running the Project

1. **SQL Server/database**: Ensure your local SQL instance is running.
2. **ASP.NET Core backend**:
   ```bash
   cd backend/AgriSaarthi.Api
   dotnet run --launch-profile http
   ```
   (Runs on http://localhost:5000)
3. **Python FastAPI service**:
   ```bash
   cd ai-service
   uvicorn main:app --reload --port 8000
   ```
   (Runs on http://localhost:8000)
4. **React frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   (Runs on http://localhost:5173)

## Testing

Verified using standard build checks:
```bash
# Frontend Type Check
cd frontend
npx tsc --noEmit

# Frontend Build
npm run build

# Backend Build
cd backend/AgriSaarthi.Api
dotnet build
```

## API Endpoint Inventory

**Authentication** (`AuthController`)
- `POST /api/auth/register`
- `POST /api/auth/login`

**Farmer / Profile** (`FarmersController`)
- `POST /api/farmers`
- `GET /api/farmers/{id}`
- `GET /api/farmers/{id}/profile`
- `PUT /api/farmers/{id}/profile`

**Crop Recommendation** (`CropAdvisoryController`)
- `POST /api/crop-advisory/recommend`

**Disease Detection** (`DiseaseDetectionController`)
- `POST /api/disease-detection/predict`

**Weather** (`WeatherController`)
- `GET /api/weather`

**Agri Knowledge** (`AgriKnowledgeController`)
- `GET /api/agri-knowledge/crops`
- `GET /api/agri-knowledge/diseases`
- `GET /api/agri-knowledge/pests`
- `GET /api/agri-knowledge/disease/{id}`
- `GET /api/agri-knowledge/pest/{id}`
- `GET /api/agri-knowledge/advisory`

**Market Prices** (`MarketPricesController`)
- `GET /api/market-prices`

**Farming Tips** (`FarmingTipsController`)
- `GET /api/farming-tips`

**System Health** (`HealthController`)
- `GET /api/health`

## ML Notes

- Crop Recommendation uses the Crop Recommendation dataset and Random Forest.
- Disease Detection uses PlantVillage-derived data and MobileNetV2.
- Disease model performance should not be represented beyond the verified training/evaluation results.
- Large datasets/model binaries are intentionally excluded from Git where appropriate.

## Deployment

The application utilizes a multi-tier deployment architecture requiring the following services:

1. **Frontend (React/Vite)**
2. **ASP.NET Core Web API (Backend)**
3. **FastAPI AI Service**
4. **SQL Server Database**

The architecture strictly routes all frontend traffic through the ASP.NET Core API. The frontend does **not** communicate directly with the FastAPI service or SQL database.

### ML Model Deployment
The Machine Learning models for Crop Recommendation and Disease Detection must be physically present and accessible to the FastAPI service at runtime. They are loaded from local file paths within the AI Service container/environment.

**Required Files:**
- Crop Recommendation: crop_rf_model.joblib
- Disease Detection: disease_model.pth and classes.json

Ensure the local storage or mounted volume contains these models when deploying the FastAPI service.

### Environment Variables
Configure the following required variables (names exactly match codebase configurations) using secure runtime configuration or environment variable injection. Do not hardcode production secrets.

**ASP.NET Core (Backend):**
`	ext
ConnectionStrings:DefaultConnection=<your-production-sql-connection-string>
Jwt:Key=<your-production-jwt-secret>
Jwt:Issuer=<your-production-jwt-issuer>
Jwt:Audience=<your-production-jwt-audience>
Cors:AllowedOrigins:0=<deployed-frontend-url>
AiService:BaseUrl=<deployed-fastapi-url>
`

**FastAPI (AI Service):**
`	ext
ALLOWED_ORIGINS=<deployed-backend-url>
`

**React (Frontend):**
`	ext
VITE_API_URL=<deployed-backend-url>
`

### SPA Routing
When hosting the React frontend (e.g., Vercel, Netlify, or Nginx), ensure SPA fallback routing is configured so that all paths redirect to index.html to support client-side routing on reload.
