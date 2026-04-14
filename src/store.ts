import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DIR = join(homedir(), ".veyra-memory");
mkdirSync(DIR, { recursive: true });

const db = new Database(join(DIR, "data.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS memory (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    tags TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

const stmtGet = db.prepare("SELECT * FROM memory WHERE key = ?");
const stmtSet = db.prepare(`
  INSERT INTO memory (key, value, tags, updated_at)
  VALUES (?, ?, ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    tags = excluded.tags,
    updated_at = datetime('now')
`);
const stmtDel = db.prepare("DELETE FROM memory WHERE key = ?");
const stmtList = db.prepare(
  "SELECT key, tags, updated_at FROM memory WHERE key LIKE ? ORDER BY updated_at DESC LIMIT ?"
);
const stmtSearch = db.prepare(
  "SELECT key, value, tags FROM memory WHERE value LIKE ? OR key LIKE ? OR tags LIKE ? LIMIT 20"
);
const stmtClear = db.prepare("DELETE FROM memory");

export interface MemoryEntry {
  key: string;
  value: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export function get(key: string): MemoryEntry | undefined {
  return stmtGet.get(key) as MemoryEntry | undefined;
}

export function set(key: string, value: string, tags?: string): void {
  stmtSet.run(key, value, tags ?? "");
}

export function del(key: string): number {
  return stmtDel.run(key).changes;
}

export function list(prefix?: string, limit?: number): Partial<MemoryEntry>[] {
  return stmtList.all(`${prefix ?? ""}%`, limit ?? 50) as Partial<MemoryEntry>[];
}

export function search(query: string): Partial<MemoryEntry>[] {
  const q = `%${query}%`;
  return stmtSearch.all(q, q, q) as Partial<MemoryEntry>[];
}

export function clear(): number {
  return stmtClear.run().changes;
}
