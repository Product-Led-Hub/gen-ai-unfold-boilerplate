# SQLite Migrations Guide
> Stack: Node.js built-in `node:sqlite` · Auto-migration runner · No ORM required

---

## How It Works (TL;DR)

**You never run a migration command manually.** The migration runner fires automatically every time the dev server starts (or the app boots in production). It reads every `.sql` file in `src/lib/db/migrations/`, skips anything already applied, and runs the rest in order.

```
pnpm dev  →  Next.js starts  →  db/index.ts imports  →  runMigrations() fires  →  pending .sql files run
```

The database file lives at `.data/app.db` (auto-created, gitignored).

---

## First-Time Setup

```bash
# 1. Make sure Node.js ≥ 23.4 is installed (node:sqlite is built-in from 23.4+)
node -v    # must be v23.4.0 or higher

# 2. Install dependencies (if not already done)
pnpm install

# 3. Start the dev server — migrations run automatically
pnpm dev
```

On first start you will see this in the terminal:

```
[db] Running migration: 0001_initial_schema.sql
[db] Migration applied: 0001_initial_schema.sql
[db] Running migration: 0002_llm_providers.sql
[db] Migration applied: 0002_llm_providers.sql
[db] Running migration: 0003_setting_profiles.sql
[db] Migration applied: 0003_setting_profiles.sql
```

After that the DB file exists at `.data/app.db` with all tables created and seeded.

---

## Current Tables

### `sessions`
Stores each chat conversation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `crypto.randomUUID()` |
| `title` | TEXT | Defaults to `'New Chat'` |
| `created_at` | INTEGER | Unix ms timestamp |
| `updated_at` | INTEGER | Unix ms timestamp |

### `messages`
Individual messages inside a session.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `crypto.randomUUID()` |
| `session_id` | TEXT FK | References `sessions(id)` — CASCADE delete |
| `role` | TEXT | `'user'` \| `'assistant'` \| `'system'` |
| `content` | TEXT | Full message text |
| `created_at` | INTEGER | Unix ms timestamp |

### `rag_chunks`
Chunked document text with vector embeddings for RAG retrieval.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `crypto.randomUUID()` |
| `source` | TEXT | Filename or document title |
| `content` | TEXT | The chunk text (~512 tokens) |
| `embedding` | TEXT | JSON-serialised `number[]` (384 floats, MiniLM) |
| `chunk_num` | INTEGER | Position of this chunk within the document |
| `total_chunks` | INTEGER | Total chunks for this document |
| `ingested_at` | TEXT | ISO timestamp string |

### `llm_providers`
User-configured AI provider + model combinations. Seeded with LM Studio.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `'default-lmstudio'` for the seed row |
| `label` | TEXT | Display name, e.g. `'LM Studio – Mistral 3B'` |
| `provider` | TEXT | `'lmstudio'` \| `'openai'` \| `'anthropic'` \| `'ollama'` |
| `model` | TEXT | Model ID string |
| `base_url` | TEXT | Override endpoint (needed for LM Studio / Ollama) |
| `api_key` | TEXT | Nullable — stored locally, not sent to any external service |
| `is_default` | INTEGER | `1` = default provider shown on load |
| `created_at` | INTEGER | Unix ms timestamp |
| `updated_at` | INTEGER | Unix ms timestamp |

### `setting_profiles`
Named AI setting presets. Seeded with a `Default` profile.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | `'default-profile'` for the seed row |
| `name` | TEXT | Display name |
| `system_prompt` | TEXT | Defaults to `'You are a helpful AI assistant.'` |
| `temperature` | REAL | `0.0` – `2.0`, default `0.7` |
| `max_tokens` | INTEGER | Default `8000` |
| `history_limit` | INTEGER | Messages to include, default `20` |
| `is_default` | INTEGER | `1` = loaded on app start |
| `created_at` | INTEGER | Unix ms timestamp |
| `updated_at` | INTEGER | Unix ms timestamp |

### `schema_migrations` (internal)
Tracks which migration files have been applied. **Do not edit manually.**

| Column | Type |
|--------|------|
| `version` | TEXT PK — filename without `.sql`, e.g. `0001_initial_schema` |
| `applied_at` | INTEGER — Unix ms timestamp |

---

## Adding a New Migration

### Step 1 — Create the file

```bash
# Example: add a documents table for team projects
touch src/lib/db/migrations/0004_documents.sql
```

Name format: `NNNN_description.sql` — the 4-digit prefix controls run order.

### Step 2 — Write the SQL

```sql
-- Migration 0004: documents table
-- Stores uploaded document metadata for RAG.

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  filename    TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | embedded | error
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user
  ON documents(user_id);
```

### Step 3 — Restart the dev server

```bash
# Stop the server (Ctrl+C) then:
pnpm dev
```

