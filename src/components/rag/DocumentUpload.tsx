"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DocumentUploadProps {
  onIngestComplete?: (chunkCount: number) => void;
  embeddingProvider?: "openai" | "ollama";
}

export function DocumentUpload({
  onIngestComplete,
  embeddingProvider = "openai",
}: DocumentUploadProps) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("my-document");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [docCount, setDocCount] = useState<number | null>(null);

  const handleIngest = async () => {
    if (!text.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          source: source.trim() || "uploaded",
          embeddingProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ingest failed");
      }

      setStatus("success");
      setMessage(`Ingested ${data.chunks} chunks from "${data.source}". Total chunks: ${data.totalDocuments}.`);
      setDocCount(data.totalDocuments);
      setText("");
      onIngestComplete?.(data.chunks);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleClear = async () => {
    try {
      await fetch("/api/rag/ingest", { method: "DELETE" });
      setDocCount(0);
      setStatus("idle");
      setMessage("Knowledge base cleared.");
    } catch {
      setMessage("Failed to clear knowledge base.");
    }
  };

  const handleRefreshCount = async () => {
    try {
      const res = await fetch("/api/rag/ingest");
      const data = await res.json();
      setDocCount(data.documentCount);
    } catch {
      // silent
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Knowledge Base (RAG)</CardTitle>
        <CardDescription className="text-xs">
          Paste text to add to the retrieval context. Enable &quot;Use RAG&quot; in chat to query it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Document count badge */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={handleRefreshCount} className="hover:underline">
            {docCount !== null ? `${docCount} chunk${docCount !== 1 ? "s" : ""} stored` : "Check stored chunks"}
          </button>
          {docCount !== null && docCount > 0 && (
            <button
              onClick={handleClear}
              className="text-destructive hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Source label */}
        <div className="space-y-1">
          <label className="text-xs font-medium">Source name</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. my-document"
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
          />
        </div>

        {/* Document text */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your document text here..."
          className="min-h-[120px] text-xs resize-none"
          disabled={status === "loading"}
        />

        {/* Status message */}
        {message && (
          <p
            className={`text-xs ${
              status === "error" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        )}

        <Button
          onClick={handleIngest}
          disabled={!text.trim() || status === "loading"}
          size="sm"
          className="w-full"
        >
          {status === "loading" ? "Ingesting…" : "Ingest Document"}
        </Button>
      </CardContent>
    </Card>
  );
}
