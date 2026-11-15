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
    if (progress - last < 1 && !message) return;
    last = progress;
    q.run('UPDATE jobs SET progress = ?, message = COALESCE(?, message) WHERE id = ?', Math.round(progress), message || null, id);
  };
  (async () => {
    try {
      const result = await work(update);
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
