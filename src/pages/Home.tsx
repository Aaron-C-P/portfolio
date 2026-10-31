import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Store, Code2, BarChart3 } from "lucide-react";
import { brand, profilePhoto, projects, principles } from "@/data/studio";
import { Note, ProjectCard, Reveal, SectionHead, Underlined, usePageTitle } from "@/components/studio/parts";

const proof = [
  { value: "2", label: "live business applications" },
  { value: "500", label: "automated tests on the cake platform" },
  { value: "5", label: "pieces in national newspapers" },
  { value: "2026", label: "Computer Science graduate" },
];

const paths = [
  { to: "/journey", Icon: Compass, who: "Hiring or recruiting?", text: "Follow how I went from lab exercises to live business systems.", cta: "Read the journey" },
  { to: "/services", Icon: Store, who: "Run a business?", text: "See what a better ordering or request system could do for you.", cta: "See services" },
  { to: "/work/chef-hudsons-christmas-cakes", Icon: Code2, who: "Developer?", text: "A concurrency bug, a simulation, and idempotency keys.", cta: "Read the case study" },
  { to: "/work/errands", Icon: BarChart3, who: "Care about data?", text: "How a delivery service models orders, trips and prices.", cta: "Explore the data" },
];

const Home = () => {
  usePageTitle();
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 -z-10">
          <img src={profilePhoto} alt="" className="h-full w-full object-cover object-top opacity-60 md:ml-auto md:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-transparent md:via-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:pt-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <Note className="text-3xl">Hi, I'm Aaron.</Note>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
              I turn real problems into <Underlined>working software</Underlined>.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-soft md:text-xl">
              Ordering systems, business applications and data tools, built for real businesses in Jamaica, and explained in plain language.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/work" className="btn-primary">
                See the work <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Start a conversation
              </Link>
            </div>
            <p className="mt-6 font-hand text-2xl text-cream/90">{brand.tagline}</p>
          </motion.div>
        </div>
      </section>

      <section aria-label="At a glance" className="mx-auto -mt-2 max-w-6xl px-5">
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label} className="glass rounded-2xl p-5">
              <dt className="sr-only">{p.label}</dt>
              <dd className="text-4xl font-extrabold text-cream">{p.value}</dd>
              <p className="mt-1 text-sm text-soft">{p.label}</p>
            </div>
          ))}
        </dl>
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
