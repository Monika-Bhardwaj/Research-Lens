import { NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';

export const runtime = 'edge';

// Edge specific configs
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

let extractor: any = null;

export async function POST(req: Request) {
  try {
    const { texts } = await req.json();

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'Invalid texts payload' }, { status: 400 });
    }

    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }

    const embeddings = [];
    for (const text of texts) {
      const res = await extractor(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(res.data));
    }

    return NextResponse.json({ embeddings });
  } catch (error: any) {
    console.error('Edge Embeddings Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate embeddings' }, { status: 500 });
  }
}
