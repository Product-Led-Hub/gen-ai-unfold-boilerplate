/**
 * @file hooks/useTokenCount.ts
 * @description React hooks that wrap the tokenizer library functions with `useMemo`
 * so components get reactive, memoised token counts without manual recalculation.
 *
 * Exported hooks:
 *  - `useTokenCount(text, model)` — token count for a single string.
 *  - `useMessageTokens(messages, model)` — total tokens across a message array.
 *  - `useRemainingTokens(messages, model, reserve)` — remaining context tokens.
 *  - `useContextLimit(model)` — maximum context window for the given model.
 *  - `useChatCost(messages, model)` — estimated USD cost for the conversation.
 *
 * How to use:
 * ```tsx
 * const inputTokens = useTokenCount(input, "gpt-4o");
 * const remaining = useRemainingTokens(messages, "gpt-4o", 1024);
 * ```
 *
 * All hooks return plain numbers — display formatting is handled by
 * `formatTokenCount()` from `@/lib/tokenizer`.
 *
 * Extension ideas:
 *  - Add a `useTokenWarning(threshold)` hook that fires a callback when
 *    remaining tokens drop below the threshold.
 */
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
