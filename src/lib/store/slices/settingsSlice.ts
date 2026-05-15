/**
 * @file lib/store/slices/settingsSlice.ts
 * @description Redux slice for all AI configuration settings.
 *
 * This is the single source of truth for what the chat uses on every request.
 * `ChatPanel` reads these values and forwards them to `POST /api/chat`.
 *
 * State shape:
 * ```ts
 * {
 *   provider: AIProvider;           // "lmstudio" | "ollama" | "openai" | ...
 *   model: string;                  // model ID string
 *   temperature: number;            // 0–2 (0 = deterministic, 2 = very creative)
 *   maxTokens: number;              // max output tokens per response
 *   systemPrompt: string;           // system instruction sent on every turn
 *   apiKeys: { openai?, anthropic?, google? };
 *   localEndpoints: { lmstudio, ollama }; // base URLs for local providers
 *   useTools: boolean;              // enable tool calling
 *   useRAG: boolean;                // enable retrieval-augmented generation
 *   ragEmbeddingProvider: "openai" | "ollama" | "lmstudio";
 * }
 * ```
 *
 * Available actions (all exported):
 *  `setProvider` · `setModel` · `setTemperature` · `setMaxTokens`
 *  `setSystemPrompt` · `setApiKey` · `setLocalEndpoint`
 *  `setUseTools` · `setUseRAG` · `setRAGEmbeddingProvider` · `resetSettings`
 *
 * Defaults: LM Studio provider, `llama-3.2-3b-instruct` model, temperature 0.7.
 * Override the default embedding provider via `NEXT_PUBLIC_RAG_EMBEDDING_PROVIDER`.
 *
 * How to use:
 * ```tsx
 * dispatch(setTemperature(0.9));
 * dispatch(setSystemPrompt("You are a pirate."));
 * ```
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AIProvider } from "@/lib/ai/providers";

interface SettingsState {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  localEndpoints: {
    lmstudio: string;
    ollama: string;
  };
  // Session 3 — tool calling & RAG toggles
  useTools: boolean;
  useRAG: boolean;
  ragEmbeddingProvider: "openai" | "ollama" | "lmstudio";
}

const initialState: SettingsState = {
  // Default to LM Studio so attendees can test immediately on day 1.
  // Change to 'openai' and set OPENAI_API_KEY to use cloud models.
  provider: "lmstudio",
  model: "llama-3.2-3b-instruct",
  temperature: 0.7,
  maxTokens: 8000,
  systemPrompt: "You are a helpful AI assistant.",
  apiKeys: {},
  localEndpoints: {
    lmstudio: "http://localhost:1234/v1",
    ollama: "http://localhost:11434/v1",  // /v1 for OpenAI-compatible endpoint
  },
  useTools: false,
  useRAG: false,
  ragEmbeddingProvider: (process.env.NEXT_PUBLIC_RAG_EMBEDDING_PROVIDER as "openai" | "ollama" | "lmstudio") ?? "lmstudio",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<AIProvider>) => {
      state.provider = action.payload;
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    setTemperature: (state, action: PayloadAction<number>) => {
      state.temperature = action.payload;
    },
    setMaxTokens: (state, action: PayloadAction<number>) => {
      state.maxTokens = action.payload;
    },
    setSystemPrompt: (state, action: PayloadAction<string>) => {
      state.systemPrompt = action.payload;
    },
    setApiKey: (
      state,
      action: PayloadAction<{ provider: "openai" | "anthropic" | "google"; key: string }>
    ) => {
      state.apiKeys[action.payload.provider] = action.payload.key;
    },
    setLocalEndpoint: (
      state,
      action: PayloadAction<{ provider: "lmstudio" | "ollama"; endpoint: string }>
    ) => {
      state.localEndpoints[action.payload.provider] = action.payload.endpoint;
    },
    setUseTools: (state, action: PayloadAction<boolean>) => {
      state.useTools = action.payload;
    },
    setUseRAG: (state, action: PayloadAction<boolean>) => {
      state.useRAG = action.payload;
    },
    setRAGEmbeddingProvider: (state, action: PayloadAction<"openai" | "ollama" | "lmstudio">) => {
      state.ragEmbeddingProvider = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setProvider,
  setModel,
  setTemperature,
  setMaxTokens,
  setSystemPrompt,
  setApiKey,
  setLocalEndpoint,
  setUseTools,
  setUseRAG,
  setRAGEmbeddingProvider,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
