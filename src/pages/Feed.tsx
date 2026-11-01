import { ArrowUpRight } from "lucide-react";
import { feed } from "@/data/studio";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";

const Feed = () => {
  usePageTitle("Feed");
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-32">
      <SectionHead page eyebrow="Feed" title="Milestones and moments." intro="Posts from my own LinkedIn activity and community photos, newest first." />
      <div className="space-y-8">
        {feed.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i * 0.05, 0.15)}>
            <article className="overflow-hidden rounded-3xl border border-line bg-panel">
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
