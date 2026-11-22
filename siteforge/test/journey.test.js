// Simulates real users against the running app: sign up, describe a business, watch the team build it, publish,
// visit the live site, check per-tenant storage, edit, unpublish. Then 25 owners at once.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DB_MEMORY = '1';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'webber-journey-'));
process.env.STORAGE_DRIVER = 'local';
delete process.env.OPENROUTER_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
process.env.APP_URL = 'http://localhost:0';

const { app } = await import('../src/server.js');
const { q } = await import('../src/db.js');
const { fleetUsage } = await import('../src/usage.js');

let server;
let base;
before(async () => {
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://localhost:${server.address().port}`;
});
after(() => {
  server.close();
  try {
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  } catch {
    /* the database file is still open on Windows; the OS temp folder is cleaned later */
  }
});

class Visitor {
  cookie = '';
  constructor(ip = '203.0.113.1') { this.ip = ip; }
  async call(method, url, body) {
    const res = await fetch(base + url, {
      method,
      headers: { 'content-type': 'application/json', cookie: this.cookie, 'x-forwarded-for': this.ip },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    });
    const set = res.headers.getSetCookie?.() || [];
    if (set.length) this.cookie = set.map((c) => c.split(';')[0]).join('; ');
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: res.status, json, text };
  }
}

