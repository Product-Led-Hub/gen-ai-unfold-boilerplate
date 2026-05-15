/**
 * @file lib/ai/providers.ts
 * @description LLM provider registry and model factory.
 *
 * Responsibilities:
 *  - Defines the `AIProvider` union type: `"openai" | "anthropic" | "google" | "lmstudio" | "ollama"`.
 *  - `PROVIDER_INFO` — display names and local/cloud flags for UI rendering.
 *  - `DEFAULT_MODELS` — sensible default model per provider.
 *  - `AVAILABLE_MODELS` — dropdown lists for cloud providers; local providers
 *    use a free-text input since available models depend on what is loaded.
 *  - `getModel(config)` — factory that returns a Vercel AI SDK `LanguageModel`
 *    instance for the requested provider, wiring API keys and base URLs.
 *
 * How to use:
 * ```ts
 * // In an API route handler:
 * const model = getModel({
 *   provider: "lmstudio",
 *   model: "mistralai/ministral-3b-latest",
 *   config: { baseURL: "http://localhost:1234/v1" },
 * });
 * const result = await streamText({ model, messages });
 * ```
 *
 * Adding a new provider:
 *  1. Add the key to the `AIProvider` union.
 *  2. Add an entry to `PROVIDER_INFO`, `DEFAULT_MODELS`, `AVAILABLE_MODELS`.
 *  3. Add a `case` in `getModel()` that calls the appropriate `@ai-sdk/*` factory.
 */
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
      // LM Studio does not require authentication.
      // The Vercel AI SDK's createOpenAI validates that apiKey is non-empty,
      // so we pass a single space — LM Studio ignores the Authorization header.
      return createOpenAI({
        apiKey: config?.apiKey || " ",
        baseURL: config?.baseURL || process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1",
      });

    case "ollama":
      // Ollama also needs no auth key.
      return createOpenAI({
        apiKey: config?.apiKey || " ",
        baseURL: config?.baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      });

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function getModel(modelConfig: ModelConfig): LanguageModel {
  const provider = createDynamicProvider(modelConfig.provider, modelConfig.config);
  return provider(modelConfig.model) as LanguageModel;
}

// ─── Convenience helpers shown in the bootcamp slides ─────────────────────────
// Used in Session 1 to demonstrate swapping providers with one function call.

/**
 * getLMStudioModel — use LM Studio as the AI provider.
 * Start the Local Server in LM Studio, then select a loaded model.
 * The server exposes an OpenAI-compatible API on port 1234.
 *
 * Usage:
 *   const model = getLMStudioModel('llama-3.2-3b-instruct');
 */
export function getLMStudioModel(modelId: string): LanguageModel {
  const lmstudio = createOpenAI({
    baseURL: process.env.LMSTUDIO_BASE_URL ?? "http://localhost:1234/v1",
    apiKey: " ", // LM Studio ignores the Authorization header
  });
  return lmstudio(modelId) as LanguageModel;
}

/**
 * getOllamaModel — use Ollama as the AI provider.
 * Run: ollama serve  (port 11434, OpenAI-compatible endpoint)
 *
 * Usage:
 *   const model = getOllamaModel('llama3.2');
 */
export function getOllamaModel(modelId: string): LanguageModel {
  const ollama = createOpenAI({
    baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
    apiKey: " ", // Ollama ignores the Authorization header
  });
  return ollama(modelId) as LanguageModel;
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
