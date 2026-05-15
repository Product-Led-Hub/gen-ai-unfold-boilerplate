import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import type { SettingProfileRow } from "../route";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  system_prompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().optional(),
  history_limit: z.number().int().min(0).optional(),
  is_default: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = db
    .prepare("SELECT * FROM setting_profiles WHERE id = ?")
    .get(id) as unknown as SettingProfileRow | undefined;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const validated = patchSchema.parse(body);
  const now = Date.now();

  if (validated.is_default === true) {
    db.prepare("UPDATE setting_profiles SET is_default = 0, updated_at = ?").run(now);
  }

  db.prepare(
    `UPDATE setting_profiles SET
      name          = COALESCE(?, name),
      system_prompt = COALESCE(?, system_prompt),
      temperature   = COALESCE(?, temperature),
      max_tokens    = COALESCE(?, max_tokens),
      history_limit = COALESCE(?, history_limit),
      is_default    = COALESCE(?, is_default),
      updated_at    = ?
     WHERE id = ?`
  ).run(
    validated.name ?? null,
    validated.system_prompt ?? null,
    validated.temperature ?? null,
    validated.max_tokens ?? null,
    validated.history_limit ?? null,
    validated.is_default !== undefined ? (validated.is_default ? 1 : 0) : null,
    now,
    id
  );

  const updated = db
    .prepare("SELECT * FROM setting_profiles WHERE id = ?")
    .get(id) as unknown as SettingProfileRow;
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM setting_profiles WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
