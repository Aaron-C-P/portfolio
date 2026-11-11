import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";
import { services } from "@/data/studio";
import { packages } from "@/data/pay";
import { whatsappAbout } from "@/lib/contact";
import { Reveal } from "@/components/studio/parts";

/** Bold services block for the landing page: what you can buy, and a one-tap way to ask for a quote. */
export const ServicesShowcase = () => (
  <section id="services" aria-labelledby="svc-title" className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
    <Reveal className="rounded-[2rem] border-2 border-violet-light/60 bg-panel p-6 shadow-xl md:p-12">
      <p className="text-sm font-bold uppercase tracking-widest text-violet-light">Services</p>
      <h2 id="svc-title" className="mt-2 text-4xl font-extrabold leading-tight md:text-6xl">
        Need something built? <span className="text-cream">Get a quote in 24 hours.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-soft md:text-xl">Tell me the problem. You get a clear scope and price, not a surprise bill.</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {services.map((s) => (
          <li key={s.slug}>
            <Link to={`/services#${s.slug}`} className="inline-block rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-violet-light">
              {s.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {packages.map((p) => (
          <div key={p.name} className="flex flex-col rounded-3xl bg-white/5 p-6">
            <h3 className="text-2xl font-extrabold">{p.name}</h3>
            <p className="mt-2 text-soft">{p.scope}</p>
            <Link to={`/contact?package=${encodeURIComponent(p.name)}`} className="btn-primary mt-auto justify-center !py-3 text-base">
              Get a quote <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/book" className="inline-flex items-center gap-2 rounded-full bg-cream px-8 py-4 text-lg font-bold text-ink hover:bg-white">
          <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Book a free call
        </Link>
        <a href={whatsappAbout("a quote")} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-8 !py-4 text-lg">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp me
        </a>
        <Link to="/services" className="btn-ghost !px-8 !py-4 text-lg">
          All services
        </Link>
      </div>
    </Reveal>
  </section>
);
