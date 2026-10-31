import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/portfolio/PageHeader";
import { services } from "@/data/site";

const Services = () => (
  <>
    <PageHeader
      eyebrow="Work with me"
      title="Services"
      intro="Practical software for small businesses and teams, built to be simple for the people who use it every day."
    />
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {services.map((s) => (
          <div key={s.title} className="p-8 bg-white border border-portfolio-border rounded-2xl hover:border-portfolio-accent/50 transition-colors">
            <h2 className="text-xl font-bold mb-3">{s.title}</h2>
            <p className="text-slate-600 mb-5">{s.text}</p>
            <ul className="space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-portfolio-accent shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-center mt-14">
        <p className="text-slate-600 mb-4">Have a project in mind? Tell me what you need.</p>
        <Button asChild className="bg-portfolio-accent hover:bg-portfolio-accent/90 text-white rounded-xl px-8 py-5">
          <Link to="/contact">Start a conversation</Link>
        </Button>
      </div>
    </section>
  </>
);

export default Services;
