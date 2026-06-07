import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:7b"

def generate_answer(question: str, context_chunks: list) -> str:
    """
    Generates an answer using the remote JarvisLabs Ollama LLM by providing context and the user's question.
    """
    # Build context string with metadata for citations
    context_list = []
    for chunk in context_chunks:
        metadata = chunk.get('metadata', {})
        source_type = metadata.get('type', 'unknown')
        if source_type == 'transcript':
            source_ref = metadata.get('timestamp', 'Unknown Time')
        elif source_type == 'slide':
            source_ref = f"Slide {metadata.get('slide_number', '?')}"
        else:
            source_ref = 'Unknown Source'
            
        context_list.append(f"[{source_type} @ {source_ref}]: {chunk.get('text', '')}")
        
    context_text = "\n\n".join(context_list)
    
    prompt = f"""You are a helpful meeting assistant. Use the following context excerpts from a meeting to answer the user's question. 
Always include timestamps or slide numbers when making claims.
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
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "Error: No response from LLM")
    except Exception as e:
        return f"Failed to connect to Ollama LLM. Error: {str(e)}"
