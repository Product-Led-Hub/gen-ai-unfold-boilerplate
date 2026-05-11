// In-memory vector store for the bootcamp demo.
// Production alternatives: pgvector, Qdrant, Pinecone, Weaviate, Chroma.

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

// Module-level store — persists for the lifetime of the server process.
const documents: StoredDocument[] = [];

// ─── Cosine Similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addDocument(doc: Omit<StoredDocument, "id">): string {
  const id = crypto.randomUUID();
  documents.push({ ...doc, id });
  return id;
}

export function getDocumentCount(): number {
  return documents.length;
}

export function clearDocuments(): void {
  documents.splice(0, documents.length);
}

// ─── Similarity Search ────────────────────────────────────────────────────────

export interface SearchResult {
  document: StoredDocument;
  score: number;
}

export function search(
  queryEmbedding: number[],
  topK = 3,
  minScore = 0.0
): SearchResult[] {
  return documents
    .map((doc) => ({
      document: doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
