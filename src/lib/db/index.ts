/**
 * @file lib/db/index.ts
 * @description SQLite database singleton using the Node.js built-in `node:sqlite`.
 *
 * Why `node:sqlite`?
 *  The project runs on Node 25. The built-in module requires zero native compilation,
 *  avoiding the `better-sqlite3` gyp build failures common in ARM/M-chip environments.
 *
 * Singleton pattern:
 *  The `db` instance is cached on `global.__db` so that Next.js hot-reloads and
 *  multiple route-handler module instances all share the same database connection.
 *  This is critical for in-memory caches (RAG) that must survive module re-imports.
 *
 * Database file: `.data/app.db` (gitignored).
 *
 * Schema management:
 *  On every startup, `runMigrations(db)` is called automatically.
 *  To add tables or columns: create a new `.sql` file in `src/lib/db/migrations/`
 *  and restart the dev server.
 *
 * How to use:
 * ```ts
 * import { db } from "@/lib/db";
 *
 * const rows = db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC").all();
 * ```
 *
 * TypeScript note:
 *  `.all()` returns `Record<string, SQLOutputValue>[]`. Cast with `as unknown as MyType[]`.
 */
// SQLite database using Node.js built-in `node:sqlite` (stable since Node 23.4).
// One file at .data/app.db — schema managed by src/lib/db/migrate.ts.
// To add tables or columns: create a new .sql file in src/lib/db/migrations/.

import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";
import { runMigrations } from "./migrate";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "app.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __db: DatabaseSync | undefined;
}

function initDB(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);

  // WAL mode for better concurrent read performance
  db.exec(`PRAGMA journal_mode = WAL`);
  // Foreign key enforcement must be set per connection
  db.exec(`PRAGMA foreign_keys = ON`);

  // Run any pending migrations (idempotent — safe to call every startup)
  runMigrations(db);

  return db;
}

export const db: DatabaseSync =
  global.__db ?? (global.__db = initDB());
