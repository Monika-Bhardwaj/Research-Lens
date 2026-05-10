import { COLLECTION_NAME, ensureCollection, getQdrantClient } from '../lib/qdrant';
import { getEmbeddings } from '../lib/embeddings';
import { DocumentChunk } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const indexDocument = async (chunks: DocumentChunk[]) => {
  await ensureCollection();
  
  const embeddings = getEmbeddings();
  const texts = chunks.map(c => c.text);
  
  // Create embeddings natively
  const vectors = await embeddings.embedDocuments(texts);
  
  // Prepare points for Qdrant
  const points = chunks.map((chunk, i) => ({
    id: chunk.id,
    vector: vectors[i],
    payload: {
      text: chunk.text,
      metadata: chunk.metadata,
      filename: chunk.metadata.filename, // Top-level for easier filtering
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
  const embeddings = getEmbeddings();
  const vector = await embeddings.embedQuery(query);
  
  const client = getQdrantClient();
  const searchResults = await client.search(COLLECTION_NAME, {
    vector,
    limit: topK,
    with_payload: true,
  });

  return searchResults.map(result => ({
    score: result.score,
    text: result.payload?.text as string,
    metadata: result.payload?.metadata as DocumentChunk['metadata'],
  }));
};
