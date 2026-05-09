import { QdrantClient } from '@qdrant/js-client-rest';

const getQdrantClient = () => {
  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  const apiKey = process.env.QDRANT_API_KEY;
  return apiKey ? new QdrantClient({ url, apiKey }) : new QdrantClient({ url });
};

export const qdrantClient = getQdrantClient();
export const COLLECTION_NAME = 'research_lens_documents';

// 384 for HuggingFace (all-MiniLM-L6-v2), 768 for Ollama (nomic-embed-text)
const isRealHfToken = process.env.HUGGINGFACEHUB_API_TOKEN &&
  process.env.HUGGINGFACEHUB_API_TOKEN !== 'your_hf_token_here';
export const VECTOR_SIZE = isRealHfToken ? 384 : 768;

export const ensureCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      });
    }

    // Ensure payload index exists (idempotent — safe to call even if already created)
    try {
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'metadata.filename',
        field_schema: 'keyword',
      });
    } catch {
      // Index already exists — ignore
    }
  } catch (error) {
    console.error('[Qdrant] Error ensuring collection:', error);
    throw error;
  }
};




