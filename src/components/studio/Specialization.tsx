import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cloud, ClipboardList, Layers, Network, Server, ShieldCheck } from "lucide-react";
import { specialization } from "@/data/studio";
import { Note, Reveal } from "@/components/studio/parts";

const icons = { cloud: Cloud, project: ClipboardList, network: Network, sysadmin: Server, security: ShieldCheck, apps: Layers };

/** The six electives, grouped as one focus. Tap a card to see where it shows up in the work. */
export const Specialization = ({ id = "specialization" }: { id?: string }) => {
  const [open, setOpen] = useState(0);
  const active = specialization.tracks[open];

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-line bg-panel p-6 md:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />
        <Note>My specialization</Note>
        <h2 id={`${id}-title`} className="h-section mt-1 max-w-3xl">
          {specialization.title}
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-soft">{specialization.pitch}</p>

        <p className="mt-6 font-hand text-2xl text-violet-light">Tap one to see where it shows up in my work.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3" role="group" aria-label="Specialization electives">
          {specialization.tracks.map((t, i) => {
            const Icon = icons[t.icon];
            const on = i === open;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setOpen(i)}
                aria-pressed={on}
                className={`group flex min-h-[5.5rem] flex-col items-start gap-2 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                  on ? "border-violet bg-violet text-white shadow-lg" : "border-line bg-raise text-fg hover:border-violet-light/60"
                }`}
              >
                <Icon className={`h-6 w-6 ${on ? "text-white" : "text-violet-light"}`} aria-hidden="true" />
                <span className="text-sm font-semibold leading-tight md:text-base">{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 min-h-[11rem]" aria-live="polite">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-line bg-raise p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold">{active.name}</h3>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-soft">{active.basis}</span>
              </div>
              <p className="mt-2 text-soft">{active.what}</p>
              <p className="mt-3 text-sm">
                <span className="font-semibold">In my work:</span> <span className="text-soft">{active.proof}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.links.map((l) => (
                  <Link key={l.to + l.label} to={l.to} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm text-cream transition hover:border-cream">
                    {l.label} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </motion.div>
        </div>
        <p className="mt-4 text-sm text-soft">{specialization.honesty}</p>
      </Reveal>
    </section>
  );
};
