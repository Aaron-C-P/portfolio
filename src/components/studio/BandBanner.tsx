import { Link } from "react-router-dom";
import { ArrowRight, Music2 } from "lucide-react";
import { band } from "@/data/band";

/** Bold banner for the landing page that points to the /band page. */
export const BandBanner = () => (
  <section aria-label="The band" className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
    <Link to="/band" className="group relative block overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b0f3d] via-violet to-[#c026d3] p-8 text-white shadow-xl md:p-12">
      <Music2 className="absolute -right-6 -top-6 h-48 w-48 rotate-12 opacity-15" aria-hidden="true" />
      <p className="text-sm font-bold uppercase tracking-widest text-white/80">Live music</p>
      <h2 className="mt-2 text-4xl font-extrabold leading-tight md:text-6xl">{band.name}</h2>
      {band.genre && <p className="mt-2 text-xl font-semibold text-white/90">{band.genre}</p>}
      <p className="mt-3 max-w-xl text-lg text-white/85 md:text-xl">{band.nextShow ? `Next show: ${band.nextShow}` : band.pitch}</p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-lg font-bold text-ink transition group-hover:bg-cream">
        Book the band <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  </section>
);
