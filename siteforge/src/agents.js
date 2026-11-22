// The build team. Instead of one giant AI request, three agents work together and talk to each other:
//
//   Lead Developer  plans the site, hands out small jobs, reviews the results, and changes the plan when something fails
//   Content Writer  writes the words, at most TWO sections per pass and inside a word budget
//   Page Builder    turns the approved plan and words into the finished page
//
// Everything they say is recorded (agent_events) so the owner can watch the team work. If the writer fails, times out
// or goes overboard, it reports to the lead, who tightens the plan (smaller passes, shorter budget, then the built-in copy),
// so a build always finishes. With no AI key the same team runs offline with built-in writing: free to demo and to test.
import { templateSite, pickVibe } from './templates.js';
import { aiEnabled, generateSite, writeCopy, cleanHtml } from './ai.js';

export const TEAM = {
  lead: { name: 'Lead Developer', badge: 'LD' },
  writer: { name: 'Content Writer', badge: 'CW' },
  builder: { name: 'Page Builder', badge: 'PB' },
  system: { name: 'Studio', badge: 'S' },
};

export const LIMITS = {
  perPass: 2, // sections the writer may take on at once
  maxReplans: 2, // times the lead will change the plan before using the built-in copy
  passTimeoutMs: 45_000,
  overboard: 1.5, // a section over 150% of its word budget counts as "went overboard"
  maxHtmlBytes: 60_000,
};

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const unitText = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

/** The lead's first plan: the sections to write and how many words each may use. */
export function makePlan(brief) {
  return {
    vibe: pickVibe(brief.vibe),
    units: [
      { id: 'hero', title: 'Opening line', budget: 38 },
      { id: 'services', title: 'What we offer (3 cards)', budget: 75 },
      { id: 'about', title: 'About us', budget: 70 },
    ],
    perPass: LIMITS.perPass,
    scale: 1,
  };
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// ---- the offline writer: built-in wording (also the lead's last-resort fallback) ----
export function offlineCopy(brief, unitIds) {
  const page = templateSite(brief); // read only to borrow the stock services for this kind of business
  const cards = [...page.matchAll(/<h3>([^<]+)<\/h3><p>([^<]+)<\/p>/g)]
    .slice(0, 3)
    .map((m) => [m[1], m[2]].map((t) => t.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')));
  const name = brief.name || 'We';
  const out = {};
  if (unitIds.includes('hero')) out.hero = brief.description?.trim() || `${name} is here to serve you with quality, care and a smile.`;
  if (unitIds.includes('services')) out.services = cards;
  if (unitIds.includes('about'))
    out.about = `${name} is a${/^[aeiou]/i.test(brief.type || '') ? 'n' : ''} ${brief.type || 'local business'}${brief.location ? ` in ${brief.location}` : ''}. We focus on doing good work, being easy to reach, and treating every customer well.`;
  return out;
}

// ---- checks the lead runs on the writer's work ----
export function reviewCopy(brief, copy, units, scale = 1) {
  const problems = [];
  const given = Object.values(brief).join(' ').replace(/\D/g, '');
  for (const u of units) {
    const v = copy?.[u.id];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
      problems.push(`${u.id}: missing`);
      continue;
    }
    const n = words(Array.isArray(v) ? v.flat().join(' ') : v);
    const limit = Math.ceil(u.budget * scale * LIMITS.overboard);
    if (n > limit) problems.push(`${u.id}: went overboard (${n} words, limit ${limit})`);
    // Never invent contact details: a phone-like number that was not in the owner's brief is rejected.
    for (const m of unitText(v).match(/\+?\d[\d\s().-]{6,}\d/g) || []) if (!given.includes(m.replace(/\D/g, ''))) problems.push(`${u.id}: invented a number (${m.trim()})`);
    if (u.id === 'services' && (!Array.isArray(v) || v.some((c) => !Array.isArray(c) || c.length < 2))) problems.push('services: needs [title, description] cards');
  }
  return problems;
}

const withTimeout = (p, ms, label) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Object.assign(new Error(`${label} took too long`), { timeout: true })), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });

/**
 * Runs the team. `emit(event)` records each message; `progress(pct, text)` drives the progress bar.
 * `deps` lets tests swap in a misbehaving writer: { writer(units, ctx) -> copy, builder(brief, copy) -> html }.
 */
