import { useEffect } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  documentTitle?: string;
}

export const PageHeader = ({ eyebrow, title, intro, documentTitle }: PageHeaderProps) => {
  useEffect(() => {
    document.title = `${documentTitle ?? title} | Aaron Prince`;
  }, [documentTitle, title]);

  return (
    <header className="pt-36 pb-12 px-6 text-center bg-gradient-to-b from-portfolio-card to-white">
      <div className="max-w-3xl mx-auto">
        <span className="text-portfolio-accent font-semibold mb-4 block uppercase tracking-wider text-sm">{eyebrow}</span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {intro && <p className="text-lg text-slate-600">{intro}</p>}
      </div>
    </header>
  );
};
