import { ArrowUpRight } from "lucide-react";
import { press } from "@/data/studio";
import { Reveal, SectionHead, usePageTitle } from "@/components/studio/parts";
import { BookShowcase } from "@/components/studio/BookCover";

const Writing = () => {
  usePageTitle("Writing");
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32">
      <SectionHead page eyebrow="Writing" title="Engineering is clearer when you can explain it." intro="A book, national newspaper pieces and a peer-reviewed international journal paper." />
      <Reveal className="mb-8">
        <BookShowcase href={press.find((p) => p.no === "001")?.href} />
      </Reveal>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-panel">
        {press.map((w, i) => {
          const body = (
            <div className="flex flex-wrap items-start gap-4 p-5 sm:flex-nowrap md:p-6">
              <span className="pt-1 font-mono text-sm text-soft">{w.no}</span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold md:text-xl">{w.title}</h2>
                <p className="mt-1 text-sm text-soft">{w.meta}</p>
              </div>
              {w.shot && (
                <img
                  src={w.shot}
                  alt={`Screenshot of the published article: ${w.title}`}
                  loading="lazy"
                  className="order-last aspect-[16/9] w-full shrink-0 rounded-lg border border-line object-cover object-top sm:order-none sm:aspect-auto sm:h-24 sm:w-36"
                />
              )}
              {w.href && <ArrowUpRight className="h-5 w-5 shrink-0 text-soft" />}
            </div>
          );
          return (
            <li key={w.no}>
              <Reveal delay={Math.min(i * 0.04, 0.2)}>
                {w.href ? (
                  <a href={w.href} target="_blank" rel="noopener noreferrer" className="block transition hover:bg-white/5">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Writing;
