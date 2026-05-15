/**
 * @file DocumentUpload.tsx
 * @description UI for adding documents to the RAG knowledge base.
 *
 * Responsibilities:
 *  - Two tabs: **Upload File** (drag-and-drop or click) and **Paste Text**.
 *  - Supported file types: `.txt`, `.md`, `.docx`, `.doc` (server extracts text).
 *  - File tab: POSTs `multipart/form-data` to `POST /api/rag/upload`.
 *  - Paste tab: POSTs JSON `{ text, source }` to `POST /api/rag/ingest`.
 *  - Both endpoints chunk the text, generate embeddings, and persist chunks to
 *    SQLite via `src/lib/rag/vectorStore.ts`.
 *  - Shows progress feedback: idle / loading / success / error.
 *
 * How to use:
 * ```tsx
 * <DocumentUpload
 *   embeddingProvider={settings.ragEmbeddingProvider}  // "lmstudio" | "ollama" | "openai"
 *   onIngestComplete={(chunkCount) => console.log(`${chunkCount} chunks stored`)}
 * />
 * ```
 *
 * Bootcamp session: Session 3 — RAG.
 *
 * Extension ideas:
 *  - Add a PDF tab using `pdf-parse` on the server.
 *  - Show the list of ingested documents with a per-document delete button.
 *  - Add a "Re-embed all" button to migrate embeddings to a new model.
 */
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onIngestComplete?: (chunkCount: number) => void;
  embeddingProvider?: "openai" | "ollama" | "lmstudio";
}

type Tab = "file" | "paste";
type Status = "idle" | "loading" | "success" | "error";

export function DocumentUpload({
  onIngestComplete,
  embeddingProvider = "openai",
}: DocumentUploadProps) {
  const [tab, setTab] = useState<Tab>("file");
  const [text, setText] = useState("");
  const [source, setSource] = useState("my-document");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [docCount, setDocCount] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetStatus = () => { setStatus("idle"); setMessage(""); };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    setSelectedFile(file);
    setMessage("");
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("embeddingProvider", embeddingProvider);
    formData.append("source", selectedFile.name);

    try {
      const res = await fetch("/api/rag/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStatus("success");
      setMessage(`Ingested ${data.chunks} chunks from "${data.source}". Total: ${data.totalDocuments}.`);
      setDocCount(data.totalDocuments);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onIngestComplete?.(data.chunks);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // ── Paste ingest ──────────────────────────────────────────────────────────
  const handleIngest = async () => {
    if (!text.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), source: source.trim() || "uploaded", embeddingProvider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingest failed");

      setStatus("success");
      setMessage(`Ingested ${data.chunks} chunks from "${data.source}". Total: ${data.totalDocuments}.`);
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
      resetStatus();
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
    } catch { /* silent */ }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Knowledge Base (RAG)</CardTitle>
        <CardDescription className="text-xs">
          Upload a file or paste text. Enable &quot;Use RAG&quot; in chat to query it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Chunk count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button onClick={handleRefreshCount} className="hover:underline">
            {docCount !== null ? `${docCount} chunk${docCount !== 1 ? "s" : ""} stored` : "Check stored chunks"}
          </button>
          {docCount !== null && docCount > 0 && (
            <button onClick={handleClear} className="text-destructive hover:underline">
              Clear all
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex rounded-md border overflow-hidden text-xs">
          {(["file", "paste"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); resetStatus(); }}
              className={cn(
                "flex-1 py-1 capitalize transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
            >
              {t === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {/* ── File tab ── */}
        {tab === "file" && (
          <div className="space-y-2">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-6 text-xs text-muted-foreground cursor-pointer transition-colors select-none",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-xl">📄</span>
              {selectedFile ? (
                <span className="font-medium text-foreground truncate max-w-full">{selectedFile.name}</span>
              ) : (
                <>
                  <span>Click or drag &amp; drop</span>
                  <span className="text-[10px]">.txt · .md · .docx · .doc (max 2 MB)</span>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx,.doc"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {selectedFile && (
              <button
                onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="text-[10px] text-muted-foreground hover:underline"
              >
                Remove file
              </button>
            )}

            {message && (
              <p className={`text-xs ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                {message}
              </p>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || status === "loading"}
              size="sm"
              className="w-full"
            >
              {status === "loading" ? "Uploading…" : "Upload & Ingest"}
            </Button>
          </div>
        )}

        {/* ── Paste tab ── */}
        {tab === "paste" && (
          <div className="space-y-2">
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

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your document text here..."
              className="min-h-[120px] text-xs resize-none"
              disabled={status === "loading"}
            />

            {message && (
              <p className={`text-xs ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
