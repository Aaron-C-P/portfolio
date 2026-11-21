// Central configuration. Everything is driven by environment variables (or a .env file
// in the project root) so the same code runs on your laptop and in production.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Tiny .env loader (no extra dependency). Real environment variables win over .env.
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadEnvFile(path.join(ROOT, '.env'));

const env = process.env;
const port = Number(env.PORT || 3000);
const appUrl = (env.APP_URL || `http://localhost:${port}`).replace(/\/+$/, '');
const appUrlParsed = new URL(appUrl);

export const config = {
  port,
  brand: env.BRAND_NAME || 'The Webber',
  // The domain you bought, e.g. "mybrand.com". Client sites live at <name>.mybrand.com
  rootDomain: (env.ROOT_DOMAIN || appUrlParsed.hostname).toLowerCase(),
  appUrl,
  appProtocol: appUrlParsed.protocol, // "http:" or "https:"
  appPort: appUrlParsed.port, // "" in production, "3000" locally
  adminEmails: (env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  dataDir: path.resolve(env.DATA_DIR || path.join(ROOT, 'data')),
  contact: {
    // Shown to clients when card payments are not set up, or for manual payment.
    whatsapp: env.CONTACT_WHATSAPP || '',
    email: env.CONTACT_EMAIL || '',
  },
  storage: {
    driver: (env.STORAGE_DRIVER || 'local').toLowerCase(), // "local" or "s3"
    bucket: env.S3_BUCKET || '',
    region: env.S3_REGION || 'auto',
    endpoint: env.S3_ENDPOINT || '', // e.g. https://<account-id>.r2.cloudflarestorage.com
    accessKeyId: env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: env.S3_SECRET_ACCESS_KEY || '',
  },
  ai: {
    // "openrouter" (free models), "anthropic" (Claude) or "auto" (OpenRouter if its key is set).
    provider: (env.AI_PROVIDER || (env.OPENROUTER_API_KEY ? 'openrouter' : 'anthropic')).toLowerCase(),
    openrouter: {
      apiKey: env.OPENROUTER_API_KEY || '',
      baseUrl: (env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, ''),
      // Comma-separated, best first. Empty = built-in list of strong free models.
      models: (env.OPENROUTER_MODELS || '').split(',').map((s) => s.trim()).filter(Boolean),
      // 1000/day after a one-time $10 credit purchase, 50/day before. Counted per day (UTC).
      dailyLimit: Number(env.OPENROUTER_DAILY_LIMIT || 1000),
      maxAttempts: Number(env.OPENROUTER_MAX_ATTEMPTS || 4), // models tried per request
      maxTokens: Number(env.OPENROUTER_MAX_TOKENS || 16000),
      timeoutMs: Number(env.OPENROUTER_TIMEOUT_MS || 240000),
      referer: env.OPENROUTER_REFERER || '',
      title: env.OPENROUTER_TITLE || '',
    },
    apiKey: env.ANTHROPIC_API_KEY || '',
    model: env.AI_MODEL || 'claude-sonnet-5-5',
    baseUrl: (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, ''),
    maxTokens: Number(env.AI_MAX_TOKENS || 20000),
  },
  trialDays: Number(env.TRIAL_DAYS || 14),
  billing: {
    lemonWebhookSecret: env.LEMON_WEBHOOK_SECRET || '',
    checkoutUrls: {
      starter: env.LEMON_CHECKOUT_STARTER || '',
      business: env.LEMON_CHECKOUT_BUSINESS || '',
    },
    variants: {
      [String(env.LEMON_VARIANT_STARTER || '')]: 'starter',
      [String(env.LEMON_VARIANT_BUSINESS || '')]: 'business',
    },
  },
};

// Plans. Prices are what you show on the site; the real charge is whatever you set up in
// Lemon Squeezy (or collect manually). Limits keep your AI bill under control.
export const PLANS = {
  trial: {
    id: 'trial',
    name: 'Free trial',
    price: 0,
    sites: Number(env.TRIAL_SITES || 1),
    aiPerMonth: Number(env.AI_LIMIT_TRIAL || 15),
    badge: true,
    features: [`${config.trialDays} days free`, '1 website', 'AI builder + editor'],
  },
  // One fee, everything included. (The id stays "starter" so existing subscriptions and webhooks keep working.)
  starter: {
    id: 'starter',
    name: 'The Webber',
    price: Number(env.PRICE_STARTER || 19),
    sites: Number(env.SITES_PER_PLAN || 3),
    aiPerMonth: Number(env.AI_LIMIT_STARTER || 250),
    badge: false,
    features: ['Up to 3 websites', '250 AI changes a month', 'Your own yourname link', 'Edit, unpublish or cancel any time'],
  },
  // Legacy tier, no longer sold. Kept so old customers and webhooks still resolve.
  business: {
    id: 'business',
    name: 'Business',
    price: Number(env.PRICE_BUSINESS || 35),
    sites: 3,
    aiPerMonth: Number(env.AI_LIMIT_BUSINESS || 250),
    badge: false,
    features: ['3 websites', '250 AI edits / month', 'No "Made with" badge', 'Priority support'],
  },
};

export const CURRENCY = env.CURRENCY || 'USD';

// Subdomains clients are not allowed to claim.
export const RESERVED_SLUGS = new Set(
  'www app api admin mail email smtp ftp static assets cdn dashboard login signup help support billing docs blog status preview s ns1 ns2 dev test staging'.split(
    ' ',
  ),
);

export function siteUrl(slug) {
  const port = config.appPort ? `:${config.appPort}` : '';
  return `${config.appProtocol}//${slug}.${config.rootDomain}${port}`;
}
