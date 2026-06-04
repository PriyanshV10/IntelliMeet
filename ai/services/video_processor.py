import cv2
import pytesseract

def extract_frames_and_ocr(video_path: str, interval_seconds: int = 5):
    """
    Extract 1 frame every `interval_seconds` from the video and run OCR on it.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps == 0:
        fps = 30  # Fallback
        
    frame_interval = int(fps * interval_seconds)
    
    frames_data = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            timestamp_seconds = int(frame_count / fps)
            
            # Convert to grayscale for better OCR
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Run OCR
            text = pytesseract.image_to_string(gray).strip()
            
            # Keep frame data even if text is empty, or only if there is text? 
            # Usually we only care if there is text.
            if text:
                timestamp_display = f"{timestamp_seconds // 60}:{timestamp_seconds % 60:02d}"
                frames_data.append({
                    "timestamp_seconds": timestamp_seconds,
                    "timestamp_display": timestamp_display,
                    "ocr_text": text
                })
                
        frame_count += 1
        
    cap.release()
    return frames_data
