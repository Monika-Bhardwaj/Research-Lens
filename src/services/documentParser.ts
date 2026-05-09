import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';
import { DocumentChunk } from '../types';

export const parseFile = async (buffer: Buffer, filename: string, mimeType: string) => {
  let text = '';

  if (mimeType === 'application/pdf') {
    // Vercel Serverless environment lacks DOMMatrix and Path2D which pdfjs-dist requires, causing it to crash on import
    if (typeof globalThis.DOMMatrix === 'undefined') {
      (globalThis as any).DOMMatrix = class DOMMatrix {};
    }
    if (typeof globalThis.Path2D === 'undefined') {
      (globalThis as any).Path2D = class Path2D {};
    }

    // Lazy load pdf-parse to prevent Vercel Serverless module initialization crashes
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const pdfData = await (pdfParse as any)(buffer);
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

