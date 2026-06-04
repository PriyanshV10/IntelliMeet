from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
from services import transcription, pdf_extractor
from models.schemas import TranscriptionResponse, PDFExtractionResponse

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

@router.post("/pdf", response_model=PDFExtractionResponse)
async def process_pdf(file: UploadFile = File(...)):
    """
    Accept .pdf, run PyMuPDF, return extracted text per page.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF file.")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
            
        # Run extraction
        pages = pdf_extractor.extract_pdf(tmp_path)
        
        return {"pages": pages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
