"use client";

import { useMemo } from "react";
import {
  countTokens,
  countMessageTokens,
  getRemainingTokens,
  getContextLimit,
  calculateCost,
} from "@/lib/tokenizer";

interface Message {
  role: string;
  content: string;
}

export function useTokenCount(text: string, model: string = "gpt-4o") {
  return useMemo(() => countTokens(text, model), [text, model]);
}

export function useMessageTokens(
  messages: Message[],
  model: string = "gpt-4o"
) {
  return useMemo(() => countMessageTokens(messages, model), [messages, model]);
}

export function useRemainingTokens(
  messages: Message[],
  model: string = "gpt-4o",
  reserveForResponse: number = 4096
) {
  return useMemo(
    () => getRemainingTokens(messages, model, reserveForResponse),
    [messages, model, reserveForResponse]
  );
}

export function useContextLimit(model: string = "gpt-4o") {
  return useMemo(() => getContextLimit(model), [model]);
}

export function useCostEstimate(
  promptTokens: number,
  completionTokens: number,
  model: string
) {
  return useMemo(
    () => calculateCost(promptTokens, completionTokens, model),
    [promptTokens, completionTokens, model]
  );
}
