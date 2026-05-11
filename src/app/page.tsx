"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo } from "react";
import { TextStreamChatTransport } from "ai";
import {
  ChatMessages,
  ChatInput,
  ProviderSelector,
  FeaturesToggle,
} from "@/components/chat";
import { DocumentUpload } from "@/components/rag/DocumentUpload";
import { AIProvider, DEFAULT_MODELS } from "@/lib/ai/providers";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  setProvider,
  setModel,
  setUseTools,
  setUseRAG,
  setRAGEmbeddingProvider,
} from "@/lib/store/slices/settingsSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: {
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
          useTools: settings.useTools,
          useRAG: settings.useRAG,
          ragEmbeddingProvider: settings.ragEmbeddingProvider,
        },
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
    ]
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const handleProviderChange = (provider: AIProvider) => {
    dispatch(setProvider(provider));
    dispatch(setModel(DEFAULT_MODELS[provider]));
  };

  const handleModelChange = (model: string) => {
    dispatch(setModel(model));
  };

  const handleSend = (content: string) => {
    sendMessage({ text: content });
  };

  return (
    <main className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 border-r p-4 hidden md:flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-xl font-bold">AI Chat</h1>

        <ProviderSelector
          provider={settings.provider}
          model={settings.model}
          onProviderChange={handleProviderChange}
          onModelChange={handleModelChange}
        />

        {/* Session 3: Features (tools + RAG) */}
        <FeaturesToggle
          useTools={settings.useTools}
          useRAG={settings.useRAG}
          ragEmbeddingProvider={settings.ragEmbeddingProvider}
          onToggleTools={(v) => dispatch(setUseTools(v))}
          onToggleRAG={(v) => dispatch(setUseRAG(v))}
          onChangeEmbeddingProvider={(v) => dispatch(setRAGEmbeddingProvider(v))}
        />

        {/* Session 3: Knowledge base upload */}
        <DocumentUpload
          embeddingProvider={settings.ragEmbeddingProvider}
        />
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{settings.provider}</h2>
            <p className="text-sm text-muted-foreground">{settings.model}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {settings.useTools && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Tools ON
              </span>
            )}
            {settings.useRAG && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                RAG ON
              </span>
            )}
          </div>
        </header>

        {/* Messages */}
        <ChatMessages
          messages={messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            content:
              m.parts
                ?.filter((p) => p.type === "text")
                .map((p) => (p as { type: "text"; text: string }).text)
                .join("") || "",
          }))}
          isLoading={isLoading}
        />

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm">
            Error: {error.message}
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          model={settings.model}
        />
      </div>
    </main>
  );
}

