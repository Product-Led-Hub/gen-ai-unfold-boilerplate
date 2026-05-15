/**
 * @file lib/db/migrate.ts
 * @description Automatic migration runner for the SQLite database.
 *
 * How it works:
 *  1. Ensures a `schema_migrations` table exists to track applied versions.
 *  2. Reads all `*.sql` files from `src/lib/db/migrations/` sorted lexicographically.
 *  3. Skips migrations already recorded in `schema_migrations`.
 *  4. Runs each pending file inside a transaction; rolls back on failure.
 *  5. Records the version in `schema_migrations` so it never runs again.
 *
 * How to add a migration:
 *  1. Create: `src/lib/db/migrations/NNNN_description.sql`
 *     (increment the 4-digit prefix — e.g. `0004_add_tags.sql`).
 *  2. Write your SQL (`CREATE TABLE`, `ALTER TABLE`, `INSERT`, etc.).
 *  3. Restart the dev server — migrations run automatically at startup.
 *
 * Naming convention:
 *  `0001_initial_schema.sql`
 *  `0002_llm_providers.sql`
 *  `0003_setting_profiles.sql`
 *
 * Current migrations:
 *  - 0001 — `sessions`, `messages`, `rag_chunks`
 *  - 0002 — `llm_providers`
 *  - 0003 — `setting_profiles`
 */
// Migration runner for the SQLite database.
//
// HOW IT WORKS:
//   1. Ensures a `schema_migrations` table exists to track applied migrations.
//   2. Reads all *.sql files from src/lib/db/migrations/ sorted by filename.
//   3. Skips migrations that are already recorded in schema_migrations.
//   4. Runs each pending migration inside a transaction and records it.
//
// HOW TO ADD A MIGRATION:
//   1. Create a new file: src/lib/db/migrations/NNNN_description.sql
//      (increment NNNN — e.g. 0002_add_tags.sql)
//   2. Write your SQL (ALTER TABLE, CREATE TABLE, etc.)
//   3. Restart the dev server — migrations run automatically on startup.
//
// EXAMPLE migration file — 0002_add_model_to_sessions.sql:
//   ALTER TABLE sessions ADD COLUMN model TEXT;
//
// NOTE: migrations are one-way (no down migrations) for simplicity.
// If you need to undo, write a new migration that reverses the change.

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

export function runMigrations(db: DatabaseSync): void {
  // ── Bootstrap migrations table ────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  // ── Collect migration files ───────────────────────────────────────────────
  const migrationsDir = path.join(process.cwd(), "src", "lib", "db", "migrations");

  if (!fs.existsSync(migrationsDir)) return;

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // lexicographic sort — prefix NNNN ensures correct order

  // ── Already applied versions ──────────────────────────────────────────────
  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as Array<{ version: string }>)
      .map((r) => r.version)
  );

  // ── Run pending migrations ────────────────────────────────────────────────
  for (const file of files) {
    const version = file.replace(".sql", "");
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

    console.log(`[db] Running migration: ${file}`);
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(
        version,
        Date.now()
      );
      db.exec("COMMIT");
      console.log(`[db] Migration applied: ${file}`);
    } catch (err) {
      db.exec("ROLLBACK");
      console.error(`[db] Migration FAILED: ${file}`, err);
      throw err; // abort startup — do not serve a broken schema
    }
  }
}
