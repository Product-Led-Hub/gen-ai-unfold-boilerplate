// RAG orchestration: chunking, ingestion, and retrieval-augmented context.

import { addDocument, search, getDocumentCount, clearDocuments } from "./vectorStore";
import { getEmbedding, getEmbeddings } from "./embeddings";
import type { SearchResult } from "./vectorStore";

export { getDocumentCount, clearDocuments };
export type { SearchResult };

// ─── Text Chunker ─────────────────────────────────────────────────────────────

interface ChunkOptions {
  chunkSize?: number;   // target characters per chunk
  overlap?: number;     // overlap between consecutive chunks (characters)
}

export function chunkText(
  text: string,
  { chunkSize = 500, overlap = 100 }: ChunkOptions = {}
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (normalized.length <= chunkSize) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    // Try to break at a sentence boundary (. ! ?) or newline
    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const lastBreak = Math.max(
        slice.lastIndexOf(". "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("\n")
      );
      if (lastBreak > chunkSize / 2) {
        end = start + lastBreak + 1;
      }
    }

    chunks.push(normalized.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter((c) => c.length > 0);
}

// ─── Ingest Document ──────────────────────────────────────────────────────────

export interface IngestOptions {
  source?: string;
  chunkSize?: number;
  overlap?: number;
  embeddingProvider?: "openai" | "ollama";
  embeddingModel?: string;
  embeddingBaseURL?: string;
}

export interface IngestResult {
  chunks: number;
  documentIds: string[];
  source: string;
}

export async function ingestDocument(
  text: string,
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { source = "uploaded", chunkSize, overlap, embeddingProvider, embeddingModel, embeddingBaseURL } = options;

  const chunks = chunkText(text, { chunkSize, overlap });

  const embeddingConfig = embeddingProvider
    ? { provider: embeddingProvider, model: embeddingModel, baseURL: embeddingBaseURL }
    : undefined;

  const embeddings = await getEmbeddings(chunks, embeddingConfig);

  const documentIds = chunks.map((content, i) =>
    addDocument({
      content,
      embedding: embeddings[i],
      metadata: {
        source,
        chunk: i + 1,
        totalChunks: chunks.length,
        ingestedAt: new Date().toISOString(),
      },
    })
  );

  return { chunks: chunks.length, documentIds, source };
}

// ─── Retrieve Context ─────────────────────────────────────────────────────────

export interface RetrieveOptions {
  topK?: number;
  minScore?: number;
  embeddingProvider?: "openai" | "ollama";
  embeddingModel?: string;
  embeddingBaseURL?: string;
}

export interface RetrievedContext {
  contextText: string;
  sources: Array<{ content: string; source?: string; score: number }>;
}

export async function retrieveContext(
  query: string,
  options: RetrieveOptions = {}
): Promise<RetrievedContext> {
  const {
    topK = 3,
    minScore = 0.0,
    embeddingProvider,
    embeddingModel,
    embeddingBaseURL,
  } = options;

  const embeddingConfig = embeddingProvider
    ? { provider: embeddingProvider, model: embeddingModel, baseURL: embeddingBaseURL }
    : undefined;

  const queryEmbedding = await getEmbedding(query, embeddingConfig);
  const results: SearchResult[] = search(queryEmbedding, topK, minScore);

  if (results.length === 0) {
    return { contextText: "", sources: [] };
  }

  const contextText = results
    .map((r, i) => `[Source ${i + 1}] ${r.document.content}`)
    .join("\n\n");

  const sources = results.map((r) => ({
    content: r.document.content.slice(0, 200) + (r.document.content.length > 200 ? "..." : ""),
    source: r.document.metadata.source,
    score: Math.round(r.score * 100) / 100,
  }));

  return { contextText, sources };
}

// ─── Build RAG System Prompt ──────────────────────────────────────────────────

export function buildRAGSystemPrompt(
  contextText: string,
  baseSystemPrompt = ""
): string {
  return `${baseSystemPrompt ? baseSystemPrompt + "\n\n" : ""}You have access to the following context retrieved from the knowledge base. Use it to answer the user's question accurately.

If the answer is not contained in the context, say "I don't have enough information in my knowledge base to answer that." Do not make up information.

CONTEXT:
${contextText}`;
}
