import { Link } from "react-router-dom";
import { CalendarCheck, Check, ExternalLink, MessageCircle, Music2 } from "lucide-react";
import { band } from "@/data/band";
import { whatsappAbout } from "@/lib/contact";
import { usePageTitle } from "@/components/studio/parts";

const Band = () => {
  usePageTitle(band.name);
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1b0f3d] via-violet to-[#c026d3] p-8 text-white shadow-xl md:p-14">
        <Music2 className="absolute -right-8 -top-8 h-64 w-64 rotate-12 opacity-15" aria-hidden="true" />
        <p className="text-sm font-bold uppercase tracking-widest text-white/80">Live music</p>
        <h1 className="mt-2 text-5xl font-extrabold leading-[1.05] md:text-7xl">{band.name}</h1>
        {band.genre && <p className="mt-3 text-2xl font-semibold text-white/90">{band.genre}</p>}
        <p className="mt-4 max-w-xl text-xl text-white/85">{band.pitch}</p>
        {band.nextShow && <p className="mt-5 inline-block rounded-full bg-white/15 px-5 py-2 text-lg font-bold">Next show: {band.nextShow}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/book?topic=Band%20booking" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-ink hover:bg-cream">
            <CalendarCheck className="h-5 w-5" aria-hidden="true" /> Book the band
          </Link>
          <a href={whatsappAbout("booking the band")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-4 text-lg font-bold hover:bg-white/10">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel p-6">
          <h2 className="text-2xl font-extrabold">Great for</h2>
          <ul className="mt-3 space-y-2">
            {band.goodFor.map((g) => (
              <li key={g} className="flex gap-2 text-soft">
                <Check className="mt-1 h-4 w-4 shrink-0 text-cream" aria-hidden="true" /> {g}
              </li>
            ))}
          </ul>
        </div>
        {band.members.length > 0 && (
          <div className="rounded-3xl border border-line bg-panel p-6">
            <h2 className="text-2xl font-extrabold">The band</h2>
            <ul className="mt-3 space-y-2">
              {band.members.map((m) => (
                <li key={m.name} className="text-soft">
                  <span className="font-semibold text-fg">{m.name}</span>, {m.role}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {band.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {band.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> {l.label}
            </a>
          ))}
        </div>
      )}
      <p className="mt-8 text-sm text-soft">Tell me the date, place and kind of event. I reply with availability and a quote, usually within a day.</p>
    </div>
  );
};

export default Band;
