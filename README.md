# 🧠 IntelliMeet: Meeting Intelligence Assistant

## What it does
IntelliMeet is a multimodal meeting intelligence assistant that ingests presentation decks (PDFs), meeting audio (MP3s), and screen recordings (MP4s), synthesizing them into one coherent meeting representation. It allows users to ask cross-modal questions about their meetings and receive accurate, grounded answers complete with timestamps, slide references, and exact quotes.

## Why I built this
I built this because analyzing past meetings is often tedious and disconnected. Participants might remember an argument or a decision, but finding the exact context—such as the exact slide on the screen when a budget concern was raised—requires scrubbing through video, audio, and slides separately. By combining all these modalities into a unified vector search and RAG pipeline, we can achieve true "meeting intelligence" that mirrors how humans experience and recall these events.

## How to run it
The application is designed to be deployed and run on a GPU instance using [JarvisLabs](https://jarvislabs.ai/) to leverage efficient local omni/multimodal model inference.

1. **Spin up a GPU Instance on JarvisLabs**
   - Create an instance with a GPU (e.g., RTX 5000 or better) and install the default PyTorch environment.

2. **Deploy the Application**
   - From your local machine, run the deployment script, passing the IP address of your JarvisLabs instance:
     ```bash
     ./deploy_all.sh <JARVIS_LABS_GPU_IP>
     ```

3. **Run Services on JarvisLabs**
   - SSH into your JarvisLabs instance as `root`.
   - Ensure prerequisites are installed (Java, Node, PostgreSQL, Tesseract OCR, FFmpeg). You can use the provided setup script:
     ```bash
     ./setup_gpu.sh
     ```
   - Start all the services (Ollama, FastAPI AI Service, Spring Boot Backend):
     ```bash
     ./start_all.sh
     ```
   - The Spring Boot backend will serve the React frontend on `http://<JARVIS_LABS_GPU_IP>:8080`.

## Example Cross-Modal Questions
The system successfully answers cross-modal questions by combining information from multiple inputs:

1. **"What did Sarah suggest when we were looking at the Q3 Budget slide?"**
   *(Requires combining Audio for speaker/content + PDF/Video OCR for slide detection)*
2. **"Who objected to the timeline shown on the screen at 15:30?"**
   *(Requires combining Video/OCR for screen content + Audio for the spoken objection)*
3. **"Did the final verbal agreement match the pricing tiers shown in the presentation deck?"**
   *(Requires combining PDF text for pricing tiers + Audio for final spoken consensus)*

**Grounding:** All answers include exact citations to source materials, such as specific transcript timestamps (`14:32`), slide numbers (`Slide 7`), and OCR text from screen frames, allowing the user to verify the response.

## Architecture decisions
- **Separation of Concerns (Spring Boot + FastAPI):** Instead of building everything in one monolithic framework, I used Spring Boot as the robust API gateway and file storage manager, while delegating all AI processing to a FastAPI Python service. This allowed me to leverage Python's native AI ecosystem (Whisper, PyMuPDF, SentenceTransformers, OpenCV) without compromising the enterprise-grade stability of the backend.
- **Local Vector Store (ChromaDB):** I chose ChromaDB for embedding storage rather than a hosted solution like Pinecone. ChromaDB is lightweight, runs locally, and perfectly integrates into a single-node deployment on JarvisLabs, ensuring meeting data never leaves the server.
- **Local LLM via Ollama (Qwen2.5/Gemma):** To guarantee complete privacy and zero API costs, I opted for local inference using Ollama instead of relying on OpenAI or Anthropic APIs. With a JarvisLabs GPU, inference is fast enough for near-real-time user queries.
- **Custom Overlap Chunking:** Rather than using a standard LangChain document loader, I wrote a custom chunking algorithm that overlaps text segments while injecting multi-modal metadata (like timestamp ranges and slide numbers) directly into the chunk payload to improve the vector search accuracy.

## What I used AI for
- **AI-Generated:** I used DeepMind Assistant to generate the initial React boilerplate, Tailwind UI styling, and the skeleton for the FastAPI RAG endpoints.
- **Hand-Written:** The end-to-end integration logic connecting the frontend, Spring Boot, and FastAPI was written entirely by hand. I also manually wrote the multimodal preprocessing pipelines (OpenCV frame extraction combined with Tesseract OCR) and the RAG prompt engineering.
- **Overrides:** I overrode the AI's suggestion to use standard 1000-token chunking. Instead, I implemented a custom, smaller chunk size (300 words) with significant overlap (50 words), as meeting transcripts often shift topics quickly, and smaller chunks led to more precise retrieval and grounding.

## What I would change with 4 more weeks
If I were to ship this to real users and had 4 more weeks:
1. **Speaker Diarization:** I would integrate `pyannote-audio` to automatically tag speakers. Currently, the system relies mostly on explicit mentions of names in the audio, but diarization would guarantee "Who said what" precision.
2. **Real-time Processing:** Instead of requiring a post-meeting upload, I would implement WebRTC to stream audio and video live into the platform, analyzing and providing insights dynamically as the meeting happens.
3. **Advanced Semantic Chunking:** I would transition from fixed-size text chunking to semantic chunking, using NLP to break segments naturally at topic shifts or slide transitions, further reducing hallucination in the LLM.
4. **Cloud Object Storage:** I would replace the local file storage with AWS S3 or a similar object storage solution to support scaling across multiple backend instances.
