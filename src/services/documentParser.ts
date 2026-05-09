import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { v4 as uuidv4 } from 'uuid';
import { DocumentChunk } from '../types';

export const parseFile = async (buffer: Buffer, filename: string, mimeType: string) => {
  let text = '';
  if (mimeType === 'application/pdf') {
    text = await new Promise<string>((resolve, reject) => {
      import('pdf2json').then((pdf2json) => {
        const PDFParser = (pdf2json as any).default || pdf2json;
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(new Error(errData.parserError));
        });
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          const extractedText = (pdfParser as any).getRawTextContent();
          resolve(extractedText);
        });
        
        pdfParser.parseBuffer(buffer);
      }).catch(reject);
    });
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

