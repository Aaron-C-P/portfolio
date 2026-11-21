import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project, Status } from "@/data/studio";

export const usePageTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | Aaron Prince` : "Aaron Prince | Technology & Digital Solutions";
    window.scrollTo(0, 0);
  }, [title]);
};

export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const calm = useReducedMotion();
  // Safety net: if the scroll trigger never fires (print, screenshots, odd browsers) show the content anyway, so a section is never blank.
  const [late, setLate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLate(true), 2200);
    return () => clearTimeout(t);
  }, []);
  const shown = calm ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0, z: 0 };
  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        initial={calm ? { opacity: 0 } : { opacity: 0, y: 36, rotateX: 16, z: -60, transformOrigin: "50% 100%" }}
        animate={late ? shown : undefined}
        whileInView={shown}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** Leans toward the pointer in 3D, with a soft glare. Touch and reduced-motion visitors get a plain card. */
export const Tilt = ({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) => {
  const calm = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 18 });
  if (calm) return <div className={className}>{children}</div>;
  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        className="h-full"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width - 0.5);
          y.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
        whileHover={{ z: 24 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/** A word with a hand-drawn cream underline, echoing a sketchbook annotation. */
export const Underlined = ({ children }: { children: ReactNode }) => (
  <span className="relative inline-block text-cream">
    {children}
    <svg
      aria-hidden="true"
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className="absolute -bottom-2 left-0 h-3 w-full"
    >
      <motion.path
        d="M3 9 C 40 2, 90 12, 130 6 S 185 4, 197 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.5 }}
      />
    </svg>
  </span>
);

export const Note = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`font-hand text-2xl text-violet-light ${className}`}>{children}</span>
);

const statusStyle: Record<Status, string> = {
  "Deployed application": "border-emerald-400/40 text-emerald-300",
  "Working prototype": "border-sky-400/40 text-sky-300",
  Experiment: "border-amber-300/40 text-amber-200",
  "Academic project": "border-violet-light/50 text-violet-light",
  "In progress": "border-pink-300/40 text-pink-200",
  "Concept design": "border-teal-400/40 text-teal-300",
  "Details being added": "border-line text-soft",
};

export const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${statusStyle[status]}`}>{status}</span>
);

export const SectionHead = ({ eyebrow, title, intro, page = false }: { eyebrow: string; title: ReactNode; intro?: string; page?: boolean }) => (
  <Reveal className="mb-12 max-w-2xl">
    <Note>{eyebrow}</Note>
    {page ? <h1 className="h-section mt-1 md:text-6xl">{title}</h1> : <h2 className="h-section mt-1">{title}</h2>}
    {intro && <p className="mt-4 text-lg text-soft">{intro}</p>}
  </Reveal>
);

/** Frames a screenshot like a browser window so product images feel like product images. */
export const BrowserFrame = ({ src, alt, url }: { src: string; alt: string; url?: string | null }) => (
  <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-violet/10">
    <div className="flex items-center gap-2 border-b border-line bg-raise px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      {url && <span className="ml-3 truncate rounded-full bg-black/30 px-3 py-0.5 font-mono text-xs text-soft">{url.replace(/^https?:\/\//, "")}</span>}
    </div>
    <img src={src} alt={alt} className="block w-full" loading="lazy" />
  </div>
);

