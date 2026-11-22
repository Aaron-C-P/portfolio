// The database is PostgreSQL. In production it is Supabase: set DATABASE_URL to the project's connection string
// (Project Settings > Database > Connection pooling, "Transaction" mode, port 6543: that is the one that suits Vercel).
// With no DATABASE_URL the app runs on PGlite, a real Postgres engine that lives inside this process and keeps its
// files in DATA_DIR, so local development and the tests need no server and speak exactly the same SQL.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';

const url = (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '').trim();
export const dbKind = url ? 'supabase-postgres' : 'pglite';

let run;
if (url) {
  const pg = (await import('pg')).default;
  pg.types.setTypeParser(20, (v) => Number(v)); // BIGINT (times in ms, counts) as numbers
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const pool = new pg.Pool({ connectionString: url, max: Number(process.env.DB_POOL_MAX || 5), ssl: local ? false : { rejectUnauthorized: false } });
  pool.on('error', (e) => console.error('[db] idle client error', e.message));
  run = async (sql, params) => pool.query(sql, params);
} else {
  // PGlite is WebAssembly. Compiling it with the optimising tier can run out of memory on small machines; the quick
  // baseline compiler is plenty for a local/test database.
  (await import('node:v8')).setFlagsFromString('--liftoff-only');
  const { PGlite } = await import('@electric-sql/pglite');
  fs.mkdirSync(config.dataDir, { recursive: true });
  const lite = process.env.DB_MEMORY === '1' ? new PGlite() : new PGlite(path.join(config.dataDir, 'pg')); // DB_MEMORY=1: keep it all in RAM (tests)
  await lite.waitReady;
  run = async (sql, params) => lite.query(sql, params);
  // Used by the schema below, which has several statements in one string.
  run.exec = (sql) => lite.exec(sql);
}

// SQL is written with ? placeholders; Postgres wants $1, $2…
const toPg = (sql) => {
  let n = 0;
  let inStr = false;
  let out = '';
  for (const ch of sql) {
    if (ch === "'") inStr = !inStr;
    out += ch === '?' && !inStr ? `$${++n}` : ch;
  }
  return out;
};
const clean = (params) => params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v));
const plain = (row) => {
  const o = {};
  for (const [k, v] of Object.entries(row)) o[k] = typeof v === 'bigint' ? Number(v) : v;
  return o;
};

async function query(sql, params) {
  const r = await run(toPg(sql), clean(params));
  return { rows: (r.rows || []).map(plain), count: r.rowCount ?? r.affectedRows ?? 0 };
}

export const q = {
  get: async (sql, ...p) => (await query(sql, p)).rows[0],
  all: async (sql, ...p) => (await query(sql, p)).rows,
  run: async (sql, ...p) => ({ changes: (await query(sql, p)).count }),
  /** INSERT … RETURNING id, for when the new row's id is needed. */
  insert: async (sql, ...p) => (await query(`${sql} RETURNING id`, p)).rows[0]?.id,
};

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  password_hash   TEXT NOT NULL,
  is_admin        INTEGER NOT NULL DEFAULT 0,
  plan            TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at   BIGINT,
  sub_provider    TEXT,
  sub_id          TEXT,
  sub_status      TEXT,
  sub_renews_at   BIGINT,
  sub_ends_at     BIGINT,
  portal_url      TEXT,
  paid_until      BIGINT,
  created_at      BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id                       TEXT PRIMARY KEY,
  user_id                  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug                     TEXT NOT NULL UNIQUE,
  name                     TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'draft',
  draft_html               TEXT,
  brief                    TEXT,
  has_unpublished_changes  INTEGER NOT NULL DEFAULT 0,
  admin_locked             INTEGER NOT NULL DEFAULT 0,
  custom_domain            TEXT UNIQUE,
  created_at               BIGINT NOT NULL,
  updated_at               BIGINT NOT NULL,
  published_at             BIGINT
);

CREATE TABLE IF NOT EXISTS site_versions (
  id          BIGSERIAL PRIMARY KEY,
  site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  html        TEXT NOT NULL,
  note        TEXT,
  source      TEXT,
  created_at  BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_versions_site ON site_versions(site_id, id);

CREATE TABLE IF NOT EXISTS jobs (
  id           TEXT PRIMARY KEY,
  user_id      BIGINT,
  site_id      TEXT,
  kind         TEXT,
  status       TEXT,
  progress     INTEGER NOT NULL DEFAULT 0,
  message      TEXT,
  error        TEXT,
  created_at   BIGINT NOT NULL,
  finished_at  BIGINT
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL,
  kind           TEXT,
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  created_at     BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_user ON ai_usage(user_id, created_at);

CREATE TABLE IF NOT EXISTS ai_calls (
  id          BIGSERIAL PRIMARY KEY,
  model       TEXT,
  ok          INTEGER NOT NULL DEFAULT 1,
  created_at  BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calls_time ON ai_calls(created_at);

CREATE TABLE IF NOT EXISTS agent_events (
  job_id      TEXT NOT NULL,
  seq         INTEGER NOT NULL,
  at          BIGINT NOT NULL,
  from_agent  TEXT NOT NULL,
  to_agent    TEXT,
  kind        TEXT NOT NULL,
  text        TEXT NOT NULL,
  PRIMARY KEY (job_id, seq)
);

CREATE TABLE IF NOT EXISTS billing_events (
  id          BIGSERIAL PRIMARY KEY,
  provider    TEXT,
  event       TEXT,
  user_id     BIGINT,
  payload     TEXT,
  created_at  BIGINT NOT NULL
);
`;

// Create the tables once per cold start. Safe to repeat: every statement is IF NOT EXISTS.
if (run.exec) await run.exec(schema);
else for (const stmt of schema.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) await run(stmt);

export const now = () => Date.now();
export const newId = (bytes = 6) => crypto.randomBytes(bytes).toString('base64url').replace(/[-_]/g, 'x').toLowerCase();
