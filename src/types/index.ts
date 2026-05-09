export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    filename: string;
    pageNumber: number;
    chunkId: string;
    source: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidenceScore?: number;
}

export interface Citation {
  text: string;
  metadata: {
    filename: string;
    pageNumber: number;
    chunkId: string;
    source: string;
  };
}

export interface DocumentInfo {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'error';
  progress: number;
}
