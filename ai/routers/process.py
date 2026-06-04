from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
from services import transcription
from models.schemas import TranscriptionResponse

router = APIRouter(
    prefix="/process",
    tags=["Process"]
)

@router.post("/audio", response_model=TranscriptionResponse)
async def process_audio(file: UploadFile = File(...)):
    """
    Accept .mp3 or .mp4, run Whisper, return timestamped text.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".mp3", ".mp4", ".wav", ".m4a"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload an audio or video file.")
    
    # Save uploaded file to a temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
            
        # Run transcription
        result = transcription.transcribe_audio(tmp_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
