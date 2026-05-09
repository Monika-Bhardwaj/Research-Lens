import { OllamaEmbeddings } from '@langchain/ollama';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

const isRealHfToken = () => {
  const t = process.env.HUGGINGFACEHUB_API_TOKEN;
  return t && t !== 'your_hf_token_here';
};

/**
 * Cloud (HF): sentence-transformers/all-MiniLM-L6-v2 → 384-dim (free, always available)
 * Local (Ollama): nomic-embed-text → 768-dim
 */
export const EMBEDDING_DIMENSION = isRealHfToken() ? 384 : 768;

export const getEmbeddings = () => {
  if (isRealHfToken()) {
    return new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACEHUB_API_TOKEN!,
      model: 'sentence-transformers/all-MiniLM-L6-v2',
    });
  }
  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};
