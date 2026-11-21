// Builds a tailored résumé from the master data (src/data/myResume.json). Nothing here is invented: it only chooses,
// orders and trims facts that already exist in the master, so a résumé for a web job, a data job or a bank systems job
// are all true, and each leads with what that reader cares about.
//
// Plain JS with no dependencies, so the browser preview and the server PDF endpoint use exactly the same logic.

const STOP = new Set("a an and are as at be but by for from has have i in is it its of on or our that the their this to we with you your will can able about into over more all any not who what when where which while per etc job role team work working experience years year strong skills skill looking required requirements preferred responsibilities".split(" "));
const tokens = (s) => (String(s || "").toLowerCase().match(/[a-z][a-z0-9+#]*/g) || []).filter((w) => w.length > 1 && !STOP.has(w));
const overlap = (text, set) => {
  let n = 0;
  for (const w of new Set(tokens(text))) if (set.has(w)) n++;
  return n;
};

/** Which focus a job posting leans towards, by counting each focus's keywords in the text. Null when nothing matches. */
export function detectFocus(master, posting) {
  const set = new Set(tokens(posting));
  let best = null;
  let top = 0;
  const scores = {};
  for (const [id, f] of Object.entries(master.focuses)) {
    scores[id] = f.keywords.reduce((n, k) => n + (set.has(k) ? 1 : 0), 0);
    if (scores[id] > top) {
      top = scores[id];
      best = id;
    }
  }
  return { focus: best, scores };
}

/**
 * @param master  the master résumé data
 * @param opts    { focus?: "web"|"data"|"network"|"systems", posting?: string, contact?: boolean }
 *                focus wins if valid; otherwise it is detected from the posting; otherwise the default.
 *                contact false leaves out phone and email (used for the public preview).
 * @returns       { resume, focus, focusLabel, matched }  where resume has the shape the PDF builder expects
 */
export function tailor(master, { focus, posting = "", contact = true, today = new Date() } = {}) {
  const text = String(posting || "").slice(0, 6000);
  const detected = detectFocus(master, text).focus;
  const f = master.focuses[focus] ? focus : detected || master.defaultFocus;
  const set = new Set(tokens(text));
  const F = master.focuses[f];

  // Things you added recently get a boost that fades over about four months, so what you are learning now does not
  // lose a tie to something older. Items with no `added` date (the original record) get no boost.
  const fresh = (item) => (item.added ? Math.max(0, Math.min(2, 2 - (new Date(today) - new Date(item.added)) / 86400000 / 60)) : 0);
  const rank = (item, body) => (item.w || 1) + ((item.tags || []).includes(f) ? 3 : 0) + Math.min(5, overlap(body, set)) * 1.2 + fresh(item);
  const top = (items, body, n) => items.map((it, i) => ({ it, i, r: rank(it, body(it)) })).sort((a, b) => b.r - a.r || a.i - b.i).slice(0, n);

  const experience = [];

  const hi = top(master.highlights, (h) => h.text, 3).sort((a, b) => a.i - b.i);
  if (hi.length) experience.push({ role: "Career highlights", org: "", dates: "", bullets: hi.map((x) => x.it.text) });

  // A role marked `lead` for this focus goes first; the rest keep their order. `focusMax` trims a role that matters less here.
  const jobs = [...master.jobs].sort((a, b) => Number((b.lead || []).includes(f)) - Number((a.lead || []).includes(f)));
  for (const job of jobs) {
    if (job.only && !job.only.includes(f)) continue;
    const picked = top(job.bullets, (b) => b.text, job.focusMax?.[f] ?? (job.max || 4)).sort((a, b) => a.i - b.i); // keep the order they were written in
    experience.push({ role: job.role, org: job.org, dates: job.dates, bullets: picked.map((x) => x.it.text) });
  }

  for (const p of top(master.projects, (p) => `${p.title} ${p.stack} ${p.text}`, 2).sort((a, b) => a.i - b.i)) {
    experience.push({ role: p.it.title, org: p.it.stack, dates: "", bullets: [p.it.text] });
  }

  const skills = top(master.skills, (s) => s.name, 16).map((x) => x.it.name);

  const education = [{ school: master.education.school, what: master.education.what, dates: master.education.dates }];
  for (const c of top(master.certs, (c) => c.what, 5)) education.push({ school: c.it.who || "Certification", what: c.it.what, dates: c.it.year });
  if (master.awards) education.push({ school: "Awards", what: master.awards, dates: "" });
  if (master.extras) education.push({ school: "Research and community", what: master.extras, dates: "" });

  // Words from the posting that this résumé genuinely covers, so the page can show why it was shaped this way.
  const known = new Set([...F.keywords, ...master.skills.flatMap((s) => tokens(s.name))]);
  const matched = [...set].filter((w) => known.has(w)).slice(0, 10);

  return {
    focus: f,
    focusLabel: F.label,
    matched,
    resume: {
      name: master.name,
      title: F.title,
      email: contact ? master.email : "",
      phone: contact ? master.phone : "",
      location: master.location,
      links: master.links,
      summary: F.summary,
      skills: skills.join(", "),
      experience,
      education,
    },
  };
}
