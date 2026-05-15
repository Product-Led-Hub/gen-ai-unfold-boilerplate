-- Migration 0001: initial schema
-- Sessions, messages, and RAG chunks tables.

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT 'New Chat',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rag_chunks (
  id           TEXT PRIMARY KEY,
  source       TEXT NOT NULL,
  content      TEXT NOT NULL,
  embedding    TEXT NOT NULL,
  chunk_num    INTEGER,
  total_chunks INTEGER,
  ingested_at  TEXT NOT NULL
);
