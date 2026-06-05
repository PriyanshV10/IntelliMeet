from fastapi import APIRouter, HTTPException
from models.schemas import QueryRequest, QueryResponse, QuerySource
from services import vector_store, llm

router = APIRouter(
    prefix="/query",
    tags=["Query"]
)

@router.post("/", response_model=QueryResponse)
async def query_meeting(request: QueryRequest):
    """
    Query a specific meeting using RAG. Retrieves context from ChromaDB and generates an answer via LLM.
    """
    try:
        # 1. Retrieve top 5 relevant chunks
        relevant_chunks = vector_store.query_chunks(
            meeting_id=request.meeting_id,
            query_text=request.question,
            top_k=5
        )
        
        # 2. Generate answer using Ollama
        answer = llm.generate_answer(request.question, relevant_chunks)
        
        # 3. Format sources
        sources = [
            QuerySource(text=chunk["text"], metadata=chunk["metadata"]) 
            for chunk in relevant_chunks
        ]
        
        return QueryResponse(answer=answer, sources=sources)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
