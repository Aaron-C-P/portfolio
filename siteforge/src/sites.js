// Client-facing API: accounts, sites, AI build/edit, versions, photos, publish/unpublish.
import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import { q, now, newId } from './db.js';
import { config, PLANS, RESERVED_SLUGS, siteUrl } from './config.js';
import {
  createUser, startSession, endSession, verifyPassword, requireUser, limitsFor, publicUser, tooManyAttempts,
} from './auth.js';
import { storage, invalidate, UPLOAD_TYPES, contentTypeFor } from './storage/index.js';
import { generateSite, editSite, aiEnabled, listModels } from './ai.js';
import { providerName, dailyBudget, isAllowedModel } from './models.js';
import { templateSite } from './templates.js';
import { startJob, getJob, addEvent, getEvents } from './jobs.js';
import { buildWithTeam } from './agents.js';
import { siteUsage } from './usage.js';
import { checkoutAvailable } from './billing.js';

export const api = express.Router();
const MAX_VERSIONS = 40;

// ---------- helpers ----------
export function siteJson(s) {
  let brief = {};
  try { brief = JSON.parse(s.brief || '{}'); } catch {}
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    status: s.status,
    url: siteUrl(s.slug),
    pathUrl: `/s/${s.slug}/`,
    customDomain: s.custom_domain || null,
    hasUnpublishedChanges: !!s.has_unpublished_changes,
    adminLocked: !!s.admin_locked,
    hasContent: !!s.draft_html,
    brief,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    publishedAt: s.published_at,
  };
}

const cleanEmail = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '');
}

export async function slugProblem(slug) {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) return 'Use 3–40 letters, numbers or dashes.';
  if (RESERVED_SLUGS.has(slug)) return 'That name is reserved.';
  if (await q.get('SELECT 1 FROM sites WHERE slug = ?', slug)) return 'That name is taken.';
  return null;
}

async function freeSlug(base) {
  let slug = slugify(base) || 'my-site';
  if (slug.length < 3) slug = `${slug}-site`;
  if (!await slugProblem(slug)) return slug;
  for (let i = 2; i < 500; i++) {
    const s = `${slug.slice(0, 36)}-${i}`;
    if (!await slugProblem(s)) return s;
  }
  return `${slug.slice(0, 30)}-${newId(3)}`;
}

async function ownSite(req, res) {
  const s = await q.get('SELECT * FROM sites WHERE id = ? AND user_id = ?', req.params.id, req.user.id);
  if (!s) res.status(404).json({ error: 'Site not found.' });
  return s;
}

export async function saveDraft(siteId, html, note, source) {
  const t = now();
  await q.run(
    `UPDATE sites SET draft_html = ?, updated_at = ?,
       has_unpublished_changes = CASE WHEN status = 'draft' THEN 0 ELSE 1 END
     WHERE id = ?`,
    html, t, siteId,
  );
  await q.run('INSERT INTO site_versions (site_id, html, note, source, created_at) VALUES (?, ?, ?, ?, ?)', siteId, html, note, source, t);
  await q.run(
    `DELETE FROM site_versions WHERE site_id = ? AND id NOT IN
       (SELECT id FROM site_versions WHERE site_id = ? ORDER BY id DESC LIMIT ?)`,
    siteId, siteId, MAX_VERSIONS,
  );
}

const pickModel = (v) => {
  const m = String(v || '').trim().slice(0, 120);
  return isAllowedModel(m) ? m : '';
};

async function recordUsage(userId, kind, usage) {
  if (!usage) return; // template builds cost nothing
  await q.run('INSERT INTO ai_usage (user_id, kind, input_tokens, output_tokens, created_at) VALUES (?, ?, ?, ?, ?)',
    userId, kind, usage.input_tokens, usage.output_tokens, now());
}

async function aiAllowed(user, res, { allowDailyFallback = false } = {}) {
  const lim = await limitsFor(user);
  if (!lim.state.active) {
    res.status(402).json({ error: 'Your plan has ended. Choose a plan to keep building.', code: 'inactive' });
    return false;
  }
  if (!allowDailyFallback && providerName() === 'openrouter' && (await dailyBudget()).left <= 0) {
    res.status(429).json({
      error: 'The free AI limit for today has been reached. It resets at 00:00 UTC. You can still edit text and photos yourself.',
      code: 'ai_daily',
    });
    return false;
  }
  if (aiEnabled() && lim.aiUsed >= lim.aiPerMonth) {
    res.status(402).json({
      error: `You've used all ${lim.aiPerMonth} AI edits for this month. You can still edit text and photos yourself, or upgrade for more.`,
      code: 'ai_limit',
    });
    return false;
  }
  return true;
}

