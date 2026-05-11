// Embedding functions for the RAG pipeline.
// Supports OpenAI embeddings (cloud) and Ollama embeddings (local).
// The AI SDK's embed() function handles the provider abstraction.

import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// ─── Provider Selection ───────────────────────────────────────────────────────

type EmbeddingProvider = "openai" | "ollama";

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
      apiKey: "ollama",
      baseURL: config.baseURL ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
    });
    return ollamaProvider.embedding(config.model ?? "nomic-embed-text");
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
