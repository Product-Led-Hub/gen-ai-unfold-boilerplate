// POST /api/rag/ingest — Chunks and embeds a document into the in-memory vector store.
// GET  /api/rag/ingest — Returns the current document count.

import { NextRequest } from "next/server";
import { z } from "zod";
import { ingestDocument, getDocumentCount, clearDocuments } from "@/lib/rag";

const ingestSchema = z.object({
  text: z.string().min(1, "Document text cannot be empty").max(100_000, "Document too large"),
  source: z.string().optional().default("uploaded"),
  chunkSize: z.number().min(100).max(2000).optional(),
  overlap: z.number().min(0).max(500).optional(),
  embeddingProvider: z.enum(["openai", "ollama"]).optional().default("openai"),
  embeddingModel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ingestSchema.parse(body);

    const result = await ingestDocument(validated.text, {
      source: validated.source,
      chunkSize: validated.chunkSize,
      overlap: validated.overlap,
      embeddingProvider: validated.embeddingProvider,
      embeddingModel: validated.embeddingModel,
    });

    return Response.json({
      success: true,
      chunks: result.chunks,
      source: result.source,
      totalDocuments: getDocumentCount(),
    });
  } catch (error) {
    console.error("RAG ingest error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return Response.json({ error: "Failed to ingest document" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ documentCount: getDocumentCount() });
}

export async function DELETE() {
  clearDocuments();
  return Response.json({ success: true, documentCount: 0 });
}
