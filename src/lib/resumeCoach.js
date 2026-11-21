// The résumé coach. Pure functions, no file access, so they can be tested and reused.
//
//  coach(master, log, today)    -> { findings, moves }   what to fix, and the next few things worth doing
//  applyLog(master, log, today) -> { master, log, applied } folds every APPROVED log entry into the master
//
// The log is an inbox: whenever you learn or build something, add an entry (see docs/resume-coach.md). Nothing reaches
// the public résumé until you set "approve": true on it and run the apply step, so it is always your call.

const STRONG = "built designed developed led created delivered automated reduced increased improved resolved diagnosed fixed deployed trained wrote analysed analyzed implemented configured installed maintained migrated optimised optimized launched replaced identified produced coordinated documented tested reproduced designed shipped supported handled".split(" ");
const VAGUE = ["helped", "worked on", "responsible for", "assisted with", "various", "etc", "many", "several", "tasks", "duties"];

// What an employer in each focus usually looks for. Missing ones become "next to learn and prove" suggestions.
const EXPECTED = {
  web: ["React", "TypeScript", "Node.js", "REST APIs", "Git and GitHub", "Automated testing", "CI/CD"],
  data: ["Power BI", "DAX", "SQL", "Microsoft Excel", "Python", "Data visualisation"],
  network: ["Routing and switching", "TCP/IP and subnetting", "VLANs", "Network troubleshooting", "Security+ fundamentals"],
  systems: ["Requirements analysis", "Unit and regression testing", "Technical documentation", "Access control", "SQL"],
};

