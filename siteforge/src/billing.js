// Subscriptions.
//
// 1) Lemon Squeezy (card payments, works for sellers in Jamaica, pays out to a local bank
//    account or PayPal). Clients click "Choose plan" -> Lemon Squeezy checkout -> Lemon
//    Squeezy calls our webhook -> the client's plan switches on/off automatically.
// 2) Manual: a client pays you another way (WiPay invoice, bank transfer, cash) and you set
//    "paid until" for them in the admin panel.
import express from 'express';
import crypto from 'node:crypto';
import { q, now } from './db.js';
import { config, PLANS } from './config.js';
import { requireUser } from './auth.js';

export const billing = express.Router();

export const checkoutAvailable = (plan) => !!config.billing.checkoutUrls[plan];

billing.get('/api/billing/checkout/:plan', requireUser, (req, res) => {
  const plan = req.params.plan;
  if (!PLANS[plan] || plan === 'trial') return res.status(400).json({ error: 'Unknown plan.' });
  const base = config.billing.checkoutUrls[plan];
  if (!base)
    return res.json({
      manual: true,
      message: 'Card payments are not switched on yet. Message us to pay and we will turn your plan on right away.',
      contact: config.contact,
    });
  const url = new URL(base);
  url.searchParams.set('checkout[email]', req.user.email);
  url.searchParams.set('checkout[custom][user_id]', String(req.user.id));
  url.searchParams.set('checkout[custom][plan]', plan);
  res.json({ url: url.toString() });
});

billing.get('/api/billing/portal', requireUser, (req, res) => {
  if (!req.user.portal_url) return res.status(404).json({ error: 'No subscription found yet.' });
  res.json({ url: req.user.portal_url });
});

export function verifyLemonSignature(rawBody, signature, secret) {
  if (!secret || !signature || !rawBody) return false;
  const digest = Buffer.from(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'), 'utf8');
  const given = Buffer.from(String(signature), 'utf8');
  return digest.length === given.length && crypto.timingSafeEqual(digest, given);
}

const ts = (v) => (v ? Date.parse(v) || null : null);

export function handleLemonEvent(payload) {
  const event = payload?.meta?.event_name || '';
  if (!event.startsWith('subscription_') || payload?.data?.type !== 'subscriptions') return { ignored: true };
  const attrs = payload.data.attributes || {};
  const custom = payload.meta.custom_data || {};
  const subId = String(payload.data.id);

  let user = custom.user_id ? q.get('SELECT * FROM users WHERE id = ?', Number(custom.user_id)) : null;
  if (!user) user = q.get(`SELECT * FROM users WHERE sub_provider = 'lemonsqueezy' AND sub_id = ?`, subId);
  if (!user && attrs.user_email) user = q.get('SELECT * FROM users WHERE email = ?', String(attrs.user_email).toLowerCase());
  if (!user) return { ignored: true, reason: 'no matching user' };

  const plan =
    config.billing.variants[String(attrs.variant_id)] ||
    (PLANS[custom.plan] && custom.plan !== 'trial' ? custom.plan : null) ||
    (user.plan !== 'trial' ? user.plan : 'starter');

  q.run(
    `UPDATE users SET plan = ?, sub_provider = 'lemonsqueezy', sub_id = ?, sub_status = ?,
       sub_renews_at = ?, sub_ends_at = ?, portal_url = COALESCE(?, portal_url)
     WHERE id = ?`,
    plan, subId, attrs.status || null, ts(attrs.renews_at), ts(attrs.ends_at),
    attrs.urls?.customer_portal || null, user.id,
  );
  return { userId: user.id, plan, status: attrs.status };
}

billing.post('/webhooks/lemonsqueezy', express.raw({ type: () => true, limit: '1mb' }), (req, res) => {
  const secret = config.billing.lemonWebhookSecret;
  if (!secret) return res.status(503).json({ error: 'Webhook secret not configured.' });
  if (!verifyLemonSignature(req.body, req.headers['x-signature'], secret))
    return res.status(401).json({ error: 'Bad signature.' });
  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Bad JSON.' });
  }
  const result = handleLemonEvent(payload);
  q.run('INSERT INTO billing_events (provider, event, user_id, payload, created_at) VALUES (?, ?, ?, ?, ?)',
    'lemonsqueezy', payload?.meta?.event_name || '', result.userId || null, req.body.toString('utf8').slice(0, 20000), now());
  res.json({ ok: true, ...result });
});
