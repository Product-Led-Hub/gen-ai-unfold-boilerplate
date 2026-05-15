/**
 * @file FeaturesToggle.tsx
 * @description Toggle panel for optional AI features: Tool Calling and RAG.
 *
 * Responsibilities:
 *  - Two toggle switches: **Tool Calling** and **Use RAG**.
 *  - When RAG is enabled, shows three embedding-provider buttons
 *    (LM Studio / Ollama / OpenAI) so the user can switch the vector-store
 *    backend without touching environment variables.
 *  - All state lives in the parent (controlled component pattern).
 *
 * How to use:
 * ```tsx
 * <FeaturesToggle
 *   useTools={settings.useTools}
 *   useRAG={settings.useRAG}
 *   ragEmbeddingProvider={settings.ragEmbeddingProvider}
 *   onToggleTools={(v) => dispatch(setUseTools(v))}
 *   onToggleRAG={(v) => dispatch(setUseRAG(v))}
 *   onChangeEmbeddingProvider={(v) => dispatch(setRAGEmbeddingProvider(v))}
 * />
 * ```
 *
 * Bootcamp session: Session 3 — Tool Calling & RAG.
 *
 * Extension ideas:
 *  - Add a Web Search toggle that routes through a `searchTool`.
 *  - Add a Code Execution toggle (sandboxed via a Docker tool).
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeaturesToggleProps {
  useTools: boolean;
  useRAG: boolean;
  ragEmbeddingProvider: "openai" | "ollama" | "lmstudio";
  onToggleTools: (value: boolean) => void;
  onToggleRAG: (value: boolean) => void;
  onChangeEmbeddingProvider: (value: "openai" | "ollama" | "lmstudio") => void;
}

export function FeaturesToggle({
  useTools,
  useRAG,
  ragEmbeddingProvider,
  onToggleTools,
  onToggleRAG,
  onChangeEmbeddingProvider,
}: FeaturesToggleProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Features</CardTitle>
        <CardDescription className="text-xs">
          Enable advanced AI capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tool Calling Toggle */}
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <div>
            <p className="text-sm font-medium">Tool Calling</p>
            <p className="text-xs text-muted-foreground">
              Weather, calculator, date/time
            </p>
          </div>
          <button
            role="switch"
            aria-checked={useTools}
            onClick={() => onToggleTools(!useTools)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
              useTools ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                useTools ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </label>

        {/* RAG Toggle */}
        <label className="flex items-center justify-between gap-2 cursor-pointer">
          <div>
            <p className="text-sm font-medium">Use RAG</p>
            <p className="text-xs text-muted-foreground">
              Query your knowledge base
            </p>
          </div>
          <button
            role="switch"
            aria-checked={useRAG}
            onClick={() => onToggleRAG(!useRAG)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
              useRAG ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                useRAG ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </label>

        {/* Embedding provider (visible only when RAG is on) */}
        {useRAG && (
          <div className="space-y-1 pl-1 border-l-2 border-muted ml-1">
            <p className="text-xs font-medium text-muted-foreground">
              Embedding provider
            </p>
            <div className="flex gap-2 flex-wrap">
              {(["lmstudio", "ollama", "openai"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onChangeEmbeddingProvider(p)}
                  className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                    ragEmbeddingProvider === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {p === "openai" ? "OpenAI" : p === "ollama" ? "Ollama" : "LM Studio"}
                </button>
              ))}
            </div>
            {ragEmbeddingProvider === "ollama" && (
              <p className="text-xs text-muted-foreground">
                Requires <code>nomic-embed-text</code> pulled in Ollama
              </p>
            )}
            {ragEmbeddingProvider === "lmstudio" && (
              <p className="text-xs text-muted-foreground">
                Uses <code>text-embedding-nomic-embed-text-v1.5</code> via LM Studio
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