const words = (s) => String(s || "").toLowerCase().match(/[a-z][a-z0-9+#.]*/g) || [];
const days = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const iso = (d) => new Date(d).toISOString().slice(0, 10);

/** Feedback on one sentence that would go on the résumé. Returns a list of short, specific problems (empty when fine). */
export function wording(text) {
  const t = String(text || "").trim();
  const out = [];
  const w = words(t);
  if (w.length < 8) out.push("Too short to prove anything. Say what you did, how, and what changed.");
  if (w.length > 45) out.push("Too long. Aim for one or two lines; move detail to a project.");
  if (!STRONG.includes(w[0])) out.push(`Start with a strong action verb (built, fixed, automated, reduced...), not "${w[0] || ""}".`);
  if (!/\d/.test(t)) out.push("Add a number: how many, how long, how much faster, how many people used it.");
  for (const v of VAGUE) if (t.toLowerCase().includes(v)) out.push(`Replace the vague phrase "${v}" with what you actually did.`);
  return out;
}

const entryText = (e) => e.text || e.what || `${e.title || ""} ${e.text || ""}`;

export function coach(master, log, today = new Date()) {
  const now = iso(today);
  const findings = [];
  const moves = [];
  const add = (level, where, msg) => findings.push({ level, where, msg });

  // 1. Wording of everything waiting in the inbox
  for (const e of log.entries || []) {
    if (["bullet", "highlight", "project"].includes(e.kind)) for (const m of wording(entryText(e))) add("fix", `inbox ${e.id || e.date}`, m);
    if (!e.approve) add("info", `inbox ${e.id || e.date}`, "Waiting for your approval (set approve to true to publish it).");
    if (!(e.tags || []).length && e.kind !== "cert") add("fix", `inbox ${e.id || e.date}`, "No tags, so it would never be chosen for any role. Add web, data, network or systems.");
  }

  // 2. Skills listed with no evidence anywhere: employers probe these
  const proof = [...master.highlights.map((h) => h.text), ...master.jobs.flatMap((j) => j.bullets.map((b) => b.text)), ...master.projects.map((p) => `${p.title} ${p.stack} ${p.text}`)].join(" ").toLowerCase();
  const unproven = master.skills.filter((s) => !s.name.toLowerCase().split(/[^a-z0-9+#.]+/).filter((x) => x.length > 2).some((x) => proof.includes(x)));
  for (const s of unproven.slice(0, 6)) add("watch", "skills", `"${s.name}" is listed but no bullet or project mentions it. Add proof, or an interviewer may ask and find nothing.`);
  if (unproven.length) moves.push(`Prove it: ${unproven.slice(0, 3).map((s) => s.name).join(", ")} appear in your skills but not in any bullet. Build or describe one thing for each.`);

  // 3. Coverage per focus
  for (const [f, def] of Object.entries(master.focuses)) {
    const have = new Set(master.skills.filter((s) => s.tags.includes(f)).map((s) => s.name.toLowerCase()));
    const missing = (EXPECTED[f] || []).filter((x) => !have.has(x.toLowerCase()));
    const items = master.highlights.filter((h) => h.tags.includes(f)).length + master.jobs.reduce((n, j) => n + j.bullets.filter((b) => b.tags.includes(f)).length, 0);
    if (items < 4) add("watch", def.label, `Only ${items} experience lines are tagged ${f}. That version of the résumé will feel thin.`);
    if (missing.length) {
      add("watch", def.label, `Employers hiring for ${def.label.toLowerCase()} usually look for: ${missing.join(", ")}.`);
      moves.push(`For ${def.label.toLowerCase()} roles, learn and prove: ${missing.slice(0, 2).join(" and ")}.`);
    }
    const inProgress = master.certs.filter((c) => c.tags.includes(f) && /in progress/i.test(c.what));
    for (const c of inProgress) moves.push(`Finish "${c.what}", then change it to a completed certification with the year.`);
  }

  // 4. Freshness
  const age = days(master.updated, now);
  if (age > 60) {
    add("fix", "master", `Not updated for ${age} days. Log what you learned or built since ${master.updated}.`);
    moves.unshift(`It has been ${age} days. Add what you learned or built recently to the inbox.`);
  }
  if (!(log.entries || []).length) moves.push("The inbox is empty. Each time you finish something, add one line with what you did and a number.");

  return { findings, moves: [...new Set(moves)].slice(0, 5) };
}

/** Moves every approved inbox entry into the master, and the entry into the log's history. Returns copies; inputs are not changed. */
export function applyLog(master, log, today = new Date()) {
  const m = structuredClone(master);
  const keep = [];
  const applied = [];
  const history = [...(log.applied || [])];
  const dup = (list, key, val) => list.some((x) => String(x[key]).toLowerCase() === String(val).toLowerCase());
  const added = iso(today); // stamped on everything new, so the tailoring can favour what you learned recently

  for (const e of log.entries || []) {
    if (!e.approve) {
      keep.push(e);
      continue;
    }
    const tags = e.tags || [];
    let ok = false;
    if (e.kind === "skill" && e.text && !dup(m.skills, "name", e.text)) (m.skills.push({ name: e.text, tags, added }), (ok = true));
    else if (e.kind === "highlight" && e.text) (m.highlights.push({ id: `h-${added}-${m.highlights.length}`, w: e.w || 2, tags, text: e.text, added }), (ok = true));
    else if (e.kind === "project" && e.title && !dup(m.projects, "title", e.title)) (m.projects.push({ id: `p-${added}-${m.projects.length}`, w: e.w || 2, tags, title: e.title, stack: e.stack || "", text: e.text || "", added }), (ok = true));
    else if (e.kind === "cert" && e.what && !dup(m.certs, "what", e.what)) (m.certs.push({ what: e.what, who: e.who || "", year: e.year || "", tags, w: e.w || 2, added }), (ok = true));
    else if (e.kind === "bullet" && e.text) {
      const job = m.jobs.find((j) => j.id === e.job);
      if (job) (job.bullets.push({ w: e.w || 2, tags, text: e.text, added }), (ok = true));
    }
    if (ok) {
      applied.push(e);
      history.push({ ...e, approve: undefined, appliedOn: iso(today) });
    } else keep.push({ ...e, approve: false, note: "Could not apply: unknown kind, missing job id, or it already exists. Fix it and approve again." });
  }
  if (applied.length) m.updated = iso(today);
  return { master: m, log: { ...log, entries: keep, applied: history }, applied };
}
