// SQLite database using Node's built-in driver (no native install step on Windows).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(config.dataDir, 'app.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  password_hash   TEXT NOT NULL,
  is_admin        INTEGER NOT NULL DEFAULT 0,
  plan            TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at   INTEGER,
  sub_provider    TEXT,
  sub_id          TEXT,
  sub_status      TEXT,
  sub_renews_at   INTEGER,
  sub_ends_at     INTEGER,
  portal_url      TEXT,
  paid_until      INTEGER,
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id                       TEXT PRIMARY KEY,
  user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug                     TEXT NOT NULL UNIQUE,
  name                     TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'draft',
  draft_html               TEXT,
  brief                    TEXT,
  has_unpublished_changes  INTEGER NOT NULL DEFAULT 0,
  admin_locked             INTEGER NOT NULL DEFAULT 0,
  custom_domain            TEXT UNIQUE,
  created_at               INTEGER NOT NULL,
  updated_at               INTEGER NOT NULL,
  published_at             INTEGER
);

CREATE TABLE IF NOT EXISTS site_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  html        TEXT NOT NULL,
  note        TEXT,
  source      TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_versions_site ON site_versions(site_id, id);

CREATE TABLE IF NOT EXISTS jobs (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER,
  site_id      TEXT,
  kind         TEXT,
  status       TEXT,
  progress     INTEGER NOT NULL DEFAULT 0,
  message      TEXT,
  error        TEXT,
  created_at   INTEGER NOT NULL,
  finished_at  INTEGER
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  kind           TEXT,
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_user ON ai_usage(user_id, created_at);

CREATE TABLE IF NOT EXISTS ai_calls (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  model       TEXT,
  ok          INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calls_time ON ai_calls(created_at);

CREATE TABLE IF NOT EXISTS billing_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  provider    TEXT,
  event       TEXT,
  user_id     INTEGER,
  payload     TEXT,
  created_at  INTEGER NOT NULL
);
`);

// Add columns introduced after a database was first created (safe to run every start).
function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}
ensureColumn('sites', 'custom_domain', 'custom_domain TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_domain ON sites(custom_domain)');

const cache = new Map();
function stmt(sql) {
  let s = cache.get(sql);
  if (!s) {
    s = db.prepare(sql);
    cache.set(sql, s);
  }
  return s;
}
const clean = (params) =>
  params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));

export const q = {
  get: (sql, ...p) => stmt(sql).get(...clean(p)),
  all: (sql, ...p) => stmt(sql).all(...clean(p)),
  run: (sql, ...p) => stmt(sql).run(...clean(p)),
};

export const now = () => Date.now();
export const newId = (bytes = 6) => crypto.randomBytes(bytes).toString('base64url').replace(/[-_]/g, 'x').toLowerCase();
