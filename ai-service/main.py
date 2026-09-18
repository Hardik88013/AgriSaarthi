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
