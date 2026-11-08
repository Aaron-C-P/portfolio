import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Github, Linkedin, Mail, MessageCircle, Phone, Share2 } from "lucide-react";
import { brand, profilePhoto } from "@/data/studio";
import { offers } from "@/data/studentHelp";
import { saveContact, whatsapp } from "@/lib/contact";
import { usePageTitle } from "@/components/studio/parts";

const business = ["Websites and web apps", "Ordering and request systems", "Dashboards and reporting", "Database design"];

const Card = () => {
  usePageTitle("Digital card");
  const [note, setNote] = useState("");

  const share = async () => {
    const data = { title: `${brand.name} | ${brand.studio}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setNote("Link copied");
      }
    } catch {
      /* share dismissed */
    }
  };

  const action = "flex items-center justify-center gap-2 rounded-2xl border border-line bg-panel px-4 py-3 text-sm font-medium transition hover:border-violet-light";

  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-28">
      <div className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-xl">
        <div className="h-24 bg-gradient-to-br from-violet to-violet-light" />
        <div className="-mt-14 px-6 pb-8 text-center">
          <img
            src={profilePhoto}
            alt="Aaron Prince"
            className="mx-auto h-28 w-28 rounded-full border-4 border-panel object-cover object-[56%_22%]"
          />
          <h1 className="mt-4 text-3xl font-extrabold">{brand.name}</h1>
          <p className="font-hand text-2xl text-violet-light">Computer Science graduate, tutor and developer</p>
          <p className="mt-1 text-sm text-soft">{brand.location}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href={brand.phoneHref} className={action}>
              <Phone className="h-4 w-4 text-violet-light" aria-hidden="true" /> Call
            </a>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={action}>
              <MessageCircle className="h-4 w-4 text-violet-light" aria-hidden="true" /> WhatsApp
            </a>
            <a href={`mailto:${brand.email}`} className={action}>
              <Mail className="h-4 w-4 text-violet-light" aria-hidden="true" /> Email
            </a>
            <button type="button" onClick={saveContact} className={action}>
              <Download className="h-4 w-4 text-violet-light" aria-hidden="true" /> Save contact
            </button>
          </div>

          <section className="mt-8 text-left" aria-labelledby="card-help">
            <h2 id="card-help" className="font-hand text-3xl text-cream">
              Student help
            </h2>
            <ul className="mt-3 space-y-3">
              {offers.map(({ title, items }) => (
                <li key={title} className="rounded-2xl border border-line p-4">
                  <p className="font-bold">{title}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {items.map((t) => (
                      <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-soft">
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 text-left" aria-labelledby="card-biz">
            <h2 id="card-biz" className="font-hand text-3xl text-cream">
              Business and technology
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {business.map((b) => (
                <li key={b} className="rounded-full border border-line px-3 py-1 text-sm text-soft">
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link to="/services" className="text-violet-light underline underline-offset-4">
                See services
              </Link>
              <Link to="/work" className="text-violet-light underline underline-offset-4">
                See my work
              </Link>
              <Link to="/assignment-help" className="text-violet-light underline underline-offset-4">
                Student help and AI tutor
              </Link>
            </div>
          </section>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a href={brand.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-line p-3 text-violet-light transition hover:border-violet-light">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href={brand.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="rounded-full border border-line p-3 text-violet-light transition hover:border-violet-light">
              <Github className="h-5 w-5" />
            </a>
            <button type="button" onClick={share} aria-label="Share this card" className="rounded-full border border-line p-3 text-violet-light transition hover:border-violet-light">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 h-5 text-sm text-soft" role="status">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
