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
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
