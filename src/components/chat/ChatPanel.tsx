/**
 * @file ChatPanel.tsx
 * @description Core chat orchestrator for a single session.
 *
 * Responsibilities:
 *  - Wires `useChat` (Vercel AI SDK v6) with a `TextStreamChatTransport` that
 *    POSTs to `POST /api/chat` with all current settings from Redux.
 *  - Rebuilds the transport (via `useMemo`) whenever provider, model, temperature,
 *    max tokens, system prompt, RAG, or history-limit settings change.
 *  - Persists new messages to SQLite via `POST /api/sessions/[id]/messages` after
 *    each completed exchange (status === "ready").
 *  - Auto-titles the session from the first 60 characters of the first user message.
 *
 * How to use:
 * ```tsx
 * // Remount with `key` to reset state when the active session changes.
 * <ChatPanel
 *   key={session.id}
 *   sessionId={session.id}
 *   initialMessages={savedMessages}   // loaded from DB
 *   historyLimit={20}
 *   onTitleUpdate={(title) => updateSidebarTitle(title)}
 * />
 * ```
 *
 * AI SDK v6 notes:
 *  - `useChat` prop is `messages` (not `initialMessages`) for pre-loaded history.
 *  - Valid `status` values: `"submitted" | "streaming" | "ready" | "error"`.
 *  - Message parts format: `{ type: "text", text: string }`.
 *
 * Extension ideas:
 *  - Pass `onFinish` to `useChat` to stream tool-call results back into the UI.
 *  - Add optimistic user-message rendering before the server round-trip.
 */
"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAppSelector } from "@/lib/store";
import { countTokens } from "@/lib/tokenizer";

interface SavedMessage {
  id: string;
  role: string;
  content: string;
}

interface ChatPanelProps {
  sessionId: string;
  initialMessages: SavedMessage[];
  historyLimit: number;
  onTitleUpdate?: (title: string) => void;
}

export function ChatPanel({ sessionId, initialMessages, historyLimit, onTitleUpdate }: ChatPanelProps) {
  const settings = useAppSelector((s) => s.settings);

  // Body is recomputed on every render so useChat always sends the latest settings.
  // useChat reads the body prop on each sendMessage() call — no stale values.
  const chatBody = useMemo(
    () => ({
      provider: settings.provider,
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      systemPrompt: settings.systemPrompt,
      useTools: settings.useTools,
      useRAG: settings.useRAG,
      ragEmbeddingProvider: settings.ragEmbeddingProvider,
      localEndpoint:
        settings.provider === "lmstudio" || settings.provider === "ollama"
          ? settings.localEndpoints[settings.provider]
          : undefined,
      historyLimit,
    }),
    [
      settings.provider,
      settings.model,
      settings.temperature,
      settings.maxTokens,
      settings.systemPrompt,
      settings.useTools,
      settings.useRAG,
      settings.ragEmbeddingProvider,
      settings.localEndpoints,
      historyLimit,
    ]
  );

  // Convert saved messages to UIMessage format for useChat initialMessages
  const uiInitial = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as UIMessage["role"],
        parts: [{ type: "text" as const, text: m.content }],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // only run once on mount
  );

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
    body: chatBody,
    messages: uiInitial,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // ── Persist messages to DB after each exchange ─────────────────────────────
  const savedCountRef = useRef(initialMessages.length);
  const titleSetRef = useRef(initialMessages.length > 0); // already has title if loaded

  useEffect(() => {
    if ((status === "ready" || status === "error") && messages.length > savedCountRef.current) {
      const newMessages = messages.slice(savedCountRef.current);
      savedCountRef.current = messages.length;

      const toSave = newMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: (m.parts as Array<{ type: string; text?: string }>)
          ?.filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join("") ?? "",
      }));

      fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSave }),
      }).catch(console.error);

      // Auto-set title from first user message
      if (!titleSetRef.current) {
        const firstUser = messages.find((m) => m.role === "user");
        if (firstUser) {
          const text = (firstUser.parts as Array<{ type: string; text?: string }>)
            ?.filter((p) => p.type === "text")
            .map((p) => p.text ?? "")
            .join("") ?? "";
          const title = text.slice(0, 60) || "New Chat";
          titleSetRef.current = true;
          onTitleUpdate?.(title);
          fetch(`/api/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          }).catch(console.error);
        }
      }
    }
  }, [status, messages.length, sessionId, onTitleUpdate, messages]);

  // ── Token counts ────────────────────────────────────────────────────────────
  const conversationTokens = useMemo(() => {
    return messages.reduce((total, m) => {
      const parts = m.parts as Array<{ type: string; text?: string }> | undefined;
      const text = parts?.filter((p) => p.type === "text").map((p) => p.text ?? "").join("") ?? "";
      return total + countTokens(text, settings.model);
    }, 0);
  }, [messages, settings.model]);

  const handleSend = (content: string) => {
    sendMessage({ text: content }, { body: chatBody });
  };

  return (
    <>
      <ChatMessages
        messages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content:
            (m.parts as Array<{ type: string; text?: string }>)
              ?.filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("") ?? "",
        }))}
        isLoading={isLoading}
      />

      {error && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
          Error: {error.message}
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        model={settings.model}
        conversationTokens={conversationTokens}
      />
    </>
  );
}
