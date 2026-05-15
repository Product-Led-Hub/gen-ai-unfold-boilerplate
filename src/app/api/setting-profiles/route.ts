import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { z } from "zod";

export interface SettingProfileRow {
  id: string;
  name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  history_limit: number;
  is_default: number;
  created_at: number;
  updated_at: number;
}

const createSchema = z.object({
  name: z.string().min(1),
  system_prompt: z.string().default("You are a helpful AI assistant."),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().positive().default(8000),
  history_limit: z.number().int().min(0).default(20),
  is_default: z.boolean().default(false),
});

export async function GET() {
  const rows = db
    .prepare("SELECT * FROM setting_profiles ORDER BY is_default DESC, created_at ASC")
    .all() as unknown as SettingProfileRow[];
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createSchema.parse(body);
  const now = Date.now();
  const id = randomUUID();

  if (validated.is_default) {
    db.prepare("UPDATE setting_profiles SET is_default = 0, updated_at = ?").run(now);
  }

  db.prepare(
    `INSERT INTO setting_profiles (id, name, system_prompt, temperature, max_tokens, history_limit, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    validated.name,
    validated.system_prompt,
    validated.temperature,
    validated.max_tokens,
    validated.history_limit,
    validated.is_default ? 1 : 0,
    now,
    now
  );

  const row = db
    .prepare("SELECT * FROM setting_profiles WHERE id = ?")
    .get(id) as unknown as SettingProfileRow;
  return NextResponse.json(row, { status: 201 });
}
