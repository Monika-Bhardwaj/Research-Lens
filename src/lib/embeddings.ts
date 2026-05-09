import { OllamaEmbeddings } from '@langchain/ollama';

export const getEmbeddings = () => {
  // We don't do Xenova here anymore. Xenova is strictly moved to Edge runtime API.
  return new OllamaEmbeddings({
    model: 'nomic-embed-text',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  });
};

export const EMBEDDING_DIMENSION = 384;