function cleanBrief(b = {}) {
  const pick = (k, n = 300) => String(b[k] ?? '').trim().slice(0, n);
  return {
    name: pick('name', 80), type: pick('type', 80), description: pick('description', 1500),
    location: pick('location', 160), phone: pick('phone', 40), whatsapp: pick('whatsapp', 40),
    email: pick('email', 120), instagram: pick('instagram', 60), hours: pick('hours', 200),
    vibe: pick('vibe', 40), color: pick('color', 40), extra: pick('extra', 1000),
  };
}

// ---------- account ----------
api.post('/auth/signup', async (req, res) => {
  const email = cleanEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const name = String(req.body?.name || '').trim().slice(0, 80);
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if (tooManyAttempts(`signup|${req.ip}`))
    return res.status(429).json({ error: 'Too many sign-ups from this connection. Try again later.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (await q.get('SELECT 1 FROM users WHERE email = ?', email))
    return res.status(409).json({ error: 'An account with that email already exists. Try logging in.' });
  const user = await createUser({ email, password, name });
  await startSession(res, user.id);
  res.json({ user: publicUser(user) });
});

api.post('/auth/login', async (req, res) => {
  const email = cleanEmail(req.body?.email);
  if (tooManyAttempts(`${req.ip}|${email}`))
    return res.status(429).json({ error: 'Too many attempts. Wait 15 minutes and try again.' });
  const user = await q.get('SELECT * FROM users WHERE email = ?', email);
  if (!user || !verifyPassword(String(req.body?.password || ''), user.password_hash))
    return res.status(401).json({ error: 'Wrong email or password.' });
  await startSession(res, user.id);
  res.json({ user: publicUser(user) });
});

api.post('/auth/logout', async (req, res) => {
  await endSession(req, res);
  res.json({ ok: true });
});

api.get('/me', async (req, res) => {
  const base = {
    brand: config.brand,
    trialDays: config.trialDays,
    siteDomain: config.rootDomain + (config.appPort ? `:${config.appPort}` : ''),
  };
  if (!req.user) return res.json({ ...base, user: null });
  const lim = await limitsFor(req.user);
  res.json({
    ...base,
    user: publicUser(req.user),
    account: lim.state,
    limits: { maxSites: lim.maxSites, aiPerMonth: lim.aiPerMonth, aiUsed: lim.aiUsed },
    plans: ['starter'].map((id) => ({ ...PLANS[id], checkout: checkoutAvailable(id) })),
    aiEnabled: aiEnabled(),
    aiProvider: providerName(),
    aiDaily: providerName() === 'openrouter' ? await dailyBudget() : null,
    contact: config.contact,
  });
});

// ---------- AI models (free OpenRouter models, with today's request budget) ----------
api.get('/ai/models', requireUser, async (_req, res) => {
  const models = await listModels();
  res.json({
    provider: providerName(),
    models,
    default: models[0]?.id || null,
    daily: providerName() === 'openrouter' ? await dailyBudget() : null,
  });
});

// ---------- sites ----------
api.use('/sites', requireUser);

api.get('/sites', async (req, res) => {
  const rows = await q.all('SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC', req.user.id);
  res.json({ sites: rows.map(siteJson) });
});

api.get('/slug-check', requireUser, async (req, res) => {
  const slug = slugify(req.query.slug);
  res.json({ slug, problem: await slugProblem(slug), url: siteUrl(slug || 'name') });
});

api.post('/sites', async (req, res) => {
  const lim = await limitsFor(req.user);
  if (!await aiAllowed(req.user, res, { allowDailyFallback: true })) return;
  const count = (await q.get('SELECT COUNT(*) AS n FROM sites WHERE user_id = ?', req.user.id)).n;
  if (count >= lim.maxSites)
    return res.status(402).json({ error: `Your plan allows ${lim.maxSites} website${lim.maxSites === 1 ? '' : 's'}. Upgrade to add more.`, code: 'site_limit' });
  const brief = cleanBrief(req.body?.brief);
  if (!brief.name) return res.status(400).json({ error: 'Tell us your business name.' });
  let slug = req.body?.slug ? slugify(req.body.slug) : await freeSlug(brief.name);
  const problem = await slugProblem(slug);
  if (problem) return res.status(400).json({ error: `Web address: ${problem}` });

  const id = newId(6);
  const t = now();
  await q.run(
    `INSERT INTO sites (id, user_id, slug, name, status, brief, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)`,
    id, req.user.id, slug, brief.name, JSON.stringify(brief), t, t,
  );
  // A starter page is there straight away, so the owner can watch their site take shape while the team works.
  await q.run('UPDATE sites SET draft_html = ? WHERE id = ?', templateSite(brief), id);
  const userId = req.user.id;
  const model = pickModel(req.body?.model);
  const jobId = await startJob({ userId, siteId: id, kind: 'generate' }, async (update, jid) => {
    try {
      const { html, usage } = await buildWithTeam(brief, { model, pace: aiEnabled() ? 0 : 700, progress: update, emit: (e) => addEvent(jid, e) });
      await recordUsage(userId, 'generate', usage);
      await saveDraft(id, html, 'AI built your site', 'ai');
      return { message: 'Your site is ready!' };
    } catch (e) {
      // Never leave a new customer with an empty site: fall back to the built-in design.
      console.warn('[generate] AI failed, using template:', e.message);
      await saveDraft(id, templateSite(brief), 'Built from the starter design (AI was busy)', 'template');
      return { message: 'Your site is ready! (The AI was busy, so we used our starter design. Use “Redesign with AI” in a minute.)' };
    }
  });
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', id)), jobId });
});

api.get('/sites/:id', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const versions = await q.all(
    'SELECT id, note, source, created_at FROM site_versions WHERE site_id = ? ORDER BY id DESC LIMIT ?', s.id, MAX_VERSIONS,
  );
  res.json({ site: siteJson(s), versions });
});

api.patch('/sites/:id', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const name = req.body?.name != null ? String(req.body.name).trim().slice(0, 80) : s.name;
  let slug = s.slug;
  if (req.body?.slug != null && slugify(req.body.slug) !== s.slug) {
    slug = slugify(req.body.slug);
    const problem = await slugProblem(slug);
    if (problem) return res.status(400).json({ error: `Web address: ${problem}` });
  }
  let brief = s.brief;
  if (req.body?.brief) brief = JSON.stringify(cleanBrief({ ...JSON.parse(s.brief || '{}'), ...req.body.brief }));
  await q.run('UPDATE sites SET name = ?, slug = ?, brief = ?, updated_at = ? WHERE id = ?', name || s.name, slug, brief, now(), s.id);
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', s.id)) });
});

