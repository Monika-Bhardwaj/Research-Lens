import { ChatGroq } from '@langchain/groq';
import { ChatOllama } from '@langchain/ollama';

export const getLLM = (mode: 'groq' | 'ollama' = 'groq', streaming = true) => {
  if (mode === 'groq') {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      streaming,
    });
  } else {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'llama3.1',
      temperature: 0,
    });
  }
};

export const SYSTEM_PROMPT = `You answer ONLY using provided context.

Rules:
- Do not use outside knowledge.
- If answer is missing, say: "The document does not contain this information."
- Be concise.
- Cite relevant pages/chunks using their metadata.
- Do not hallucinate.
- Prefer exact facts from context.
- If context is weak, say so.

Context:
{context}`;

