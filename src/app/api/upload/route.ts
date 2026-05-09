import { NextRequest, NextResponse } from 'next/server';
import { parseFile, chunkDocument } from '@/services/documentParser';
import { indexDocument } from '@/services/ragPipeline';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only PDF and TXT files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Parse File
    const { text, filename } = await parseFile(buffer, file.name, file.type);

    if (!text.trim()) {
      return NextResponse.json({ error: 'Document appears to be empty or unreadable.' }, { status: 400 });
    }

    // 2. Chunk Document
    const chunks = await chunkDocument(text, filename);

    // 3. Index Document in Qdrant
    await indexDocument(chunks);

    return NextResponse.json({
      success: true,
      filename,
      chunkCount: chunks.length,
      message: `Document indexed successfully (${chunks.length} chunks).`,
    });

  } catch (error) {
    console.error('[Upload Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to process document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
