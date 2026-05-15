/**
 * @file lib/rag/vectorStore.ts
 * @description Persistent vector store for RAG chunks.
 *
 * Storage strategy:
 *  - **SQLite** (`rag_chunks` table) — durable storage that survives server restarts.
 *  - **In-memory cache** (`global.__ragCache`) — fast cosine-similarity search without
 *    round-tripping SQLite on every query. Loaded from DB on first access.
 *  - The `global.*` pattern ensures the cache is shared across Next.js route-handler
 *    module instances (which each get their own module scope in dev).
 *
 * Cosine similarity:
 *  Implemented inline (no external library) over `number[]` vectors.
 *  O(n·d) where n = number of chunks and d = embedding dimension.
 *  Suitable for thousands of chunks; use pgvector for millions.
 *
 * Exported functions:
 *  - `addDocument(doc)` — persist a chunk to SQLite + push to cache; returns `id`.
 *  - `search(queryEmbedding, topK?)` — returns top-K most similar chunks.
 *  - `getDocumentCount()` — number of chunks currently in the store.
 *  - `clearDocuments()` — delete all chunks from SQLite and reset cache.
 *
 * How to use:
 * ```ts
 * import { addDocument, search } from "@/lib/rag/vectorStore";
 *
 * addDocument({ id, content, embedding, metadata });
 * const results = search(queryVec, 3);
 * ```
 */
// Vector store backed by SQLite (node:sqlite built-in).
// Chunks are persisted in the rag_chunks table and cached in memory.

import { db } from "@/lib/db";

export interface StoredDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source?: string;
    chunk?: number;
    totalChunks?: number;
    ingestedAt: string;
  };
}

interface RagRow {
  id: string;
  source: string;
  content: string;
  embedding: string;
  chunk_num: number | null;
  total_chunks: number | null;
  ingested_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __ragCache: StoredDocument[] | undefined;
  // eslint-disable-next-line no-var
  var __ragCacheLoaded: boolean | undefined;
}

function getCache(): StoredDocument[] {
  if (!global.__ragCacheLoaded) {
    const rows = db.prepare("SELECT * FROM rag_chunks").all() as unknown as RagRow[];
    global.__ragCache = rows.map((r) => ({
      id: r.id,
      content: r.content,
      embedding: JSON.parse(r.embedding) as number[],
      metadata: {
        source: r.source,
        chunk: r.chunk_num ?? undefined,
        totalChunks: r.total_chunks ?? undefined,
        ingestedAt: r.ingested_at,
      },
    }));
    global.__ragCacheLoaded = true;
  }
  return global.__ragCache as StoredDocument[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

export function addDocument(doc: Omit<StoredDocument, "id">): string {
  const id = crypto.randomUUID();
  const full: StoredDocument = { ...doc, id };
  db.prepare(
    "INSERT INTO rag_chunks (id, source, content, embedding, chunk_num, total_chunks, ingested_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    doc.metadata.source ?? "uploaded",
    doc.content,
    JSON.stringify(doc.embedding),
    doc.metadata.chunk ?? null,
    doc.metadata.totalChunks ?? null,
    doc.metadata.ingestedAt,
  );
  getCache().push(full);
  return id;
}

export function getDocumentCount(): number {
  return getCache().length;
}

export function clearDocuments(): void {
  db.exec("DELETE FROM rag_chunks");
  global.__ragCache = [];
  global.__ragCacheLoaded = true;
}

export interface SearchResult {
  document: StoredDocument;
  score: number;
}

export function search(
  queryEmbedding: number[],
  topK = 3,
  minScore = 0.0,
): SearchResult[] {
  return getCache()
    .map((doc) => ({
      document: doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
