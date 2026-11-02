import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, Compass, Store, Code2, BarChart3, GraduationCap, Wrench } from "lucide-react";
import heroPhoto from "@/assets/portfolio/aaron-hero.png";
import { useState } from "react";
import { NotesBoard } from "@/components/studio/NotesBoard";
import { ProjectTour } from "@/components/studio/ProjectTour";
import { Specialization } from "@/components/studio/Specialization";
import { brand, projects, principles, findProject, press, feed } from "@/data/studio";
import { Note, ProjectCard, Reveal, SectionHead, Underlined, usePageTitle } from "@/components/studio/parts";

const publishedPieces = press.filter((p) => /Gleaner|Observer|Castledown/.test(p.meta)).length;

const proof = [
  { value: "2", label: "live business applications", to: "/work", hint: "See the live applications" },
  { value: "400+", label: "automated tests on the cake platform", to: "/work/chef-hudsons-christmas-cakes", hint: "Read the cake platform case study" },
  { value: String(publishedPieces), label: "pieces in national newspapers and international peer-reviewed journals", to: "/writing", hint: "Read the published pieces" },
  { value: "2026", label: "Computer Science graduate", to: "/about", hint: "See my degree and coursework" },
];

const hiringCards = [
  {
    h: "Skills",
    Icon: Wrench,
    card: "border-violet/50 bg-violet/5",
    tile: "bg-violet text-white",
    check: "text-violet-light",
    items: [
      { t: "SQL: PostgreSQL, MySQL, SQL Server", hot: "Core" },
      { t: "Python for data processing and automation" },
      { t: "Dashboards and KPI design" },
      { t: "Database and schema design" },
      { t: "Data validation and audit logging" },
      { t: "React, TypeScript, Node.js" },
      { t: "Git, documentation and testing" },
    ],
  },
  {
    h: "Experience",
    Icon: Briefcase,
    card: "border-amber-500/60 bg-amber-300/10",
    tile: "bg-amber-600 text-white",
    check: "text-amber-600",
    items: [
      { t: "Web Development Intern, Larvation Web LLC (remote), Mar to Jun 2026", hot: "Intern" },
      { t: "Live systems for a baker and a delivery service", hot: "Live" },
      { t: "Published in the Jamaica Gleaner, the Jamaica Observer and an international peer-reviewed journal (Castledown)", hot: "Published" },
      { t: "Volunteer workshop facilitator, SBA" },
    ],
  },
  {
    h: "Credentials",
    Icon: GraduationCap,
    card: "border-emerald-500/60 bg-emerald-400/10",
    tile: "bg-emerald-600 text-white",
    check: "text-emerald-600",
    items: [
      { t: "B.Sc. Computer Science, NCU (2026)", hot: "Graduate" },
      { t: "Honor Roll, Top Student in Software Engineering", hot: "Top" },
      { t: "8 CSEC subjects, 9 CAPE units and 2 NVQ qualifications" },
      { t: "CompTIA Security+ 701 (Infosec, 2025)", hot: "Certified" },
      { t: "CCNA: Introduction to Networks (2026)", hot: "Certified" },
      { t: "In progress: Power BI (DataCamp) and the full CCNA" },
    ],
  },
];

const paths = [
  { to: "/journey", Icon: Compass, who: "Hiring or recruiting?", text: "Follow how I went from lab exercises to live business systems.", cta: "Read the journey" },
  { to: "/services", Icon: Store, who: "Run a business?", text: "See what a better ordering or request system could do for you.", cta: "See services" },
  { to: "/work/chef-hudsons-christmas-cakes", Icon: Code2, who: "Developer?", text: "A concurrency bug, a simulation, and idempotency keys.", cta: "Read the case study" },
  { to: "/work/errands", Icon: BarChart3, who: "Care about data?", text: "How a delivery service models orders, trips and prices.", cta: "Explore the data" },
];

