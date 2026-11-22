// Owner admin panel API: every client, their plan, their sites, and monthly revenue.
import express from 'express';
import crypto from 'node:crypto';
import { q, now } from './db.js';
import { PLANS, siteUrl } from './config.js';
import { requireUser, requireAdmin, accountState, hashPassword } from './auth.js';
import { invalidate } from './storage/index.js';
import { fleetUsage } from './usage.js';

export const admin = express.Router();
admin.use(requireUser, requireAdmin);

admin.get('/overview', (_req, res) => {
  const users = q.all(`
    SELECT u.*,
      (SELECT COUNT(*) FROM sites s WHERE s.user_id = u.id) AS site_count,
      (SELECT COUNT(*) FROM sites s WHERE s.user_id = u.id AND s.status = 'published') AS live_count
    FROM users u ORDER BY u.created_at DESC`);
  const d = new Date();
  const monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const usage = q.get(
    'SELECT COUNT(*) AS calls, COALESCE(SUM(input_tokens),0) AS input, COALESCE(SUM(output_tokens),0) AS output FROM ai_usage WHERE created_at >= ?',
    monthStart,
  );
  const totals = { users: 0, paying: 0, trials: 0, inactive: 0, mrr: 0, liveSites: 0, aiCalls: usage.calls, aiInputTokens: usage.input, aiOutputTokens: usage.output };
  const clients = users.map((u) => {
    const st = accountState(u);
    totals.users++;
    if (u.is_admin) {}
    else if (st.reason === 'subscription' || st.reason === 'manual') {
      totals.paying++;
      totals.mrr += PLANS[st.plan]?.price || 0;
    } else if (st.reason === 'trial') totals.trials++;
    else totals.inactive++;
    totals.liveSites += u.live_count;
    return {
      id: u.id, email: u.email, name: u.name, isAdmin: !!u.is_admin, plan: u.plan, state: st,
      subStatus: u.sub_status, paidUntil: u.paid_until, trialEndsAt: u.trial_ends_at,
      sites: u.site_count, live: u.live_count, createdAt: u.created_at,
    };
  });
  const sites = q.all(`SELECT s.id, s.slug, s.name, s.status, s.admin_locked, s.custom_domain, s.updated_at, u.email
                       FROM sites s JOIN users u ON u.id = s.user_id ORDER BY s.updated_at DESC`)
    .map((s) => ({ ...s, url: siteUrl(s.slug) }));
  res.json({ totals, clients, sites, plans: PLANS });
});

// Per-tenant storage and server memory, biggest first.
admin.get('/usage', async (_req, res) => {
  res.json(await fleetUsage());
});

admin.post('/users/:id', (req, res) => {
  const u = q.get('SELECT * FROM users WHERE id = ?', req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found.' });
  const b = req.body || {};
  if (b.plan && PLANS[b.plan]) q.run('UPDATE users SET plan = ? WHERE id = ?', b.plan, u.id);
  if (b.paidUntil !== undefined) {
    const t = b.paidUntil ? Date.parse(`${b.paidUntil}T23:59:59Z`) : null;
    if (b.paidUntil && !t) return res.status(400).json({ error: 'Use a date like 2026-12-31.' });
    q.run('UPDATE users SET paid_until = ? WHERE id = ?', t, u.id);
  }
  if (b.extendTrialDays) {
    const base = Math.max(now(), u.trial_ends_at || 0);
    q.run('UPDATE users SET trial_ends_at = ? WHERE id = ?', base + Number(b.extendTrialDays) * 864e5, u.id);
  }
  res.json({ ok: true });
});

admin.post('/users/:id/reset-password', (req, res) => {
  const u = q.get('SELECT * FROM users WHERE id = ?', req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found.' });
  const temp = crypto.randomBytes(6).toString('base64url');
  q.run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(temp), u.id);
  q.run('DELETE FROM sessions WHERE user_id = ?', u.id);
  res.json({ tempPassword: temp });
});

admin.post('/sites/:id', (req, res) => {
  const s = q.get('SELECT * FROM sites WHERE id = ?', req.params.id);
  if (!s) return res.status(404).json({ error: 'Site not found.' });
  const b = req.body || {};
  if (b.locked !== undefined) q.run('UPDATE sites SET admin_locked = ? WHERE id = ?', b.locked ? 1 : 0, s.id);
  if (b.customDomain !== undefined) {
    const dom = String(b.customDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || null;
    if (dom && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dom)) return res.status(400).json({ error: 'That domain looks wrong.' });
    try {
      q.run('UPDATE sites SET custom_domain = ? WHERE id = ?', dom, s.id);
    } catch {
      return res.status(409).json({ error: 'Another site already uses that domain.' });
    }
  }
  invalidate(`sites/${s.id}/`);
  res.json({ ok: true });
});
