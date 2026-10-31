import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { findProject, services } from "@/data/studio";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const Services = () => {
  usePageTitle("Services");
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <SectionHead page
        eyebrow="Services"
        title="What a better system can do for your business."
        intro="I do not sell technology. I help you take orders cleanly, see what is happening and stop doing the same task by hand. Each service links to work I have actually done."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.slug} delay={Math.min(i * 0.05, 0.2)}>
            <section id={s.slug} className="flex h-full flex-col rounded-3xl border border-line bg-panel p-7">
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <p className="mt-3 text-lg text-fg/90">{s.promise}</p>
              <p className="mt-3 text-sm text-soft">
                <span className="font-semibold text-fg">Good for:</span> {s.forWhom}
              </p>
              <ul className="mt-5 space-y-2">
                {s.outcomes.map((o) => (
                  <li key={o} className="flex gap-2 text-soft">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-cream" />
                    {o}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-4">
                <p className="mb-2 font-hand text-xl text-violet-light">See it in action</p>
                <div className="flex flex-wrap gap-2">
                  {s.examples.map((slug) => {
                    const p = findProject(slug);
                    return p ? (
                      <Link key={slug} to={`/work/${slug}`} className="rounded-full border border-line px-3 py-1 text-sm text-soft transition hover:border-violet-light hover:text-cream">
                        {p.name}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            </section>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 rounded-3xl bg-gradient-to-br from-violet to-[#3b1d99] p-10 text-center">
        <h2 className="text-3xl font-bold">Not sure which one you need?</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/80">Describe the problem in your own words. We will work out the rest together.</p>
        <Link to="/contact" className="mt-6 inline-flex rounded-full bg-cream px-8 py-3 font-semibold text-ink hover:bg-white">
          Start a conversation
        </Link>
      </Reveal>
    </div>
  );
};

export default Services;
