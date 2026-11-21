import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FastForward, Play } from "lucide-react";
import { ResumeDoc } from "@/components/studio/ResumeDoc";
import { samples } from "@/data/resumeSamples";
import { brand, services } from "@/data/studio";

const SEEN = "intro-seen-v1";

interface Scene {
  key: string;
  ms: number;
  kicker: string;
  title: string;
  lines: string[];
}

const SCENES: Scene[] = [
  { key: "title", ms: 3600, kicker: "A short film", title: brand.name, lines: ["Technology and digital solutions", "Built in Jamaica for the world"] },
  { key: "services", ms: 3800, kicker: "01 · Services", title: "Things people can buy", lines: services.slice(0, 4).map((s) => s.title).concat(["Ordering systems · Data · Automation"]) },
  { key: "content", ms: 3400, kicker: "02 · Content creation", title: "Stories that get seen", lines: ["Brand films", "Writing for real audiences", "A feed that shows the work"] },
  { key: "tech", ms: 3400, kicker: "03 · Technology", title: "Built to last", lines: ["Fast on a phone", "Clear for the people using it", "Yours to own and update"] },
  { key: "brand", ms: 3400, kicker: "04 · Branding", title: "Brand the person, too", lines: ["Your story", "Your look", "One place that proves it"] },
  { key: "resume", ms: 6000, kicker: "05 · The digital résumé", title: "ATS-ready text. Art built in.", lines: ["Design it live in 3D", "Every word stays readable by hiring systems"] },
];

