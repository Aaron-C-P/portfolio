// Background jobs for slow AI work. The browser polls /api/jobs/:id, which keeps every
// request short (proxies like Cloudflare cut requests off after ~100 seconds).
import { q, now, newId } from './db.js';

// Anything left "running" from a previous server process can't finish now.
q.run(`UPDATE jobs SET status = 'error', error = 'The server restarted. Please try again.', finished_at = ?
       WHERE status = 'running'`, now());

export function startJob({ userId, siteId, kind }, work) {
  const id = newId(9);
  q.run(
    `INSERT INTO jobs (id, user_id, site_id, kind, status, progress, message, created_at)
     VALUES (?, ?, ?, ?, 'running', 2, 'Starting…', ?)`,
    id, userId, siteId, kind, now(),
  );
  let last = 0;
  const update = (progress, message) => {
    if (progress == null) progress = last; // message-only update keeps the bar where it is
    if (progress - last < 1 && !message) return;
    last = progress;
    q.run('UPDATE jobs SET progress = ?, message = COALESCE(?, message) WHERE id = ?', Math.round(progress), message || null, id);
  };
  (async () => {
    try {
      const result = await work(update, id);
      q.run(`UPDATE jobs SET status = 'done', progress = 100, message = ?, finished_at = ? WHERE id = ?`,
        result?.message || 'Done', now(), id);
    } catch (e) {
      console.error(`[job ${kind}]`, e);
      q.run(`UPDATE jobs SET status = 'error', error = ?, finished_at = ? WHERE id = ?`,
        String(e.message || e).slice(0, 500), now(), id);
    }
  })();
  return id;
}

export function getJob(id, userId) {
  return q.get('SELECT id, site_id, kind, status, progress, message, error FROM jobs WHERE id = ? AND user_id = ?', id, userId);
}

// The team's conversation for a job: who said what to whom, in order.
export function addEvent(jobId, ev) {
  const seq = (q.get('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM agent_events WHERE job_id = ?', jobId)?.n) || 1;
  q.run('INSERT INTO agent_events (job_id, seq, at, from_agent, to_agent, kind, text) VALUES (?, ?, ?, ?, ?, ?, ?)',
    jobId, seq, now(), ev.from, ev.to || null, ev.kind, String(ev.text).slice(0, 400));
  return seq;
}

export function getEvents(jobId, userId, after = 0) {
  if (!q.get('SELECT 1 AS x FROM jobs WHERE id = ? AND user_id = ?', jobId, userId)) return null;
  return q.all('SELECT seq, at, from_agent AS "from", to_agent AS "to", kind, text FROM agent_events WHERE job_id = ? AND seq > ? ORDER BY seq', jobId, after);
}
