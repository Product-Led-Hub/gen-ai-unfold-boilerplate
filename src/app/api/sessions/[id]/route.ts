// PATCH  /api/sessions/[id] — update session title
// DELETE /api/sessions/[id] — delete session + all its messages

import { db } from "@/lib/db";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const { title } = await req.json() as { title?: string };
  if (!title?.trim()) return Response.json({ error: "title required" }, { status: 400 });

  db.prepare("UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?")
    .run(title.trim().slice(0, 80), Date.now(), id);

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  // Explicitly delete messages first — foreign key CASCADE requires
  // `PRAGMA foreign_keys = ON` per connection which may not always fire.
  db.prepare("DELETE FROM messages WHERE session_id = ?").run(id);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  return Response.json({ ok: true });
}
