# Research Lens — Google NotebookLM RAG Application

Research Lens is a powerful RAG-powered (Retrieval-Augmented Generation) application designed to mimic the core functionality of Google NotebookLM. It allows users to upload documents and engage in a grounded conversation with them, ensuring that the AI's responses are derived directly from the provided source material.

## ✨ Features
- **Document Upload**: Support for PDF and Plain Text files.
- **Full RAG Pipeline**: Implements ingestion, chunking, embedding, storage, retrieval, and generation.
- **Vector Database**: Utilizes **Qdrant** for high-performance vector search.
- **Local Embeddings**: Uses **Xenova/all-MiniLM-L6-v2** via Transformers.js (running in WASM for serverless compatibility).
- **Grounded Chat**: Powered by **Llama 3.1 (Groq)** with strict system prompting to prevent hallucinations.
- **Premium UI**: Modern, responsive dark-mode interface built with Next.js and Tailwind CSS.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Qdrant (Vector DB)
- **LLM**: Groq (Llama 3.1 8B)
- **Embeddings**: Transformers.js (all-MiniLM-L6-v2)
- **Parsing**: pdf2json (Pure JS PDF parsing)

## 📂 RAG Implementation Details

### 1. Ingestion & Parsing
Documents are uploaded as `FormData` and processed on the server. We use `pdf2json` for PDF extraction to avoid dependencies on native binaries like `pdf-parse`, ensuring full compatibility with Vercel Serverless Functions.

### 2. Chunking Strategy
We implement a **Recursive Character Chunking** strategy using LangChain's `RecursiveCharacterTextSplitter`.
- **Chunk Size**: 1000 characters
- **Chunk Overlap**: 200 characters
This ensures that semantic context is preserved across chunk boundaries, allowing the LLM to understand relationships between adjacent text blocks.

### 3. Embedding & Vector Storage
Chunks are converted into 384-dimensional vectors using the `Xenova/all-MiniLM-L6-v2` model. These vectors are stored in a Qdrant collection with **Cosine Similarity** distance. We include `filename` in the payload to allow for document-specific filtering.

### 4. Retrieval & Generation
When a user asks a question:
1. The query is embedded into a vector.
2. A similarity search is performed in Qdrant, filtered by the active `filename`.
3. The top 3 most relevant chunks are retrieved.
4. These chunks are injected into a strict System Prompt: *"You answer ONLY using provided context. Do not use outside knowledge."*
5. Groq generates a streaming response grounded in the retrieved text.

## ⚙️ Setup & Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   GROQ_API_KEY=your_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📝 Compliance Note
This project fulfills all requirements for **Assignment 03 — Google NotebookLM RAG**. It implements a complete end-to-end pipeline with grounded generation and handles new documents dynamically.
