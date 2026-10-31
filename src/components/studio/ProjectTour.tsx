import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Project } from "@/data/studio";
import { StatusBadge } from "@/components/studio/parts";

const DURATION = 10;
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/**
 * A 10-second animated tour of a project, built from its real screenshot and
 * verified facts. It is an animation, not a screen recording, and says so.
 */
export const ProjectTour = ({ project, autoPlay = true }: { project: Project; autoPlay?: boolean }) => {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const tick = useCallback((now: number) => {
    const dt = (now - last.current) / 1000;
    last.current = now;
    setT((v) => {
      const n = v + dt;
      if (n >= DURATION) {
        setPlaying(false);
        return DURATION;
      }
      return n;
    });
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, tick]);

  // Start once when scrolled into view, unless the visitor prefers reduced motion.
  useEffect(() => {
    started.current = false;
    setT(0);
    setPlaying(false);
    if (!autoPlay || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          setPlaying(true);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [project.slug, autoPlay]);

  const scene = t < 3 ? 0 : t < 6.5 ? 1 : 2;
  const fact = project.verified[0];

  const toggle = () => {
    if (t >= DURATION) setT(0);
    setPlaying((p) => !p);
  };

  return (
    <figure ref={box} className="overflow-hidden rounded-3xl border border-line bg-panel">
      <div className="relative aspect-video overflow-hidden bg-raise">
        {project.image ? (
          <motion.img
            key={project.slug}
            src={project.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
            animate={{ scale: 1 + 0.12 * (t / DURATION), y: `${-4 * (t / DURATION)}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet/50 to-raise" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              {scene === 0 && (
                <>
                  <p className="font-hand text-2xl text-[#feeeaf]">{project.kind}</p>
                  <p className="text-3xl font-extrabold leading-tight md:text-5xl">{project.name}</p>
                  <p className="mt-2 text-sm text-white/80 md:text-lg">{project.oneLiner}</p>
                </>
              )}
              {scene === 1 && (
                <>
                  <p className="font-hand text-2xl text-[#feeeaf]">The problem</p>
                  <p className="text-base font-semibold md:text-2xl">{clip(project.problem, 150)}</p>
                  <p className="mt-3 font-hand text-2xl text-[#feeeaf]">What I built</p>
                  <p className="text-sm text-white/85 md:text-lg">{clip(project.solution, 170)}</p>
                </>
              )}
              {scene === 2 && (
                <>
                  <p className="font-hand text-2xl text-[#feeeaf]">Built with</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.slice(0, 6).map((x, i) => (
                      <motion.span
                        key={x}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.12 }}
                        className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm"
                      >
                        {x}
                      </motion.span>
                    ))}
                  </div>
                  {fact && <p className="mt-3 text-sm text-white/85 md:text-base">{clip(fact, 130)}</p>}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute right-4 top-4">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <button onClick={toggle} aria-label={playing ? "Pause tour" : t >= DURATION ? "Replay tour" : "Play tour"} className="rounded-full bg-violet p-2 text-white hover:bg-violet-light">
          {playing ? <Pause className="h-4 w-4" /> : t >= DURATION ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-fg/10"
          role="progressbar"
          aria-label="Tour progress"
          aria-valuemin={0}
          aria-valuemax={DURATION}
          aria-valuenow={Math.round(t)}
        >
          <div className="h-full rounded-full bg-violet-light" style={{ width: `${(t / DURATION) * 100}%` }} />
        </div>
        <span className="w-12 text-right font-mono text-xs text-soft">0:{String(Math.floor(t)).padStart(2, "0")} / 0:10</span>
      </div>
      <figcaption className="px-4 pb-3 text-xs text-soft">
        A 10-second animated tour made from the project's real screenshot and checked facts. It is an animation, not a screen recording.
      </figcaption>
    </figure>
  );
};
