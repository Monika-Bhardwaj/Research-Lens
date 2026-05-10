import { OllamaEmbeddings } from '@langchain/ollama';

let _xenovaEmbeddings: any = null;

class LazyXenovaEmbeddings {
  async getExtractor() {
    // 100% Lazy Loaded to prevent Vercel boot crashes
    
    // GENIUS HACK: Intercept Node.js require to physically block onnxruntime-node from executing.
    // Turbopack ignores Webpack aliases, so transformers.js still tries to require the native C++ binary.
    // By mocking it at the OS level, we completely eradicate the "missing .so" Vercel error.
    if (typeof process !== 'undefined' && typeof require !== 'undefined') {
      const Module = require('module');
      if (!Module._originalRequireHooked) {
        const originalRequire = Module.prototype.require;
        Module.prototype.require = function(request: string) {
          if (request === 'onnxruntime-node') {
            return {}; // Mock it out!
          }
          return originalRequire.apply(this, arguments);
        };
        Module._originalRequireHooked = true;
      }
    }

    const xenova = await import('@xenova/transformers');
    
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      xenova.env.allowLocalModels = false;
      xenova.env.backends.onnx.node = false; // Disable Native bindings completely
      xenova.env.backends.onnx.wasm.numThreads = 1;
      xenova.env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
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
      const vec = Array.from(res.data) as number[];
      console.log('Generated vector dim:', vec.length);
      embeddings.push(vec);
    }
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const res = await extractor(text, { pooling: 'mean', normalize: true });
    const vec = Array.from(res.data) as number[];
    console.log('Generated query vector dim:', vec.length);
    return vec;
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
