"use client";

import { useChat } from "@ai-sdk/react";
import { useMemo } from "react";
import { TextStreamChatTransport } from "ai";
import { ChatMessages, ChatInput, ProviderSelector } from "@/components/chat";
import { AIProvider, DEFAULT_MODELS } from "@/lib/ai/providers";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setProvider, setModel } from "@/lib/store/slices/settingsSlice";

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
        },
      }),
    [
      settings.provider,
      settings.model,
      settings.temperature,
      settings.maxTokens,
      settings.systemPrompt,
    ]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

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
      <aside className="w-80 border-r p-4 hidden md:block">
        <h1 className="text-xl font-bold mb-6">AI Chat</h1>
        <ProviderSelector
          provider={settings.provider}
          model={settings.model}
          onProviderChange={handleProviderChange}
          onModelChange={handleModelChange}
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
