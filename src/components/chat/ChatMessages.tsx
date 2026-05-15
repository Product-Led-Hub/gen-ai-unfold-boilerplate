/**
 * @file ChatMessages.tsx
 * @description Scrollable message list that renders the full conversation.
 *
 * Responsibilities:
 *  - Iterates over the `messages` array and renders each bubble.
 *  - User messages → plain text (right-aligned, primary colour).
 *  - Assistant messages → full Markdown via `react-markdown`:
 *    - GitHub-Flavoured Markdown (tables, strikethrough, task lists) via `remark-gfm`.
 *    - Syntax-highlighted code blocks via `rehype-highlight` + `highlight.js/github-dark`.
 *  - Shows an animated three-dot loader while the model is streaming.
 *
 * How to use:
 * ```tsx
 * <ChatMessages
 *   messages={messages}   // UIMessage[] from useChat
 *   isLoading={isLoading}
 * />
 * ```
 *
 * Styling:
 *  - Requires `@tailwindcss/typography` (prose classes) in `globals.css`.
 *  - Requires `@import "highlight.js/styles/github-dark.css"` in `globals.css`.
 *
 * Extension ideas:
 *  - Add copy-to-clipboard on code blocks.
 *  - Add a thumbs-up / thumbs-down rating per assistant message.
 *  - Render tool-call results in a collapsible panel.
 */
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 min-h-0 p-4">
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.role === "user" ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
