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