Terminal output confirms it ran:
```
[db] Running migration: 0004_documents.sql
[db] Migration applied: 0004_documents.sql
```

That's it. The migration will **never run again** on subsequent restarts because its version is recorded in `schema_migrations`.

---

## Inspecting the Database

### Option A — SQLite CLI (built into macOS)

```bash
# Open the database
sqlite3 .data/app.db

# Useful commands once inside:
.tables                        -- list all tables
.schema sessions               -- show CREATE statement for a table
SELECT * FROM schema_migrations;
SELECT * FROM llm_providers;
SELECT * FROM setting_profiles;
SELECT count(*) FROM rag_chunks;
.quit
```

### Option B — TablePlus (recommended GUI)

1. Download [TablePlus](https://tableplus.com) (free tier is sufficient)
2. New connection → SQLite
3. File path: `/path/to/your/project/.data/app.db`
4. Connect — browse tables visually

### Option C — DB Browser for SQLite (free, open source)

Download from [sqlitebrowser.org](https://sqlitebrowser.org) — same approach as TablePlus.

### Option D — Quick Node.js script

```bash
node --experimental-sqlite -e "
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('.data/app.db');
  console.log(db.prepare('SELECT * FROM schema_migrations').all());
  db.close();
"
```

---

## Migration Rules & Conventions

| Rule | Reason |
|------|--------|
| Always prefix with `NNNN_` (4 digits) | Ensures correct run order via lexicographic sort |
| Use `CREATE TABLE IF NOT EXISTS` | Safe to run if somehow migration tracking breaks |
| Use `INSERT OR IGNORE` for seed data | Prevents duplicate seed rows on re-runs |
| One concern per file | Easier to debug and revert by writing a reverse migration |
| No `DROP TABLE` without a new migration | Destructive — write a separate `0005_drop_old_table.sql` |
| No down migrations | For simplicity — undo by writing a new forward migration |
| Integer timestamps in **milliseconds** | `Date.now()` in JS; `strftime('%s','now') * 1000` in SQL |
| Migrations run inside a transaction | If any statement fails, the whole file rolls back |

---

## Migration Fails at Startup

If a migration throws an error, the runner prints the error and **throws**, which stops the Next.js server from starting. This is intentional — serving with a broken schema causes silent data corruption.

**What to do:**

```bash
# 1. Read the error in the terminal carefully
[db] Migration FAILED: 0004_documents.sql  SyntaxError: near "FORM": syntax error

# 2. Fix the SQL file
# 3. Restart — the failed migration will retry (it was never committed)
pnpm dev
```

Because the migration runs inside `BEGIN` / `ROLLBACK`, a failed file is never recorded in `schema_migrations` and will retry on the next start.

---

## Reset the Database (Development Only)

If you want to start completely fresh (e.g. after a schema experiment):

```bash
# Stop the dev server first, then:
rm .data/app.db

# Restart — all migrations run from scratch
pnpm dev
```

> ⚠️ This deletes all sessions, messages, and uploaded RAG chunks. Only do this in local dev.

---

## Team Project — Suggested Additional Migrations

Each team project (see [BOOTCAMP-TEAM-PROJECTS.md](BOOTCAMP-TEAM-PROJECTS.md)) can add its own tables. Examples:

```bash
# Team 1 — Recipe Assistant
src/lib/db/migrations/0004_team1_recipes.sql

# Team 2 — Support Agent
src/lib/db/migrations/0004_team2_tickets.sql

# Team 4 — Study Buddy
src/lib/db/migrations/0004_team4_quiz_scores.sql

# Team 6 — Legal Analyzer
src/lib/db/migrations/0004_team6_flagged_clauses.sql
```

Since all teams branch from the same boilerplate, their `0004_` files are isolated — they only affect their own local `.data/app.db`.

---

## Full File Reference

```
.data/
  app.db                            ← SQLite database file (gitignored)

src/lib/db/
  index.ts                          ← DB singleton + auto-migration on import
  migrate.ts                        ← Migration runner logic
  migrations/
    0001_initial_schema.sql         ← sessions, messages, rag_chunks
    0002_llm_providers.sql          ← llm_providers + LM Studio seed row
    0003_setting_profiles.sql       ← setting_profiles + Default profile seed
    0004_your_migration.sql         ← add yours here
```

### How `index.ts` bootstraps everything

```ts
// Every API route that does:
import { db } from "@/lib/db";

// ...triggers this chain on first import:
// initDB() → new DatabaseSync(".data/app.db") → PRAGMA WAL + FK → runMigrations()

// Use the db handle directly with prepared statements:
const sessions = db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC").all();
const insert   = db.prepare("INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?,?,?,?)");
insert.run(crypto.randomUUID(), "New Chat", Date.now(), Date.now());
```
