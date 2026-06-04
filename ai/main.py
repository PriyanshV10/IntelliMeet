from fastapi import FastAPI
from routers import process

app = FastAPI(
    title="Meeting Intelligence Assistant - AI Service",
    description="AI Service for processing meetings",
    version="1.0.0"
)

app.include_router(process.router)

@app.get("/")
def root():
    return {"message": "AI Service is running"}
