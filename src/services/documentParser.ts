import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createRequire } from 'module';
import { v4 as uuidv4 } from 'uuid';
import { DocumentChunk } from '../types';

// pdf-parse is CommonJS-only; use createRequire to import it safely in ESM/Next.js App Router
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export const parseFile = async (buffer: Buffer, filename: string, mimeType: string) => {
  let text = '';

  if (mimeType === 'application/pdf') {
    const pdfData = await pdfParse(buffer);
    text = pdfData.text as string;
  } else if (mimeType === 'text/plain') {
    text = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Only PDF and TXT are supported.');
  }

  return { text, filename };
};

export const chunkDocument = async (text: string, filename: string): Promise<DocumentChunk[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(text);

  return chunks.map((chunkText, index) => ({
    id: uuidv4(),
    text: chunkText,
    metadata: {
      filename,
      pageNumber: Math.floor(index / 3) + 1, // rough page estimate
      chunkId: `chunk-${index}`,
      source: filename,
    },
  }));
};

