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
  ragEmbeddingProvider: "openai" | "ollama";
}

const initialState: SettingsState = {
  provider: "openai",
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "You are a helpful AI assistant.",
  apiKeys: {},
  localEndpoints: {
    lmstudio: "http://localhost:1234/v1",
    ollama: "http://localhost:11434/api",
  },
  useTools: false,
  useRAG: false,
  ragEmbeddingProvider: "openai",
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
    setRAGEmbeddingProvider: (state, action: PayloadAction<"openai" | "ollama">) => {
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
