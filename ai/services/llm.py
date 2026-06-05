import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

def generate_answer(question: str, context_chunks: list) -> str:
    """
    Generates an answer using the local Ollama LLM by providing context and the user's question.
    """
    # Build context string
    context_text = "\n\n".join([f"Excerpt: {chunk['text']}" for chunk in context_chunks])
    
    prompt = f"""You are a helpful meeting assistant. Use the following context excerpts from a meeting to answer the user's question. 
If the answer is not contained in the context, say "I don't have enough information from the meeting to answer that."

CONTEXT:
{context_text}

QUESTION:
{question}

ANSWER:"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "Error: No response from LLM")
    except Exception as e:
        return f"Failed to connect to Ollama LLM. Error: {str(e)}"
