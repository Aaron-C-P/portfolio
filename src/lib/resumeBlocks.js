// The one ATS résumé format as a list of blocks. Plain JavaScript on purpose: the browser uses it for the
// preview and the "what an ATS reads" view, and the server (api/resume-pdf.js) uses the very same code to
// draw the PDF, so the two can never drift apart. Types are in resumeBlocks.d.ts.

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

export function resumeBlocks(r) {
  const out = [];
  if (clean(r.name)) out.push({ kind: "name", text: clean(r.name) });
  if (clean(r.title)) out.push({ kind: "title", text: clean(r.title) });
  const contact = [r.email, r.phone, r.location, r.links].map(clean).filter(Boolean).join(" | ");
  if (contact) out.push({ kind: "contact", text: contact });

  if (clean(r.summary)) out.push({ kind: "heading", text: "PROFESSIONAL SUMMARY" }, { kind: "text", text: clean(r.summary) });

  const jobs = (r.experience || []).filter((j) => clean(j.role));
  if (jobs.length) {
    out.push({ kind: "heading", text: "WORK EXPERIENCE" });
    for (const j of jobs) {
      out.push({ kind: "role", text: [clean(j.role), clean(j.org)].filter(Boolean).join(", "), aside: clean(j.dates) || undefined });
      (j.bullets || []).filter((b) => clean(b)).forEach((b) => out.push({ kind: "bullet", text: clean(b) }));
    }
  }

  const schools = (r.education || []).filter((s) => clean(s.school));
  if (schools.length) {
    out.push({ kind: "heading", text: "EDUCATION" });
    for (const s of schools) out.push({ kind: "role", text: [clean(s.what), clean(s.school)].filter(Boolean).join(", "), aside: clean(s.dates) || undefined });
  }

  const skills = String(r.skills ?? "").split(",").map(clean).filter(Boolean);
  if (skills.length) out.push({ kind: "heading", text: "SKILLS" }, { kind: "text", text: skills.join(", ") });
  return out;
}

/** Keeps only the expected fields, as strings, within sane sizes. Used on the server for anything a browser sends. */
export function sanitizeResume(raw) {
  const s = (v, n) => String(v ?? "").slice(0, n);
  const o = raw && typeof raw === "object" ? raw : {};
  return {
    name: s(o.name, 100),
    title: s(o.title, 120),
    email: s(o.email, 120),
    phone: s(o.phone, 40),
    location: s(o.location, 120),
    links: s(o.links, 200),
    summary: s(o.summary, 1200),
    skills: s(o.skills, 1000),
    experience: (Array.isArray(o.experience) ? o.experience : []).slice(0, 12).map((j) => ({
      role: s(j?.role, 120),
      org: s(j?.org, 120),
      dates: s(j?.dates, 60),
      bullets: (Array.isArray(j?.bullets) ? j.bullets : []).slice(0, 12).map((b) => s(b, 400)),
    })),
    education: (Array.isArray(o.education) ? o.education : []).slice(0, 8).map((e) => ({ school: s(e?.school, 140), what: s(e?.what, 140), dates: s(e?.dates, 60) })),
  };
}
