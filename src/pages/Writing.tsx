import { ArrowUpRight, Award } from "lucide-react";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { recognition, writing } from "@/data/site";

const Writing = () => (
  <>
    <PageHeader
      eyebrow="Writing"
      title="Writing & Recognition"
      intro="A self-published book, national press features and academic work."
    />
    <section className="py-16 px-6">
      <ul className="max-w-3xl mx-auto divide-y divide-portfolio-border border border-portfolio-border rounded-2xl overflow-hidden">
        {writing.map((w) => {
          const body = (
            <div className="flex items-start gap-4 p-5">
              <span className="text-sm font-mono text-slate-400 pt-0.5">{w.no}</span>
              <div className="flex-1">
                <h2 className="font-semibold">{w.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{w.meta}</p>
              </div>
              {w.href && <ArrowUpRight className="h-5 w-5 text-slate-400 shrink-0" />}
            </div>
          );
          return (
            <li key={w.no}>
              {w.href ? (
                <a href={w.href} target="_blank" rel="noopener noreferrer" className="block hover:bg-portfolio-card transition-colors">
                  {body}
                </a>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>

    <section className="pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="h-6 w-6 text-portfolio-accent" /> Recognition
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {recognition.map((r) => (
            <li key={r.text} className="p-4 bg-white border border-portfolio-border rounded-xl">
              <p className="text-sm font-medium">{r.text}</p>
              <p className="text-xs text-slate-500 mt-1">{r.sub}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </>
);

export default Writing;