async function watchJob(v, jobId) {
  let seq = 0;
  const events = [];
  for (let i = 0; i < 100; i++) {
    const { json } = await v.call('GET', `/api/jobs/${jobId}?after=${seq}`);
    for (const e of json.events) { events.push(e); seq = e.seq; }
    if (json.job.status === 'done') return { job: json.job, events };
    if (json.job.status === 'error') throw new Error(json.job.error);
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('job did not finish');
}

test('one owner, start to finish', async () => {
  const v = new Visitor();
  assert.equal((await v.call('GET', '/')).status, 200, 'landing page');
  assert.equal((await v.call('GET', '/app')).status, 200, 'dashboard shell');

  const up = await v.call('POST', '/api/auth/signup', { email: 'marcia@example.com', password: 'a-good-password-1', name: 'Marcia' });
  assert.equal(up.status, 200, up.text);
  assert.equal((await v.call('GET', '/api/me')).json.user.email, 'marcia@example.com');

  const brief = { name: 'Marcia’s Jerk Hut', type: 'Restaurant', location: 'Montego Bay', whatsapp: '876 555 0199', description: 'Jerk chicken and pork, cooked over pimento wood.' };
  const made = await v.call('POST', '/api/sites', { brief });
  assert.equal(made.status, 200, made.text);
  const { job, events } = await watchJob(v, made.json.jobId);
  assert.equal(job.status, 'done');

  const who = new Set(events.map((e) => e.from));
  assert.ok(who.has('lead') && who.has('writer'), 'lead and writer both spoke');
  assert.ok(events.some((e) => e.kind === 'plan') && events.some((e) => e.kind === 'approve'), 'a plan and an approval');

  const site = (await v.call('GET', `/api/sites/${made.json.site.id}`)).json.site;
  assert.equal(site.hasContent, true);
  assert.equal(site.status, 'draft');

  const before = (await v.call('GET', `/api/sites/${site.id}/usage`)).json.usage;
  assert.equal(before.bucketBytes, 0, 'nothing in the bucket until it is published');
  assert.ok(before.databaseBytes > 2000, 'the draft is stored in the database');

  const pub = await v.call('POST', `/api/sites/${site.id}/publish`);
  assert.equal(pub.status, 200, pub.text);
  const live = await fetch(`${base}/s/${site.slug}/`);
  const html = await live.text();
  assert.equal(live.status, 200);
  assert.ok(html.includes('Jerk Hut') && html.includes('wa.me/18765550199'), 'the live page shows the owner’s real details');

  const after = (await v.call('GET', `/api/sites/${site.id}/usage`)).json.usage;
  assert.ok(after.bucketBytes > 2000 && after.bucketFiles === 1, 'published page counted in the bucket');
  assert.ok(after.memoryBytes > 0, 'the served page is now cached in server memory');
  assert.equal(after.totalBytes, after.bucketBytes + after.databaseBytes);

  const edit = await v.call('POST', `/api/sites/${site.id}/ai-edit`, { instruction: 'Add a price list' });
  assert.ok(edit.status < 500, 'AI edit without a key answers politely, never a 500');

  const hand = await v.call('PUT', `/api/sites/${site.id}/html`, { html: html.replace('Jerk Hut', 'Jerk Hut Kitchen'), note: 'renamed' });
  assert.equal(hand.status, 200);

  assert.equal((await v.call('POST', `/api/sites/${site.id}/unpublish`)).status, 200);
  assert.equal((await fetch(`${base}/s/${site.slug}/`)).status, 503, 'offline page once unpublished');
});

test('a rude or broken user cannot get a 500', async () => {
  const v = new Visitor();
  await v.call('POST', '/api/auth/signup', { email: 'rude@example.com', password: 'a-good-password-2' });
  assert.equal((await v.call('POST', '/api/sites', { brief: {} })).status, 400, 'no name');
  const evil = await v.call('POST', '/api/sites', { brief: { name: '<script>alert(1)</script>', description: '"><img src=x onerror=alert(1)>' } });
  assert.equal(evil.status, 200);
  await watchJob(v, evil.json.jobId);
  await v.call('POST', `/api/sites/${evil.json.site.id}/publish`);
  const html = await (await fetch(`${base}/s/${evil.json.site.slug}/`)).text();
  assert.ok(!html.includes('<script>alert(1)') && !html.includes('<img src=x'), 'owner text is escaped (no live tags from the brief)');
  assert.equal((await new Visitor().call('GET', `/api/jobs/abc`)).status, 401, 'jobs need a login');
  assert.equal((await v.call('GET', '/api/sites/nope/usage')).status, 404);
});

test('stress: 25 owners build and publish at the same time; every tenant’s footprint is reported', async () => {
  const t0 = Date.now();
  const owners = await Promise.all(Array.from({ length: 25 }, async (_, i) => {
    const v = new Visitor(`198.51.100.${i + 1}`);
    const up = await v.call('POST', '/api/auth/signup', { email: `owner${i}@example.com`, password: 'a-good-password-3' });
    assert.equal(up.status, 200, up.text);
    const made = await v.call('POST', '/api/sites', { brief: { name: `Tenant ${i} Barber Shop`, type: 'Barber shop', location: 'Kingston', description: 'x '.repeat(i * 20) } });
    assert.equal(made.status, 200, made.text);
    await watchJob(v, made.json.jobId);
    assert.equal((await v.call('POST', `/api/sites/${made.json.site.id}/publish`)).status, 200);
    const page = await fetch(`${base}/s/${made.json.site.slug}/`);
    assert.equal(page.status, 200);
    return made.json.site.id;
  }));
  const ms = Date.now() - t0;

  const admin = await q.get('SELECT id FROM users WHERE email = ?', 'marcia@example.com');
  await q.run('UPDATE users SET is_admin = 1 WHERE id = ?', admin.id);
  const v = new Visitor();
  await v.call('POST', '/api/auth/login', { email: 'marcia@example.com', password: 'a-good-password-1' });
  const fleet = (await v.call('GET', '/api/admin/usage')).json;
  assert.ok(fleet.sites.length >= 26);
  assert.ok(owners.every((id) => fleet.sites.some((s) => s.id === id && s.bucketBytes > 0)), 'every tenant has a bucket footprint');
  assert.ok(fleet.server.rssMb > 0);
  const ov = await v.call('GET', '/api/admin/overview');
  assert.equal(ov.status, 200, 'admin overview loads');
  assert.ok(ov.json.clients.length >= 26 && ov.json.sites.length >= 26 && ov.json.sites.every((x) => x.url), 'overview lists every client and site');
  const own = await fleetUsage();
  const perSite = own.sites.map((s) => s.totalBytes);
  const avgKb = perSite.reduce((a, b) => a + b, 0) / perSite.length / 1024;
  console.log(`  25 owners in ${ms} ms. Server memory ${fleet.server.rssMb} MB, page cache ${fleet.server.cacheMb} MB (${fleet.server.cacheEntries} pages). Average tenant ${avgKb.toFixed(1)} KB, largest ${(Math.max(...perSite) / 1024).toFixed(1)} KB.`);
  assert.ok(Math.max(...perSite) < 400_000, 'no tenant is anywhere near the size cap');
  assert.ok(fleet.server.rssMb < 600, 'server memory stays under 600 MB');
});