api.put('/sites/:id/html', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const html = String(req.body?.html || '');
  if (!/<html[\s>]/i.test(html) || html.length > 800_000) return res.status(400).json({ error: 'That page could not be saved.' });
  await saveDraft(s.id, html, String(req.body?.note || 'Your edits').slice(0, 120), 'manual');
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', s.id)) });
});

api.post('/sites/:id/ai-edit', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const instruction = String(req.body?.instruction || '').trim().slice(0, 2000);
  if (!instruction) return res.status(400).json({ error: 'Tell the AI what to change.' });
  if (!s.draft_html) return res.status(400).json({ error: 'This site has no page yet.' });
  if (!await aiAllowed(req.user, res)) return;
  const userId = req.user.id;
  const model = pickModel(req.body?.model);
  const jobId = await startJob({ userId, siteId: s.id, kind: 'edit' }, async (update) => {
    const fresh = await q.get('SELECT draft_html, brief FROM sites WHERE id = ?', s.id);
    const { html, usage, summary } = await editSite(fresh.draft_html, instruction, JSON.parse(fresh.brief || '{}'), update, { model });
    await recordUsage(userId, 'edit', usage);
    await saveDraft(s.id, html, `AI: ${summary}`.slice(0, 200), 'ai');
    return { message: summary };
  });
  res.json({ jobId });
});

api.post('/sites/:id/regenerate', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  if (!await aiAllowed(req.user, res)) return;
  const brief = cleanBrief({ ...JSON.parse(s.brief || '{}'), ...(req.body?.brief || {}) });
  await q.run('UPDATE sites SET brief = ?, name = ? WHERE id = ?', JSON.stringify(brief), brief.name || s.name, s.id);
  const userId = req.user.id;
  const model = pickModel(req.body?.model);
  const jobId = await startJob({ userId, siteId: s.id, kind: 'generate' }, async (update, jid) => {
    const { html, usage } = await buildWithTeam(brief, { model, pace: aiEnabled() ? 0 : 700, progress: update, emit: (e) => addEvent(jid, e) });
    await recordUsage(userId, 'generate', usage);
    await saveDraft(s.id, html, 'AI rebuilt your site', 'ai');
    return { message: 'Fresh design ready!' };
  });
  res.json({ jobId });
});

