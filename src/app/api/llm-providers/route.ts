import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
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

const createSchema = z.object({
  label: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  base_url: z.string().optional().nullable(),
  api_key: z.string().optional().nullable(),
  is_default: z.boolean().optional().default(false),
});

export async function GET() {
  const rows = db
    .prepare("SELECT * FROM llm_providers ORDER BY is_default DESC, created_at ASC")
    .all() as unknown as LLMProviderRow[];
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createSchema.parse(body);
  const now = Date.now();
  const id = randomUUID();

  if (validated.is_default) {
    db.prepare("UPDATE llm_providers SET is_default = 0, updated_at = ?").run(now);
  }

  db.prepare(
    `INSERT INTO llm_providers (id, label, provider, model, base_url, api_key, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    validated.label,
    validated.provider,
    validated.model,
    validated.base_url ?? null,
    validated.api_key ?? null,
    validated.is_default ? 1 : 0,
    now,
    now
  );

  const row = db
    .prepare("SELECT * FROM llm_providers WHERE id = ?")
    .get(id) as unknown as LLMProviderRow;
  return NextResponse.json(row, { status: 201 });
}
