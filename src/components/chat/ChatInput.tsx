/**
 * @file ChatInput.tsx
 * @description Controlled textarea that the user types into.
 *
 * Responsibilities:
 *  - Renders a resizable `<Textarea>` and a "Send" button.
 *  - Sends the message when the user presses Enter (Shift+Enter inserts a newline).
 *  - Displays a live token count for the current input AND the full conversation
 *    so attendees can see context-window consumption in real time.
 *
 * How to use:
 * ```tsx
 * <ChatInput
 *   onSend={(msg) => sendMessage(msg)}
 *   isLoading={isLoading}
 *   model="gpt-4o"
 *   conversationTokens={totalTokens}
 * />
 * ```
 *
 * Extension ideas (bootcamp exercises):
 *  - Add a file-attachment button that uploads images to the message.
 *  - Add voice-to-text via the Web Speech API.
 *  - Show a warning banner when tokens approach the model's context limit.
 */
"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { countTokens, formatTokenCount } from "@/lib/tokenizer";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  model?: string;
  /** Pre-computed total tokens for all messages in the conversation */
  conversationTokens?: number;
}

export function ChatInput({
  onSend,
  isLoading,
  model = "gpt-4o",
  conversationTokens = 0,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const inputTokens = countTokens(input, model);
  const totalTokens = conversationTokens + inputTokens;

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            Send
          </Button>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {inputTokens > 0
              ? `This message: ${formatTokenCount(inputTokens)} tokens`
              : "Start typing to see token count"}
          </span>
          <span>
            Conversation: {formatTokenCount(totalTokens)} tokens
          </span>
        </div>
      </div>
    </div>
  );
}
