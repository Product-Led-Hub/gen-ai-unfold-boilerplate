/**
 * @file lib/rag/index.ts
 * @description RAG (Retrieval-Augmented Generation) pipeline orchestration.
 *
 * The RAG pipeline turns your documents into grounded AI answers:
 *
 * ```
 * Document text
 *     │
 *     ▼
 *  chunkText()          Split into overlapping ~500-char windows
 *     │
 *     ▼
 *  getEmbeddings()      Vectorise every chunk (local or cloud model)
 *     │
 *     ▼
 *  addDocument()        Persist chunks to SQLite + in-memory cache
 *
 * User message
 *     │
 *     ▼
 *  getEmbedding()       Vectorise the query
 *     │
 *     ▼
 *  search()             Cosine similarity → top-K chunks
 *     │
 *     ▼
 *  buildRAGSystemPrompt()  Inject context into the system prompt
 * ```
 *
 * Exported functions:
 *  - `chunkText(text, opts?)` — split text into overlapping string chunks.
 *  - `ingestDocument(text, opts?)` — full ingest pipeline; returns `IngestResult`.
 *  - `retrieveContext(query, opts?)` — embed query + return top-K chunks.
 *  - `buildRAGSystemPrompt(basePrompt, chunks)` — append retrieved context.
 *  - `getDocumentCount()` — total chunks in the store (used for logging).
 *  - `clearDocuments()` — wipe all chunks (for testing/reset).
 *
 * Bootcamp session: Session 3 — RAG.
 *
 * Extension ideas:
 *  - Increase `topK` to 5–10 for longer, denser documents.
 *  - Add metadata filtering (e.g. only search chunks from a specific source).
 *  - Replace cosine similarity with a re-ranker model for better precision.
 */
// RAG orchestration: chunking, ingestion, and retrieval-augmented context.
//
// Session 3 live coding — four core functions to build the RAG pipeline:
//
//   1. chunkText()             — split document into overlapping windows
//   2. ingestDocument()        — chunk → embed → store (call once per document)
//   3. retrieveContext()       — embed query → cosine search → top-K chunks
//   4. buildRAGSystemPrompt()  — inject retrieved context into the system prompt
//
// Tested with: LM Studio (llama-3.2-3b-instruct) + Ollama nomic-embed-text

import { addDocument, search, getDocumentCount, clearDocuments } from "./vectorStore";
import { getEmbedding, getEmbeddings } from "./embeddings";
import type { SearchResult } from "./vectorStore";

export { getDocumentCount, clearDocuments };
export type { SearchResult };

// ─── 1. Text Chunker ─────────────────────────────────────────────────────────────────
// Splits long text into overlapping chunks at sentence boundaries.
// Default: 500-char chunks with 100-char overlap to preserve context.

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
    const next = end - overlap;
    // Always advance by at least 1 character to prevent infinite loops.
    start = next > start ? next : end;
  }

  return chunks.filter((c) => c.length > 0);
}

// ─── 2. Ingest Document ─────────────────────────────────────────────────────────────────
// Call once per document (e.g. after the user pastes text in the UI).
// Pipeline: chunkText() → getEmbeddings() → addDocument() × N

export interface IngestOptions {
  source?: string;
  chunkSize?: number;
  overlap?: number;
  embeddingProvider?: "openai" | "ollama" | "lmstudio";
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

// ─── 3. Retrieve Context ─────────────────────────────────────────────────────────────────
// Called on every user message when RAG is enabled.
// Pipeline: embed(query) → cosine search → top-K chunks → formatted text

export interface RetrieveOptions {
  topK?: number;
  minScore?: number;
  embeddingProvider?: "openai" | "ollama" | "lmstudio";
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

// ─── 4. Build RAG System Prompt ───────────────────────────────────────────────
// Wraps the retrieved context + original system prompt into the format
// the model expects. Instructs the model not to hallucinate.

export function buildRAGSystemPrompt(
  contextText: string,
  baseSystemPrompt = ""
): string {
  return `${baseSystemPrompt ? baseSystemPrompt + "\n\n" : ""}You have access to the following context retrieved from the knowledge base. Use it to answer the user's question accurately.

If the answer is not contained in the context, say "I don't have enough information in my knowledge base to answer that." Do not make up information.

CONTEXT:
${contextText}`;
}
