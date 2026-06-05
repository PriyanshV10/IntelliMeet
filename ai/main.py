from fastapi import FastAPI
from routers import process, embed, query

app = FastAPI(
    title="Meeting Intelligence Assistant - AI Service",
    description="AI Service for processing meetings",
    version="1.0.0"
)

app.include_router(process.router)
app.include_router(embed.router)
app.include_router(query.router)

@app.get("/")
def root():
    return {"message": "AI Service is running"}
