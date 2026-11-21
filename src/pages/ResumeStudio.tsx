import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Lock, Plus, Download, Sparkles, X } from "lucide-react";
import { Note, usePageTitle } from "@/components/studio/parts";
import { collect } from "@/lib/collect";
import { bank, bankReady } from "@/data/pay";
import { priceLabel, studio } from "@/data/resume";
import {
  basicChecks, bulletTips, emptyResume, exampleResume, extractKeywords, matchScore, type Resume,
} from "@/lib/resumeEngine";
import { atsChecks, atsText } from "@/lib/resumeFormat";
import { Stage3D } from "@/components/studio/Stage3D";
import { BulletCoach } from "@/components/studio/BulletCoach";
import { TemplateGallery } from "@/components/studio/TemplateGallery";
import { samples } from "@/data/resumeSamples";
import { templateById } from "@/lib/resumeTemplates.js";

const KEY = "resume-studio-v1";
const STEPS = ["The job", "Your details", "Improve it", "Template", "Get it"] as const;
const field = "mt-1 w-full rounded-xl border border-line bg-raise px-3 py-2 text-sm";

interface Saved {
  resume: Resume;
  posting: string;
  step: number;
  code: string;
  ref: string;
  ordered: boolean;
  reported: boolean;
  template: string;
  /** Art remix number, 0 to 99. Same number gives the same art in the preview and the PDF. */
  variant: number;
}

/** The journey told as chapters, so each step has a reason and a result. */
const STORY = [
  { title: "Aim", line: "Every strong résumé is aimed at one job. Show the app what you are going for." },
  { title: "Facts", line: "Your real story, in plain words. No tricks, just the facts an employer needs." },
  { title: "Sharpen", line: "See how well you match and which lines would make a hiring manager stop." },
  { title: "Design", line: "Now make it yours. Spin it, pull the layers apart, remix the art. The text stays machine-readable." },
  { title: "Launch", line: "Download a real-text PDF with your art built in, ready to send." },
] as const;

const newRef = () => `RS-${Array.from({ length: 5 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("")}`;
const initial = (): Saved => ({ resume: emptyResume(), posting: "", step: 0, code: "", ref: newRef(), ordered: false, reported: false, template: "classic", variant: 0 });
const load = (): Saved => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...JSON.parse(raw) } : initial();
  } catch {
    return initial();
  }
};

const Bar = ({ value, label }: { value: number; label: string }) => (
  <div>
    <div className="flex justify-between text-sm"><span className="font-semibold">{label}</span><span>{value}%</span></div>
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-raise"><div className="h-full rounded-full bg-violet-light transition-all" style={{ width: `${value}%` }} /></div>
  </div>
);

