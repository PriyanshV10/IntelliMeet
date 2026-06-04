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

class VideoFrame(BaseModel):
    timestamp_seconds: int
    timestamp_display: str
    ocr_text: str

class VideoExtractionResponse(BaseModel):
    frames: List[VideoFrame]

class ChunkData(BaseModel):
    chunk_id: str
    text: str
    metadata: Optional[dict] = None

class StoreChunksRequest(BaseModel):
    meeting_id: str
    chunks: List[ChunkData]

class StoreChunksResponse(BaseModel):
    stored: int
    meeting_id: str
