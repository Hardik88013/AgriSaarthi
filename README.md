# AgriSaarthi

**AI-Powered Crop Advisory & Farmer's Companion**
*Tagline: KNOW MORE GROW MORE*

## Overview
AgriSaarthi is an AI-powered agricultural advisory platform designed to empower farmers with actionable insights. By combining modern web technologies with machine learning, the platform provides tailored crop recommendations, disease detection, pest risk awareness, and weather-aware agricultural guidance.

## Problem Being Addressed
Farmers often face challenges due to unpredictable weather, undiagnosed crop diseases, and lack of localized, data-driven agricultural advice. AgriSaarthi bridges this gap by providing an intuitive, accessible platform for agricultural intelligence.

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend API:** ASP.NET Core Web API, C#, Entity Framework Core, SQL Server
- **AI/ML Service:** Python, FastAPI, scikit-learn, TensorFlow

## High-Level Architecture
```text
React/TypeScript (Frontend)
        |
        | REST API
        v
ASP.NET Core Web API (Main Backend)
        |
        +---- SQL Server (Database)
        |
        +---- Python FastAPI (AI Service)
                       |
                       +---- ML Models
```

## Repository Structure
- `frontend/` - React frontend application
- `backend/AgriSaarthi.Api/` - ASP.NET Core Web API
- `ai-service/` - Python FastAPI service for AI/ML predictions
- `ml/` - Jupyter notebooks, data preprocessing, and model training scripts
- `docs/` - Project documentation and architecture diagrams

## Current Development Status
- **Phase 1:** Initialized repository structure, basic frontend shell, and minimal backend API endpoints for health checks. (In Progress)

## Local Setup Instructions

### Prerequisites
- Node.js & npm
- .NET 8 SDK (or latest)
- Python 3.9+

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running the Main Backend (ASP.NET Core)
```bash
cd backend/AgriSaarthi.Api
dotnet restore
dotnet run
```

### Running the AI Service (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
