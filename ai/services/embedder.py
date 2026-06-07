from sentence_transformers import SentenceTransformer
from typing import List

# Upgrading to a highly accurate state-of-the-art embedding model
model = SentenceTransformer("BAAI/bge-large-en-v1.5")

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Convert a list of text strings into embeddings (lists of floats).
    """
    if not texts:
        return []
    embeddings = model.encode(texts)
    # Convert numpy arrays to lists of floats
    return [embedding.tolist() for embedding in embeddings]
