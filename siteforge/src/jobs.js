// Background jobs for slow AI work. The browser polls /api/jobs/:id, which keeps every
// request short (proxies like Cloudflare cut requests off after ~100 seconds).
import { q, now, newId } from './db.js';

// Anything left "running" from a previous server process can't finish now.
await q.run(`UPDATE jobs SET status = 'error', error = 'The server restarted. Please try again.', finished_at = ?
       WHERE status = 'running'`, now());

// On Vercel a function is frozen the moment its response is sent, so slow work is handed to waitUntil to keep it alive.
let keepAlive = null;
if (process.env.VERCEL) keepAlive = (await import('@vercel/functions')).waitUntil;

export async function startJob({ userId, siteId, kind }, work) {
  const id = newId(9);
  await q.run(
    `INSERT INTO jobs (id, user_id, site_id, kind, status, progress, message, created_at)
     VALUES (?, ?, ?, ?, 'running', 2, 'Starting…', ?)`,
    id, userId, siteId, kind, now(),
  );
  let last = 0;
  let chain = Promise.resolve(); // progress writes go in order
  const update = (progress, message) => {
    if (progress == null) progress = last; // message-only update keeps the bar where it is
    if (progress - last < 1 && !message) return;
    last = progress;
    chain = chain.then(() => q.run('UPDATE jobs SET progress = ?, message = COALESCE(?, message) WHERE id = ?', Math.round(progress), message || null, id)).catch(() => {});
  };
  const done = (async () => {
    try {
      const result = await work(update, id);
      await chain;
      await q.run(`UPDATE jobs SET status = 'done', progress = 100, message = ?, finished_at = ? WHERE id = ?`,
        result?.message || 'Done', now(), id);
    } catch (e) {
      console.error(`[job ${kind}]`, e);
      await q.run(`UPDATE jobs SET status = 'error', error = ?, finished_at = ? WHERE id = ?`,
        String(e.message || e).slice(0, 500), now(), id);
    }
  })();
  if (keepAlive) keepAlive(done);
  return id;
}

export async function getJob(id, userId) {
  return await q.get('SELECT id, site_id, kind, status, progress, message, error FROM jobs WHERE id = ? AND user_id = ?', id, userId);
}

// The team's conversation for a job: who said what to whom, in order.
const tails = new Map();
export function addEvent(jobId, ev) {
  const next = (tails.get(jobId) || Promise.resolve()).catch(() => {}).then(() => insertEvent(jobId, ev));
  tails.set(jobId, next);
  next.finally(() => { if (tails.get(jobId) === next) tails.delete(jobId); }).catch(() => {});
  return next;
}
async function insertEvent(jobId, ev) {
  const seq = (await q.get('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM agent_events WHERE job_id = ?', jobId))?.n || 1;
  await q.run('INSERT INTO agent_events (job_id, seq, at, from_agent, to_agent, kind, text) VALUES (?, ?, ?, ?, ?, ?, ?)',
    jobId, seq, now(), ev.from, ev.to || null, ev.kind, String(ev.text).slice(0, 400));
  return seq;
}

export async function getEvents(jobId, userId, after = 0) {
  if (!await q.get('SELECT 1 AS x FROM jobs WHERE id = ? AND user_id = ?', jobId, userId)) return null;
  return await q.all('SELECT seq, at, from_agent AS "from", to_agent AS "to", kind, text FROM agent_events WHERE job_id = ? AND seq > ? ORDER BY seq', jobId, after);
}
