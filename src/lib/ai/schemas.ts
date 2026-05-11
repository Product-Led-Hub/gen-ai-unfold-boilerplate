import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
});

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
  ragEmbeddingProvider: z.enum(["openai", "ollama"]).optional().default("openai"),
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
