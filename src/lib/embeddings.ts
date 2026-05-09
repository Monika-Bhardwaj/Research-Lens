import { OllamaEmbeddings } from '@langchain/ollama';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to not use local cache in Vercel to avoid read-only FS errors
env.allowLocalModels = false;

let extractor: any = null;

class XenovaEmbeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/nomic-embed-text-v1', {
        quantized: true,
      });
    }
    const embeddings = [];
    for (const text of texts) {
      const res = await extractor(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(res.data) as number[]);
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/nomic-embed-text-v1', {
        quantized: true,
      });
    }
    const res = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(res.data) as number[];
  }
}

/**
 * Returns the appropriate embeddings provider:
 * - Xenova (transformers.js) in production (Vercel) -> zero config, free, 768-dim
 * - Ollama local when not in Vercel
 */
export const getEmbeddings = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return new XenovaEmbeddings();
  }

  // Local dev fallback: Ollama
  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};

export const EMBEDDING_DIMENSION = 768;
