import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { milestones, type Milestone } from "@/data/studio";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";

const chapterColor: Record<Milestone["chapter"], string> = {
  Foundations: "bg-violet-light",
  Building: "bg-cream",
  "Real businesses": "bg-emerald-300",
  Voice: "bg-pink-300",
};

const Row = ({ m, open, onToggle }: { m: Milestone; open: boolean; onToggle: () => void }) => {
  const panelId = `panel-${m.id}`;
  return (
    <li className="relative pl-10 md:pl-14">
      <span className={`absolute left-[11px] top-3 h-3 w-3 rounded-full ring-4 ring-ink md:left-[19px] ${chapterColor[m.chapter]}`} />
      <Reveal>
        <div className="rounded-3xl border border-line bg-panel transition hover:border-violet-light/50">
          <button
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
          >
            <span>
              <span className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-cream">{m.date}</span>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-soft">{m.chapter}</span>
                {!m.dated && <span className="text-xs text-soft">date being verified</span>}
              </span>
              <span className="mt-2 block text-xl font-bold md:text-2xl">{m.title}</span>
              <span className="mt-1 block text-soft">{m.summary}</span>
            </span>
            <ChevronDown className={`mt-2 h-5 w-5 shrink-0 text-soft transition ${open ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <dl className="grid gap-5 border-t border-line p-5 md:grid-cols-2 md:p-6">
                  {[
                    ["What I was exploring", m.explored],
                    ["The problem that interested me", m.problem],
                    ["What I built or learned", m.built],
                    ["The outcome", m.outcome],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-hand text-2xl text-violet-light">{k}</dt>
                      <dd className="mt-1 text-fg/90">{v}</dd>
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <dt className="font-hand text-2xl text-violet-light">Technologies</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {m.tech.map((t) => (
                        <span key={t} className="rounded-full border border-line px-3 py-1 text-sm text-soft">
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                  {m.project && (
                    <div className="md:col-span-2">
                      <Link to={`/work/${m.project}`} className="font-semibold text-cream hover:underline">
                        Open the project story →
                      </Link>
                    </div>
                  )}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </li>
  );
};

const Journey = () => {
  usePageTitle("My Journey");
  const [open, setOpen] = useState<string | null>("cake");
  const dated = milestones.filter((m) => m.dated);
  const pending = milestones.filter((m) => !m.dated);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32">
      <Reveal>
        <Note className="text-3xl">My journey</Note>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-6xl">From lab exercises to live systems.</h1>
        <p className="mt-5 max-w-2xl text-lg text-soft">
          This is how I developed, in order. Open any milestone for what I was exploring, the problem that interested me, what I built and what came of it.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-soft">
          {(Object.keys(chapterColor) as Milestone["chapter"][]).map((c) => (
            <span key={c} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${chapterColor[c]}`} /> {c}
            </span>
          ))}
        </div>
      </Reveal>

      <ol className="relative mt-14 space-y-5 before:absolute before:bottom-0 before:left-[16px] before:top-2 before:w-px before:bg-line md:before:left-[24px]">
        {dated.map((m) => (
          <Row key={m.id} m={m} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} />
        ))}
      </ol>

      <Reveal className="mt-16">
        <h2 className="text-2xl font-bold">Still being dated</h2>
        <p className="mt-2 max-w-2xl text-soft">
          These happened, but I have not yet confirmed the exact dates from the original posts, so I am not guessing.
        </p>
      </Reveal>
      <ol className="mt-6 space-y-5">
        {pending.map((m) => (
          <Row key={m.id} m={m} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} />
        ))}
      </ol>
    </div>
  );
};

export default Journey;
