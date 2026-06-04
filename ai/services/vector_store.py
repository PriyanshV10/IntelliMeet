import chromadb
import os

# We store chroma data in the ai/chroma_data folder
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection(name="meeting_chunks")

def store_chunks(meeting_id: str, chunks: list):
    """
    Store text chunks and their embeddings in ChromaDB.
    """
    if not chunks:
        return 0

    from services.embedder import get_embeddings
    
    texts = [chunk.text for chunk in chunks]
    embeddings = get_embeddings(texts)
    
    ids = [chunk.chunk_id for chunk in chunks]
    
    # Ensure metadata has the meeting_id so we can filter by it later
    metadatas = []
    for chunk in chunks:
        meta = chunk.metadata.copy() if chunk.metadata else {}
        meta["meeting_id"] = meeting_id
        metadatas.append(meta)
        
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )
    
    return len(ids)
