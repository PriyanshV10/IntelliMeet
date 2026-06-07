import whisper
import os
import tempfile

# Load the model at module level to avoid reloading it on every request
# Upgrading to "medium" model and enforcing "cuda" device for GPU acceleration
model = whisper.load_model("medium", device="cuda")

def transcribe_audio(file_path: str):
    """
    Transcribe the given audio/video file using Whisper and return timestamped segments.
    """
    result = model.transcribe(file_path)
    
    segments = []
    for segment in result.get("segments", []):
        segments.append({
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"].strip(),
            "speaker": None  # Whisper base does not do diarization out of the box
        })
        
    return {
        "segments": segments,
        "full_text": result.get("text", "").strip()
    }
