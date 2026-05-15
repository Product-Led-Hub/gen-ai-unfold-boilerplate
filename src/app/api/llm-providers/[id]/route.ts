import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface LLMProviderRow {
  id: string;
  label: string;
  provider: string;
  model: string;
  base_url: string | null;
  api_key: string | null;
  is_default: number;
  created_at: number;
  updated_at: number;
}

const patchSchema = z.object({
  label: z.string().min(1).optional(),
  provider: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  base_url: z.string().optional().nullable(),
  api_key: z.string().optional().nullable(),
  is_default: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = db
    .prepare("SELECT * FROM llm_providers WHERE id = ?")
    .get(id) as unknown as LLMProviderRow | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const validated = patchSchema.parse(body);
  const now = Date.now();

  if (validated.is_default === true) {
    db.prepare("UPDATE llm_providers SET is_default = 0, updated_at = ?").run(now);
  }

  db.prepare(
    `UPDATE llm_providers SET
      label      = COALESCE(?, label),
      provider   = COALESCE(?, provider),
      model      = COALESCE(?, model),
      base_url   = ?,
      api_key    = ?,
      is_default = COALESCE(?, is_default),
      updated_at = ?
     WHERE id = ?`
  ).run(
    validated.label ?? null,
    validated.provider ?? null,
    validated.model ?? null,
    "base_url" in validated ? (validated.base_url ?? null) : existing.base_url,
    "api_key" in validated ? (validated.api_key ?? null) : existing.api_key,
    validated.is_default !== undefined ? (validated.is_default ? 1 : 0) : null,
    now,
    id
  );

  const updated = db
    .prepare("SELECT * FROM llm_providers WHERE id = ?")
    .get(id) as unknown as LLMProviderRow;
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM llm_providers WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
