// The build team: unit tests for how the lead handles a misbehaving writer, plus a stress run of many builds at once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWithTeam, reviewCopy, makePlan, offlineCopy, LIMITS } from '../src/agents.js';

const brief = { name: 'Fresh Cutz Barber Shop', type: 'Barber shop', location: 'Kingston', phone: '876 555 0142', whatsapp: '876 555 0142' };
const run = (deps, extra = {}) => {
  const events = [];
  return buildWithTeam(brief, { emit: (e) => events.push(e), deps, ...extra }).then((r) => ({ ...r, events }));
};
const tasks = (events) => events.filter((e) => e.kind === 'task' && e.to === 'writer');

test('offline team plans, writes two sections at a time, and finishes', async () => {
  const r = await run();
  assert.equal(r.stats.failures, 0);
  assert.equal(r.stats.passes, 2, '3 sections at 2 per pass = 2 passes');
  assert.ok(r.events.some((e) => e.from === 'lead' && e.kind === 'plan'));
  assert.ok(r.html.includes('Fresh Cutz Barber Shop') && r.html.includes('id="contact"'));
});

test('a writer that goes overboard is sent back; the lead shrinks the plan and the build still finishes', async () => {
  let calls = 0;
  const wordy = (units, ctx) => {
    calls++;
    const out = offlineCopy(brief, units.map((u) => u.id));
    if (calls === 1) out.hero = 'word '.repeat(400); // way over the 38-word budget
    return out;
  };
  const r = await run({ writer: wordy });
  assert.equal(r.stats.failures, 1);
  assert.equal(r.stats.replans, 1);
  assert.ok(r.events.some((e) => e.kind === 'fail' && /overboard/.test(e.text)), 'writer reported the problem');
  assert.ok(r.events.some((e) => e.from === 'lead' && e.kind === 'replan'), 'lead changed the plan');
  // After the replan the lead asks for ONE section at a time.
  const after = tasks(r.events).slice(1);
  assert.ok(after.every((t) => (t.text.match(/“/g) || []).length === 1), 'one section per pass after a failure');
  assert.ok(r.html.length > 3000);
});

test('a writer that always fails: lead gives up after the replan limit and uses the built-in wording', async () => {
  const r = await run({ writer: async () => { throw new Error('model returned nothing'); } });
  assert.equal(r.stats.replans, LIMITS.maxReplans);
  assert.deepEqual([...r.stats.fallbackUnits].sort(), ['about', 'hero', 'services']);
  assert.ok(r.html.includes('Fresh Cutz Barber Shop'));
});

test('a writer that hangs is timed out', async () => {
  const r = await run({ writer: () => new Promise(() => {}) }, { limits: { ...LIMITS, passTimeoutMs: 30, maxReplans: 1 } });
  assert.ok(r.events.some((e) => e.kind === 'fail' && /timed out/.test(e.text)));
  assert.ok(r.html.includes('id="home"'));
});

test('invented phone numbers are rejected, real ones from the brief are fine', () => {
  const units = makePlan(brief).units.filter((u) => u.id === 'hero');
  assert.deepEqual(reviewCopy(brief, { hero: 'Call us on 876 555 0142 today.' }, units), []);
  assert.match(reviewCopy(brief, { hero: 'Call us on 876 123 4567 today.' }, units)[0], /invented a number/);
});

test('a builder that returns junk or too much is replaced by the built-in design', async () => {
  const junk = await run({ writer: async (u) => offlineCopy(brief, u.map((x) => x.id)), builder: async () => '<html><body>hi</body></html>' });
  assert.ok(junk.html.includes('id="contact"'));
  assert.ok(junk.events.some((e) => e.kind === 'replan' && e.from === 'lead' && e.to === 'builder'));
  const huge = await run({ writer: async (u) => offlineCopy(brief, u.map((x) => x.id)), builder: async () => '<!DOCTYPE html><html><body id="home">' + 'x'.repeat(200_000) + 'id="contact" Fresh Cutz Barber Shop</body></html>' });
  assert.ok(Buffer.byteLength(huge.html) < LIMITS.maxHtmlBytes);
});

test('stress: 200 builds at once with a mix of good, wordy, flaky and hanging writers all finish within limits', async () => {
  const before = process.memoryUsage().heapUsed;
  const kinds = ['good', 'wordy', 'flaky', 'broken', 'hang'];
  const jobs = Array.from({ length: 200 }, (_, i) => {
    const kind = kinds[i % kinds.length];
    const b = { ...brief, name: `Shop ${i}` };
    let n = 0;
    const writer = async (units) => {
      n++;
      const out = offlineCopy(b, units.map((u) => u.id));
      if (kind === 'wordy' && n === 1) out.about = 'long '.repeat(500);
      if (kind === 'flaky' && n < 3) throw new Error('503 busy');
      if (kind === 'broken') return { services: 'not cards' };
      if (kind === 'hang' && n === 1) await new Promise(() => {});
      return out;
    };
    const events = [];
    return buildWithTeam(b, { emit: (e) => events.push(e), deps: { writer }, limits: { ...LIMITS, passTimeoutMs: 40 } }).then((r) => ({ r, events, kind }));
  });
  const done = await Promise.all(jobs);
  for (const { r, events, kind } of done) {
    assert.ok(r.html.includes('id="home"') && r.html.includes('id="contact"'), `${kind}: finished page`);
    assert.ok(Buffer.byteLength(r.html) < LIMITS.maxHtmlBytes, `${kind}: under size limit`);
    assert.ok(r.stats.replans <= LIMITS.maxReplans, `${kind}: replans capped`);
    assert.ok(events.length < 40, `${kind}: chatter stays small (${events.length} messages)`);
    const firstPass = tasks(events)[0];
    assert.ok((firstPass.text.match(/“/g) || []).length <= LIMITS.perPass, `${kind}: never more than ${LIMITS.perPass} sections at once`);
  }
  const grewMb = (process.memoryUsage().heapUsed - before) / 1048576;
  console.log(`  stress: 200 builds ok, heap grew ${grewMb.toFixed(1)} MB; replans ${done.reduce((a, d) => a + d.r.stats.replans, 0)}, fallbacks ${done.reduce((a, d) => a + d.r.stats.fallbackUnits.length, 0)}`);
  assert.ok(grewMb < 150, 'memory stays reasonable');
});