const Tours = () => {
  const list = projects.filter((p) => p.image).slice(0, 5);
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Choose a project tour">
        {list.map((p, k) => (
          <button
            key={p.slug}
            onClick={() => setI(k)}
            aria-pressed={i === k}
            className={`rounded-full border px-4 py-2 text-sm transition ${i === k ? "border-violet bg-violet text-white" : "border-line text-soft hover:text-fg"}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <ProjectTour project={list[i]} autoPlay={false} />
    </div>
  );
};

const Home = () => {
  usePageTitle();
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 -z-10">
          <motion.img
            src={heroPhoto}
            alt="Aaron Prince"
            className="h-[62vh] w-full object-cover object-[64%_20%] md:h-full md:ml-auto md:w-3/5 md:object-[60%_25%] md:opacity-70"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.7, scale: [1.08, 1.16, 1.08] }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 22, repeat: Infinity, ease: "easeInOut" } }}
          />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/85 to-transparent md:block md:via-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink from-45% via-transparent to-ink/20 md:from-0% md:to-ink/50" />
          <div aria-hidden="true" className="live-bg pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(rgb(var(--c-violet, 118 71 235)) 1px, transparent 1.5px)",
                backgroundSize: "44px 44px",
                animation: "gridpan 5s linear infinite",
              }}
            />
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet/35 blur-3xl" style={{ animation: "drift 9s ease-in-out infinite" }} />
            <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-amber-400/25 blur-3xl" style={{ animation: "drift2 11s ease-in-out infinite" }} />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" style={{ animation: "drift 13s ease-in-out infinite reverse" }} />
            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: "sweep 6s ease-in-out infinite" }} />
            {[6, 14, 23, 31, 42, 53, 61, 72, 83, 92].map((x, i) => (
              <span
                key={x}
                className="absolute bottom-0 h-2 w-2 rounded-full bg-violet-light"
                style={{
                  left: `${x}%`,
                  ["--dx" as string]: `${i % 2 ? 28 : -28}px`,
                  animation: `rise ${9 + (i % 5) * 2}s linear ${i * 0.9}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-[44vh] md:pb-20 md:pt-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
              Open to work: data, software and IT roles
            </span>
            <br />
            <Note className="text-3xl">Hi, I'm Aaron.</Note>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              I turn real problems into <Underlined>working software</Underlined>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-soft md:mt-8 md:text-xl">
              Ordering systems, business applications and data tools, built for real businesses in Jamaica, and explained in plain language.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-9">
              <Link to="/work" className="btn-primary">
                See the work <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Start a conversation
              </Link>
            </div>
            <p className="mt-6 text-base font-medium text-soft">
              Hiring or got a project? Email{" "}
              <a href={`mailto:${brand.email}`} className="font-semibold text-violet-light underline underline-offset-4 hover:text-fg">
                {brand.email}
              </a>{" "}
              or call{" "}
              <a href={brand.phoneHref} className="whitespace-nowrap font-semibold text-violet-light underline underline-offset-4 hover:text-fg">
                {brand.phone}
              </a>
            </p>
            <p className="mt-3 font-hand text-2xl text-cream/90">{brand.tagline}</p>
          </motion.div>
        </div>
      </section>

      <section aria-label="At a glance" className="mx-auto -mt-2 max-w-6xl px-5">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label}>
              <Link
                to={p.to}
                aria-label={`${p.value} ${p.label}. ${p.hint}`}
                className="glass group relative flex h-full min-h-[8.5rem] flex-col rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-light/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <dt className="sr-only">{p.label}</dt>
                <dd className="text-4xl font-extrabold text-cream">{p.value}</dd>
                <span className="mt-1 text-sm text-soft">{p.label}</span>
                <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-violet-light">
                  {p.hint} <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                </span>
              </Link>
            </div>
          ))}
        </dl>
      </section>

      <section id="hiring" aria-labelledby="hiring-title" className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
        <Reveal className="rounded-3xl border border-line bg-panel p-6 md:p-10">
          <Note>For hiring teams</Note>
          <h2 id="hiring-title" className="h-section mt-1">
            What I do, in one place.
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-soft">
            I am a 2026 Computer Science graduate (Northern Caribbean University) who builds ordering systems, reporting dashboards and data tools, and
            makes the data behind them accurate and traceable. Open to data and reporting analytics, software development, and IT or networking roles, including remote.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {hiringCards.map((c) => (
              <div
                key={c.h}
                className={`group rounded-3xl border-2 p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${c.card}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.tile}`}>
                    <c.Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-2xl font-extrabold">{c.h}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i.t} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${c.check}`} aria-hidden="true" />
                      <span className={i.hot ? "font-semibold text-fg" : "text-soft"}>
                        {i.t}
                        {i.hot && <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${c.tile}`}>{i.hot}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-violet/50 bg-violet/5 p-4">
            <span className="flex items-center gap-2 rounded-full bg-violet px-3 py-1 text-sm font-semibold text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" /> Learning now
            </span>
            <p className="text-sm text-soft">
              <span className="font-semibold text-fg">Introduction to Power BI</span> on DataCamp, part of the Data Analyst in Power BI track, and the full Cisco CCNA.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/resume" className="btn-primary">
              Request my résumé
            </Link>
            <Link to="/skills" className="btn-ghost">
              Search my skills, with proof
            </Link>
            <a href={brand.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              LinkedIn
            </a>
          </div>
        </Reveal>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
        <Specialization id="home-specialization" />
      </div>

      <section aria-labelledby="wins-title" className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
        <Reveal className="rounded-3xl border border-violet/40 bg-panel p-6 md:p-10">
          <Note>Achievements</Note>
          <h2 id="wins-title" className="h-section mt-1">
            Proof you can check.
          </h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {feed
              .filter((p) => p.achievement)
              .map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/feed#${p.id}`}
                    className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-line bg-raise p-4 transition hover:-translate-y-0.5 hover:border-violet-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span>
                      <span className="block font-semibold">{p.achievement}</span>
                      <span className="block text-sm text-soft">{p.date}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-violet-light transition group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
          <Link to="/feed" className="btn-primary mt-6">
            See the full feed <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-5 pt-14 md:pt-24">
        <SectionHead eyebrow="Watch" title="Ten seconds per project." intro="Pick one. Each tour runs for ten seconds." />
        <Tours />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <SectionHead
          eyebrow="Selected work"
          title="Products people actually use."
          intro="Each one started with a problem I could describe, and ended as something live."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
        <Reveal className="mt-8">
          <Link to="/work" className="inline-flex items-center gap-2 font-semibold text-cream hover:underline">
            All work, with its status <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24" aria-labelledby="eng-title">
        <SectionHead
          eyebrow="Engineering and maths"
          title="I design on paper before anything is built."
          intro="A poultry house designed in 3D and tested against a heat wave (concept stage, not built), and a rocking crib designed around an ESP32 and built as a wooden prototype."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {[...(findProject("egg-farm-design")?.gallery ?? []).filter((_, i) => i !== 1), ...(findProject("smart-rocking-crib")?.gallery ?? []).slice(0, 2)].map((g) => (
            <Reveal key={g.src}>
              <figure className="h-full overflow-hidden rounded-2xl border border-line bg-white">
                <img src={g.src} alt={g.alt} loading="lazy" className={g.crop ? "aspect-[1.88] w-full object-cover" : "w-full"} />
                <figcaption className="border-t border-line bg-panel p-4 text-sm text-soft">{g.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <div id="eng-title" className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <ul className="flex flex-wrap gap-2 text-sm text-soft">
            {["Dimensioning and cut lists", "Thermal simulation", "Sizing from stated rules", "Calculus and constraints"].map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1">{t}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Link to="/work/smart-rocking-crib" className="inline-flex items-center gap-2 font-semibold text-cream hover:underline">
              The rocking crib <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/work/egg-farm-design" className="inline-flex items-center gap-2 font-semibold text-cream hover:underline">
              The egg farm design <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <SectionHead
          eyebrow="The notebook"
          title="How I study, drawn out."
          intro="Concepts from my own projects and learning, sketched the way I work through them. Simulation figures are labelled as simulation; the dashboard data is illustrative."
        />
        <NotesBoard />
      </section>

      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <SectionHead eyebrow="How I think" title="Understand it. Reproduce it. Then fix it." />
          <div className="grid gap-6 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-line bg-white/[0.03] p-7">
                  <span className="font-mono text-sm text-violet-light">0{i + 1}</span>
                  <h3 className="mt-2 text-xl font-bold">{p.title}</h3>
                  <p className="mt-3 text-soft">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <SectionHead eyebrow="Find your way in" title="Where would you like to start?" />
        <div className="grid gap-4 md:grid-cols-2">
          {paths.map(({ to, Icon, who, text, cta }, i) => (
            <Reveal key={to} delay={i * 0.06}>
              <Link to={to} className="group flex h-full gap-5 rounded-3xl border border-line bg-panel p-6 transition hover:border-violet-light/60">
                <Icon className="mt-1 h-7 w-7 shrink-0 text-violet-light" />
                <div>
                  <h3 className="text-xl font-bold">{who}</h3>
                  <p className="mt-1 text-soft">{text}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cream">
                    {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24">
        <Reveal className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-violet to-[#3b1d99] p-10 text-center md:p-16">
          <h2 className="text-3xl font-bold md:text-5xl">Have a problem that deserves better software?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Tell me what is slowing you down. I will tell you honestly whether and how I can help.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-8 py-3 font-semibold text-ink transition hover:bg-white">
            Start a conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
