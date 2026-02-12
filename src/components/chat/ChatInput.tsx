"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { countTokens, formatTokenCount } from "@/lib/tokenizer";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  model?: string;
}

export function ChatInput({ onSend, isLoading, model = "gpt-4o" }: ChatInputProps) {
  const [input, setInput] = useState("");

  const tokenCount = countTokens(input, model);

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
        <div className="text-xs text-muted-foreground text-right">
          {formatTokenCount(tokenCount)} tokens
        </div>
      </div>
    </div>
  );
}
