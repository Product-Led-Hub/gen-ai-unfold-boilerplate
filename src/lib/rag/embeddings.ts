/**
 * @file lib/rag/embeddings.ts
 * @description Embedding adapter for the RAG pipeline.
 *
 * Supports three providers via the Vercel AI SDK `embed` / `embedMany` functions:
 *
 * | Provider    | Model (default)                       | Base URL
 * |-------------|---------------------------------------|---------------------------
 * | `openai`    | `text-embedding-3-small`              | api.openai.com (cloud)
 * | `ollama`    | `nomic-embed-text`                    | http://localhost:11434/v1
 * | `lmstudio`  | `text-embedding-nomic-embed-text-v1.5`| http://localhost:1234/v1
 *
 * Both Ollama and LM Studio expose an OpenAI-compatible `/v1/embeddings` endpoint,
 * so they are created with `createOpenAI({ apiKey: " ", baseURL })` (single-space
 * key is required by the SDK but ignored by local servers).
 *
 * Exported functions:
 *  - `getEmbedding(text, config?)` — embed a single string → `number[]`.
 *  - `getEmbeddings(texts, config?)` — embed a batch → `number[][]`.
 *
 * How to use:
 * ```ts
 * import { getEmbedding } from "@/lib/rag/embeddings";
 *
 * const vec = await getEmbedding("user query", { provider: "lmstudio" });
 * ```
 *
 * Environment variables:
 *  - `OPENAI_API_KEY` — required for the OpenAI provider.
 *  - `LMSTUDIO_BASE_URL` — optional override (default `http://localhost:1234/v1`).
 *  - `OLLAMA_BASE_URL` — optional override (default `http://localhost:11434/v1`).
 *  - `RAG_EMBEDDING_MODEL` — optional model override for the LM Studio provider.
 */
// Embedding functions for the RAG pipeline.
// Supports OpenAI embeddings (cloud) and Ollama embeddings (local).
// The AI SDK's embed() function handles the provider abstraction.

import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// ─── Provider Selection ───────────────────────────────────────────────────────

type EmbeddingProvider = "openai" | "ollama" | "lmstudio";

interface EmbeddingConfig {
  provider?: EmbeddingProvider;
  model?: string;
  baseURL?: string;
}

function getEmbeddingModel(config: EmbeddingConfig = {}) {
  const provider = config.provider ?? "openai";

  if (provider === "ollama") {
    // Ollama exposes an OpenAI-compatible embedding endpoint
    const ollamaProvider = createOpenAI({
      apiKey: " ",
      baseURL: config.baseURL ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
    });
    return ollamaProvider.embedding(config.model ?? "nomic-embed-text");
  }

  if (provider === "lmstudio") {
    // LM Studio exposes an OpenAI-compatible embedding endpoint (single space key — ignored by LM Studio)
    const lmstudioProvider = createOpenAI({
      apiKey: " ",
      baseURL: config.baseURL ?? process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
    });
    return lmstudioProvider.embedding(
      config.model ?? process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-nomic-embed-text-v1.5"
    );
  }

  // Default: OpenAI embeddings
  const openaiProvider = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openaiProvider.embedding(config.model ?? "text-embedding-3-small");
}

// ─── Single Embedding ─────────────────────────────────────────────────────────

export async function getEmbedding(
  text: string,
  config?: EmbeddingConfig
): Promise<number[]> {
  const model = getEmbeddingModel(config);
  const { embedding } = await embed({ model, value: text });
  return Array.from(embedding);
}

// ─── Batch Embeddings ─────────────────────────────────────────────────────────

export async function getEmbeddings(
  texts: string[],
  config?: EmbeddingConfig
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = getEmbeddingModel(config);
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings.map((e) => Array.from(e));
}
