// Entry point. One Node process serves:
//   yourdomain.com            -> marketing page, client dashboard (/app), admin (/admin), API
//   <name>.yourdomain.com     -> each client's published website (read from the bucket)
//   client-own-domain.com     -> a client's site on their own domain (set in admin)
import './asyncExpress.js';
import express from 'express';
import path from 'node:path';
import { config, ROOT, RESERVED_SLUGS } from './config.js';
import { q } from './db.js';
import { loadUser, sameOriginOnly } from './auth.js';
import { api } from './sites.js';
import { admin } from './admin.js';
import { billing } from './billing.js';
import { serveSite, placeholder, renderPage } from './serve.js';
import { storage } from './storage/index.js';
import { providerName, dailyBudget } from './models.js';

if (config.adminEmails.length) {
  for (const email of config.adminEmails) await q.run('UPDATE users SET is_admin = 1 WHERE email = ?', email);
}

export const app = express();
export default app; // Vercel runs the exported Express app
app.disable('x-powered-by');
app.set('trust proxy', true);

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.get('/favicon.ico', (req, res, next) => {
  const host = (req.hostname || '').toLowerCase();
  if (host === config.rootDomain || !host.endsWith(`.${config.rootDomain}`)) return res.redirect(301, '/static/icon.svg');
  next(); // client sites can have their own favicon
});
app.get('/_ph/:size/:label', placeholder);

// ---- client websites, routed by host name ----
app.use(async (req, res, next) => {
  const host = (req.hostname || '').toLowerCase();
  const root = config.rootDomain;
  try {
    if (!host || host === root) return next();
    if (host === `www.${root}`) return res.redirect(301, config.appUrl + req.originalUrl);
    if (host.endsWith(`.${root}`)) {
      const sub = host.slice(0, -(root.length + 1));
      if (sub.includes('.') || RESERVED_SLUGS.has(sub)) return next();
      const site = await q.get('SELECT * FROM sites WHERE slug = ?', sub);
      return await serveSite(site, req.path, res);
    }
    const site = await q.get('SELECT * FROM sites WHERE custom_domain = ?', host.replace(/^www\./, ''));
    if (site) return await serveSite(site, req.path, res);
    next();
  } catch (e) {
    next(e);
  }
});

// ---- main app ----
app.use(loadUser);
app.use('/api', sameOriginOnly, express.json({ limit: '2mb' }));
app.use(billing);
app.use('/api/admin', admin);
app.use('/api', api);

// Same sites by path, e.g. yourdomain.com/s/bobs-barber/ (handy before wildcard DNS is set up)
app.get(['/s/:slug', '/s/:slug/*'], async (req, res, next) => {
  try {
    const rest = req.params[0];
    if (rest === undefined && !req.path.endsWith('/')) return res.redirect(301, `/s/${req.params.slug}/`);
    const site = await q.get('SELECT * FROM sites WHERE slug = ?', String(req.params.slug).toLowerCase());
    await serveSite(site, `/${rest || ''}`, res);
  } catch (e) {
    next(e);
  }
});

// Draft preview for the site owner (scripts disabled for safety; editing happens from the dashboard)
async function ownedSite(req) {
  if (!req.user) return null;
  return await q.get('SELECT * FROM sites WHERE id = ? AND (user_id = ? OR ? = 1)', req.params.id, req.user.id, req.user.is_admin ? 1 : 0);
}
app.get('/preview/:id', async (req, res) => {
  if (!req.path.endsWith('/')) return res.redirect(`/preview/${req.params.id}/`);
  const site = await ownedSite(req);
  if (!site) return res.status(404).send('Not found');
  res.set('Content-Security-Policy', 'sandbox allow-same-origin');
  res.set('Cache-Control', 'no-store');
  res.type('html').send(site.draft_html || '<!DOCTYPE html><html><body><p style="font-family:sans-serif;padding:2rem">Building…</p></body></html>');
});
app.get('/preview/:id/assets/:file', async (req, res, next) => {
  try {
    const site = await ownedSite(req);
    if (!site || !/^[a-z0-9._-]+$/i.test(req.params.file)) return res.status(404).end();
    const body = await storage.get(`sites/${site.id}/assets/${req.params.file}`);
    if (!body) return res.status(404).end();
    res.set('Content-Security-Policy', 'sandbox');
    res.set('X-Content-Type-Options', 'nosniff');
    res.type(path.extname(req.params.file)).send(body);
  } catch (e) {
    next(e);
  }
});

// Pages
app.use('/static', express.static(path.join(ROOT, 'public', 'static'), { maxAge: '1h' }));
app.get('/', (_req, res) => res.type('html').send(renderPage('index.html')));
app.get(['/app', '/app/*'], (_req, res) => res.type('html').send(renderPage('app.html')));
app.get('/admin', (req, res) => {
  if (!req.user?.is_admin) return res.redirect('/app');
  res.type('html').send(renderPage('admin.html'));
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, _next) => {
  console.error(err);
  if (req.path.startsWith('/api')) return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  res.status(500).send('Something went wrong.');
});

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'src', 'server.js')) {
  app.listen(config.port, async () => {
    const port = config.appPort ? `:${config.appPort}` : '';
    console.log(`\n  ${config.brand} is running`);
    console.log(`  Home page:   ${config.appUrl}`);
    console.log(`  Dashboard:   ${config.appUrl}/app`);
    console.log(`  Client site: ${config.appProtocol}//<name>.${config.rootDomain}${port}`);
    console.log(`  Storage:     ${config.storage.driver}${config.storage.driver === 's3' ? ` (${config.storage.bucket})` : ''}`);
    const ai = providerName() === 'openrouter' ? `OpenRouter free models (${(await dailyBudget()).left}/${(await dailyBudget()).limit} requests left today)` : providerName() === 'anthropic' ? config.ai.model : 'template mode (set OPENROUTER_API_KEY to use AI)';
    console.log(`  AI:          ${ai}
`);
  });
}
