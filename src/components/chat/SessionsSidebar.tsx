/**
 * @file SessionsSidebar.tsx
 * @description Left-hand sidebar that lists all saved chat sessions.
 *
 * Responsibilities:
 *  - Fetches all sessions from `GET /api/sessions` on mount.
 *  - "+ New Chat" button creates a session via `POST /api/sessions`.
 *  - Each row is clickable — parent receives the selected `Session` object.
 *  - Hovering a row reveals a ✕ delete button that calls `DELETE /api/sessions/[id]`.
 *  - Accepts `titleUpdates` from `ChatPanel` so newly auto-titled sessions appear
 *    immediately without a full refresh.
 *
 * How to use:
 * ```tsx
 * <SessionsSidebar
 *   activeSessionId={activeSession?.id ?? null}
 *   onSelect={(session) => loadSession(session)}
 *   onNew={(session) => setActiveSession(session)}
 *   titleUpdates={titleUpdates}
 * />
 * ```
 *
 * Data flow:
 *  Sessions are stored in SQLite (`sessions` table, managed by `src/lib/db`).
 *  The sidebar is purely a read/write UI — all business logic stays in the API routes.
 *
 * Extension ideas:
 *  - Add drag-to-reorder or folder grouping.
 *  - Add a search/filter input to find sessions by title.
 *  - Show a token-count badge per session.
 */
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface Session {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

interface SessionsSidebarProps {
  activeSessionId: string | null;
  onSelect: (session: Session) => void;
  onNew: (session: Session) => void;
  // allows ChatPanel to push title updates up
  titleUpdates?: Record<string, string>;
}

export function SessionsSidebar({
  activeSessionId,
  onSelect,
  onNew,
  titleUpdates = {},
}: SessionsSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = (await res.json()) as Session[];
      setSessions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Apply in-flight title updates from ChatPanel
  const displaySessions = sessions.map((s) =>
    titleUpdates[s.id] ? { ...s, title: titleUpdates[s.id] } : s
  );

  const handleNew = async () => {
    const res = await fetch("/api/sessions", { method: "POST" });
    const session = (await res.json()) as Session;
    setSessions((prev) => [session, ...prev]);
    onNew(session);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      // deleted the active session — create a fresh one
      handleNew();
    }
  };

  return (
    <aside className="w-56 border-r flex flex-col h-full bg-background">
      {/* New Chat button */}
      <div className="p-3 border-b">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <p className="text-xs text-muted-foreground px-3 py-2">Loading…</p>
        ) : displaySessions.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">No sessions yet</p>
        ) : (
          displaySessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s)}
              className={cn(
                "group flex items-center gap-1 px-3 py-2 cursor-pointer text-sm rounded-md mx-1 transition-colors",
                activeSessionId === s.id
                  ? "bg-muted font-medium"
                  : "hover:bg-muted/50"
              )}
            >
              <span className="flex-1 truncate">{s.title || "New Chat"}</span>
              <button
                onClick={(e) => handleDelete(e, s.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-opacity text-xs px-1"
                title="Delete session"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
