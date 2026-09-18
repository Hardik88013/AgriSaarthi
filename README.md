# AgriSaarthi

**AI-Powered Crop Advisory & Farmer's Companion**
*Tagline: KNOW MORE GROW MORE*

## Overview
AgriSaarthi is an AI-powered agricultural advisory platform designed to empower farmers with actionable insights. By combining modern web technologies with machine learning, the platform provides tailored crop recommendations, disease detection, pest risk awareness, and weather-aware agricultural guidance.

## Problem Being Addressed
Farmers often face challenges due to unpredictable weather, undiagnosed crop diseases, and lack of localized, data-driven agricultural advice. AgriSaarthi bridges this gap by providing an intuitive, accessible platform for agricultural intelligence.

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend API:** ASP.NET Core Web API, C#, Entity Framework Core, SQL Server, JWT Authentication
- **AI/ML Service:** Python, FastAPI, scikit-learn, TensorFlow

## High-Level Architecture
```text
React/TypeScript (Frontend)
        | (JWT Authenticated REST)
        v
ASP.NET Core Web API (Main Backend)
        |
        +---- SQL Server (Database)
        |
        +---- Python FastAPI (AI Service)
                       |
                       +---- ML Models
```

## Current Development Status
- **Phase 1:** Initialized repository structure, basic frontend shell, and minimal backend API endpoints for health checks. (Completed)
- **Phase 2:** Established database layer (EF Core + SQL Server) and basic Farmer Profile functionality. (Completed)
- **Phase 3:** Implemented secure JWT Farmer authentication, routing, and access control. (In Progress)

## Local Setup Instructions

### Prerequisites
- Node.js & npm
- .NET 8/10 SDK (or latest)
- Python 3.9+
- SQL Server (or LocalDB)

### Configuration
1. Copy `.env.example` to `.env` in the root directory (do not commit this file).
2. For the main API backend, update `appsettings.Development.json` with:
   - Your active SQL Server connection string under `DefaultConnection`.
   - A secure string for `Jwt:Key` (must be at least 16 characters).

### Database Setup
To initialize the SQL Server database schema, run Entity Framework migrations from the backend folder:
```bash
cd backend/AgriSaarthi.Api
dotnet ef database update
```

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
dotnet run --launch-profile http
```

### Running the AI Service (FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
