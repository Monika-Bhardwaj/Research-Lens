import { NextRequest } from 'next/server';
import { retrieveRelevantChunks } from '@/services/ragPipeline';
import { getLLM, SYSTEM_PROMPT } from '@/lib/llm';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export async function POST(req: NextRequest) {
  try {
    const { message, documentId, mode = 'groq' } = await req.json();

    if (!message || !documentId) {
      return new Response(JSON.stringify({ error: 'Missing message or documentId' }), { status: 400 });
    }

    // Advanced: Multi-Query Retrieval (Mocking the rewrite for speed & cost)
    // In a real advanced app, we'd use an LLM here to generate query variants.
    // We will just use the original query but retrieve a bit more, then slice.
    
    // 1. Retrieve chunks
    const chunks = await retrieveRelevantChunks(message, documentId, 3);

    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({ response: 'The document does not contain this information.' }),
        { status: 200 }
      );
    }

    // Advanced: Confidence Score calculation (heuristic based on vector distance)
    const avgScore = chunks.reduce((acc, c) => acc + (c.score || 0), 0) / chunks.length;
    const confidenceScore = Math.min(Math.round(avgScore * 100), 99);

    // Context Compression / Deduplication (Basic Implementation)
    const uniqueChunks = Array.from(new Map(chunks.map(c => [c.text, c])).values());

    // Prepare context
    const contextStr = uniqueChunks
      .map(c => `[Page: ${c.metadata.pageNumber}] ${c.text}`)
      .join('\n\n');

    // 2. Setup LLM Stream
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing');
      throw new Error('GROQ_API_KEY is missing in environment');
    }
    const llm = getLLM(mode, true);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_PROMPT],
      ['user', '{query}']
    ]);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    // 3. Stream back the response
    const stream = await chain.stream({
      context: contextStr,
      query: message,
    });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        const metaData = JSON.stringify({
          type: 'metadata',
          data: {
            citations: uniqueChunks.map(c => ({
              text: c.text,
              metadata: c.metadata,
              score: c.score,
            })),
            confidenceScore,
            tokenUsage: {
              promptTokens: Math.round(contextStr.length / 4), // rough estimate
              completionTokens: 0 // unknown until done
            }
          }
        });
        controller.enqueue(encoder.encode(metaData + '\n__DATA_END__\n'));

        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process chat', 
      details: error.toString(),
      stack: error.stack 
    }), { status: 500 });
  }
}
