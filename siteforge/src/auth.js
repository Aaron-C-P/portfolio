// Accounts, password hashing (scrypt, built into Node) and cookie sessions.
import crypto from 'node:crypto';
import { q, now } from './db.js';
import { config, PLANS } from './config.js';

// On https the "__Host-" prefix stops client sites on your subdomains from planting a session cookie.
const COOKIE = config.appProtocol === 'https:' ? '__Host-sid' : 'sid';
const SESSION_DAYS = 30;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(hashHex, 'hex');
  return expected.length === hash.length && crypto.timingSafeEqual(hash, expected);
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function cookieFlags(maxAgeSec) {
  const secure = config.appProtocol === 'https:' ? '; Secure' : '';
  // No Domain attribute: the cookie stays on the main domain and is never sent to client sites.
  return `; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  q.run(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    sha256(token),
    userId,
    now() + SESSION_DAYS * 864e5,
  );
  res.append('Set-Cookie', `${COOKIE}=${token}${cookieFlags(SESSION_DAYS * 86400)}`);
}

export function endSession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) q.run('DELETE FROM sessions WHERE token_hash = ?', sha256(token));
  res.append('Set-Cookie', `${COOKIE}=${cookieFlags(0)}`);
}

export function loadUser(req, _res, next) {
  req.user = null;
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) {
    const row = q.get(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
      sha256(token),
      now(),
    );
    if (row) req.user = row;
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admins only.' });
  next();
}

// Blocks cross-site requests (including from client sites on your own subdomains)
// from making changes with a logged-in user's cookie.
export function sameOriginOnly(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try {
      host = new URL(origin).host;
    } catch {}
    if (host !== req.headers.host) return res.status(403).json({ error: 'Cross-site request blocked.' });
  }
  next();
}

// Is this account allowed to have live sites right now, and on which plan?
export function accountState(user) {
  const t = now();
  if (user.is_admin) return { active: true, plan: 'business', reason: 'admin' };
  const paidPlan = PLANS[user.plan] && user.plan !== 'trial' ? user.plan : 'starter';
  const subOk =
    ['active', 'on_trial', 'past_due'].includes(user.sub_status) ||
    (user.sub_status === 'cancelled' && user.sub_ends_at && user.sub_ends_at > t);
  if (subOk)
    return {
      active: true,
      plan: paidPlan,
      reason: 'subscription',
      status: user.sub_status,
      until: user.sub_status === 'cancelled' ? user.sub_ends_at : user.sub_renews_at,
    };
  if (user.paid_until && user.paid_until > t)
    return { active: true, plan: paidPlan, reason: 'manual', until: user.paid_until };
  if (user.trial_ends_at && user.trial_ends_at > t)
    return { active: true, plan: 'trial', reason: 'trial', until: user.trial_ends_at };
  return { active: false, plan: 'none', reason: user.sub_status ? 'subscription_ended' : 'trial_ended' };
}

export function aiUsedThisMonth(userId) {
  const d = new Date();
  const monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  return q.get('SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = ? AND created_at >= ?', userId, monthStart).n;
}

export function limitsFor(user) {
  const state = accountState(user);
  const plan = PLANS[state.plan] || null;
  return {
    state,
    plan,
    maxSites: plan ? plan.sites : 0,
    aiPerMonth: plan ? plan.aiPerMonth : 0,
    aiUsed: aiUsedThisMonth(user.id),
    showBadge: plan ? plan.badge : true,
  };
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: !!user.is_admin,
    plan: user.plan,
    portalUrl: user.portal_url || null,
  };
}

export function createUser({ email, password, name }) {
  const isAdmin = config.adminEmails.includes(email) ? 1 : 0;
  const info = q.run(
    `INSERT INTO users (email, name, password_hash, is_admin, plan, trial_ends_at, created_at)
     VALUES (?, ?, ?, ?, 'trial', ?, ?)`,
    email,
    name || null,
    hashPassword(password),
    isAdmin,
    now() + config.trialDays * 864e5,
    now(),
  );
  return q.get('SELECT * FROM users WHERE id = ?', Number(info.lastInsertRowid));
}

// Very small in-memory brute-force guard for login.
const attempts = new Map();
export function tooManyAttempts(key) {
  const t = now();
  const rec = attempts.get(key) || { n: 0, at: t };
  if (t - rec.at > 15 * 60e3) {
    rec.n = 0;
    rec.at = t;
  }
  rec.n += 1;
  attempts.set(key, rec);
  return rec.n > 10;
}
