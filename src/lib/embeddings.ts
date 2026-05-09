import { OllamaEmbeddings } from '@langchain/ollama';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

/**
 * Returns the appropriate embeddings provider:
 * - HuggingFace Inference API (cloud, free) when HUGGINGFACEHUB_API_TOKEN is set → production
 * - Ollama local when only OLLAMA_BASE_URL is set → local dev
 *
 * Both use `nomic-embed-text` → 768-dim vectors, fully compatible with Qdrant collection.
 */
export const getEmbeddings = () => {
  const hfToken = process.env.HUGGINGFACEHUB_API_TOKEN;

  if (hfToken) {
    return new HuggingFaceInferenceEmbeddings({
      apiKey: hfToken,
      model: 'nomic-ai/nomic-embed-text-v1',
    });
  }

  // Prevent Vercel from trying to hit localhost Ollama
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    throw new Error('HUGGINGFACEHUB_API_TOKEN is not set in Vercel. Please add it to your Environment Variables in the Vercel Dashboard to enable embeddings.');
  }

  // Local dev fallback: Ollama
  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};

/** Vector dimension for nomic-embed-text (used when creating Qdrant collection) */
export const EMBEDDING_DIMENSION = 768;
