// POST /api/rag/upload — Accepts a file (txt, md, docx, doc), extracts text, and ingests it.
import { NextRequest } from "next/server";
import { ingestDocument, getDocumentCount } from "@/lib/rag";

const SUPPORTED_TYPES = [".txt", ".md", ".docx", ".doc"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const embeddingProvider =
      (formData.get("embeddingProvider") as "openai" | "ollama" | "lmstudio" | null) ?? "lmstudio";
    const source = (formData.get("source") as string | null) || file?.name || "uploaded-file";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const ext = SUPPORTED_TYPES.find((e) => name.endsWith(e));

    if (!ext) {
      return Response.json(
        { error: `Unsupported file type. Accepted: ${SUPPORTED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Max 2 MB
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 2 MB)" }, { status: 400 });
    }

    let text = "";

    if (ext === ".txt" || ext === ".md") {
      text = await file.text();
    } else {
      // .docx / .doc — use mammoth to extract plain text
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    if (!text.trim()) {
      return Response.json(
        { error: "No text could be extracted from the file" },
        { status: 422 }
      );
    }

    const result = await ingestDocument(text.trim(), {
      source,
      embeddingProvider,
    });

    console.log(`[RAG upload] stored ${result.chunks} chunks from "${source}" using ${embeddingProvider}. Total: ${getDocumentCount()}`);

    return Response.json({
      success: true,
      chunks: result.chunks,
      source: result.source,
      totalDocuments: getDocumentCount(),
    });
  } catch (err) {
    console.error("RAG upload error:", err);
    return Response.json({ error: "Failed to process file" }, { status: 500 });
  }
}
