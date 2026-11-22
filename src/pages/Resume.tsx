import { useMemo, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { brand } from "@/data/studio";
import masterJson from "@/data/myResume.json";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";
import { Stage3D } from "@/components/studio/Stage3D";
import { TEMPLATES } from "@/lib/resumeTemplates.js";
import { detectFocus, tailor, type Master } from "@/lib/tailorResume.js";

const master = masterJson as unknown as Master;
const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-fg placeholder:text-soft/60 outline-none transition focus:border-violet-light";
const FORMSPREE = "https://formspree.io/f/mnjqgkgz";

/**
 * My résumé is not one file. It is one set of true facts, and the copy you get is shaped for what you are hiring for:
 * pick a role (or paste the job posting) and the app puts the most relevant experience first. Contact details are left
 * out of the on-screen preview and are in the PDF you download.
 */
const maskEmail = (e: string) => e.replace(/^(.{2})[^@]*(@.*)$/, "$1••••$2");
const maskPhone = (p: string) => p.replace(/\d(?=(?:\D*\d){2})/g, "•");

const Resume = () => {
  usePageTitle("Request my résumé");
  const [focus, setFocus] = useState("");
  const [posting, setPosting] = useState("");
  const [template, setTemplate] = useState("classic");
  const [variant, setVariant] = useState(0);
  const [who, setWho] = useState({ name: "", email: "", organisation: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const preview = useMemo(() => tailor(master, { focus, posting, contact: false }), [focus, posting]);
  const guessed = useMemo(() => (posting.trim() ? detectFocus(master, posting).focus : null), [posting]);

  const get = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const payload = { ...who, focus, posting, template, variant };
      // Aaron is also told by email (the sheet records it too). Never blocks the download.
      void fetch(FORMSPREE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `Résumé downloaded: ${preview.focusLabel}`, name: who.name, email: who.email, organisation: who.organisation, focus: preview.focus, matched: preview.matched.join(", "), posting: posting.slice(0, 500) }) }).catch(() => undefined);
      const res = await fetch("/api/my-resume", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not build the résumé. Please try again, or email me and I will send it.");
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `Aaron-Prince-Resume-${preview.focus}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setDone(true);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const r = preview.resume;
  const chip = (on: boolean) => `rounded-2xl border px-4 py-3 text-left transition ${on ? "border-violet-light bg-violet/25" : "border-line bg-panel hover:border-violet-light/60"}`;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <Reveal>
        <Note className="text-3xl">Résumé</Note>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">A résumé shaped for what you need.</h1>
        <p className="mt-4 max-w-2xl text-lg text-soft">
          I do not send everyone the same file. Tell me what you are hiring for, or paste the job posting, and the experience that matters most to you comes first. It is the same true record every time, in a format applicant tracking systems can read. Last updated {master.updated}.
        </p>
      </Reveal>

      <section className="mt-10" aria-labelledby="pick">
        <h2 id="pick" className="text-xl font-bold">1. What are you hiring for?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Role focus">
          {Object.entries(master.focuses).map(([id, f]) => (
            <button key={id} type="button" role="radio" aria-checked={preview.focus === id && (focus === id || (!focus && guessed === id))} onClick={() => setFocus(focus === id ? "" : id)} className={chip(preview.focus === id && (focus === id || (!focus && guessed === id)))}>
              <span className="block font-bold">{f.label}</span>
              <span className="block text-sm text-soft">{f.blurb}</span>
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Or paste the job posting and I will match it
          <textarea value={posting} onChange={(e) => setPosting(e.target.value)} placeholder="Paste the job description here (optional)" className={`${field} mt-1 min-h-28`} maxLength={6000} />
        </label>
        <p className="mt-2 text-sm text-soft" aria-live="polite">
          {focus ? `Showing the ${preview.focusLabel} version.` : guessed ? `This looks like a ${preview.focusLabel} role, so that is the version shown.` : `Showing the ${preview.focusLabel} version. Pick a role or paste a posting to change it.`}
          {preview.matched.length > 0 && <> Matches your posting on: <b className="text-fg">{preview.matched.join(", ")}</b>.</>}
        </p>
      </section>

      <section className="mt-10" aria-labelledby="see">
        <h2 id="see" className="text-xl font-bold">2. See it, in 3D</h2>
        <p className="mt-1 text-sm text-soft">Move over it to tilt it, pull the layers apart, or switch on the ATS X-ray to see what a hiring system reads. Contact details stay masked on screen.</p>
        <div className="mt-4"><Stage3D id="resume-stage" r={preview.resume} templateId={template} variant={variant} locked={false} onRemix={() => setVariant((v) => (v + 1) % 100)} /></div>
        <div className="mt-4 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Template">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={t.id === template} onClick={() => setTemplate(t.id)} className={`rounded-full border px-3 py-1 text-sm ${t.id === template ? "border-violet-light bg-violet/30 text-cream" : "border-line text-soft hover:text-fg"}`}>{t.name}</button>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="read">
        <h2 id="read" className="text-xl font-bold">Read it right here</h2>
        <p className="mt-1 text-sm text-soft">No request needed. My phone and email are masked on screen and are in the PDF below.</p>
        <article className="mt-4 rounded-3xl border border-line bg-panel p-5 md:p-8">
          <h3 className="text-2xl font-extrabold">{r.name}</h3>
          <p className="font-semibold text-violet-light">{r.title}</p>
          <p className="mt-1 text-sm text-soft">{r.location} · {maskEmail(master.email)} · {maskPhone(master.phone)} · {r.links}</p>
          <p className="mt-4 text-soft">{r.summary}</p>
          <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-soft">Skills</h4>
          <p className="mt-1">{r.skills}</p>
          <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-soft">Experience and projects</h4>
          <div className="mt-2 space-y-5">
            {r.experience.map((x, i) => (
              <div key={i}>
                <p className="font-bold">{x.role}{x.org ? <span className="font-normal text-soft"> · {x.org}</span> : null}{x.dates ? <span className="font-normal text-soft"> · {x.dates}</span> : null}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-soft">{x.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
          <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-soft">Education and certifications</h4>
          <ul className="mt-2 space-y-1.5 text-soft">{r.education.map((e, i) => <li key={i}><b className="text-fg">{e.school}</b>{e.what ? `: ${e.what}` : ""}{e.dates ? ` (${e.dates})` : ""}</li>)}</ul>
        </article>
      </section>

      <section className="mt-10" aria-labelledby="get">
        <h2 id="get" className="text-xl font-bold">Get the PDF with my contact details</h2>
        {done ? (
          <div role="status" className="mt-3 rounded-3xl border border-emerald-400/40 bg-emerald-400/5 p-6">
            <p className="text-xl font-bold">Your résumé is downloading.</p>
            <p className="mt-1 text-soft">It has my contact details. Need it for a different role? Pick another focus above and download again.</p>
            <button type="button" onClick={() => setDone(false)} className="mt-3 text-sm text-violet-light underline">Download another version</button>
          </div>
        ) : (
          <form onSubmit={get} className="mt-3 space-y-4 rounded-3xl border border-line bg-panel p-5 md:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="r-name" className="mb-1 block text-sm font-medium">Your name</label>
                <input id="r-name" required autoComplete="name" className={field} value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="r-email" className="mb-1 block text-sm font-medium">Your email</label>
                <input id="r-email" type="email" required autoComplete="email" className={field} value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="r-org" className="mb-1 block text-sm font-medium">Company or role (optional)</label>
              <input id="r-org" autoComplete="organization" className={field} value={who.organisation} onChange={(e) => setWho({ ...who, organisation: e.target.value })} />
            </div>
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={who.website} onChange={(e) => setWho({ ...who, website: e.target.value })} /></label>
            </div>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60"><Download className="h-4 w-4" /> {busy ? "Building your copy…" : "Download my résumé (PDF)"}</button>
            {msg && <p role="alert" className="text-sm text-red-300">{msg}</p>}
            <p className="flex items-start gap-2 text-sm text-soft"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> I keep your name and email so I know who asked for what, and I will not share them. Prefer email? Write to <a className="underline" href={`mailto:${brand.email}`}>{brand.email}</a>.</p>
          </form>
        )}
      </section>
    </div>
  );
};

export default Resume;
