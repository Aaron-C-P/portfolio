import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Lock, Plus, Printer, Sparkles, X } from "lucide-react";
import { Note, usePageTitle } from "@/components/studio/parts";
import { collect } from "@/lib/collect";
import { bank, bankReady } from "@/data/pay";
import { priceLabel, studio } from "@/data/resume";
import {
  LAYOUTS, basicChecks, bulletTips, chooseLayout, emptyResume, exampleResume, extractKeywords, freshBandit, matchScore, recordOutcome, resumeText, sensibleDefault,
  type BanditState, type LayoutId, type Resume,
} from "@/lib/resumeEngine";

const KEY = "resume-studio-v1";
const STEPS = ["The job", "Your details", "Improve it", "Get it"] as const;
const field = "mt-1 w-full rounded-xl border border-line bg-raise px-3 py-2 text-sm";

interface Saved {
  resume: Resume;
  posting: string;
  step: number;
  bandit: BanditState;
  layout: LayoutId | null;
  code: string;
  ref: string;
  ordered: boolean;
  reported: boolean;
}

const newRef = () => `RS-${Array.from({ length: 5 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("")}`;
const initial = (): Saved => ({ resume: emptyResume(), posting: "", step: 0, bandit: freshBandit(), layout: null, code: "", ref: newRef(), ordered: false, reported: false });
const load = (): Saved => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...JSON.parse(raw) } : initial();
  } catch {
    return initial();
  }
};

