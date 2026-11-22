// Fills a running Webber with dummy data: one admin and a handful of tenants, each with sites (some published).
// Usage: node scripts/seed-demo.mjs http://localhost:3077   (start the server with ADMIN_EMAILS=admin@demo.test)
const base = process.argv[2] || 'http://localhost:3077';
const PASS = 'demo-password-1';

class Visitor {
  constructor(n) { this.cookie = ''; this.ip = `10.1.${Math.floor(n / 200)}.${n % 200}`; }
  async call(method, url, body) {
    const res = await fetch(base + url, { method, headers: { 'content-type': 'application/json', cookie: this.cookie, 'x-forwarded-for': this.ip }, body: body ? JSON.stringify(body) : undefined });
    const set = res.headers.getSetCookie?.() || [];
    if (set.length) this.cookie = set.map((c) => c.split(';')[0]).join('; ');
    return { status: res.status, json: await res.json().catch(() => ({})) };
  }
}

async function build(v, brief) {
  const made = await v.call('POST', '/api/sites', { brief });
  if (!made.json.site) throw new Error('create failed: ' + JSON.stringify(made.json));
  let seq = 0;
  for (let i = 0; i < 120; i++) {
    const { json } = await v.call('GET', `/api/jobs/${made.json.jobId || made.json.job?.id}?after=${seq}`);
    if (json.events?.length) seq = json.events[json.events.length - 1].seq;
    if (json.job && ['done', 'error', 'failed'].includes(json.job.status)) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  return made.json.site;
}

const admin = new Visitor(1);
await admin.call('POST', '/api/auth/signup', { email: 'admin@demo.test', password: PASS, name: 'Demo Admin' });
console.log('admin: admin@demo.test /', PASS);

const kinds = [['Barber shop', 'Fresh Cutz'], ['Restaurant', 'Jerk Hut'], ['Salon', 'Glow Studio'], ['Mechanic', 'Quick Fix Auto'], ['Bakery', 'Sweet Crumbs'], ['Tutor', 'Bright Minds']];
const places = ['Kingston', 'Mandeville', 'Montego Bay', 'Spanish Town'];
const N = Number(process.argv[3] || 12);
let ok = 0;
await Promise.all(Array.from({ length: N }, async (_, i) => {
  const v = new Visitor(i + 10);
  const [type, name] = kinds[i % kinds.length];
  const email = `tenant${i + 1}@demo.test`;
  const up = await v.call('POST', '/api/auth/signup', { email, password: PASS, name: `Owner ${i + 1}` });
  if (up.status >= 400) return console.log('signup failed', email, up.status);
  const site = await build(v, { name: `${name} ${i + 1}`, type, location: places[i % 4], phone: '876 555 01' + String(10 + i), description: `${name} serves the community with friendly, reliable service. `.repeat(1 + (i % 4)) });
  if (i % 3 !== 2) await v.call('POST', `/api/sites/${site.id}/publish`);
  ok++;
}));
console.log(`seeded ${ok}/${N} tenants. Log in as tenant1@demo.test / ${PASS}`);