const ResumeStudio = () => {
  usePageTitle(studio.name);
  const [s, setS] = useState<Saved>(load);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [lead, setLead] = useState({ name: "", email: "", phone: "", agree: false });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* private mode: still works for this visit */
    }
  }, [s]);

  const patch = (p: Partial<Saved>) => setS((x) => ({ ...x, ...p }));
  const setR = (p: Partial<Resume>) => setS((x) => ({ ...x, resume: { ...x.resume, ...p } }));
  const r = s.resume;
  const keywords = useMemo(() => extractKeywords(s.posting), [s.posting]);
  const match = useMemo(() => matchScore(r, keywords), [r, keywords]);
  const tips = useMemo(() => bulletTips(r), [r]);
  const checks = useMemo(() => basicChecks(r), [r]);
  const ats = useMemo(() => atsChecks(r), [r]);
  const [showAts, setShowAts] = useState(false);
  const [sampleId, setSampleId] = useState(samples[0].id);
  const sample = samples.find((x) => x.id === sampleId) ?? samples[0];
  const unlocked = s.code !== "";
  const avgBullet = tips.length ? Math.round((tips.reduce((a, t) => a + t.strength, 0) / tips.length) * 100) : 0;

  const download = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/resume-pdf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: s.code, resume: r, template: s.template, variant: s.variant }) });
      if (!res.ok || !(res.headers.get("content-type") || "").includes("pdf")) {
        const why = res.status === 401 ? ((await res.json().catch(() => ({}))) as { reason?: string }).reason : res.status === 429 ? "limit" : "error";
        if (why === "expired" || why === "revoked" || why === "invalid") patch({ code: "" });
        setMsg(why === "expired" ? "This code has expired. Reply to your order email and I will help." : why === "revoked" ? "This order was refunded, so the code no longer works." : why === "invalid" ? "That code is no longer valid." : why === "limit" ? "This code has reached its download limit. Reply to your order email and I will help." : "Could not build the PDF. Please try again in a moment.");
      } else {
        const url = URL.createObjectURL(await res.blob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(r.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume"}-resume.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setMsg("Could not reach the server. Check your connection and try again.");
    }
    setBusy(false);
  };

  const go = (step: number) => {
    setMsg("");
    patch({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setJob = (i: number, p: Partial<Resume["experience"][number]>) => setR({ experience: r.experience.map((j, k) => (k === i ? { ...j, ...p } : j)) });
  const setBullet = (i: number, b: number, v: string) => setJob(i, { bullets: r.experience[i].bullets.map((x, k) => (k === b ? v : x)) });

  const startOrder = async () => {
    if (!lead.agree) return setMsg("Please tick the box so I can contact you about your order.");
    if (!lead.name.trim() || !/\S+@\S+\.\S+/.test(lead.email)) return setMsg("Please add your name and a valid email.");
    setBusy(true);
    const data = new FormData();
    data.set("name", lead.name);
    data.set("email", lead.email);
    data.set("topic", "Résumé Studio order");
    data.set("message", `Order ${s.ref}. Phone: ${lead.phone || "not given"}. Target role: ${r.title || "not given"}. Keyword match: ${match.score}%. Template: ${s.template}. Price: ${priceLabel}.`);
    await collect("builder", data);
    setBusy(false);
    patch({ ordered: true });
    if (studio.checkoutUrl) window.open(`${studio.checkoutUrl}${studio.checkoutUrl.includes("?") ? "&" : "?"}checkout[custom][ref]=${s.ref}`, "_blank", "noopener");
  };

  const unlock = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/resume-unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: codeInput }) });
      if (res.ok) patch({ code: codeInput.trim().toUpperCase() });
      else setMsg(res.status === 429 ? "Too many tries. Wait a few minutes and try again." : res.status === 503 ? "Unlocking is not switched on yet. Email me and I will send your file." : "That code was not recognised. Check it and try again.");
    } catch {
      setMsg("Could not reach the server. Check your connection and try again.");
    }
    setBusy(false);
  };

  const report = async (got: boolean) => {
    patch({ reported: true });
    const data = new FormData();
    data.set("name", lead.name || "Résumé Studio user");
    data.set("email", lead.email || "outcome@resume.invalid");
    data.set("topic", "Résumé Studio outcome");
    data.set("message", `Order ${s.ref}. Got an interview: ${got ? "yes" : "no"}.`);
    void collect("builder", data);
  };

  const Nav = ({ back, next, nextLabel = "Continue" }: { back?: number; next?: () => void; nextLabel?: string }) => (
    <div className="mt-8 flex items-center justify-between">
      {back !== undefined ? <button onClick={() => go(back)} className="inline-flex items-center gap-1 text-sm text-soft hover:text-fg"><ArrowLeft className="h-4 w-4" /> Back</button> : <span />}
      {next && <button onClick={next} className="btn-primary">{nextLabel} <ArrowRight className="h-4 w-4" /></button>}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <style>{`@media print{#resume-preview,#resume-stage{display:none!important}}`}</style>
      <Note>{studio.name}</Note>
      <h1 className="h-section mt-1 md:text-5xl">A résumé built for the job you want.</h1>
      <p className="mt-3 max-w-2xl text-lg text-soft">Paste the job, add your details, and the app shows how well you match and what to sharpen, in a format applicant tracking systems read. Build and preview free. A clean download is {priceLabel}.</p>

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Progress">
        {STEPS.map((t, i) => (
          <li key={t}>
            <button onClick={() => i <= s.step && go(i)} disabled={i > s.step} aria-current={i === s.step ? "step" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm ${i === s.step ? "border-violet-light bg-violet/30 text-cream" : i < s.step ? "border-line text-fg" : "border-line text-soft opacity-60"}`}>
              {i < s.step && <Check className="mr-1 inline h-3.5 w-3.5" />}{i + 1}. {t}
            </button>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-violet-light">Chapter {s.step + 1} of {STEPS.length} · {STORY[s.step].title}</p>
      <p className="mt-1 max-w-2xl text-sm text-soft">{STORY[s.step].line}</p>

      {s.step === 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Which job are you going for?</h2>
          <p className="mt-1 text-soft">Paste the job posting. The app finds the words the employer cares about and checks your résumé against them. You can skip this and add it later.</p>
          <label className="mt-4 block text-sm font-semibold">Job title you are applying for<input className={field} value={r.title} onChange={(e) => setR({ title: e.target.value })} placeholder="e.g. Customer Support Representative" /></label>
          <label className="mt-4 block text-sm font-semibold">Job posting (paste the whole thing)<textarea className={`${field} min-h-48`} value={s.posting} onChange={(e) => patch({ posting: e.target.value })} placeholder="Paste the job description here" /></label>
          {keywords.length > 0 && <p className="mt-3 text-sm text-soft">Found {keywords.length} key terms, such as: {keywords.slice(0, 6).map((k) => k.term).join(", ")}.</p>}
          <div className="mt-2 text-sm"><button className="text-violet-light underline" onClick={() => patch({ resume: exampleResume() })}>Fill in an example résumé so I can see how it works</button></div>
          <Nav next={() => go(1)} />
          <div className="mt-10 rounded-3xl border border-line bg-panel p-5 md:p-6">
            <h3 className="text-xl font-bold">Sample résumés and 10 templates</h3>
            <p className="mt-1 text-sm text-soft">Every template is built for applicant tracking systems: one column, real text, standard fonts. They differ in look, so pick the one that suits the job. These samples use made-up people.</p>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Sample résumés">
              {samples.map((x) => (
                <button key={x.id} role="tab" aria-selected={x.id === sample.id} onClick={() => setSampleId(x.id)} className={`rounded-full border px-4 py-1.5 text-sm ${x.id === sample.id ? "border-violet-light bg-violet/30 text-cream" : "border-line text-soft"}`}>{x.label}</button>
              ))}
            </div>
            <div className="mt-5"><Stage3D id="resume-stage" r={sample.resume} templateId={s.template} variant={s.variant} locked={false} onRemix={() => patch({ variant: (s.variant + 1) % 100 })} /></div>
            <div className="mt-5"><TemplateGallery r={sample.resume} selected={s.template} onSelect={(id) => patch({ template: id })} locked={false} variant={s.variant} /></div>
            <p className="mt-3 text-sm text-soft">Selected: <b className="text-fg">{templateById(s.template).name}</b>. You can change it any time before you download.</p>
            <button className="mt-2 text-sm text-violet-light underline" onClick={() => patch({ resume: sample.resume })}>Start from this sample ({sample.label}) and edit it into yours</button>
          </div>
        </section>
      )}

      {s.step === 1 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Tell me about you</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Full name<input className={field} value={r.name} onChange={(e) => setR({ name: e.target.value })} autoComplete="name" /></label>
            <label className="text-sm font-semibold">Email<input type="email" className={field} value={r.email} onChange={(e) => setR({ email: e.target.value })} autoComplete="email" /></label>
            <label className="text-sm font-semibold">Phone<input className={field} value={r.phone} onChange={(e) => setR({ phone: e.target.value })} autoComplete="tel" /></label>
            <label className="text-sm font-semibold">Location<input className={field} value={r.location} onChange={(e) => setR({ location: e.target.value })} /></label>
          </div>
          <label className="block text-sm font-semibold">Link (LinkedIn or portfolio, optional)<input className={field} value={r.links} onChange={(e) => setR({ links: e.target.value })} /></label>
          <label className="block text-sm font-semibold">Short summary (2 to 3 sentences)<textarea className={`${field} min-h-20`} value={r.summary} onChange={(e) => setR({ summary: e.target.value })} /></label>

          <h3 className="pt-2 text-lg font-bold">Experience</h3>
          {r.experience.map((j, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-line bg-panel p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <input aria-label="Job title" placeholder="Job title" className={field} value={j.role} onChange={(e) => setJob(i, { role: e.target.value })} />
                <input aria-label="Employer" placeholder="Employer" className={field} value={j.org} onChange={(e) => setJob(i, { org: e.target.value })} />
                <input aria-label="Dates" placeholder="2023 - Present" className={field} value={j.dates} onChange={(e) => setJob(i, { dates: e.target.value })} />
              </div>
              {j.bullets.map((b, k) => <input key={k} aria-label={`Bullet ${k + 1}`} placeholder="What you did and what changed (use numbers)" className={field} value={b} onChange={(e) => setBullet(i, k, e.target.value)} />)}
              <div className="flex gap-4 text-sm">
                <button className="inline-flex items-center gap-1 text-violet-light" onClick={() => setJob(i, { bullets: [...j.bullets, ""] })}><Plus className="h-3.5 w-3.5" /> Add bullet</button>
                {r.experience.length > 1 && <button className="inline-flex items-center gap-1 text-red-300" onClick={() => setR({ experience: r.experience.filter((_, k) => k !== i) })}><X className="h-3.5 w-3.5" /> Remove job</button>}
              </div>
            </div>
          ))}
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-violet-light" onClick={() => setR({ experience: [...r.experience, { role: "", org: "", dates: "", bullets: ["", ""] }] })}><Plus className="h-4 w-4" /> Add another job</button>

          <h3 className="pt-2 text-lg font-bold">Education</h3>
          {r.education.map((e, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              <input aria-label="School" placeholder="School" className={field} value={e.school} onChange={(ev) => setR({ education: r.education.map((x, k) => (k === i ? { ...x, school: ev.target.value } : x)) })} />
              <input aria-label="Qualification" placeholder="Qualification" className={field} value={e.what} onChange={(ev) => setR({ education: r.education.map((x, k) => (k === i ? { ...x, what: ev.target.value } : x)) })} />
              <input aria-label="Dates" placeholder="2021 - 2025" className={field} value={e.dates} onChange={(ev) => setR({ education: r.education.map((x, k) => (k === i ? { ...x, dates: ev.target.value } : x)) })} />
            </div>
          ))}
          <label className="block text-sm font-semibold">Skills (separate with commas)<textarea className={`${field} min-h-16`} value={r.skills} onChange={(e) => setR({ skills: e.target.value })} /></label>
          <p className="text-xs text-soft">Saved on this device as you type. Nothing is sent to anyone until you place an order.</p>
          <Nav back={0} next={() => go(2)} nextLabel="See my score" />
        </section>
      )}

      {s.step === 2 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">How your résumé stacks up</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-line bg-panel p-5">
              <Bar value={match.score} label={keywords.length ? "Match with this job" : "Match (paste a job posting to measure)"} />
              <Bar value={avgBullet} label="How specific your bullets are" />
              <p className="text-xs text-soft">These show how well your résumé fits the posting and how concrete it is. They cannot promise an interview.</p>
              {match.missing.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Terms the job uses that your résumé does not:</p>
                  <p className="mt-1 text-sm text-soft">{match.missing.slice(0, 10).join(", ")}</p>
                  <p className="mt-1 text-xs text-soft">Only add a term where it is true for you.</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-line bg-panel p-5">
              <p className="text-sm font-semibold">Checklist</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {checks.map((c) => <li key={c.text} className={`flex gap-2 ${c.ok ? "text-emerald-300" : "text-soft"}`}>{c.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <span className="mt-0.5 h-4 w-4 shrink-0 text-center">○</span>}{c.text}</li>)}
              </ul>
            </div>
          </div>

          {tips.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Your bullets, one by one</h3>
              <ul className="mt-2 space-y-2">
                {tips.map((t, i) => (
                  <li key={i} className="rounded-xl border border-line bg-panel p-3 text-sm">
                    <p>{t.text}</p>
                    <p className={`mt-1 ${t.strength > 0.7 ? "text-emerald-300" : "text-amber-200"}`}><Sparkles className="mr-1 inline h-3.5 w-3.5" />{t.tip}</p>
                    <BulletCoach bullet={t.text} posting={s.posting} onUse={(text) => setR({ experience: r.experience.map((j) => { let done = false; return { ...j, bullets: j.bullets.map((b) => (!done && b === t.text ? ((done = true), text) : b)) }; }) })} />
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-sm text-violet-light underline" onClick={() => go(1)}>Go back and edit</button>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-violet-light/40 bg-violet/10 p-5">
            <h3 className="text-lg font-bold">ATS check</h3>
            <p className="mt-1 text-sm text-soft">Most employers run résumés through an applicant tracking system (ATS) before a person reads them. Every template uses the same plain structure that those systems read reliably: one column, standard headings, real text.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {ats.map((c) => <li key={c.text} className={`flex gap-2 ${c.ok ? "text-emerald-300" : "text-amber-200"}`}>{c.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <span className="mt-0.5 h-4 w-4 shrink-0 text-center">!</span>}{c.text}</li>)}
            </ul>
            <button className="mt-3 text-sm text-violet-light underline" onClick={() => setShowAts(!showAts)}>{showAts ? "Hide" : "Show"} exactly what an ATS will read</button>
            {showAts && <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-xs">{atsText(r) || "Fill in your details to see this."}</pre>}
          </div>
          <Nav back={1} next={() => go(3)} nextLabel="Choose a template" />
        </section>
      )}

      {s.step === 3 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Design your résumé live</h2>
          <p className="mt-1 text-soft">This is your résumé in 3D. Move over it to tilt it, pull the layers apart, or switch on the ATS X-ray to see exactly what a tracking system reads: your words, in order, with the art ignored. Your text stays hidden in previews until you unlock the download.</p>
          <div className="mt-5"><Stage3D id="resume-stage" r={r} templateId={s.template} variant={s.variant} locked={!unlocked} onRemix={() => patch({ variant: (s.variant + 1) % 100 })} /></div>
          <p className="mt-3 text-center text-sm text-soft">{templateById(s.template).name}: {templateById(s.template).note}</p>
          <h3 className="mt-8 text-lg font-bold">Pick a style</h3>
          <div className="mt-3"><TemplateGallery r={r} selected={s.template} onSelect={(id) => patch({ template: id })} locked={!unlocked} variant={s.variant} /></div>
          <Nav back={2} next={() => go(4)} nextLabel="Preview and get it" />
        </section>
      )}

      {s.step === 4 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">{unlocked ? "Your résumé is ready" : "Your résumé preview"}</h2>
          <p className="mt-1 text-sm text-soft">Template: <b className="text-fg">{templateById(s.template).name}</b> <button className="ml-2 text-violet-light underline" onClick={() => go(3)}>Change</button></p>
          <div className="mt-4"><Stage3D id="resume-stage" r={r} templateId={s.template} variant={s.variant} locked={!unlocked} onRemix={() => patch({ variant: (s.variant + 1) % 100 })} /></div>

          {unlocked ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5">
              <p className="font-semibold text-emerald-200">Unlocked. You can edit and download again any time in the next 90 days.</p>
              <button onClick={() => void download()} disabled={busy} className="btn-primary mt-3 disabled:opacity-60"><Download className="h-4 w-4" /> {busy ? "Building…" : "Download ATS-ready PDF"}</button>
              {msg && <p role="alert" className="mt-2 text-sm text-red-300">{msg}</p>}
              <p className="mt-2 text-xs text-soft">A real text PDF: an employer system can read and search every word. Your résumé is sent securely once to build the file and is not stored.</p>
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-sm font-semibold">After you apply: did this résumé get you an interview?</p>
                {s.reported ? <p className="mt-1 text-sm text-soft">Thank you. That helps me see what is working.</p> : (
                  <div className="mt-2 flex gap-2"><button onClick={() => report(true)} className="rounded-full border border-line px-4 py-1.5 text-sm">Yes</button><button onClick={() => report(false)} className="rounded-full border border-line px-4 py-1.5 text-sm">Not yet</button></div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-panel p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold"><Lock className="h-4 w-4" /> Get the clean PDF, {priceLabel}</h3>
                <p className="mt-1 text-sm text-soft">One payment per résumé. No subscription. Edit and re-download for 90 days (up to 25 downloads). Your code is personal, so please do not share it.</p>
                {!s.ordered ? (
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-semibold">Your name<input className={field} value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} autoComplete="name" /></label>
                    <label className="block text-sm font-semibold">Email<input type="email" className={field} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} autoComplete="email" /></label>
                    <label className="block text-sm font-semibold">Phone (optional)<input className={field} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} autoComplete="tel" /></label>
                    <label className="flex gap-2 text-xs text-soft"><input type="checkbox" checked={lead.agree} onChange={(e) => setLead({ ...lead, agree: e.target.checked })} /> I agree that my name, email and order details are stored so my order can be completed. My résumé content is not sent.</label>
                    <button onClick={startOrder} disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">{busy ? "Saving…" : studio.checkoutUrl ? `Pay ${priceLabel}` : "Continue to payment"}</button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="rounded-xl bg-raise p-3">Order reference: <b className="font-mono">{s.ref}</b></p>
                    {studio.checkoutUrl ? (
                      <p className="text-soft">A secure payment page opened in a new tab. <a className="text-violet-light underline" href={studio.checkoutUrl} target="_blank" rel="noopener noreferrer">Open it again</a>. Card details are entered there, never on this site.</p>
                    ) : bankReady ? (
                      <div className="text-soft"><p>Send {priceLabel} by bank transfer and use <b>{s.ref}</b> as the reference:</p><p className="mt-1">{bank.accountName}, {bank.bank}, account {bank.accountNumber}, branch {bank.branch}.</p></div>
                    ) : (
                      <p className="text-soft">Payment details will be emailed to {lead.email || "you"} shortly, quoting {s.ref}. Pay by bank transfer or WiPay.</p>
                    )}
                    <p className="text-soft">After payment you receive an unlock code by email. Enter it on the right.</p>
                  </div>
                )}
                {msg && s.step === 4 && !s.ordered && <p role="alert" className="mt-3 text-sm text-red-300">{msg}</p>}
              </div>
              <div className="rounded-2xl border border-line bg-panel p-5">
                <h3 className="text-lg font-bold">Already paid?</h3>
                <p className="mt-1 text-sm text-soft">Enter the unlock code you were sent.</p>
                <input aria-label="Unlock code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="RS-XXXXX" className={`${field} font-mono`} />
                <button onClick={unlock} disabled={busy || !codeInput.trim()} className="btn-primary mt-3 disabled:opacity-60">Unlock</button>
                {msg && (s.ordered || codeInput) && <p role="alert" className="mt-3 text-sm text-red-300">{msg}</p>}
              </div>
            </div>
          )}
          <Nav back={3} />
          <p className="mt-6 text-xs text-soft">Questions? <Link to="/contact" className="underline">Contact me</Link>. Your résumé stays in your browser until you download it; it is then sent once to build your PDF and is not stored.</p>
        </section>
      )}
    </div>
  );
};

export default ResumeStudio;
