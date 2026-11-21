// Serves the published client websites straight from the bucket.
import fs from 'node:fs';
import path from 'node:path';
import { q } from './db.js';
import { config, ROOT, PLANS, CURRENCY } from './config.js';
import { limitsFor } from './auth.js';
import { cachedGet, contentTypeFor } from './storage/index.js';
import { esc, placeholderSvg } from './templates.js';

function simplePage(title, heading, text, cta = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="robots" content="noindex">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f6f5f1;color:#16181d;text-align:center;padding:24px}
main{max-width:30rem}h1{font-size:1.8rem;margin:0 0 .6rem}p{color:#5b6170;line-height:1.6}a{color:#16181d;font-weight:600}.dot{width:14px;height:14px;border-radius:50%;background:#f5b400;display:inline-block;margin-bottom:1rem}</style></head>
<body><main><span class="dot"></span><h1>${esc(heading)}</h1><p>${text}</p>${cta}</main></body></html>`;
}

export const offlinePage = (name) =>
  simplePage(name, `${name} is offline right now`, 'This website is taking a short break. Please check back soon.',
    `<p style="margin-top:2rem;font-size:.85rem">Powered by <a href="${config.appUrl}">${esc(config.brand)}</a></p>`);

export const missingPage = () =>
  simplePage('Site not found', 'There’s no website here yet',
    `Want this address for your business? <a href="${config.appUrl}/app#signup">Build your site with ${esc(config.brand)}</a> in a few minutes.`);

function injectBadge(html, slug) {
  const badge = `<a href="${config.appUrl}/?ref=${encodeURIComponent(slug)}" target="_blank" rel="noopener" style="position:fixed;right:12px;bottom:12px;z-index:2147483647;font:600 12px/1 system-ui,sans-serif;background:#111;color:#fff;padding:9px 13px;border-radius:999px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:.92">⚡ Made with ${esc(config.brand)}</a>`;
  const i = html.toLowerCase().lastIndexOf('</body>');
  return i >= 0 ? html.slice(0, i) + badge + html.slice(i) : html + badge;
}

export async function serveSite(site, reqPath, res) {
  res.set('X-Content-Type-Options', 'nosniff');
  if (!site) return res.status(404).type('html').send(missingPage());
  const owner = q.get('SELECT * FROM users WHERE id = ?', site.user_id);
  const lim = limitsFor(owner);
  if (site.status !== 'published' || site.admin_locked || !lim.state.active) {
    res.set('Cache-Control', 'no-store');
    return res.status(503).type('html').send(offlinePage(site.name));
  }
  let rel;
  try {
    rel = decodeURIComponent(reqPath).replace(/^\/+/, '');
  } catch {
    return res.status(400).end();
  }
  if (rel === '' || rel === 'index.html') rel = 'index.html';
  else if (!/^assets\/[a-z0-9._-]+$/i.test(rel)) {
    if (rel.includes('.')) return res.status(404).type('html').send(simplePage('Not found', 'Page not found', `<a href="/">Go to the home page</a>`));
    rel = 'index.html'; // one-page sites: /about etc. show the home page
  }
  const body = await cachedGet(`sites/${site.id}/${rel}`);
  if (!body) return res.status(404).type('html').send(simplePage('Not found', 'Page not found', `<a href="/">Go to the home page</a>`));
  if (rel === 'index.html') {
    let html = body.toString('utf8');
    if (lim.showBadge) html = injectBadge(html, site.slug);
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.type('html').send(html);
  }
  res.set('Cache-Control', 'public, max-age=86400');
  res.type(contentTypeFor(rel)).send(body);
}

export function placeholder(req, res) {
  res.set('Cache-Control', 'public, max-age=604800');
  res.type('image/svg+xml').send(placeholderSvg(req.params.size, req.params.label, String(req.query.c || '')));
}

// Marketing/app pages with a few values filled in from config.
const pageCache = new Map();
export function renderPage(file) {
  if (process.env.NODE_ENV === 'production' && pageCache.has(file)) return pageCache.get(file);
  const raw = fs.readFileSync([path.join(ROOT, 'views', file), path.join(process.cwd(), 'views', file)].find((p) => fs.existsSync(p)), 'utf8');
  const money = (n) => (CURRENCY === 'USD' ? `$${n}` : `${n} ${CURRENCY}`);
  const vars = {
    BRAND: esc(config.brand),
    PRICE_STARTER: money(PLANS.starter.price),
    PRICE_BUSINESS: money(PLANS.business.price),
    TRIAL_DAYS: String(config.trialDays),
    SITE_DOMAIN: esc(config.rootDomain),
    YEAR: String(new Date().getFullYear()),
    AI_STARTER: String(PLANS.starter.aiPerMonth),
    AI_BUSINESS: String(PLANS.business.aiPerMonth),
    SITES_BUSINESS: String(PLANS.starter.sites),
  };
  const out = raw.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => vars[k] ?? m);
  pageCache.set(file, out);
  return out;
}
