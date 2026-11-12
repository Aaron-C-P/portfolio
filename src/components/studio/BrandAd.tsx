import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Pause, Play, RotateCcw } from "lucide-react";
import hero from "@/assets/portfolio/aaron-hero.png";
import egzit from "@/assets/portfolio/egzit-mockup.png";
import bns from "@/assets/portfolio/bns-preorder.png";
import { brand } from "@/data/studio";

/**
 * A 30-second brand ad that plays on the page, built from the site's own content.
 * Structure: Hook, Problem, Solution, Proof, Offer, Call to action (the classic problem-solution ad).
 * Only facts already on the site are used, and simulated results are labelled as simulated.
 */
type Scene = { key: string; tag: string; seconds: number; render: () => React.ReactNode };

const big = "text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl";

const scenes: Scene[] = [
  {
    key: "hook",
    tag: "1 of 6",
    seconds: 4,
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <p className={big}>Still taking orders by hand?</p>
        <p className="mt-4 text-xl text-white/80 md:text-2xl">Messages. Spreadsheets. Missed orders.</p>
      </div>
    ),
  },
  {
    key: "problem",
    tag: "2 of 6",
    seconds: 5,
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <p className="text-lg font-bold uppercase tracking-widest text-white/70">The real cost</p>
        <p className={`${big} mt-3`}>
          Every manual step is a place for a <span className="text-amber-300">mistake</span>.
        </p>
      </div>
    ),
  },
  {
    key: "solution",
    tag: "3 of 6",
    seconds: 5,
    render: () => (
      <div className="grid h-full items-center gap-4 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-lg font-bold uppercase tracking-widest text-white/70">Meet Aaron Prince</p>
          <p className={`${big} mt-3`}>{brand.tagline}</p>
          <p className="mt-4 text-lg text-white/80 md:text-xl">Ordering systems and business apps that fit how you work.</p>
        </div>
        <img src={hero} alt="" className="mx-auto hidden max-h-64 rounded-3xl object-cover md:block" />
      </div>
    ),
  },
  {
    key: "proof",
    tag: "4 of 6",
    seconds: 7,
    render: () => (
      <div className="grid h-full items-center gap-4 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-lg font-bold uppercase tracking-widest text-white/70">Built and shipped</p>
          <ul className="mt-3 space-y-3 text-xl font-bold md:text-2xl">
            <li>Cake ordering platform: a 40-customer burst went from 9 errors to 0 <span className="text-sm font-semibold text-white/70">(simulation)</span></li>
            <li>EGZIT marketplace: 14-table database with row-level security</li>
            <li>Staff lunch pre-order tool, live over Google Sheets</li>
          </ul>
        </div>
        <div className="hidden gap-3 md:grid">
          <img src={egzit} alt="" className="max-h-32 w-full rounded-2xl object-cover" />
          <img src={bns} alt="" className="max-h-32 w-full rounded-2xl object-cover" />
        </div>
      </div>
    ),
  },
  {
    key: "offer",
    tag: "5 of 6",
    seconds: 4,
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <p className="text-lg font-bold uppercase tracking-widest text-white/70">Your first step is free</p>
        <p className={`${big} mt-3`}>Describe the problem. Get a quote in 24 hours.</p>
      </div>
    ),
  },
  {
    key: "cta",
    tag: "6 of 6",
    seconds: 5,
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <p className={big}>Let&rsquo;s build it.</p>
        <p className="mt-3 text-lg text-white/80 md:text-xl">aaronprince.vercel.app</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/book" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-lg font-bold text-ink hover:bg-cream">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Book a free call
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-7 py-3 text-lg font-bold hover:bg-white/10">
            Get a quote <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    ),
  },
];

const total = scenes.reduce((n, s) => n + s.seconds, 0);

export const BrandAd = ({ showTitle = true }: { showTitle?: boolean }) => {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [t, setT] = useState(0); // seconds elapsed
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Starts when it scrolls into view, pauses when it leaves. Never autoplays for reduced motion.
  useEffect(() => {
    const el = box.current;
    if (!el || reduced || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting && e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setT((v) => (v + 0.1 >= total ? 0 : v + 0.1)), 100);
    return () => window.clearInterval(id);
  }, [playing]);

  const at = (() => {
    let acc = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (t < acc + scenes[i].seconds) return i;
      acc += scenes[i].seconds;
    }
    return scenes.length - 1;
  })();
  const startOf = useCallback((i: number) => scenes.slice(0, i).reduce((n, s) => n + s.seconds, 0), []);
  const scene = scenes[at];

  return (
    <div>
      {showTitle && <h2 className="mb-5 text-3xl font-extrabold md:text-5xl">Watch the 30-second version.</h2>}
      <div ref={box} role="region" aria-label="Brand ad, 30 seconds. Use the controls to pause or choose a scene." className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b0f3d] via-violet to-[#3b1d99] p-6 text-white shadow-2xl sm:aspect-video md:p-12">
        <motion.div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" animate={reduced ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity }} />
        <AnimatePresence mode="wait">
          <motion.div key={scene.key} className="relative h-full pb-10" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -18 }} transition={{ duration: 0.45 }}>
            {scene.render()}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-6 bottom-4 flex items-center gap-3 md:inset-x-12">
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause the ad" : "Play the ad"} className="rounded-full bg-white/15 p-2 hover:bg-white/25">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setT(0)} aria-label="Restart the ad" className="rounded-full bg-white/15 p-2 hover:bg-white/25">
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-1" role="group" aria-label="Scenes">
            {scenes.map((s, i) => (
              <button key={s.key} type="button" onClick={() => setT(startOf(i))} aria-label={`Scene ${s.tag}`} aria-current={i === at} className="group h-3 flex-1">
                <span className="block h-1 overflow-hidden rounded-full bg-white/25 group-hover:bg-white/40">
                  <span className="block h-full bg-white" style={{ width: i < at ? "100%" : i === at ? `${Math.min(100, ((t - startOf(i)) / s.seconds) * 100)}%` : "0%" }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
