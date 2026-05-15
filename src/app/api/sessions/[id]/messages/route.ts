// GET  /api/sessions/[id]/messages — fetch all messages for a session
// POST /api/sessions/[id]/messages — upsert a batch of messages

import { db } from "@/lib/db";

interface Params { params: Promise<{ id: string }> }

interface MsgRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: number;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const rows = db
    .prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC")
    .all(id) as unknown as MsgRow[];
  return Response.json(rows);
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const { messages } = await req.json() as {
    messages: Array<{ id: string; role: string; content: string }>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array required" }, { status: 400 });
  }

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  const now = Date.now();
  for (const m of messages) {
    stmt.run(m.id, id, m.role, m.content, now);
  }

  // Touch updated_at on the session so it floats to the top of the list
  db.prepare("UPDATE sessions SET updated_at = ? WHERE id = ?").run(now, id);

  return Response.json({ ok: true, saved: messages.length });
}
