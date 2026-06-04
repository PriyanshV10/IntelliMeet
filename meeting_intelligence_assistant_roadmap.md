# 🧠 Meeting Intelligence Assistant — Complete 3-Day Implementation Roadmap

> **You are a React/Spring Boot developer. You are NOT an ML expert. This guide is written for you.**
> Every AI concept is explained in plain English. Every step is actionable.

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Day-by-Day Plan](#2-day-by-day-plan)
3. [Folder Structure](#3-folder-structure)
4. [Detailed Backend APIs](#4-detailed-backend-apis)
5. [AI Pipeline Explanation](#5-ai-pipeline-explanation)
6. [Database Design](#6-database-design)
7. [ChromaDB Integration](#7-chromadb-integration)
8. [Video Processing](#8-video-processing)
9. [Frontend Plan](#9-frontend-plan)
10. [Deployment Plan](#10-deployment-plan)
11. [README Strategy](#11-readme-strategy)
12. [Demo Dataset Strategy](#12-demo-dataset-strategy)
13. [Risks & Fallbacks](#13-risks--fallbacks)
14. [Learning Resources](#14-learning-resources)
15. [MVP vs Stretch Goals](#15-mvp-vs-stretch-goals)
16. [Evaluation Optimization](#16-evaluation-optimization)
17. [Exact Execution Order](#17-exact-execution-order)
18. [Beginner-Friendly Glossary](#18-beginner-friendly-glossary)
19. [Practical Advice](#19-practical-advice)
20. [Final Deliverable Checklist](#20-final-deliverable-checklist)

---

## 1. High-Level System Architecture

### The Big Picture (Plain English)

Imagine your system as a smart assistant that has "read" and "listened to" everything in a meeting. When someone asks a question, it searches its memory and gives a precise answer with proof — timestamps, slide numbers, and exact quotes.

### The Three Services

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                     React.js Frontend (Vite)                        │
│          Upload files │  Ask questions │  See answers+citations      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP REST calls
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend (Port 8080)                  │
│   • Receives uploads and stores files                               │
│   • Saves metadata to PostgreSQL                                    │
│   • Acts as a relay — forwards AI requests to FastAPI               │
│   • Returns AI answers back to frontend                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP REST calls
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   FastAPI AI Service (Port 8000)                    │
│   • Whisper: transcribes audio → text                               │
│   • PyMuPDF: extracts text from PDF slides                          │
│   • OpenCV + Tesseract: reads text from video frames                │
│   • sentence-transformers: converts text → embeddings               │
│   • ChromaDB: stores/searches those embeddings                      │
│   • Ollama (Qwen2.5): generates final natural language answers      │
└─────────────────────────────────────────────────────────────────────┘
```

### How a Question Gets Answered (Step-by-Step)

```
User types: "What was the final decision on pricing?"
     │
     ▼
React sends question to Spring Boot → Spring Boot forwards to FastAPI
     │
     ▼
FastAPI converts question to embedding (a list of 384 numbers)
     │
     ▼
ChromaDB finds the 5 most relevant text chunks from the meeting
     │
     ▼
FastAPI sends those chunks + question to Qwen2.5 via Ollama
     │
     ▼
Qwen2.5 generates: "At 14:32, John confirmed the pricing at $299/month (Slide 7)"
     │
     ▼
FastAPI returns answer + source chunks (timestamp, slide number, text)
     │
     ▼
React shows answer with clickable citations
```

### Why This Architecture Is Beginner-Friendly

- **Spring Boot** is your comfort zone — it just stores files and forwards requests
- **FastAPI** is Python and very readable — each function is one job
- **All AI complexity is in FastAPI** — you never touch ML in the frontend or backend
- **Each service can be developed and tested independently**
- **If AI breaks, Spring Boot still works** — you can debug in isolation

---

## 2. Day-by-Day Plan

### Day 1 — Infrastructure + Data Processing Pipeline

**Theme: Get data IN and make it searchable**

---

#### Morning (0–4 hours)

**Task 1.1 — Project Setup (1 hour)**

- Create GitHub repo
- Set up folder structure (see Section 3)
- Install dependencies:

```bash
# Frontend
npm create vite@latest frontend -- --template react
cd frontend && npm install axios react-dropzone react-markdown

# FastAPI
pip install fastapi uvicorn whisper pymupdf chromadb \
  sentence-transformers opencv-python pytesseract \
  python-multipart ollama

# Spring Boot
# Use Spring Initializr: https://start.spring.io
# Dependencies: Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok
```

**Task 1.2 — FastAPI: Transcription Endpoint (1.5 hours)**

- Create `/process/audio` endpoint
- Accept `.mp3` or `.mp4`, run Whisper, return timestamped text
- Test with a sample audio file

**Task 1.3 — FastAPI: PDF Extraction Endpoint (1 hour)**

- Create `/process/pdf` endpoint
- Use PyMuPDF to extract text per page
- Return `[{page_number: 1, text: "..."}, ...]`

**Task 1.4 — FastAPI: Video Frame Extraction (30 min)**

- Create `/process/video` endpoint
- Use OpenCV to extract 1 frame every 5 seconds
- Run Tesseract OCR on each frame
- Return `[{timestamp_seconds: 10, text: "..."}, ...]`

---

#### Afternoon (4–8 hours)

**Task 1.5 — ChromaDB Setup + Embedding Storage (2 hours)**

- Initialize ChromaDB with a local collection called `meeting_chunks`
- Create `/embed/store` endpoint that accepts chunks and stores them
- Test with dummy data

**Task 1.6 — Spring Boot: File Upload API (2 hours)**

- Create `/api/meetings` POST endpoint
- Accept multipart form (audio, pdf, video)
- Save files to `/uploads/` folder
- Save meeting metadata to PostgreSQL
- Call FastAPI endpoints to process each file
- Store processing status in DB

**Task 1.7 — Integration Test (1 hour)**

- Upload a real file through Spring Boot
- Verify it reaches FastAPI and embeddings are stored in ChromaDB

**Milestone: Files can be uploaded and processed into searchable chunks**

**Can skip if behind:** Video frame OCR — skip for Day 1, do text-only from audio + PDF

---

### Day 2 — Question Answering + Frontend

**Theme: Ask questions and get grounded answers**

---

#### Morning (0–4 hours)

**Task 2.1 — FastAPI: RAG Query Endpoint (2 hours)**

- Create `/query` endpoint
- Accept question string + meeting_id
- Embed the question
- Search ChromaDB for top-5 matching chunks
- Build a prompt with those chunks as context
- Call Ollama (Qwen2.5) with the prompt
- Return answer + source chunks

**Task 2.2 — Spring Boot: Query Relay (30 min)**

- Create `/api/meetings/{id}/query` POST endpoint
- Forward question to FastAPI `/query`
- Return answer to frontend

**Task 2.3 — Test the Full Q&A Flow (1 hour)**

- Use Postman or curl to test questions
- Verify answers contain timestamps/slide numbers

---

#### Afternoon (4–8 hours)

**Task 2.4 — React: File Upload UI (2 hours)**

- Create upload page with drag-and-drop (use react-dropzone)
- Show upload progress
- Show processing status (polling the backend)
- Redirect to chat page when processing is done

**Task 2.5 — React: Chat Interface (2 hours)**

- Create chat UI (message bubbles)
- Show user questions and AI answers
- Below each answer, show citation cards:
  - `[Slide 7 — 14:32] "The team agreed on $299/month..."`
- Make citations clickable (scroll to or highlight source)

**Task 2.6 — Loading States + Error Handling (30 min)**

- Show spinner during upload
- Show "Processing..." during AI analysis
- Show error toasts if something fails

**Milestone: End-to-end flow works — upload → process → ask → get grounded answer**

**Can skip if behind:** Multiple meetings management — do single meeting only

---

### Day 3 — Polish + Demo Data + Deployment

**Theme: Make it impressive and deployable**

---

#### Morning (0–4 hours)

**Task 3.1 — Create Demo Dataset (1.5 hours)**

- Create fake meeting audio (see Section 12)
- Create fake presentation PDF
- Process and store in the system
- Test all sample questions

**Task 3.2 — Frontend Polish (2 hours)**

- Add a landing page with a brief description
- Add a meeting dashboard showing uploaded meetings
- Style with Tailwind — make it look professional
- Add dark mode (optional, 30 min)

**Task 3.3 — README + Screenshots (30 min)**

- Write README (see Section 11)
- Take screenshots of every major UI state
- Record a 3-minute demo video

---

#### Afternoon (4–8 hours)

**Task 3.4 — Deploy to JarvisLabs (2 hours)**

- Start GPU instance on JarvisLabs
- Run Ollama + pull Qwen2.5 model
- Deploy FastAPI service
- Deploy Spring Boot JAR
- Deploy React build

**Task 3.5 — End-to-End Demo Test (1 hour)**

- Test the demo on the deployed URL
- Fix any environment-specific bugs
- Test all 4 sample questions

**Task 3.6 — Final Cleanup (1 hour)**

- Push all code to GitHub
- Add `.env.example` files
- Add architecture diagram to README
- Write "What I would improve" section

**Milestone: Live deployable demo with demo data pre-loaded**

---

## 3. Folder Structure

### Frontend (React + Vite)

```
frontend/
├── public/
│   └── demo-slides/          # Demo PDF previews as images
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx       # Single message bubble
│   │   ├── CitationCard.jsx      # Source citation with timestamp
│   │   ├── FileUploader.jsx      # Drag-and-drop upload component
│   │   ├── MeetingCard.jsx       # Meeting list item
│   │   ├── ProcessingStatus.jsx  # Shows "Transcribing... Indexing..."
│   │   └── Sidebar.jsx           # Navigation
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Upload.jsx            # Upload new meeting
│   │   ├── MeetingChat.jsx       # Main Q&A interface
│   │   └── Meetings.jsx          # List all meetings
│   ├── services/
│   │   └── api.js                # All axios calls in one place
│   ├── hooks/
│   │   └── usePolling.js         # Poll backend for processing status
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                          # VITE_API_BASE_URL=http://localhost:8080
├── package.json
└── vite.config.js
```

### Spring Boot Backend

```
backend/
├── src/
│   └── main/
│       ├── java/com/meetingintel/
│       │   ├── MeetingIntelApplication.java
│       │   ├── controller/
│       │   │   ├── MeetingController.java      # /api/meetings
│       │   │   └── QueryController.java        # /api/meetings/{id}/query
│       │   ├── service/
│       │   │   ├── MeetingService.java         # Business logic
│       │   │   ├── FileStorageService.java     # Save files to disk
│       │   │   └── AIServiceClient.java        # HTTP calls to FastAPI
│       │   ├── repository/
│       │   │   ├── MeetingRepository.java
│       │   │   └── ChunkRepository.java
│       │   ├── model/
│       │   │   ├── Meeting.java                # JPA entity
│       │   │   └── Chunk.java                  # JPA entity
│       │   └── dto/
│       │       ├── MeetingCreateDTO.java
│       │       ├── QueryRequestDTO.java
│       │       └── QueryResponseDTO.java
│       └── resources/
│           ├── application.properties
│           └── schema.sql                      # Optional: manual schema
├── uploads/                                    # File storage (gitignored)
├── pom.xml
└── Dockerfile
```

### FastAPI AI Service

```
ai_service/
├── main.py                          # FastAPI app entry point
├── routers/
│   ├── process.py                   # /process/* endpoints
│   ├── embed.py                     # /embed/* endpoints
│   └── query.py                     # /query endpoint
├── services/
│   ├── transcription.py             # Whisper logic
│   ├── pdf_extractor.py             # PyMuPDF logic
│   ├── video_processor.py           # OpenCV + Tesseract logic
│   ├── embedder.py                  # sentence-transformers logic
│   ├── vector_store.py              # ChromaDB logic
│   └── llm_client.py                # Ollama API calls
├── models/
│   └── schemas.py                   # Pydantic request/response models
├── utils/
│   └── chunker.py                   # Text chunking logic
├── chroma_data/                     # ChromaDB persists here (gitignored)
├── requirements.txt
├── .env
└── Dockerfile
```

---

## 4. Detailed Backend APIs

### Spring Boot APIs

---

#### `POST /api/meetings` — Upload a New Meeting

**Purpose:** Accept audio, PDF slides, and optional video. Store files and trigger AI processing.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Meeting name |
| `audio` | File | Yes | `.mp3` or `.mp4` |
| `slides` | File | No | `.pdf` |
| `video` | File | No | `.mp4` screen recording |

**Response:**

```json
{
  "meetingId": "uuid-1234",
  "title": "Q3 Planning Meeting",
  "status": "PROCESSING",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

#### `GET /api/meetings` — List All Meetings

**Purpose:** Show all uploaded meetings with their processing status.

**Response:**

```json
[
  {
    "meetingId": "uuid-1234",
    "title": "Q3 Planning Meeting",
    "status": "READY",
    "duration": "47 minutes",
    "slideCount": 12,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

#### `GET /api/meetings/{id}` — Get Meeting Details

**Purpose:** Get full details of one meeting including processing status.

**Response:**

```json
{
  "meetingId": "uuid-1234",
  "title": "Q3 Planning Meeting",
  "status": "READY",
  "transcriptPreview": "Good morning everyone, let's start the Q3 planning...",
  "slideCount": 12,
  "chunkCount": 87,
  "duration": "47 minutes"
}
```

---

#### `POST /api/meetings/{id}/query` — Ask a Question

**Purpose:** Ask a natural language question about a meeting. Returns AI answer with citations.

**Request:**

```json
{
  "question": "What was the final decision on pricing?"
}
```

**Response:**

```json
{
  "answer": "At 14:32, the team confirmed a final pricing of $299/month for the Pro tier. John mentioned this after Sarah raised concerns about market positioning.",
  "citations": [
    {
      "type": "transcript",
      "timestamp": "14:32",
      "timestampSeconds": 872,
      "text": "Alright, let's lock in $299/month for Pro. That's final.",
      "speaker": "John"
    },
    {
      "type": "slide",
      "slideNumber": 7,
      "slideTitle": "Pricing Tiers",
      "text": "Pro Plan: $299/month — includes all features"
    }
  ]
}
```

---

#### `GET /api/meetings/{id}/status` — Poll Processing Status

**Purpose:** Frontend polls this every 3 seconds to know when processing is done.

**Response:**

```json
{
  "meetingId": "uuid-1234",
  "status": "PROCESSING",
  "steps": [
    { "step": "TRANSCRIPTION", "status": "DONE" },
    { "step": "PDF_EXTRACTION", "status": "DONE" },
    { "step": "EMBEDDING", "status": "IN_PROGRESS" },
    { "step": "INDEXING", "status": "PENDING" }
  ]
}
```

---

### FastAPI AI Service APIs

---

#### `POST /process/audio` — Transcribe Audio

**Request:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 5.2,
      "text": "Good morning everyone.",
      "speaker": null
    },
    {
      "start": 5.2,
      "end": 12.8,
      "text": "Let's start with the pricing discussion.",
      "speaker": null
    }
  ],
  "full_text": "Good morning everyone. Let's start with the pricing discussion..."
}
```

---

#### `POST /process/pdf` — Extract PDF Slides

**Request:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "pages": [
    {
      "page_number": 1,
      "text": "Q3 Product Roadmap Meeting\nDate: January 15, 2024"
    },
    {
      "page_number": 7,
      "text": "Pricing Tiers\nBasic: $99/month\nPro: $299/month\nEnterprise: Custom"
    }
  ]
}
```

---

#### `POST /process/video` — Extract Video Frames + OCR

**Request:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "frames": [
    {
      "timestamp_seconds": 0,
      "timestamp_display": "0:00",
      "ocr_text": "JIRA Board - Sprint 14"
    },
    {
      "timestamp_seconds": 300,
      "timestamp_display": "5:00",
      "ocr_text": "Budget Slide - Q3 Total: $450,000"
    }
  ]
}
```

---

#### `POST /embed/store` — Store Chunks in ChromaDB

**Request:**

```json
{
  "meeting_id": "uuid-1234",
  "chunks": [
    {
      "chunk_id": "chunk-001",
      "text": "John confirmed the pricing at $299/month for Pro tier.",
      "metadata": {
        "type": "transcript",
        "timestamp": "14:32",
        "timestamp_seconds": 872
      }
    }
  ]
}
```

**Response:**

```json
{ "stored": 87, "meeting_id": "uuid-1234" }
```

---

#### `POST /query` — Answer a Question

**Request:**

```json
{
  "meeting_id": "uuid-1234",
  "question": "Who disagreed with the timeline?"
}
```

**Response:**

```json
{
  "answer": "Sarah strongly disagreed with the Q3 timeline at 22:15, saying it was 'unrealistic given the current team capacity'. This was also reflected in Slide 9 which showed resource allocation gaps.",
  "sources": [
    {
      "chunk_id": "chunk-042",
      "score": 0.91,
      "text": "I think this timeline is completely unrealistic given what we have.",
      "metadata": { "type": "transcript", "timestamp": "22:15", "timestamp_seconds": 1335 }
    },
    {
      "chunk_id": "chunk-055",
      "score": 0.84,
      "text": "Resource Gaps: Engineering team at 110% capacity through Q3",
      "metadata": { "type": "slide", "slide_number": 9 }
    }
  ]
}
```

---

## 5. AI Pipeline Explanation

### Step 1: Transcription

**What it does:** Converts spoken words in audio/video into text with timestamps.

**Plain English:** Imagine a person who listens to the meeting recording and types out every word with a stopwatch running.

**Tool:** OpenAI Whisper (runs locally, free)

**Code:**

```python
import whisper

model = whisper.load_model("base")  # or "small" for better accuracy
result = model.transcribe("meeting.mp3")

for segment in result["segments"]:
    print(f"{segment['start']:.1f}s - {segment['end']:.1f}s: {segment['text']}")
```

**Output:** A list of text segments each with a start/end time in seconds.

---

### Step 2: PDF Extraction

**What it does:** Reads every page of your presentation PDF and extracts the text.

**Plain English:** It's like reading a book and copying down what's written on each page, noting the page number.

**Tool:** PyMuPDF

**Code:**

```python
import fitz  # PyMuPDF

def extract_pdf(path):
    doc = fitz.open(path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text()
        pages.append({"page_number": i + 1, "text": text})
    return pages
```

---

### Step 3: Chunking

**What it is:** Breaking long text into smaller overlapping pieces.

**Why it matters:** You can't search an entire 45-minute transcript at once. You break it into small pieces (200–400 words), and search for which piece best answers your question.

**Plain English:** Imagine cutting a long document into index cards. Each card has some context from the cards around it (overlap), so no idea gets cut in half.

**Code:**

```python
def chunk_text(text, chunk_size=300, overlap=50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap  # overlap creates continuity
    return chunks
```

---

### Step 4: Embeddings

**What they are:** A list of numbers (like `[0.23, -0.81, 0.14, ...]`) that represents the "meaning" of a piece of text.

**Why it matters:** Two sentences with the same meaning get similar numbers even if they use different words. This lets you search by *meaning*, not just exact keywords.

**Plain English:** Imagine converting "What's the budget?" and "How much money do we have?" into coordinates on a map — similar questions land near each other on the map.

**Tool:** `sentence-transformers` (runs locally, free)

**Code:**

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # tiny, fast model

texts = ["The pricing was set at $299/month", "John confirmed the budget"]
embeddings = model.encode(texts)
# embeddings[0] is a list of 384 numbers
```

---

### Step 5: Vector Search

**What it does:** Finds the text chunks most similar in meaning to your question.

**Plain English:** You convert your question into a point on a map (an embedding). ChromaDB finds the 5 nearest chunks (neighbors) on that map.

**Tool:** ChromaDB

**Code:**

```python
results = collection.query(
    query_embeddings=[question_embedding],
    n_results=5,
    where={"meeting_id": "uuid-1234"}
)
```

---

### Step 6: RAG Pipeline

**What RAG means:** Retrieval-Augmented Generation. A fancy way of saying: "Look up relevant facts first, then generate an answer based on those facts."

**Plain English:** Instead of asking the AI to answer from memory (which it might get wrong), you first RETRIEVE the relevant pieces of text from the meeting, then you AUGMENT the question with that context, and then the AI GENERATES a precise answer.

**This is how you get grounded answers with citations.**

**Code:**

```python
def answer_question(question, meeting_id):
    # Step 1: Retrieve relevant chunks
    question_embedding = embedder.encode([question])[0]
    results = chroma_collection.query(query_embeddings=[question_embedding], n_results=5)
    
    # Step 2: Build context from retrieved chunks
    context = "\n\n".join([
        f"[{chunk['metadata']['type']} @ {chunk['metadata'].get('timestamp', 'Slide ' + str(chunk['metadata'].get('slide_number', '')))}]: {chunk['text']}"
        for chunk in results
    ])
    
    # Step 3: Build prompt
    prompt = f"""You are a meeting assistant. Answer based ONLY on the context below.
Always cite the timestamp or slide number in your answer.

Context:
{context}

Question: {question}
Answer:"""
    
    # Step 4: Generate answer with LLM
    response = ollama.chat(model="qwen2.5:7b", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"], results
```

---

### Step 7: Grounding / Citations

**What it means:** Every claim in the AI's answer must be traceable to a specific source.

**How to implement it:**

The `results` from ChromaDB already contain metadata (`timestamp`, `slide_number`, `text`). You return these alongside the answer, and the frontend displays them as clickable citation cards.

**The prompt must explicitly instruct the model** to cite sources using the context provided. Add this to every prompt:

```
"Always include timestamps or slide numbers when making claims.
If you cannot find the answer in the context, say 'I could not find that in the meeting.'"
```

---

## 6. Database Design

### PostgreSQL Schema

```sql
-- meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PROCESSING',
    -- PROCESSING, READY, FAILED
    audio_path VARCHAR(500),
    pdf_path VARCHAR(500),
    video_path VARCHAR(500),
    duration_seconds INTEGER,
    slide_count INTEGER,
    chunk_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- chunks table (mirrors what's in ChromaDB, for SQL queries)
CREATE TABLE chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    chunk_type VARCHAR(50),  -- 'transcript', 'slide', 'frame'
    text TEXT NOT NULL,
    timestamp_seconds FLOAT,     -- null for slides
    timestamp_display VARCHAR(20), -- "14:32"
    slide_number INTEGER,          -- null for transcript
    speaker VARCHAR(100),          -- null if not detected
    chroma_chunk_id VARCHAR(255),  -- the ID in ChromaDB
    created_at TIMESTAMP DEFAULT NOW()
);

-- query_log table (nice to have for evaluation)
CREATE TABLE query_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id),
    question TEXT NOT NULL,
    answer TEXT,
    citations_count INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Spring Boot JPA Entities

```java
// Meeting.java
@Entity
@Table(name = "meetings")
@Data
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String title;
    private String status;
    private String audioPath;
    private String pdfPath;
    private String videoPath;
    private Integer durationSeconds;
    private Integer slideCount;
    private Integer chunkCount;
    private LocalDateTime createdAt;
}
```

---

## 7. ChromaDB Integration

### What Is a Vector Database? (Plain English)

A regular database stores and finds exact text. ChromaDB stores and finds text by *meaning*.

Think of it like this:
- Regular DB: "Find rows where text = 'pricing'"
- ChromaDB: "Find chunks that are about pricing, even if they say 'cost', 'fee', 'charge', or '$299'"

### What Are Embeddings? (Revisited Simply)

Every piece of text gets converted to a list of ~384 numbers. These numbers capture *what the text means*. Text with similar meanings produces similar number lists. ChromaDB stores these number lists and can find the most similar ones quickly.

### Setup

```python
import chromadb
from sentence_transformers import SentenceTransformer

# Initialize ChromaDB (persists to disk)
client = chromadb.PersistentClient(path="./chroma_data")

# Create or get collection
collection = client.get_or_create_collection(
    name="meeting_chunks",
    metadata={"hnsw:space": "cosine"}  # cosine similarity = better for text
)

# Load embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")
```

### Storing Chunks

```python
def store_chunks(meeting_id: str, chunks: list[dict]):
    texts = [c["text"] for c in chunks]
    embeddings = embedder.encode(texts).tolist()
    ids = [f"{meeting_id}-{i}" for i in range(len(chunks))]
    metadatas = [c["metadata"] for c in chunks]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )
```

### Querying

```python
def search(question: str, meeting_id: str, top_k: int = 5):
    question_embedding = embedder.encode([question]).tolist()[0]

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
        where={"meeting_id": meeting_id}  # filter by meeting
    )

    return [
        {
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "score": 1 - results["distances"][0][i]  # convert distance to similarity
        }
        for i in range(len(results["documents"][0]))
    ]
```

---

## 8. Video Processing

### The Simplest Possible Approach

**Don't try to do speaker detection or scene understanding. Just:**
1. Extract one frame every 5 seconds
2. Run OCR on each frame
3. Link the extracted text to the timestamp

This gives you screen content (like slides shown on screen, chat messages, browser content) linked to the time in the video.

### Implementation

```python
import cv2
import pytesseract
from PIL import Image
import numpy as np

def extract_frames_with_ocr(video_path: str, interval_seconds: int = 5):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * interval_seconds)
    
    results = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % frame_interval == 0:
            timestamp_seconds = frame_count / fps
            
            # Convert to PIL Image for Tesseract
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            # Run OCR
            text = pytesseract.image_to_string(pil_image).strip()
            
            if text:  # Only store frames that have text
                results.append({
                    "timestamp_seconds": round(timestamp_seconds, 1),
                    "timestamp_display": f"{int(timestamp_seconds // 60)}:{int(timestamp_seconds % 60):02d}",
                    "ocr_text": text
                })
        
        frame_count += 1
    
    cap.release()
    return results
```

### Install Tesseract

```bash
# Ubuntu/Linux
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Important Notes

- OCR is slow. For a 45-min meeting at 1 frame/5 sec = 540 frames. Plan for this to take 2–5 minutes.
- If OCR text is garbage (low quality video), it's okay to skip — audio + PDF already cover most questions.
- For the demo, use screen recording with clear text visible (not a webcam video).

---

## 9. Frontend Plan

### File Upload Flow

```jsx
// Upload.jsx - simplified
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Upload() {
  const [files, setFiles] = useState({ audio: null, slides: null, video: null });
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | ready

  const onDrop = useCallback((acceptedFiles, type) => {
    setFiles(prev => ({ ...prev, [type]: acceptedFiles[0] }));
  }, []);

  const handleUpload = async () => {
    setStatus('uploading');
    const formData = new FormData();
    formData.append('title', 'My Meeting');
    formData.append('audio', files.audio);
    if (files.slides) formData.append('slides', files.slides);
    if (files.video) formData.append('video', files.video);

    const res = await api.post('/api/meetings', formData);
    const meetingId = res.data.meetingId;
    
    // Start polling for status
    setStatus('processing');
    pollStatus(meetingId);
  };

  // ... render with drag-and-drop zones
}
```

### Chat Interface

```jsx
// MeetingChat.jsx - simplified
export default function MeetingChat({ meetingId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    const question = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    const res = await api.post(`/api/meetings/${meetingId}/query`, { question });
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: res.data.answer,
      citations: res.data.citations  // Array of source chunks
    }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && <LoadingBubble />}
      </div>
      <div className="border-t p-4">
        <input value={input} onChange={e => setInput(e.target.value)} 
               onKeyDown={e => e.key === 'Enter' && askQuestion()}
               placeholder="Ask about the meeting..." />
      </div>
    </div>
  );
}
```

### Citation Card Component

```jsx
// CitationCard.jsx
export default function CitationCard({ citation }) {
  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <div className="flex items-center gap-2 text-blue-600 font-medium mb-1">
        {citation.type === 'transcript' ? (
          <span>🎙️ Transcript @ {citation.timestamp}</span>
        ) : (
          <span>📊 Slide {citation.slideNumber}: {citation.slideTitle}</span>
        )}
      </div>
      <p className="text-gray-700 italic">"{citation.text}"</p>
    </div>
  );
}
```

### Processing Status Component

```jsx
// ProcessingStatus.jsx
const steps = ['TRANSCRIPTION', 'PDF_EXTRACTION', 'VIDEO_FRAMES', 'EMBEDDING', 'INDEXING'];
const labels = {
  TRANSCRIPTION: '🎙️ Transcribing audio...',
  PDF_EXTRACTION: '📄 Reading slides...',
  VIDEO_FRAMES: '🎬 Analyzing video frames...',
  EMBEDDING: '🧠 Creating embeddings...',
  INDEXING: '🔍 Indexing for search...'
};

export default function ProcessingStatus({ steps: stepStatuses }) {
  return (
    <div className="space-y-2">
      {steps.map(step => {
        const status = stepStatuses.find(s => s.step === step)?.status;
        return (
          <div key={step} className="flex items-center gap-2">
            <span>{status === 'DONE' ? '✅' : status === 'IN_PROGRESS' ? '⏳' : '⬜'}</span>
            <span className={status === 'IN_PROGRESS' ? 'font-bold' : ''}>{labels[step]}</span>
          </div>
        );
      })}
    </div>
  );
}
```

### Suggested Question Chips

Add these below the input box for the demo:

```jsx
const SUGGESTED_QUESTIONS = [
  "What was the final decision on pricing?",
  "Which slide discussed the budget issue?",
  "Who disagreed with the timeline?",
  "What action items were assigned?"
];

{SUGGESTED_QUESTIONS.map(q => (
  <button key={q} onClick={() => setInput(q)}
          className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
    {q}
  </button>
))}
```

This single feature dramatically impresses evaluators — they can click and immediately see the system answer.

---

## 10. Deployment Plan

### JarvisLabs Setup

JarvisLabs provides GPU cloud instances with NVIDIA GPUs. Perfect for running Ollama with Qwen2.5.

**Step 1: Start an Instance**

- Go to [jarvis.graphneurallabs.com](https://jarvis.graphneurallabs.com)
- Choose PyTorch template (comes with CUDA, Python 3.10)
- Minimum: RTX 3090 (24GB VRAM) for Qwen2.5 7B

**Step 2: Install Ollama + Pull Model**

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the model (downloads ~4GB)
ollama pull qwen2.5:7b
# Or lighter alternative:
ollama pull gemma:7b

# Test it works
ollama run qwen2.5:7b "Hello"

# Run as a server
ollama serve  # Runs on port 11434
```

**Step 3: Deploy FastAPI**

```bash
# Install dependencies
pip install -r requirements.txt

# Install system deps
sudo apt-get install -y tesseract-ocr ffmpeg

# Run FastAPI
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Step 4: Deploy Spring Boot**

```bash
# Build JAR
./mvnw package -DskipTests

# Run
java -jar target/meeting-intel-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/meetingdb \
  --ai.service.url=http://localhost:8000
```

**Step 5: Deploy React Frontend**

```bash
# Build
VITE_API_BASE_URL=http://<jarvis-ip>:8080 npm run build

# Serve with nginx or:
npx serve -s dist -l 3000
```

**Step 6: PostgreSQL Setup**

```bash
sudo apt-get install -y postgresql
sudo -u postgres psql
CREATE DATABASE meetingdb;
CREATE USER meetinguser WITH PASSWORD 'password';
GRANT ALL ON DATABASE meetingdb TO meetinguser;
```

### Environment Variables

```bash
# FastAPI .env
OLLAMA_BASE_URL=http://localhost:11434
CHROMA_PATH=./chroma_data
WHISPER_MODEL=base

# Spring Boot application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/meetingdb
spring.datasource.username=meetinguser
spring.datasource.password=password
ai.service.url=http://localhost:8000
file.upload.path=./uploads
```

### Quick Alternative: Run Everything Locally

If JarvisLabs is too expensive for demo:
- Run Ollama on your local machine (if you have a GPU)
- Use CPU mode for Whisper `base` model (slower but works)
- Everything runs on localhost

---

## 11. README Strategy

### Structure

```markdown
# 🧠 Meeting Intelligence Assistant

> Ask questions about your meetings. Get answers with timestamps, slide numbers, and exact quotes.

## 🎥 Demo

[Insert GIF or screenshot here]

**Try it live:** [https://your-deployment-url.com](...)

## 📋 Example Questions

Given a meeting recording + slides, the system can answer:

- *"What was the final decision on pricing?"* → "At 14:32, the team confirmed $299/month for Pro..."
- *"Which slide discussed the budget issue?"* → "Slide 9 — Resource Allocation showed a $150K shortfall..."
- *"Who disagreed with the timeline?"* → "Sarah objected at 22:15, citing team capacity constraints..."
- *"What action items were assigned?"* → "3 action items: 1) John to finalize pricing by Friday..."

## 🏗️ Architecture

[Insert architecture diagram here — use draw.io or Excalidraw]

Three services working together:
- **React Frontend** — Upload interface and chat UI
- **Spring Boot Backend** — API gateway, file storage, PostgreSQL
- **FastAPI AI Service** — Transcription, PDF parsing, embeddings, Q&A

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Ollama with `qwen2.5:7b` pulled

### Run Locally
\`\`\`bash
git clone https://github.com/yourusername/meeting-intel
cd meeting-intel
cp .env.example .env
docker-compose up
# Open http://localhost:3000
\`\`\`

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + Tailwind | Fast, familiar |
| Backend | Spring Boot | Robust REST API |
| AI Service | FastAPI + Python | AI ecosystem |
| Transcription | OpenAI Whisper | Best open-source STT |
| Embeddings | sentence-transformers | Fast, local, free |
| Vector DB | ChromaDB | Simple, embeddable |
| LLM | Qwen2.5 via Ollama | Local, no API costs |
| PDF | PyMuPDF | Reliable extraction |
| OCR | Tesseract | Open-source OCR |

## 🤖 What I Used AI For

- Claude helped me understand RAG pipelines and write the ChromaDB integration
- GitHub Copilot assisted with boilerplate Spring Boot code
- The core architecture decisions, prompt engineering, and integration logic are my own

## 🔮 What I Would Improve

1. **Speaker Diarization** — Identify who said what (using pyannote-audio)
2. **Better Chunking** — Semantic chunking instead of fixed-size windows
3. **Multi-meeting Search** — Ask questions across all meetings at once
4. **Real-time Processing** — Stream transcription as the meeting happens
5. **Better OCR** — Use GPT-4V or similar for screen content understanding

## 📁 Project Structure

[Link to Section 3 of this doc]
```

---

## 12. Demo Dataset Strategy

### Creating a Convincing Fake Meeting

You need a meeting that contains:
- A **pricing debate** with a final decision
- Someone **disagreeing with the timeline**
- A **budget issue** mentioned in a slide
- **Action items** assigned to specific people

### Option A: AI-Generated Script + Text-to-Speech

**Step 1: Write the script (use Claude)**

```
Meeting participants:
- John (CEO) — pushes for $299/month pricing
- Sarah (Engineering Lead) — disagrees with Q3 timeline
- Mike (Finance) — raises budget concerns
- Lisa (Product) — takes notes, assigns action items

Script should include:
[14:32] John: "Alright team, let's lock in $299/month for the Pro tier. That's my final call."
[22:15] Sarah: "I have to push back on this Q3 deadline. With our current team capacity at 110%, 
              this timeline is completely unrealistic."
[31:07] Mike: "I've flagged this in Slide 9. We have a $150,000 shortfall in the Q3 budget. 
              We need to either cut scope or find additional funding."
[44:20] Lisa: "Okay, let me summarize the action items. John — finalize pricing doc by Friday. 
              Sarah — submit revised timeline by Thursday. Mike — present budget options Monday."
```

**Step 2: Generate audio (free tools)**

- Use [ElevenLabs free tier](https://elevenlabs.io) for different voices
- Or use `gTTS` (Google Text-to-Speech) in Python — it's free but robotic:

```python
from gtts import gTTS
tts = gTTS("Alright team, let's lock in 299 dollars per month...")
tts.save("meeting_audio.mp3")
```

**Step 3: Create the PDF slides**

Use Google Slides or PowerPoint with these slides:

| Slide # | Title | Key Content |
|---------|-------|-------------|
| 1 | Q3 Planning Meeting | Agenda overview |
| 4 | Product Roadmap | Q3 features list |
| 7 | Pricing Tiers | Basic: $99, Pro: $299, Enterprise: custom |
| 9 | Budget Allocation | "$150K shortfall highlighted in red" |
| 11 | Action Items | Table with 3 items: John/Sarah/Mike with deadlines |
| 12 | Timeline | Q3 milestone chart with "AT RISK" labels |

**Step 4: Verify your 4 demo questions work**

Before the demo, confirm these exact answers come back:

1. "What was the final decision on pricing?" → mentions $299, John, slide 7
2. "Which slide discussed the budget issue?" → mentions Slide 9, $150K
3. "Who disagreed with the timeline?" → mentions Sarah, 22:15
4. "What action items were assigned?" → lists all 3 items

---

## 13. Risks & Fallbacks

### Risk 1: Ollama / LLM is Too Slow

**Symptom:** Answers take 30+ seconds

**Fallback Options:**

- Use a smaller model: `ollama pull gemma:2b` (much faster, less accurate)
- Use Claude API or OpenAI API as backup (instant, costs money)
- Pre-compute answers for the 4 demo questions and hardcode them for the demo

### Risk 2: Whisper Transcription Errors

**Symptom:** Names/prices in transcript are wrong

**Fallback:** Use WhisperX (better accuracy) or manually edit the transcript file before storing

### Risk 3: ChromaDB Returns Wrong Results

**Symptom:** Questions return irrelevant chunks

**Fixes:**
- Increase `n_results` from 5 to 10
- Improve chunking (smaller chunks with more overlap)
- Make sure metadata filters (`where={"meeting_id": ...}`) are correct

### Risk 4: Spring Boot ↔ FastAPI Communication Fails

**Symptom:** 500 errors from Spring Boot

**Debug Steps:**
1. Test FastAPI directly with curl first
2. Check that `ai.service.url` is correct
3. Check that FastAPI is running: `curl http://localhost:8000/health`

**Fallback:** Call FastAPI directly from the frontend (bypass Spring Boot for the demo)

### Risk 5: Running Out of Time

**Priority order — cut from the bottom:**

1. ✅ MUST: Audio transcription + PDF extraction + Q&A (core feature)
2. ✅ MUST: Basic React upload + chat UI
3. ✅ MUST: Citation display
4. ⚡ IF TIME: Video frame OCR
5. ⚡ IF TIME: Multiple meetings management
6. ❌ SKIP: Speaker diarization, real-time processing, authentication

**The simplest possible MVP that still impresses:**

- One-meeting demo only
- Pre-process the demo meeting before the presentation
- Skip the upload UI — go directly to the chat interface
- Hardcode the meeting ID in the frontend

---

## 14. Learning Resources

### Topic 1: RAG (Retrieval-Augmented Generation)

**What to learn:** How to combine vector search with LLM generation

**Why it matters:** This is the core of your entire system

**Best resource:** [LangChain RAG tutorial](https://python.langchain.com/docs/tutorials/rag/) — you won't use LangChain, but the concept explanation is excellent

**Quick video:** "RAG in 15 minutes" by Sam Witteveen on YouTube

---

### Topic 2: ChromaDB

**What to learn:** How to store and query embeddings

**Why it matters:** This is your entire search layer

**Best resource:** [ChromaDB official docs](https://docs.trychroma.com/) — excellent getting started guide

---

### Topic 3: OpenAI Whisper

**What to learn:** How to transcribe audio locally

**Why it matters:** You need timestamped transcripts

**Best resource:** [Whisper GitHub README](https://github.com/openai/whisper) — very clear examples

---

### Topic 4: sentence-transformers

**What to learn:** How to convert text to embeddings

**Why it matters:** Without good embeddings, your search won't work

**Best resource:** [sentence-transformers quickstart](https://www.sbert.net/docs/quickstart.html) — 10-minute read

---

### Topic 5: Ollama

**What to learn:** How to run LLMs locally

**Why it matters:** Free, no API costs, runs during demo without internet

**Best resource:** [Ollama GitHub](https://github.com/ollama/ollama) + `ollama run` command

---

### Topic 6: FastAPI

**What to learn:** How to build Python REST APIs quickly

**Why it matters:** All your AI code lives here

**Best resource:** [FastAPI official tutorial](https://fastapi.tiangolo.com/tutorial/) — 30 minutes to get productive

---

## 15. MVP vs Stretch Goals

### MUST HAVE (Without These, It's Not the Project)

- Audio transcription with Whisper producing timestamped text
- PDF slide text extraction with page numbers
- Chunking and storing in ChromaDB
- Natural language Q&A with answers citing timestamps and slide numbers
- React chat UI with citation display
- At least 4 pre-loaded demo questions that work

### NICE TO HAVE (Do These If Ahead of Schedule)

- Video frame OCR
- Upload UI with drag-and-drop
- Processing status polling
- Multiple meetings management
- Dark mode
- Export chat transcript

### OVERENGINEERING TRAPS TO AVOID

| Trap | Why It Wastes Time |
|------|-------------------|
| Speaker diarization | Complex ML, rarely helps the demo |
| Authentication / login | Not needed for a demo |
| Docker Compose for everything | Just run services manually |
| Custom embedding model | all-MiniLM-L6-v2 is already excellent |
| Streaming LLM responses | Complex frontend logic, marginal UX gain |
| Re-ranking with cross-encoders | Advanced RAG, day 4+ work |
| Real-time transcription | Completely separate feature |
| Multiple LLM providers | Pick one and stick with it |

---

## 16. Evaluation Optimization

### What Hiring Evaluators Care About

Based on typical hiring assessments for AI/full-stack roles:

1. **Does it work end-to-end?** — This is #1. A buggy beautiful UI is worse than an ugly working system.
2. **Do you understand what you built?** — Can you explain every component?
3. **Is the code readable?** — Clear variable names, no spaghetti
4. **Is the architecture sensible?** — Did you make reasonable choices?
5. **Did you handle edge cases?** — Empty answers, processing failures, invalid files

### How to Look Polished With Simple Implementation

**1. Demo Dataset Is Pre-Loaded**

Never make evaluators wait for uploads to process. Pre-load your demo meeting before the presentation. Show it's already ready.

**2. Suggested Question Chips**

These 4 buttons immediately demonstrate the system's capabilities without the evaluator needing to think of questions.

**3. Good Citation UI**

Even if the answer is slightly wrong, if the citations look professional (timestamp, slide number, exact text), it looks impressive.

**4. Architecture Diagram in README**

A clear diagram shows you understand the system holistically, not just wrote code.

**5. "What I would improve" Section**

This shows self-awareness and engineering maturity. List 4–5 concrete, realistic improvements.

**6. Processing Status Steps**

Showing "Transcribing → Extracting → Embedding → Indexing" makes the system feel sophisticated even if each step is simple.

**7. Honest README Section: "What I Used AI for"**

Evaluators respect honesty. Being clear about where you used AI assistance demonstrates integrity.

### How to Stand Out

- Add a system architecture diagram (use [Excalidraw](https://excalidraw.com), free)
- Write thoughtful commit messages (not "fix stuff")
- Add docstrings to your FastAPI functions
- Include a 3-minute screen-recorded demo video
- Deploy it so they can try it without setup

---

## 17. Exact Execution Order

Follow this sequence precisely. Never jump ahead.

```
Day 1 Morning:
□ 1. Create GitHub repo + folder structure
□ 2. Set up PostgreSQL locally
□ 3. Create Spring Boot project with correct dependencies
□ 4. Create FastAPI project + install dependencies
□ 5. Create Vite React project + install dependencies

□ 6. FastAPI: Whisper transcription endpoint (test with curl)
□ 7. FastAPI: PyMuPDF PDF extraction (test with curl)
□ 8. FastAPI: ChromaDB setup + store chunks endpoint

Day 1 Afternoon:
□ 9. Spring Boot: Meeting entity + repository + database schema
□ 10. Spring Boot: File upload endpoint (save to disk)
□ 11. Spring Boot: Call FastAPI after upload (AIServiceClient.java)
□ 12. End-to-end test: Upload a PDF → verify chunks in ChromaDB

Day 2 Morning:
□ 13. FastAPI: RAG query endpoint (search ChromaDB + call Ollama)
□ 14. Install Ollama + pull Qwen2.5 model + test
□ 15. Spring Boot: /api/meetings/{id}/query endpoint
□ 16. Test with Postman: Ask a question, get answer with citations

Day 2 Afternoon:
□ 17. React: Create api.js service file
□ 18. React: File upload component + upload page
□ 19. React: Processing status polling hook
□ 20. React: Chat page with message bubbles
□ 21. React: Citation card component
□ 22. React: Suggested question chips

Day 3 Morning:
□ 23. Create demo audio script (use gTTS or ElevenLabs)
□ 24. Create demo PDF slides (Google Slides → Export PDF)
□ 25. Process demo meeting through the system
□ 26. Test all 4 demo questions — verify good answers

Day 3 Afternoon:
□ 27. FastAPI: Video frame OCR endpoint (if time allows)
□ 28. Polish React UI with Tailwind
□ 29. Write README with architecture diagram
□ 30. Deploy to JarvisLabs
□ 31. Record 3-minute demo video
□ 32. Push everything to GitHub
```

---

## 18. Beginner-Friendly Glossary

### Embeddings

Numbers that capture meaning. Sentence "The pricing was set to $299" becomes `[0.21, -0.83, 0.14, ...]` — a list of 384 numbers. Similar sentences get similar numbers. This lets computers compare meaning, not just words.

### Vector Database (ChromaDB)

A database that stores and searches embeddings. Instead of `WHERE text = 'pricing'`, you say "find me the 5 pieces of text most similar to this question." ChromaDB finds them instantly even with millions of chunks.

### RAG (Retrieval-Augmented Generation)

The combination of:
1. **R**etrieve: Find relevant text chunks with vector search
2. **A**ugment: Add those chunks to your question as context
3. **G**enerate: Let the LLM write an answer based on that context

This is how you prevent the AI from making things up — you only let it answer from real meeting content.

### Chunking

Splitting a long text into smaller overlapping pieces (typically 200–400 words). You need this because you can't embed and search a 45-minute transcript as one blob — you need to find which *part* of it is relevant.

### OCR (Optical Character Recognition)

Reading text from images. Tesseract looks at a photo of text and tells you what words are in it. Used for reading text visible in video frames (screen content, slides shown on screen).

### Inference

Running an AI model to produce output. When you call Whisper to transcribe audio, or Qwen2.5 to answer a question — that's inference.

### Token

The unit of text that LLMs work with. Roughly, 1 token ≈ ¾ of a word. LLMs have a maximum context window (like 8000 tokens) — you can't send more text than this at once. This is why chunking matters.

### Vector Store vs SQL Database

- SQL (PostgreSQL): Great for structured data (meetings table, user info)
- Vector Store (ChromaDB): Great for unstructured text search by meaning

You need both. PostgreSQL stores meeting metadata. ChromaDB stores the content for searching.

---

## 19. Practical Advice

### Common Mistakes

**Mistake 1: Not testing each service independently**

Always `curl` your FastAPI endpoints directly before wiring to Spring Boot. Debugging across two services is 10x harder.

**Mistake 2: Starting with the frontend**

Build the AI pipeline first. If Q&A doesn't work, the UI doesn't matter.

**Mistake 3: Large Whisper models on slow hardware**

`whisper-large` takes 5 minutes on CPU. Use `whisper-base` or `whisper-small` for development.

**Mistake 4: Forgetting to filter ChromaDB by meeting_id**

Without the `where={"meeting_id": ...}` filter, answers mix content from all meetings.

**Mistake 5: Vague LLM prompts**

"Answer the question based on context" is weak. Always tell the model: what format to use, what to cite, what to say when it doesn't know.

---

### Shortcuts

- Use Claude or ChatGPT to write boilerplate (Spring Boot DTOs, React components)
- Use Postman collections to test all APIs — export and commit to repo
- Use `print()` statements liberally in FastAPI — much faster than debuggers for AI pipelines
- ChromaDB's `peek()` function shows stored chunks — great for debugging

---

### Debugging Tips

**ChromaDB returns empty results:**
```python
# Check what's stored
print(collection.count())  # Should be > 0
print(collection.peek())   # See first 10 items
```

**Whisper produces wrong timestamps:**
- Check that you're using `result["segments"]` not just `result["text"]`
- Large audio files: split into 10-minute chunks first

**Ollama doesn't respond:**
```bash
curl http://localhost:11434/api/generate \
  -d '{"model": "qwen2.5:7b", "prompt": "test", "stream": false}'
```

**Spring Boot can't reach FastAPI:**
```java
// Check your AIServiceClient
ResponseEntity<String> response = restTemplate.getForEntity(
    aiServiceUrl + "/health", String.class);
System.out.println(response.getStatusCode());
```

---

### Realistic Expectations

- Whisper `base` accuracy: ~90% on clear English speech. Acceptable.
- ChromaDB retrieval: won't always find the exact chunk. Tune `n_results`.
- Qwen2.5 7B quality: very good for factual extraction, struggles with complex reasoning.
- OCR from video: ~60–70% accuracy on typical screen recordings. Supplement with audio.
- Total processing time per meeting: 3–10 minutes depending on length and hardware.

---

### Where AI Coding Assistants Help Most

- Writing repetitive Spring Boot code (DTOs, repositories, controllers)
- Writing Tailwind CSS components
- Debugging cryptic error messages (paste the stack trace into Claude)
- Writing the FastAPI Pydantic models
- Generating realistic demo meeting scripts

---

## 20. Final Deliverable Checklist

### GitHub Repository

- [ ] Public GitHub repo with clear name (`meeting-intelligence-assistant`)
- [ ] All three services in separate directories
- [ ] `.env.example` files for all services
- [ ] `.gitignore` excludes: `uploads/`, `chroma_data/`, `target/`, `node_modules/`, `.env`
- [ ] `README.md` with architecture diagram and setup instructions
- [ ] `docker-compose.yml` (optional but impressive)

### Deployment

- [ ] FastAPI service running and accessible via URL
- [ ] Spring Boot backend running and accessible via URL
- [ ] React frontend built and served via URL
- [ ] Ollama running with Qwen2.5 model loaded
- [ ] PostgreSQL database running with schema applied
- [ ] ChromaDB persisting to disk
- [ ] Demo meeting pre-loaded and all 4 questions verified

### Demo Readiness

- [ ] Demo meeting audio file processed
- [ ] Demo PDF slides processed
- [ ] All 4 sample questions produce good answers with citations
- [ ] Suggested question chips visible in the UI
- [ ] Processing status shows correctly
- [ ] Citation cards display timestamp/slide number/text
- [ ] No obvious UI bugs on Chrome

### README Must-Haves

- [ ] Architecture diagram (image embedded in README)
- [ ] Live demo URL
- [ ] Screenshot of the chat UI with citations
- [ ] Tech stack table
- [ ] "What I used AI for" section
- [ ] "What I would improve" section (4–5 items)
- [ ] Local setup instructions (under 10 commands)

### Sample Data

- [ ] Demo audio file committed to repo (or linked in README)
- [ ] Demo PDF slides committed to repo
- [ ] Sample questions and expected answers documented

### Screenshots / Video

- [ ] Screenshot: Upload page
- [ ] Screenshot: Processing status
- [ ] Screenshot: Chat with answer + citation cards
- [ ] Screenshot: Citation showing timestamp + slide reference
- [ ] Video demo: 3 minutes, shows full flow from upload to answer

---

## 🎯 Final Words From Your Senior Engineer

You have a React and Spring Boot foundation. You don't need to understand machine learning to build this. You need to understand **data flow**:

1. Files come in → text comes out (Whisper, PyMuPDF)
2. Text gets chunked and stored as searchable numbers (embeddings in ChromaDB)
3. Questions find the most relevant chunks (vector search)
4. Those chunks + question become a prompt → LLM writes a grounded answer

That's it. Every line of code you write is serving one of those four steps.

**Build in this order: data pipeline → Q&A → UI. Never the other way around.**

**Use your existing strengths:** Your Spring Boot is just a REST API that stores files and makes HTTP calls to Python. You've done this a hundred times. Your React is just forms and chat bubbles. The only new thing is FastAPI + ChromaDB, and both have excellent documentation.

**Don't be afraid to simplify:** A system that works for one meeting with four great demo questions is infinitely better than an overengineered system with five half-broken features.

**You've got this. Start with Step 1 in Section 17. Good luck.**

---

*Generated for a 3-day hiring assessment. React.js + Spring Boot + FastAPI. All tools are free and open-source.*