/** For work that has no screenshot yet: a designed card built from the project's real facts, never a blank box. */
export const IdeaVisual = ({ project, large = false }: { project: Project; large?: boolean }) => (
  <div
    className={`relative flex h-full w-full flex-col justify-between overflow-hidden text-white ${large ? "p-8 md:p-12" : "p-5"}`}
    style={{ backgroundColor: "#1b1233", backgroundImage: "radial-gradient(circle at 85% 15%, rgba(167,139,250,.38), transparent 45%), radial-gradient(circle at 10% 90%, rgba(251,191,36,.14), transparent 40%), linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "auto, auto, 28px 28px, 28px 28px" }}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200">{project.kind}</span>
    <div>
      <p className={`font-hand leading-none text-amber-100 ${large ? "text-5xl md:text-6xl" : "text-3xl"}`}>{project.name}</p>
      {large && <p className="mt-4 max-w-xl text-base text-white/80">{project.purpose}</p>}
    </div>
    <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
      {project.tech.slice(0, large ? 8 : 4).map((t) => (
        <li key={t} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white/85">{t}</li>
      ))}
    </ul>
  </div>
);

export const ProjectCard = ({ project, index = 0 }: { project: Project; index?: number }) => (
  <Reveal delay={Math.min(index * 0.06, 0.24)}>
    <Tilt className="h-full">
    <Link
      to={`/work/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel transition hover:-translate-y-1 hover:border-violet-light/60"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-raise">
        {project.image ? (
          <img
            src={project.image}
            alt={project.imageAlt ?? project.name}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <IdeaVisual project={project} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wider text-soft">{project.kind}</span>
          <StatusBadge status={project.status} />
        </div>
        <h3 className="text-2xl font-bold">{project.name}</h3>
        <p className="mt-2 flex-1 text-soft">{project.oneLiner}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cream">
          Read the story <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
    </Tilt>
  </Reveal>
);

/** QR Code -> Identifier -> Backend logic -> Validation -> Resource. Dashed steps are concepts, not shipped features. */
export const FlowDiagram = () => {
  const nodes = [
    { label: "QR code", sub: "A small, scannable payload", concept: false },
    { label: "Structured identifier", sub: "A short key, not the data", concept: false },
    { label: "Backend logic", sub: "Server looks up what the key means", concept: false },
    { label: "Validation", sub: "Time-bound checks (explored as a concept)", concept: true },
    { label: "Resource or workflow", sub: "The larger thing the key unlocks", concept: false },
  ];
  return (
    <figure className="rounded-3xl border border-line bg-panel p-6 md:p-8">
      <ol className="grid gap-4 md:grid-cols-5">
        {nodes.map((n, i) => (
          <li key={n.label} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`h-full rounded-2xl p-4 ${n.concept ? "border border-dashed border-cream/50 bg-cream/5" : "border border-violet-light/50 bg-violet/10"}`}
            >
              <span className="font-mono text-xs text-soft">0{i + 1}</span>
              <p className="mt-1 font-semibold">{n.label}</p>
              <p className="mt-1 text-sm text-soft">{n.sub}</p>
            </motion.div>
            {i < nodes.length - 1 && (
              <svg aria-hidden="true" className="absolute -right-3 top-1/2 hidden h-4 w-6 -translate-y-1/2 md:block" viewBox="0 0 24 16">
                <path d="M0 8h20m-5-5 5 5-5 5" fill="none" stroke="rgb(var(--c-violet-light))" strokeWidth="2" strokeDasharray="4 4" style={{ animation: "flow 1s linear infinite" }} />
              </svg>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-5 text-sm text-soft">
        Solid boxes show the idea demonstrated by the proof of concept. The dashed box is time-bound validation, which I explored as a concept. This is an
        experiment, not a finished authentication product.
      </figcaption>
    </figure>
  );
};

/** Before and after figures from the discrete-event simulation. These are simulation results, not live measurements. */
export const SimComparison = () => {
  const rows = [
    { label: "Customers who hit an error", before: 9, after: 0, max: 40 },
    { label: "Customers who did not get through", before: 1, after: 0, max: 40 },
    { label: "Orders completed", before: null, after: 40, max: 40 },
    { label: "90-customer burst beyond capacity: customers who hit an error", before: 32, after: 1, max: 90 },
  ];
  return (
    <figure className="rounded-3xl border border-line bg-panel p-6 md:p-8">
      <p className="mb-6 text-sm text-soft">A burst of 40 simultaneous customers, replayed through the real client and server code.</p>
      <div className="space-y-6">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="mb-2 text-sm font-medium">{r.label}</p>
            <div className="space-y-2">
              {r.before !== null && (
                <Bar name="Before" value={r.before} max={r.max} color="bg-red-400/80" />
              )}
              <Bar name="After" value={r.after} max={r.max} color="bg-emerald-400/80" />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm text-amber-100">
        These figures come from a simulation with modelled latency. They are not measurements from live production traffic.
      </figcaption>
    </figure>
  );
};

const Bar = ({ name, value, max, color }: { name: string; value: number; max: number; color: string }) => (
  <div className="flex items-center gap-3">
    <span className="w-14 text-xs text-soft">{name}</span>
    <div className="h-6 flex-1 overflow-hidden rounded-full bg-white/5">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.max((value / max) * 100, value > 0 ? 3 : 0)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />
    </div>
    <span className="w-8 text-right font-mono text-sm">{value}</span>
  </div>
);
