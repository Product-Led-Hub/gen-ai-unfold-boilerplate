import {
  encodingForModel,
  getEncoding,
  Tiktoken,
  TiktokenModel,
} from "js-tiktoken";

export type SupportedModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "gemini-pro"
  | "gemini-1.5-pro";

const MODEL_TO_TIKTOKEN: Record<string, TiktokenModel> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-4": "gpt-4",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "claude-3-opus": "gpt-4o",
  "claude-3-sonnet": "gpt-4o",
  "claude-3-haiku": "gpt-4o",
  "claude-3.5-sonnet": "gpt-4o",
  "gemini-pro": "gpt-4o",
  "gemini-1.5-pro": "gpt-4o",
  "gemini-1.5-flash": "gpt-4o",
};

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "gpt-4-turbo": 128000,
  "gpt-4": 8192,
  "gpt-3.5-turbo": 16385,
  "claude-3-opus": 200000,
  "claude-3-sonnet": 200000,
  "claude-3-haiku": 200000,
  "claude-3.5-sonnet": 200000,
  "gemini-pro": 32760,
  "gemini-1.5-pro": 1000000,
  "gemini-1.5-flash": 1000000,
};

let encoderCache: Map<string, Tiktoken> = new Map();

function getEncoder(model: string): Tiktoken {
  const tiktokenModel = MODEL_TO_TIKTOKEN[model] || "gpt-4o";

  if (!encoderCache.has(tiktokenModel)) {
    try {
      encoderCache.set(tiktokenModel, encodingForModel(tiktokenModel));
    } catch {
      encoderCache.set(tiktokenModel, getEncoding("cl100k_base"));
    }
  }

  return encoderCache.get(tiktokenModel)!;
}

export function countTokens(text: string, model: string = "gpt-4o"): number {
  try {
    const encoder = getEncoder(model);
    return encoder.encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

export function countMessageTokens(
  messages: Array<{ role: string; content: string }>,
  model: string = "gpt-4o"
): number {
  let totalTokens = 0;

  for (const message of messages) {
    totalTokens += 4;
    totalTokens += countTokens(message.role, model);
    totalTokens += countTokens(message.content, model);
  }

  totalTokens += 2;

  return totalTokens;
}

export function getContextLimit(model: string): number {
  return MODEL_CONTEXT_LIMITS[model] || 4096;
}

export function getRemainingTokens(
  messages: Array<{ role: string; content: string }>,
  model: string = "gpt-4o",
  reserveForResponse: number = 4096
): number {
  const used = countMessageTokens(messages, model);
  const limit = getContextLimit(model);
  return Math.max(0, limit - used - reserveForResponse);
}

export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model: string = "gpt-4o"
): string {
  const encoder = getEncoder(model);
  const tokens = encoder.encode(text);

  if (tokens.length <= maxTokens) {
    return text;
  }

  const truncatedTokens = tokens.slice(0, maxTokens);
  return encoder.decode(truncatedTokens);
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  "claude-3-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125 },
  "claude-3.5-sonnet": { input: 0.003, output: 0.015 },
};

export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model: string
): number {
  const costs = TOKEN_COSTS[model];
  if (!costs) return 0;

  return (
    (promptTokens / 1000) * costs.input +
    (completionTokens / 1000) * costs.output
  );
}

export function formatTokenCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function cleanupEncoders(): void {
  encoderCache.clear();
}
