-- Migration 0002: LLM providers table
-- Stores user-configured LLM provider + model combinations.

CREATE TABLE IF NOT EXISTS llm_providers (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  provider   TEXT NOT NULL,
  model      TEXT NOT NULL,
  base_url   TEXT,
  api_key    TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Seed with the default LM Studio entry.
INSERT OR IGNORE INTO llm_providers (id, label, provider, model, base_url, api_key, is_default, created_at, updated_at)
VALUES (
  'default-lmstudio',
  'LM Studio – Mistral 3B',
  'lmstudio',
  'mistralai/ministral-3b-latest',
  'http://localhost:1234/v1',
  NULL,
  1,
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);
