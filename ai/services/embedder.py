from sentence_transformers import SentenceTransformer
from typing import List

# Using a lightweight model as recommended in the roadmap
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Convert a list of text strings into embeddings (lists of floats).
    """
    if not texts:
        return []
    embeddings = model.encode(texts)
    # Convert numpy arrays to lists of floats
    return [embedding.tolist() for embedding in embeddings]
