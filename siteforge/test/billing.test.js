// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'asb-test-'));
process.env.LEMON_VARIANT_BUSINESS = '777';
const { verifyLemonSignature, handleLemonEvent } = await import('../src/billing.js');
const { createUser, accountState } = await import('../src/auth.js');
const { q } = await import('../src/db.js');

test('Lemon Squeezy signature matches the published test vector', () => {
  const body = Buffer.from('{"meta":{"event_name":"order_created"},"data":{"type":"orders","id":"1"}}');
  const sig = 'd981647f004dca22ba68a332a8b1cc1bfcafa57070356543ec2e2bee31448cfb';
  assert.equal(verifyLemonSignature(body, sig, 'lemon-test-secret'), true);
  assert.equal(verifyLemonSignature(body, sig, 'wrong-secret'), false);
  assert.equal(verifyLemonSignature(body, 'abc', 'lemon-test-secret'), false);
});

test('subscription webhooks switch a client plan on and off', () => {
  const user = createUser({ email: 'client@test.com', password: 'password123', name: 'Client' });
  q.run('UPDATE users SET trial_ends_at = 0 WHERE id = ?', user.id); // trial over
  assert.equal(accountState(q.get('SELECT * FROM users WHERE id = ?', user.id)).active, false);

  const event = (name, status, extra = {}) => ({
    meta: { event_name: name, custom_data: { user_id: String(user.id), plan: 'starter' } },
    data: { type: 'subscriptions', id: '5001', attributes: { status, variant_id: 777, user_email: 'client@test.com',
      renews_at: '2030-01-01T00:00:00Z', ends_at: null, urls: { customer_portal: 'https://example.com/portal' }, ...extra } },
  });

  const r = handleLemonEvent(event('subscription_created', 'active'));
  assert.equal(r.plan, 'business'); // variant id wins over custom plan
  let u = q.get('SELECT * FROM users WHERE id = ?', user.id);
  assert.equal(accountState(u).active, true);
  assert.equal(accountState(u).plan, 'business');
  assert.equal(u.portal_url, 'https://example.com/portal');

  handleLemonEvent(event('subscription_cancelled', 'cancelled', { ends_at: '2030-02-01T00:00:00Z' }));
  u = q.get('SELECT * FROM users WHERE id = ?', user.id);
  assert.equal(accountState(u).active, true, 'still active until period ends');

  handleLemonEvent(event('subscription_expired', 'expired', { ends_at: '2020-01-01T00:00:00Z' }));
  u = q.get('SELECT * FROM users WHERE id = ?', user.id);
  assert.equal(accountState(u).active, false);
});

test('non-subscription events are ignored', () => {
  assert.deepEqual(handleLemonEvent({ meta: { event_name: 'order_created' }, data: { type: 'orders', id: '1' } }), { ignored: true });
});
