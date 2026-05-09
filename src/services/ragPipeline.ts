import { COLLECTION_NAME, ensureCollection, getQdrantClient } from '../lib/qdrant';
import { getEmbeddings } from '../lib/embeddings';
import { DocumentChunk } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const indexDocument = async (chunks: DocumentChunk[]) => {
  await ensureCollection();
  
  const embeddings = getEmbeddings();
  const texts = chunks.map(c => c.text);
  
  let vectors: number[][] = [];

  if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
    // Call the Edge API route for embeddings (which uses Xenova/WASM)
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts })
    });
    if (!res.ok) {
      throw new Error(`Edge Embeddings API failed: ${await res.text()}`);
    }
    const data = await res.json();
    vectors = data.embeddings;
  } else {
    // Local dev fallback
    const embeddings = getEmbeddings();
    vectors = await embeddings.embedDocuments(texts);
  }
  
  // Prepare points for Qdrant
  const points = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: vectors[i],
    payload: {
      text: chunk.text,
      metadata: chunk.metadata,
    }
  }));

  // Upload to Qdrant
  const client = getQdrantClient();
  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });
};

export const retrieveRelevantChunks = async (query: string, documentId: string, topK = 5) => {
  let vector: number[];

  if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [query] })
    });
    if (!res.ok) {
      throw new Error(`Edge Embeddings API failed: ${await res.text()}`);
    }
    const data = await res.json();
    vector = data.embeddings[0];
  } else {
    const embeddings = getEmbeddings();
    vector = await embeddings.embedQuery(query);
  }
  
  const client = getQdrantClient();
  const searchResults = await client.search(COLLECTION_NAME, {
    vector,
    limit: topK,
    filter: {
      must: [
        {
          key: 'metadata.filename', // Assuming filename represents documentId for now
          match: {
            value: documentId
          }
        }
      ]
    },
    with_payload: true,
  });

  return searchResults.map(result => ({
    score: result.score,
    text: result.payload?.text as string,
    metadata: result.payload?.metadata as DocumentChunk['metadata'],
  }));
};