api.post('/sites/:id/restore/:versionId', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const v = await q.get('SELECT * FROM site_versions WHERE id = ? AND site_id = ?', req.params.versionId, s.id);
  if (!v) return res.status(404).json({ error: 'Version not found.' });
  await saveDraft(s.id, v.html, `Restored: ${v.note || 'earlier version'}`.slice(0, 200), 'restore');
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', s.id)) });
});

api.post('/sites/:id/publish', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  if (!s.draft_html) return res.status(400).json({ error: 'Build your site first.' });
  const lim = await limitsFor(req.user);
  if (!lim.state.active)
    return res.status(402).json({ error: 'Choose a plan to put your site online.', code: 'inactive' });
  if (s.admin_locked) return res.status(403).json({ error: 'This site has been paused by support. Please contact us.' });
  await storage.put(`sites/${s.id}/index.html`, Buffer.from(s.draft_html, 'utf8'));
  invalidate(`sites/${s.id}/`);
  await q.run(`UPDATE sites SET status = 'published', has_unpublished_changes = 0, published_at = ?, updated_at = ? WHERE id = ?`, now(), now(), s.id);
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', s.id)) });
});

api.post('/sites/:id/unpublish', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  await q.run(`UPDATE sites SET status = 'offline', updated_at = ? WHERE id = ?`, now(), s.id);
  invalidate(`sites/${s.id}/`);
  res.json({ site: siteJson(await q.get('SELECT * FROM sites WHERE id = ?', s.id)) });
});

api.delete('/sites/:id', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  if (String(req.body?.confirm || '') !== s.slug)
    return res.status(400).json({ error: `Type "${s.slug}" to confirm.` });
  await storage.deletePrefix(`sites/${s.id}/`);
  invalidate(`sites/${s.id}/`);
  await q.run('DELETE FROM sites WHERE id = ?', s.id);
  res.json({ ok: true });
});

// ---------- photos ----------
const MAGIC = [
  [/^\.png$/, (b) => b[0] === 0x89 && b[1] === 0x50],
  [/^\.jpe?g$/, (b) => b[0] === 0xff && b[1] === 0xd8],
  [/^\.gif$/, (b) => b.slice(0, 3).toString() === 'GIF'],
  [/^\.webp$/, (b) => b.slice(8, 12).toString() === 'WEBP'],
  [/^\.ico$/, (b) => b[0] === 0 && b[1] === 0],
];

api.post('/sites/:id/assets', express.raw({ type: () => true, limit: '8mb' }), async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const original = decodeURIComponent(String(req.headers['x-filename'] || 'photo.jpg'));
  const ext = path.extname(original).toLowerCase();
  const body = req.body;
  if (!UPLOAD_TYPES.has(ext)) return res.status(400).json({ error: 'Please upload a JPG, PNG, WebP or GIF image.' });
  if (!Buffer.isBuffer(body) || body.length < 16) return res.status(400).json({ error: 'That file is empty.' });
  const check = MAGIC.find(([re]) => re.test(ext));
  if (check && !check[1](body)) return res.status(400).json({ error: 'That file does not look like an image.' });
  const base = slugify(path.basename(original, ext)).slice(0, 30) || 'photo';
  const file = `${base}-${crypto.randomBytes(3).toString('hex')}${ext === '.jpeg' ? '.jpg' : ext}`;
  await storage.put(`sites/${s.id}/assets/${file}`, body);
  res.json({ path: `assets/${file}`, size: body.length });
});

api.get('/sites/:id/assets', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  const items = await storage.list(`sites/${s.id}/assets/`);
  res.json({
    assets: items.map((o) => ({ path: o.key.replace(`sites/${s.id}/`, ''), size: o.size, type: contentTypeFor(o.key) })),
  });
});

// ---------- jobs ----------
api.get('/jobs/:id', requireUser, async (req, res) => {
  const job = await getJob(req.params.id, req.user.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  const events = await getEvents(req.params.id, req.user.id, Number(req.query.after) || 0) || [];
  res.json({ job, events });
});

// How much room this site takes: bucket files, saved versions in the database, and what is cached in server memory.
api.get('/sites/:id/usage', async (req, res) => {
  const s = await ownSite(req, res);
  if (!s) return;
  res.json({ usage: await siteUsage(s.id) });
});
