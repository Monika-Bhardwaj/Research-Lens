import { QdrantClient } from '@qdrant/js-client-rest';

const getQdrantClient = () => {
  if (!process.env.QDRANT_URL && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    throw new Error('QDRANT_URL is not set. Please add your Qdrant Cluster URL to the Vercel Environment Variables.');
  }

  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  const apiKey = process.env.QDRANT_API_KEY;

  if (apiKey) {
    return new QdrantClient({ url, apiKey });
  } else {
    return new QdrantClient({ url });
  }
};

export const qdrantClient = getQdrantClient();
export const COLLECTION_NAME = 'research_lens_docs_v2';

export const ensureCollection = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // sentence-transformers/all-MiniLM-L6-v2
          distance: 'Cosine',
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring Qdrant collection:', error);
  }
};