/** The résumé as three layers drifting apart: art, words, and the plain text an ATS reads. */
const LayersReel = () => {
  const r = samples[1].resume;
  const page = (layer: "art" | "text", z: number, o = 1) => (
    <div style={{ position: "absolute", inset: 0, transform: `translateZ(${z}px)`, opacity: o }}>
      <ResumeDoc r={r} templateId="aurora" variant={2} locked={false} layer={layer} />
    </div>
  );
  return (
    <motion.div initial={{ rotateY: -50, rotateX: 12, opacity: 0 }} animate={{ rotateY: [-28, 14, -28], rotateX: 8, opacity: 1 }} transition={{ rotateY: { duration: 9, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.8 } }} style={{ position: "absolute", left: "50%", top: 0, marginLeft: -688, width: 816, height: 1056, transformStyle: "preserve-3d", scale: 0.2, transformOrigin: "top center" }} aria-hidden="true">
      {page("art", -120)}
      {page("text", 40)}
      <div style={{ position: "absolute", inset: 0, transform: "translate3d(560px,30px,120px)" }} className="rounded-sm bg-[#07111f]/95 p-[54pt] font-mono text-emerald-300">
        <div style={{ fontSize: "10pt", lineHeight: 1.5 }}>
          <div className="mb-2 uppercase tracking-widest text-emerald-500">What an ATS reads</div>
          <div className="font-bold text-emerald-100">{r.name}</div>
          <div>{r.title}</div>
          <div>{r.email} | {r.phone} | {r.location}</div>
          <div className="mt-3 font-bold text-emerald-200">PROFESSIONAL SUMMARY</div>
          <div>{r.summary}</div>
          <div className="mt-3 font-bold text-emerald-200">WORK EXPERIENCE</div>
          <div>{r.experience[0].role}, {r.experience[0].org}</div>
          {r.experience[0].bullets.map((b) => <div key={b}>- {b}</div>)}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * The opening film on the home page: six short scenes flying through a 3D grid, ending on the live résumé studio.
 * It plays once per browser session, can be skipped at any time (button or Esc), is skipped entirely for people who
 * ask their device for reduced motion, and can be replayed from the home page. Plain CSS 3D, no WebGL.
 */
export const MovieIntro = ({ force }: { force: boolean }) => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return force || !sessionStorage.getItem(SEEN);
    } catch {
      return force;
    }
  });
  const [i, setI] = useState(0);

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* private mode: it just plays again next time */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open || reduce) return;
    if (i >= SCENES.length - 1) return; // the last scene waits for the viewer
    const t = setTimeout(() => setI((x) => x + 1), SCENES[i].ms);
    return () => clearTimeout(t);
  }, [open, i, reduce]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const stars = useMemo(() => Array.from({ length: 36 }, (_, n) => ({ n, x: (n * 53) % 100, y: (n * 37) % 100, d: 2 + ((n * 7) % 5), s: 1 + (n % 3) })), []);

  if (!open || reduce) return null;
  const sc = SCENES[i];
  const last = i === SCENES.length - 1;

  // A portal to <body>: the page-transition wrapper is transformed, which would otherwise trap a fixed overlay inside it.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Intro film" style={{ zIndex: 2147483000 }} className="fixed inset-0 overflow-hidden bg-[#05030d] text-white">
      <style>{`
        @keyframes mvgrid{from{background-position:0 0}to{background-position:0 80px}}
        @keyframes mvstar{0%{transform:translateZ(-400px);opacity:0}30%{opacity:1}100%{transform:translateZ(500px);opacity:0}}
        .mv-grid{background-image:linear-gradient(rgba(167,139,250,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,.55) 1px,transparent 1px);background-size:80px 80px;animation:mvgrid 1.6s linear infinite}
      `}</style>
      <div className="absolute inset-0" style={{ perspective: 700 }} aria-hidden="true">
        <div className="mv-grid absolute left-[-50%] top-[55%] h-[160%] w-[200%] opacity-60" style={{ transform: "rotateX(72deg)", transformOrigin: "top", maskImage: "linear-gradient(to bottom,black,transparent 80%)", WebkitMaskImage: "linear-gradient(to bottom,black,transparent 80%)" }} />
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {stars.map((s) => (
            <span key={s.n} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y * 0.7}%`, width: s.s, height: s.s, animation: `mvstar ${s.d}s linear ${-s.n * 0.3}s infinite` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(124,58,237,.28),transparent)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center" style={{ perspective: 1000 }}>
        <AnimatePresence mode="wait">
          <motion.div key={sc.key} initial={{ opacity: 0, z: -700, rotateY: -35 }} animate={{ opacity: 1, z: 0, rotateY: 0 }} exit={{ opacity: 0, z: 500, rotateY: 25, scale: 1.2 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformStyle: "preserve-3d" }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-violet-300">{sc.kicker}</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">{sc.title}</h2>
            {sc.key === "resume" && <div className="relative mx-auto mt-6 h-[230px] w-[320px]" style={{ perspective: 1100 }}><LayersReel /></div>}
            <ul className="mt-6 space-y-1 text-lg text-white/75">
              {sc.lines.map((l, n) => (
                <motion.li key={l} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + n * 0.25 }}>{l}</motion.li>
              ))}
            </ul>
            {last && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={close} autoFocus className="btn-primary"><Play className="h-4 w-4" /> Enter the site</button>
                <Link to="/resume-builder" onClick={close} className="btn-ghost">Design my résumé <ArrowRight className="h-4 w-4" /></Link>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex gap-1.5" aria-hidden="true">
          {SCENES.map((s, n) => <span key={s.key} className={`h-1 w-8 rounded-full transition-colors ${n <= i ? "bg-violet-light" : "bg-white/20"}`} />)}
        </div>
        {!last && <button onClick={close} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-sm text-white/80 hover:text-white"><FastForward className="h-4 w-4" /> Skip intro</button>}
      </div>
    </div>,
    document.body,
  );
};

/** A small button for the home page that plays the film again. */
export const ReplayIntro = ({ onReplay }: { onReplay: () => void }) => (
  <button onClick={onReplay} className="inline-flex items-center gap-1.5 text-sm text-soft underline hover:text-fg"><Play className="h-3.5 w-3.5" /> Replay the intro</button>
);
