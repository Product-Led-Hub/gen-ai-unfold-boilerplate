-- Migration 0003: setting profiles
-- Stores named AI setting profiles (system prompt, temperature, etc.)

CREATE TABLE IF NOT EXISTS setting_profiles (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful AI assistant.',
  temperature   REAL NOT NULL DEFAULT 0.7,
  max_tokens    INTEGER NOT NULL DEFAULT 8000,
  history_limit INTEGER NOT NULL DEFAULT 20,
  is_default    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- Seed with a default profile
INSERT OR IGNORE INTO setting_profiles (id, name, system_prompt, temperature, max_tokens, history_limit, is_default, created_at, updated_at)
VALUES (
  'default-profile',
  'Default',
  'You are a helpful AI assistant.',
  0.7,
  8000,
  20,
  1,
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);
