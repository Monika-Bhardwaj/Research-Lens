import { OllamaEmbeddings } from '@langchain/ollama';

let _xenovaEmbeddings: any = null;

class LazyXenovaEmbeddings {
  async getExtractor() {
    // 100% Lazy Loaded to prevent Vercel boot crashes
    const xenova = await import('@xenova/transformers');
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      xenova.env.cacheDir = '/tmp'; // Vercel read-only bypass
    }
    return await xenova.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const extractor = await this.getExtractor();
    const embeddings = [];
    for (const text of texts) {
      const res = await extractor(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(res.data) as number[]);
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const res = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(res.data) as number[];
  }
}

export const getEmbeddings = () => {
  if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
    if (!_xenovaEmbeddings) _xenovaEmbeddings = new LazyXenovaEmbeddings();
    return _xenovaEmbeddings;
  }

  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};

export const EMBEDDING_DIMENSION = 384;
