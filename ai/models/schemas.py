from pydantic import BaseModel
from typing import List, Optional

class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str
    speaker: Optional[str] = None

class TranscriptionResponse(BaseModel):
    segments: List[TranscriptionSegment]
    full_text: str

class PDFPage(BaseModel):
    page_number: int
    text: str

class PDFExtractionResponse(BaseModel):
    pages: List[PDFPage]
