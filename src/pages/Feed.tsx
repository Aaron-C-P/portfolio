import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Award } from "lucide-react";
import { feed } from "@/data/studio";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const Feed = () => {
  usePageTitle("Feed");
  const { hash } = useLocation();
  // Links such as /feed#ccna land on the matching post once the page has rendered.
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }), 450);
    return () => window.clearTimeout(t);
  }, [hash]);
  const [only, setOnly] = useState(false);
  const wins = feed.filter((p) => p.achievement);
  const shown = only ? wins : feed;

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light ${on ? "border-violet bg-violet text-white" : "border-line text-soft hover:border-violet-light hover:text-fg"}`;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32">
      <SectionHead
        page
        eyebrow="Feed"
        title="Milestones, achievements and moments."
        intro="Posts from my own LinkedIn activity, my published writing and community photos, newest first. Achievements are highlighted so you can see the proof quickly."
      />

      <Reveal className="rounded-3xl border border-violet/40 bg-panel p-5 md:p-6">
        <p className="flex items-center gap-2 font-hand text-2xl text-violet-light">
          <Award className="h-5 w-5" aria-hidden="true" /> Achievements at a glance
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {wins.map((p) => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="block rounded-2xl border border-line bg-raise p-3 transition hover:-translate-y-0.5 hover:border-violet-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="block text-sm font-semibold">{p.achievement}</span>
                <span className="block text-xs text-soft">{p.date}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-soft">
          Hiring? <Link to="/resume" className="font-semibold text-cream underline">Request my résumé</Link> or see the <Link to="/skills" className="font-semibold text-cream underline">skills with proof</Link>.
        </p>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter the feed">
        <button type="button" onClick={() => setOnly(false)} aria-pressed={!only} className={chip(!only)}>
          Everything ({feed.length})
        </button>
        <button type="button" onClick={() => setOnly(true)} aria-pressed={only} className={chip(only)}>
          Achievements only ({wins.length})
        </button>
      </div>

      <div className="mt-6 space-y-8">
        {shown.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.05, 0.15)}>
            <article id={p.id} className={`scroll-mt-28 overflow-hidden rounded-3xl border bg-panel ${p.achievement ? "border-violet/50 shadow-lg shadow-violet/10" : "border-line"}`}>
              {p.achievement && (
                <p className="flex items-center gap-2 bg-violet px-5 py-2 text-sm font-semibold text-white">
                  <Award className="h-4 w-4" aria-hidden="true" /> Achievement: {p.achievement}
                </p>
              )}
              {p.image && <img src={p.image} alt={p.imageAlt} className="w-full" loading="lazy" />}
              <div className="p-6">
                <p className="font-mono text-xs text-soft">
                  {p.source} · {p.date}
                </p>
                <p className="mt-2 text-lg">{p.text}</p>
                {p.note && <p className="mt-2 text-sm text-soft">{p.note}</p>}
                {p.href && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cream hover:underline">
                    {p.href.includes("linkedin") ? "View on LinkedIn" : "Read the original"} <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

export default Feed;
