import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModel } from "ai";

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "lmstudio"
  | "ollama";

export interface ProviderConfig {
  apiKey?: string;
  baseURL?: string;
}

export interface ModelConfig {
  provider: AIProvider;
  model: string;
  config?: ProviderConfig;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-latest",
  google: "gemini-1.5-pro",
  lmstudio: "local-model",
  ollama: "llama3.2",
};

export const AVAILABLE_MODELS: Record<AIProvider, string[]> = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "o1",
    "o1-mini",
    "o1-preview",
  ],
  anthropic: [
    "claude-3-5-sonnet-latest",
    "claude-3-5-haiku-latest",
    "claude-3-opus-latest",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  google: [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-exp",
  ],
  lmstudio: ["local-model"],
  ollama: [
    "llama3.2",
    "llama3.1",
    "llama3",
    "mistral",
    "mixtral",
    "codellama",
    "phi3",
    "gemma2",
    "qwen2.5",
  ],
};

export function createDynamicProvider(
  provider: AIProvider,
  config?: ProviderConfig
) {
  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: config?.apiKey || process.env.OPENAI_API_KEY,
        baseURL: config?.baseURL,
      });

    case "anthropic":
      return createAnthropic({
        apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY,
        baseURL: config?.baseURL,
      });

    case "google":
      return createGoogleGenerativeAI({
        apiKey: config?.apiKey || process.env.GOOGLE_API_KEY,
        baseURL: config?.baseURL,
      });

    case "lmstudio":
      return createOpenAI({
        apiKey: "lm-studio",
        baseURL: config?.baseURL || "http://localhost:1234/v1",
      });

    case "ollama":
      return createOpenAI({
        apiKey: "ollama",
        baseURL: config?.baseURL || "http://localhost:11434/v1",
      });

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function getModel(modelConfig: ModelConfig): LanguageModel {
  const provider = createDynamicProvider(modelConfig.provider, modelConfig.config);
  return provider(modelConfig.model) as LanguageModel;
}

export function getModelFromEnv(
  providerName: AIProvider,
  modelName?: string
): LanguageModel {
  const model = modelName || DEFAULT_MODELS[providerName];
  return getModel({ provider: providerName, model });
}

export interface ProviderInfo {
  name: string;
  displayName: string;
  requiresApiKey: boolean;
  isLocal: boolean;
  defaultEndpoint?: string;
}

export const PROVIDER_INFO: Record<AIProvider, ProviderInfo> = {
  openai: {
    name: "openai",
    displayName: "OpenAI",
    requiresApiKey: true,
    isLocal: false,
  },
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic",
    requiresApiKey: true,
    isLocal: false,
  },
  google: {
    name: "google",
    displayName: "Google AI",
    requiresApiKey: true,
    isLocal: false,
  },
  lmstudio: {
    name: "lmstudio",
    displayName: "LM Studio",
    requiresApiKey: false,
    isLocal: true,
    defaultEndpoint: "http://localhost:1234/v1",
  },
  ollama: {
    name: "ollama",
    displayName: "Ollama",
    requiresApiKey: false,
    isLocal: true,
    defaultEndpoint: "http://localhost:11434/v1",
  },
};
