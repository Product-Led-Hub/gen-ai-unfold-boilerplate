/**
 * @file lib/ai/schemas.ts
 * @description Zod validation schemas for the chat API route.
 *
 * Key schemas:
 *  - `messageSchema` — validates a single AI SDK UIMessage (role + passthrough).
 *  - `chatRequestSchema` — validates the full request body for `POST /api/chat`.
 *    Covers: messages, provider, model, temperature, maxTokens, systemPrompt,
 *    useTools, useRAG, ragEmbeddingProvider, localEndpoint, historyLimit.
 *  - `providerConfigSchema` — optional API key + baseURL override.
 *  - `settingsSchema` — validates the full Redux settings object.
 *  - `streamResponseSchema` — shape of a single SSE chunk from the streaming API.
 *
 * How to use:
 * ```ts
 * // In an API route handler:
 * const validated = chatRequestSchema.parse(await request.json());
 * // Access: validated.provider, validated.model, validated.messages, ...
 * ```
 *
 * Why Zod?
 *  All external inputs (HTTP request bodies) are untrusted. Zod rejects malformed
 *  or missing fields with descriptive errors before they reach any AI call,
 *  preventing prompt injection and invalid-argument errors.
 */
import { z } from "zod";

// Messages arrive from useChat in AI SDK v6 UIMessage format:
//   { role, parts: [{type:"text", text:"..."}], id, ... }
// We do loose validation here — convertToCoreMessages() in the route handler
// converts them to the CoreMessage format that streamText() expects.
// We only require `role` and passthrough everything else the SDK sends.
export const messageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system", "tool"]),
  })
  .passthrough();

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, "At least one message is required"),
  provider: z.enum(["openai", "anthropic", "google", "lmstudio", "ollama"]),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(100000).optional().default(4096),
  systemPrompt: z.string().optional(),
  stream: z.boolean().optional().default(true),
  // Session 3: tool calling
  useTools: z.boolean().optional().default(false),
  // Session 3: RAG
  useRAG: z.boolean().optional().default(false),
  ragEmbeddingProvider: z.enum(["openai", "ollama", "lmstudio"]).optional().default("lmstudio"),
  // Local provider endpoint override (from the UI localEndpoints setting)
  // Lets users point LM Studio / Ollama at a custom host without touching .env
  localEndpoint: z.string().optional(),
  // Number of previous messages to include in the request.
  // 0 = no history, 10 = last 10 messages (5 turns), 100 = all.
  historyLimit: z.number().int().min(0).max(200).optional().default(20),
});

export const providerConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().url().optional(),
});

export const settingsSchema = z.object({
  provider: z.enum(["openai", "anthropic", "google", "lmstudio", "ollama"]),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(100000),
  systemPrompt: z.string(),
  apiKeys: z.object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    google: z.string().optional(),
  }),
  localEndpoints: z.object({
    lmstudio: z.string().url(),
    ollama: z.string().url(),
  }),
});

export const streamResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  done: z.boolean(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ProviderConfigInput = z.infer<typeof providerConfigSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type StreamResponse = z.infer<typeof streamResponseSchema>;