export async function buildWithTeam(brief, { emit = () => {}, progress = () => {}, model, deps = {}, limits = LIMITS, pace = 0 } = {}) {
  const nap = () => (pace ? new Promise((r) => setTimeout(r, pace)) : null); // lets the owner read the conversation when the team is fast
  const say = (from, to, kind, text) => emit({ from, to, kind, text });
  const online = deps.writer ? true : aiEnabled();
  const writerFn = deps.writer || (online ? (units, ctx) => writeCopy({ brief, units, scale: ctx.scale, model }) : async (units) => offlineCopy(brief, units.map((u) => u.id)));
  const stats = { passes: 0, failures: 0, replans: 0, fallbackUnits: [] };

  progress(4, 'The lead developer is planning…');
  const plan = makePlan(brief);
  say('lead', 'writer', 'plan', `Plan for ${brief.name}: ${plan.units.length} sections (${plan.units.map((u) => u.title).join(', ')}). Take at most ${plan.perPass} at a time and keep each short.${online ? '' : ' (Offline team: built-in writing, no AI key.)'}`);

  await nap();
  const copy = {};
  let queue = [...plan.units];
  let replans = 0;
  let passNo = 0;
  while (queue.length) {
    const group = chunk(queue, plan.perPass)[0];
    passNo++;
    stats.passes++;
    progress(10 + Math.min(60, passNo * 20), `Writing: ${group.map((u) => u.title).join(' + ')}…`);
    say('lead', 'writer', 'task', `Pass ${passNo}: write ${group.map((u) => `“${u.title}” (max ${Math.round(u.budget * plan.scale)} words)`).join(' and ')}.`);
    let problems = [];
    let got;
    try {
      got = await withTimeout(Promise.resolve(writerFn(group, { scale: plan.scale, pass: passNo })), limits.passTimeoutMs, 'The writer');
      problems = reviewCopy(brief, got, group, plan.scale);
    } catch (e) {
      problems = [e.timeout ? 'timed out' : `error: ${String(e.message || e).slice(0, 120)}`];
    }
    if (!problems.length) {
      Object.assign(copy, got);
      queue = queue.filter((u) => !group.includes(u));
      say('writer', 'lead', 'draft', `Done: ${group.map((u) => u.id).join(', ')}.`);
      say('lead', 'writer', 'approve', `Approved ${group.map((u) => u.id).join(' and ')}.`);
      await nap();
      continue;
    }
    // The writer failed. It tells the lead; the lead decides how to change the path.
    stats.failures++;
    say('writer', 'lead', 'fail', `I could not finish this pass: ${problems.join('; ')}.`);
    if (replans >= limits.maxReplans) {
      stats.fallbackUnits.push(...group.map((u) => u.id));
      Object.assign(copy, offlineCopy(brief, group.map((u) => u.id)));
      queue = queue.filter((u) => !group.includes(u));
      say('lead', 'writer', 'replan', `That is enough retries. I will use the built-in wording for ${group.map((u) => u.id).join(' and ')} and move on.`);
      continue;
    }
    replans++;
    stats.replans++;
    if (replans === 1) {
      plan.perPass = 1;
      plan.scale = 0.6;
      say('lead', 'writer', 'replan', 'New plan: one section at a time, and 40% shorter. Do not go over budget.');
    } else {
      plan.scale = 0.4;
      say('lead', 'writer', 'replan', 'Last try: very short and plain, one section only.');
    }
  }

  await nap();
  progress(74, 'The page builder is assembling the site…');
  say('lead', 'builder', 'task', `Build the page from the approved plan and words (${stats.failures ? `${stats.failures} writer problem${stats.failures > 1 ? 's' : ''} handled` : 'no problems'}).`);
  const pageCopy = { hero: copy.hero, services: copy.services, about: copy.about };
  let html;
  let usage = null;
  let usedModel = null;
  try {
    if (deps.builder) html = await deps.builder(brief, pageCopy);
    else if (online) {
      const r = await generateSite(brief, (p, m) => progress(74 + Math.round(((p || 0) / 100) * 20), m || 'The page builder is designing…'), { model, copy: pageCopy });
      html = r.html;
      usage = r.usage;
      usedModel = r.model;
    } else html = templateSite(brief, pageCopy);
  } catch (e) {
    say('builder', 'lead', 'fail', `The designer failed (${String(e.message || e).slice(0, 100)}). Using the built-in design.`);
    html = templateSite(brief, pageCopy);
  }
  html = cleanHtml(html);

  // The lead's final review.
  const size = Buffer.byteLength(html);
  const missing = ['id="home"', 'id="contact"'].filter((m) => !html.includes(m));
  const nameMissing = !html.includes(String(brief.name || '').slice(0, 20));
  if (size > limits.maxHtmlBytes || missing.length || nameMissing) {
    say('lead', 'builder', 'replan', `The page is not right (${size > limits.maxHtmlBytes ? `${Math.round(size / 1024)} KB is too big` : missing.length ? `missing ${missing.join(', ')}` : 'name missing'}). Switching to the built-in design.`);
    html = cleanHtml(templateSite(brief, pageCopy));
  }
  await nap();
  progress(97, 'Final check…');
  say('lead', 'system', 'approve', `Approved. ${Math.round(Buffer.byteLength(html) / 1024)} KB page, ${stats.passes} writing pass${stats.passes > 1 ? 'es' : ''}, ${stats.replans} plan change${stats.replans === 1 ? '' : 's'}.`);
  return { html, usage, model: usedModel, stats, copy };
}
