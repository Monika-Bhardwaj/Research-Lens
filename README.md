<div align="center">

# 🔍 Research Lens

### AI-Powered Document Intelligence — Inspired by Google NotebookLM

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![LangChain](https://img.shields.io/badge/LangChain-latest-1c3c3c)](https://langchain.com)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-ff4f64)](https://qdrant.tech)
[![Groq](https://img.shields.io/badge/Groq-LLM-f55036)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Upload any PDF or TXT → Ask questions → Get grounded AI answers with source citations**

[![Vercel Deploy](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://research-lens-roan.vercel.app)
[![Render Deploy](https://img.shields.io/badge/Render-Live-46E3B7?logo=render)](https://research-lensresearch-lens.onrender.com)

[🚀 Vercel Live Demo](https://research-lens-roan.vercel.app) · [🌐 Render Live Demo](https://research-lensresearch-lens.onrender.com) · [📖 API Docs](#api-reference) · [🛠️ Setup](#-quick-start)

</div>

---

## ✨ What Is Research Lens?

Research Lens is a **production-grade Retrieval-Augmented Generation (RAG) application** that lets you have AI-powered conversations with your documents. Upload a PDF or TXT file and query it using a state-of-the-art pipeline.

Unlike basic chatbots, Research Lens is **strictly grounded** — it answers only from your document content, never hallucinating, always citing sources.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                         │
│  Sidebar (Docs List) │ Chat Panel (Stream) │ Source Citations │
└──────────────────────────────────────────────────────────────┘
         │                                       │
   POST /api/upload                       POST /api/chat
         │                                       │
  ┌──────▼──────────┐                  ┌──────────▼──────────┐
  │  Document Parser │                  │   Query Embedding   │
  │   (pdf-parse)    │                  │  (nomic-embed-text) │
  └──────┬──────────┘                  └──────────┬──────────┘
         │                                         │
  ┌──────▼──────────┐                  ┌──────────▼──────────┐
  │  Text Chunker    │                  │  Qdrant Similarity  │
  │ (1000/200 ovlp)  │                  │    Search (K=3)     │
  └──────┬──────────┘                  └──────────┬──────────┘
         │                                         │
  ┌──────▼──────────┐                  ┌──────────▼──────────┐
  │   Embeddings     │                  │  Context Builder    │
  │ (nomic-embed-    │                  │  (Dedup+Compress)   │
  │  text via HF)    │                  └──────────┬──────────┘
  └──────┬──────────┘                             │
         │                             ┌──────────▼──────────┐
  ┌──────▼──────────┐                  │  Groq LLM Stream    │
  │  Qdrant Cloud   │                  │ (llama-3.1-8b-inst) │
  │ Vector Storage  │                  └─────────────────────┘
  └─────────────────┘
```

---

## 🚀 Features

### Core RAG Pipeline
- 📄 **PDF & TXT Upload** — Drag-and-drop or click to upload (max 10MB)
- ✂️ **Smart Chunking** — `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap)
- 🧠 **Semantic Embeddings** — `nomic-embed-text` via HuggingFace (cloud) or Ollama (local)
- 🗄️ **Qdrant Vector DB** — Cloud-hosted, persistent semantic memory
- ⚡ **Streaming Responses** — Real-time token streaming from Groq
- 📎 **Source Citations** — Every answer linked to page numbers and document chunks

### Advanced Differentiators
| Feature | Implementation |
|---|---|
| **Confidence Score** | Avg cosine similarity → color-coded badge (green/amber/red) |
| **Hallucination Guard** | Strict system prompt refuses answers outside document context |
| **Context Deduplication** | Map-based dedup removes repeated chunks before prompting |
| **Context Compression** | Only top K=3 most relevant chunks sent to LLM (token-efficient) |
| **Local + Cloud Toggle** | Switch Groq ↔ Ollama from the UI header in real time |
| **Multi-document Support** | Upload multiple files — each indexed independently in Qdrant |
| **Grounded Refusal** | Explicit "document does not contain this information" response |
| **File Validation** | Server-side MIME type and size validation before processing |

### UI / UX
- 🌙 Sleek dark-mode interface inspired by Google NotebookLM
- 📱 Fully responsive for desktop and mobile
- 💬 Real-time streaming chat with animated typing indicator
- 🏷️ Clickable citation badges with confidence scoring on every AI message
- 📂 Document management sidebar with upload status tracking

---

## 🛠️ Quick Start

### Prerequisites
- **Node.js** 18+
- **Groq API key** — free at [console.groq.com](https://console.groq.com)
- **Qdrant Cloud cluster** — free at [cloud.qdrant.io](https://cloud.qdrant.io)
- **HuggingFace token** (cloud embeddings) — free at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) OR **Ollama** for local dev

### 1. Clone & Install

```bash
git clone https://github.com/Monika-Bhardwaj/Research-Lens.git
cd Research-Lens
npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your actual API keys
```

| Variable | Required | Get it from |
|---|---|---|
| `GROQ_API_KEY` | ✅ Always | [console.groq.com](https://console.groq.com) |
| `QDRANT_URL` | ✅ Always | [cloud.qdrant.io](https://cloud.qdrant.io) |
| `QDRANT_API_KEY` | ✅ Always | Qdrant Cloud dashboard |
| `HUGGINGFACEHUB_API_TOKEN` | ✅ Cloud deploy | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `OLLAMA_BASE_URL` | Local dev only | Defaults to `http://localhost:11434` |

### 3. Run

```bash
npm run dev
# Open http://localhost:3000
```

#### Local Dev with Ollama (no HuggingFace needed)
```bash
# Install Ollama: https://ollama.com/download
ollama pull nomic-embed-text

# Optional: local LLM support
ollama pull llama3.1

# Optional: local Qdrant via Docker
docker run -p 6333:6333 qdrant/qdrant
```

---

## 🌐 Deployment

### Vercel *(Recommended — Native Next.js support)*

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Add environment variables in the **Environment Variables** section:
   - `GROQ_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `HUGGINGFACEHUB_API_TOKEN`
4. Click **Deploy** — done!

> The `vercel.json` in this repo handles build configuration automatically.

### Render *(Alternative — No timeout limits)*

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect this GitHub repository
3. Configure:
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node
4. Add environment variables in the Render dashboard
5. Deploy

---

## 📁 Project Structure

```
Research-Lens/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts    # File validation, parsing, chunking, indexing
│   │   │   └── chat/route.ts      # RAG retrieval + Groq streaming + citations
│   │   ├── globals.css            # Tailwind v4 global styles
│   │   ├── layout.tsx             # Root layout with Inter font
│   │   └── page.tsx               # Main app shell
│   ├── components/
│   │   ├── Sidebar.tsx            # Document list, upload button, status
│   │   ├── ChatPanel.tsx          # Message stream, citations, confidence score
│   │   └── SourcePanel.tsx        # Active document info + feature list
│   ├── lib/
│   │   ├── qdrant.ts              # Qdrant client + auto-collection creation
│   │   ├── embeddings.ts          # HuggingFace (cloud) / Ollama (local) provider
│   │   └── llm.ts                 # Groq / Ollama LLM factory + system prompt
│   ├── services/
│   │   ├── documentParser.ts      # PDF/TXT parsing + RecursiveCharacterTextSplitter
│   │   └── ragPipeline.ts         # Embed, upsert, similarity search
│   ├── store/
│   │   └── useAppStore.ts         # Zustand: documents, messages, inference mode
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── .env.example                   # Environment variable template (safe to commit)
├── next.config.ts                 # serverExternalPackages for pdf-parse
├── vercel.json                    # Vercel deployment config
└── README.md
```

---

## 📡 API Reference

### `POST /api/upload`

**Request:** `multipart/form-data` with `file` field (PDF or TXT, ≤ 10MB)

**Response:**
```json
{
  "success": true,
  "filename": "research-paper.pdf",
  "chunkCount": 42,
  "message": "Document indexed successfully (42 chunks)."
}
```

**Errors:** `400` (invalid type/size/empty) · `500` (parsing or embedding failure)

---

### `POST /api/chat`

**Request:**
```json
{
  "message": "What is the main argument of this paper?",
  "documentId": "research-paper.pdf",
  "mode": "groq"
}
```

**Streaming Response** (`text/event-stream`):

First chunk — JSON metadata + `\n__DATA_END__\n` separator:
```json
{
  "type": "metadata",
  "data": {
    "citations": [
      { "text": "...chunk...", "metadata": { "pageNumber": 3, "chunkId": "chunk-7" }, "score": 0.92 }
    ],
    "confidenceScore": 92
  }
}
```
Remaining chunks — plain text tokens of the AI response.

---

## 🧠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, streaming |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Rapid UI development |
| State | Zustand | Lightweight, no boilerplate |
| RAG | LangChain | Composable AI chains |
| LLM | Groq (`llama-3.1-8b-instant`) | Fastest free LLM API |
| Embeddings | HuggingFace `nomic-embed-text` | Free, 768-dim, cloud-native |
| Vector DB | Qdrant Cloud | Free tier, persistent, fast |
| File Parsing | pdf-parse | Node.js native PDF text extraction |
| Streaming | SSE (Server-Sent Events) | Low-latency token streaming |

---

## 📄 License

MIT © [Monika Bhardwaj](https://github.com/Monika-Bhardwaj)