/** The résumé itself, laid out by the chosen layout. Also what gets printed. */
const Doc = ({ r, layout, locked }: { r: Resume; layout: LayoutId; locked: boolean }) => {
  const contact = [r.email, r.phone, r.location, r.links].filter(Boolean).join("  ·  ");
  const Head = ({ children }: { children: string }) => <h3 className="mb-1 mt-4 border-b border-black/20 pb-0.5 text-xs font-bold uppercase tracking-widest text-black/70">{children}</h3>;
  const summary = r.summary.trim() && (
    <section>
      <Head>Summary</Head>
      <p className="text-sm">{r.summary}</p>
    </section>
  );
  const skills = r.skills.trim() && (
    <section>
      <Head>Skills</Head>
      <p className="text-sm">{r.skills.split(",").map((s) => s.trim()).filter(Boolean).join("  ·  ")}</p>
    </section>
  );
  const experience = r.experience.some((j) => j.role.trim()) && (
    <section>
      <Head>Experience</Head>
      {r.experience.filter((j) => j.role.trim()).map((j, i) => (
        <div key={i} className="mb-2">
          <p className="flex justify-between gap-3 text-sm font-semibold"><span>{j.role}{j.org && `, ${j.org}`}</span><span className="shrink-0 font-normal text-black/60">{j.dates}</span></p>
          <ul className="ml-5 list-disc text-sm">{j.bullets.filter((b) => b.trim()).map((b, k) => <li key={k}>{b}</li>)}</ul>
        </div>
      ))}
    </section>
  );
  const education = r.education.some((s) => s.school.trim()) && (
    <section>
      <Head>Education</Head>
      {r.education.filter((s) => s.school.trim()).map((s, i) => (
        <p key={i} className="flex justify-between gap-3 text-sm"><span><b>{s.school}</b>{s.what && `, ${s.what}`}</span><span className="shrink-0 text-black/60">{s.dates}</span></p>
      ))}
    </section>
  );
  const order = layout === "skills" ? [skills, summary, experience, education] : layout === "education" ? [summary, education, skills, experience] : [summary, experience, skills, education];
  return (
    <div id="resume-print" className="relative mx-auto w-full max-w-[794px] bg-white p-8 text-black shadow-xl" style={{ minHeight: 560 }}>
      <h2 className="text-2xl font-bold">{r.name || "Your Name"}</h2>
      {r.title && <p className="text-sm text-black/70">{r.title}</p>}
      <p className="mt-1 text-xs text-black/70">{contact}</p>
      {order.map((o, i) => <div key={i}>{o}</div>)}
      {locked && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span style={{ transform: "rotate(-30deg)" }} className="select-none text-6xl font-black tracking-widest text-black/10">PREVIEW</span>
        </div>
      )}
    </div>
  );
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
  const baseline = sensibleDefault(r);
  // Drawn once per default/outcome change, so the suggestion does not flicker while the user types.
  const recommended = useMemo(() => chooseLayout(s.bandit, baseline), [s.bandit, baseline]);
  const layout = s.layout ?? recommended;
  const unlocked = s.code !== "";
  const avgBullet = tips.length ? Math.round((tips.reduce((a, t) => a + t.strength, 0) / tips.length) * 100) : 0;

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
    data.set("message", `Order ${s.ref}. Phone: ${lead.phone || "not given"}. Layout: ${layout}. Target role: ${r.title || "not given"}. Keyword match: ${match.score}%. Price: ${priceLabel}.`);
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
    patch({ bandit: recordOutcome(s.bandit, layout, got), reported: true });
    const data = new FormData();
    data.set("name", lead.name || "Résumé Studio user");
    data.set("email", lead.email || "outcome@resume.invalid");
    data.set("topic", "Résumé Studio outcome");
    data.set("message", `Order ${s.ref}. Layout ${layout}. Got an interview: ${got ? "yes" : "no"}.`);
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
      <style>{`@media print{body *{visibility:hidden}#resume-print,#resume-print *{visibility:visible}#resume-print{position:absolute;left:0;top:0;width:100%;box-shadow:none}}`}</style>
      <Note>{studio.name}</Note>
      <h1 className="h-section mt-1 md:text-5xl">A résumé built for the job you want.</h1>
      <p className="mt-3 max-w-2xl text-lg text-soft">Paste the job, add your details, and the app shows how well you match and what to sharpen. Build and preview free. A clean download is {priceLabel}.</p>

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

      {s.step === 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Which job are you going for?</h2>
          <p className="mt-1 text-soft">Paste the job posting. The app finds the words the employer cares about and checks your résumé against them. You can skip this and add it later.</p>
          <label className="mt-4 block text-sm font-semibold">Job title you are applying for<input className={field} value={r.title} onChange={(e) => setR({ title: e.target.value })} placeholder="e.g. Customer Support Representative" /></label>
          <label className="mt-4 block text-sm font-semibold">Job posting (paste the whole thing)<textarea className={`${field} min-h-48`} value={s.posting} onChange={(e) => patch({ posting: e.target.value })} placeholder="Paste the job description here" /></label>
          {keywords.length > 0 && <p className="mt-3 text-sm text-soft">Found {keywords.length} key terms, such as: {keywords.slice(0, 6).map((k) => k.term).join(", ")}.</p>}
          <div className="mt-2 text-sm"><button className="text-violet-light underline" onClick={() => patch({ resume: exampleResume() })}>Fill in an example résumé so I can see how it works</button></div>
          <Nav next={() => go(1)} />
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
                  </li>
                ))}
              </ul>
              <button className="mt-3 text-sm text-violet-light underline" onClick={() => go(1)}>Go back and edit</button>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-violet-light/40 bg-violet/10 p-5">
            <h3 className="text-lg font-bold">Layout</h3>
            <p className="mt-1 text-sm text-soft">The app suggests <b>{LAYOUTS.find((l) => l.id === recommended)?.name}</b> for you. It starts from your background, then shifts toward layouts that worked for other applicants as outcomes are reported.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {LAYOUTS.map((l) => (
                <button key={l.id} onClick={() => patch({ layout: l.id })} aria-pressed={layout === l.id} className={`rounded-xl border p-3 text-left text-sm ${layout === l.id ? "border-violet-light bg-violet/30" : "border-line"}`}>
                  <b>{l.name}</b>{l.id === recommended && <span className="ml-2 text-xs text-emerald-300">suggested</span>}
                  <span className="mt-1 block text-xs text-soft">{l.note}</span>
                </button>
              ))}
            </div>
          </div>
          <Nav back={1} next={() => go(3)} nextLabel="Preview and get it" />
        </section>
      )}

      {s.step === 3 && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold">{unlocked ? "Your résumé is ready" : "Your résumé preview"}</h2>
          <div className="mt-4 overflow-x-auto"><Doc r={r} layout={layout} locked={!unlocked} /></div>

          {unlocked ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5">
              <p className="font-semibold text-emerald-200">Unlocked. Download as many versions as you like.</p>
              <button onClick={() => window.print()} className="btn-primary mt-3"><Printer className="h-4 w-4" /> Download PDF</button>
              <p className="mt-2 text-xs text-soft">In the print window, choose "Save as PDF" as the printer and turn off headers and footers.</p>
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-sm font-semibold">After you apply: did this résumé get you an interview?</p>
                {s.reported ? <p className="mt-1 text-sm text-soft">Thank you. That helps the app learn which layouts work.</p> : (
                  <div className="mt-2 flex gap-2"><button onClick={() => report(true)} className="rounded-full border border-line px-4 py-1.5 text-sm">Yes</button><button onClick={() => report(false)} className="rounded-full border border-line px-4 py-1.5 text-sm">Not yet</button></div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-panel p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold"><Lock className="h-4 w-4" /> Get the clean PDF, {priceLabel}</h3>
                <p className="mt-1 text-sm text-soft">One payment per résumé. No subscription. Unlimited edits and downloads of this résumé.</p>
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
                {msg && s.step === 3 && !s.ordered && <p role="alert" className="mt-3 text-sm text-red-300">{msg}</p>}
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
          <Nav back={2} />
          <p className="mt-6 text-xs text-soft">Questions? <Link to="/contact" className="underline">Contact me</Link>. Your résumé text ({resumeText(r).length} characters) stays in your browser unless you download or share it yourself.</p>
        </section>
      )}
    </div>
  );
};

export default ResumeStudio;
