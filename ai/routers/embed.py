from fastapi import APIRouter, HTTPException
from models.schemas import StoreChunksRequest, StoreChunksResponse
from services import vector_store

router = APIRouter(
    prefix="/embed",
    tags=["Embed"]
)

@router.post("/store", response_model=StoreChunksResponse)
async def store_chunks_endpoint(request: StoreChunksRequest):
    """
    Accept text chunks, generate embeddings, and store them in ChromaDB.
    """
    try:
        stored_count = vector_store.store_chunks(request.meeting_id, request.chunks)
        return {"stored": stored_count, "meeting_id": request.meeting_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
