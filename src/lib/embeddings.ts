import { OllamaEmbeddings } from '@langchain/ollama';
import { pipeline, env } from '@xenova/transformers';

// STRICT VERCEL COMPATIBILITY: Force WASM, disable Node native bindings
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.node = false; // Prevents loading onnxruntime-node which crashes Vercel

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  env.cacheDir = '/tmp'; // Vercel is read-only except for /tmp
}

let extractor: any = null;

class XenovaEmbeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
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
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }
    const res = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(res.data) as number[];
  }
}

export const getEmbeddings = () => {
  if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
    return new XenovaEmbeddings();
  }

  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};

export const EMBEDDING_DIMENSION = 384;
