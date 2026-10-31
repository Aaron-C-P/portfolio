import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { brand } from "@/data/studio";
import { competencies, levels, roles, skills, type Level, type RoleKey } from "@/data/skills";
import { Note, Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const levelStyle: Record<Level, string> = {
  Shipped: "border-emerald-400/50 text-emerald-300",
  Built: "border-sky-400/50 text-sky-300",
  "Coursework and labs": "border-violet-light/50 text-violet-light",
  "In progress": "border-amber-300/50 text-amber-200",
};

const Dots = ({ level }: { level: Level }) => {
  const n = levels.find((l) => l.name === level)?.dots ?? 0;
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i <= n ? "bg-cream" : "bg-fg/15"}`} />
      ))}
    </span>
  );
};

const Skills = () => {
  usePageTitle("Skills");
  const [role, setRole] = useState<RoleKey | "all">("all");
  const [query, setQuery] = useState("");
  const [lvl, setLvl] = useState<Level | "all">("all");

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      skills.filter((s) => {
        if (role !== "all" && !s.roles.includes(role)) return false;
        if (lvl !== "all" && s.level !== lvl) return false;
        if (!q) return true;
        const hay = [s.name, s.proof, s.group, ...(s.keywords ?? [])].join(" ").toLowerCase();
        return q.split(/\s+/).every((w) => hay.includes(w));
      }),
    [role, lvl, q],
  );
  const active = roles.find((r) => r.key === role);

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${on ? "border-violet bg-violet text-white" : "border-line text-soft hover:border-violet-light hover:text-fg"}`;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <SectionHead
        page
        eyebrow="Skills, with proof"
        title="Search my skills the way you would search for a candidate."
        intro="Filter by the role you are hiring for, or type a keyword. Every skill says how I have used it and links to the evidence, so you can check instead of trust."
      />

      <Reveal className="rounded-3xl border border-line bg-panel p-5 md:p-7">
        <p className="font-hand text-2xl text-violet-light">I am hiring a…</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by role">
          <button onClick={() => setRole("all")} aria-pressed={role === "all"} className={chip(role === "all")}>
            Show everything
          </button>
          {roles.map((r) => (
            <button key={r.key} onClick={() => setRole(r.key)} aria-pressed={role === r.key} className={chip(role === r.key)}>
              {r.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-2xl border border-line bg-raise p-5"
            >
              <p className="text-lg font-semibold">{active.pitch}</p>
              <p className="mt-2 text-sm text-soft">
                <span className="font-semibold text-fg">Bring me in when:</span> {active.bringMeIn}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {active.proof.map((p) => (
                  <Link key={p.label} to={p.to} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-sm text-cream transition hover:border-cream">
                    {p.label} <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <label className="relative block">
            <span className="sr-only">Search skills by keyword</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: SQL, dashboard, CCNA, Python, testing…"
              className="w-full rounded-full border border-line bg-white/5 py-3 pl-11 pr-4 text-fg outline-none placeholder:text-soft/60 focus:border-violet-light"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by evidence level">
            <button onClick={() => setLvl("all")} aria-pressed={lvl === "all"} className={chip(lvl === "all")}>
              Any level
            </button>
            {levels.map((l) => (
              <button key={l.name} onClick={() => setLvl(l.name)} aria-pressed={lvl === l.name} className={chip(lvl === l.name)} title={l.meaning}>
                {l.name}
              </button>
            ))}
          </div>
        </div>
        <p role="status" aria-live="polite" className="mt-4 text-sm text-soft">
          {shown.length} of {skills.length} skills match.
        </p>
      </Reveal>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {shown.map((s) => (
            <motion.li
              key={s.name}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col rounded-3xl border border-line bg-panel p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{s.name}</h2>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${levelStyle[s.level]}`}>{s.level}</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-soft">
                <Dots level={s.level} />
                <span>{s.group}</span>
              </div>
              <p className="mt-3 flex-1 text-soft">{s.proof}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.links.map((l) => (
                  <Link key={l.label} to={l.to} className="rounded-full border border-line px-3 py-1 text-sm text-cream transition hover:border-cream">
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {shown.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-soft">
          Nothing matches that{role !== "all" || lvl !== "all" ? " with these filters" : ""}.{" "}
          {(role !== "all" || lvl !== "all") && (
            <button onClick={() => { setRole("all"); setLvl("all"); }} className="text-cream underline">
              Search all roles and levels
            </button>
          )}{" "}
          If you are looking for something specific, ask me: it may be something I have not claimed yet, and I would rather say so.{" "}
          <Link to="/contact" className="text-cream underline">
            Contact me
          </Link>
          .
        </p>
      )}

      <section className="mt-16 grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <Note>How to read the levels</Note>
          <dl className="mt-3 space-y-3">
            {levels.map((l) => (
              <div key={l.name} className="flex items-start gap-3">
                <Dots level={l.name} />
                <div>
                  <dt className="font-semibold">{l.name}</dt>
                  <dd className="text-sm text-soft">{l.meaning}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.08}>
          <Note>Keywords</Note>
          <p className="mt-3 text-sm leading-relaxed text-soft">{competencies.join(" · ")}</p>
        </Reveal>
      </section>

      <Reveal className="mt-14 rounded-3xl bg-gradient-to-br from-violet to-[#3b1d99] p-8 text-center text-white md:p-10">
        <h2 className="text-3xl font-bold">Open to data, software and IT roles.</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">Remote or in Jamaica. Request my résumé and I will reply with it directly.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/resume" className="inline-flex rounded-full bg-cream px-8 py-3 font-semibold text-ink hover:bg-white">
            Request my résumé
          </Link>
          <a
            href={`mailto:${brand.email}?subject=${encodeURIComponent("Opportunity for Aaron")}`}
            className="inline-flex rounded-full border border-white/40 px-8 py-3 font-semibold hover:bg-white/10"
          >
            Email me
          </a>
        </div>
      </Reveal>
    </div>
  );
};

export default Skills;
