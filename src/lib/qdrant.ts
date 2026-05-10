import { QdrantClient } from '@qdrant/js-client-rest';

let _qdrantClient: QdrantClient | null = null;

export const getQdrantClient = () => {
  if (_qdrantClient) return _qdrantClient;

  if (!process.env.QDRANT_URL && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    console.warn('QDRANT_URL is not set.');
  }

  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  const apiKey = process.env.QDRANT_API_KEY;

  if (apiKey) {
    _qdrantClient = new QdrantClient({ url, apiKey });
  } else {
    _qdrantClient = new QdrantClient({ url });
  }
  return _qdrantClient;
};

export const COLLECTION_NAME = 'research_lens_final_prod_v1';

export const ensureCollection = async () => {
  try {
    const client = getQdrantClient();
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // sentence-transformers/all-MiniLM-L6-v2
          distance: 'Cosine',
        },
      });
      
      // Create payload index for fast and reliable filtering
      await client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'doc_id',
        field_schema: 'keyword',
        wait: true,
      });
    }
  } catch (error) {
    console.error('Error ensuring Qdrant collection:', error);
    throw error; // Don't fail silently
  }
};
