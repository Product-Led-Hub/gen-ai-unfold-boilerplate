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

// In AI SDK v6, tool parts have type `"tool-{toolName}"` (e.g. "tool-calculator").
// Fields are flat on the part — no nested `toolInvocation` sub-object.
interface ToolUIPart {
  type: string;           // starts with "tool-"
  toolCallId: string;
  state: string;          // "input-streaming" | "input-available" | "output-available" | "output-error"
  input?: unknown;        // the args passed to the tool
  output?: unknown;       // the result returned by the tool
  errorText?: string;
}

interface TextUIPart {
  type: "text";
  text: string;
}

export type MessagePart = ToolUIPart | TextUIPart | { type: string };

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parts?: MessagePart[];
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
                "rounded-lg px-4 py-2 max-w-[80%] space-y-2",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.role === "user" ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <>
                  {/* Render tool parts — type is "tool-{toolName}" in AI SDK v6 */}
                  {message.parts
                    ?.filter((p): p is ToolUIPart => p.type.startsWith("tool-") && p.type !== "dynamic-tool")
                    .map((p) => {
                      // Extract tool name from the type string: "tool-calculator" → "calculator"
                      const toolName = p.type.split("-").slice(1).join("-");
                      const isDone = p.state === "output-available" || p.state === "output-error";
                      return (
                        <div
                          key={p.toolCallId}
                          className="rounded-md border border-border bg-background/60 text-xs p-2 space-y-1"
                        >
                          <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                            <span className={`inline-block w-2 h-2 rounded-full ${isDone ? "bg-green-500" : "bg-blue-500 animate-pulse"}`} />
                            Tool: <span className="font-mono">{toolName}</span>
                            {!isDone && (
                              <span className="text-muted-foreground italic">running…</span>
                            )}
                            {p.state === "output-error" && (
                              <span className="text-destructive italic">error</span>
                            )}
                          </div>
                          {p.input != null && (
                            <details className="cursor-pointer">
                              <summary className="text-muted-foreground select-none">Input</summary>
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(p.input, null, 2)}</pre>
                            </details>
                          )}
                          {p.state === "output-available" && p.output != null && (
                            <details open className="cursor-pointer">
                              <summary className="text-muted-foreground select-none">Result</summary>
                              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(p.output, null, 2)}</pre>
                            </details>
                          )}
                          {p.state === "output-error" && p.errorText != null && (
                            <div className="text-destructive mt-1">{p.errorText}</div>
                          )}
                        </div>
                      );
                    })}
                  {/* Render text content */}
                  {message.content && (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </>
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
