// GET  /api/sessions       — list all sessions (newest first)
// POST /api/sessions       — create a new session, returns the new session row

import { db } from "@/lib/db";

interface SessionRow {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

export async function GET() {
  const rows = db
    .prepare("SELECT * FROM sessions ORDER BY updated_at DESC")
    .all() as unknown as SessionRow[];
  return Response.json(rows);
}

export async function POST() {
  const id = crypto.randomUUID();
  const now = Date.now();
  db.prepare(
    "INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)"
  ).run(id, "New Chat", now, now);

  return Response.json({ id, title: "New Chat", created_at: now, updated_at: now });
}
