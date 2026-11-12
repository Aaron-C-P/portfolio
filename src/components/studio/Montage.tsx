import { Link } from "react-router-dom";
import avatar from "@/assets/portfolio/aaron-avatar.jpg";
import hero from "@/assets/portfolio/aaron-hero.png";
import graduation from "@/assets/portfolio/feed-graduation.webp";
import itda from "@/assets/portfolio/feed-itda-event.png";
import egzit from "@/assets/portfolio/egzit-mockup.png";
import bns from "@/assets/portfolio/bns-preorder.png";
import preq from "@/assets/portfolio/preq-app.png";
import egg from "@/assets/portfolio/egg-farm-3d.png";
import book from "@/assets/portfolio/book-gentle-architect.jpg";
import { quotes } from "@/data/quotes";

const frames = [
  { src: graduation, alt: "Aaron at graduation", to: "/journey", label: "Graduation" },
  { src: egzit, alt: "EGZIT moving marketplace on a phone", to: "/work/egzit", label: "EGZIT" },
  { src: hero, alt: "Aaron Prince", to: "/about", label: "About Aaron" },
  { src: bns, alt: "Staff lunch pre-order tool", to: "/work", label: "Lunch pre-order" },
  { src: itda, alt: "IT event Aaron took part in", to: "/feed", label: "IT event" },
  { src: preq, alt: "PreQ queue app", to: "/work", label: "PreQ" },
  { src: egg, alt: "3D model of an egg farm design", to: "/work/egg-farm-design", label: "Egg farm design" },
  { src: book, alt: "Aaron's book, The Gentle Architect", to: "/writing", label: "The book" },
  { src: avatar, alt: "Aaron smiling", to: "/about", label: "Hi" },
];

type Slide = { kind: "photo"; src: string; alt: string; to: string; label: string } | { kind: "quote"; text: string; by: string };

// One quote after every photo, so words and pictures alternate.
const slides: Slide[] = frames.flatMap((f, i): Slide[] => [{ kind: "photo", ...f }, ...(quotes[i % Math.max(quotes.length, 1)] ? [{ kind: "quote" as const, ...quotes[i % quotes.length] }] : [])]);

/** A slow, endless strip of photos and project screens. Pauses on hover and stands still for reduced motion. */
export const Montage = () => (
  <section aria-label="Montage of Aaron's work and life" className="pt-14 md:pt-24">
    <h2 className="mx-auto max-w-6xl px-5 text-3xl font-extrabold md:text-5xl">The work, the people, the words.</h2>
    <div className="group relative mt-6 overflow-hidden">
      <ul className="flex w-max gap-4 px-5 motion-safe:animate-[montage_110s_linear_infinite] motion-safe:group-hover:[animation-play-state:paused]">
        {[...slides, ...slides].map((f, i) => {
          const hidden = i >= slides.length;
          return (
            <li key={i} aria-hidden={hidden} className="shrink-0">
              {f.kind === "quote" ? (
                <figure className="flex h-56 w-72 flex-col justify-center rounded-3xl bg-gradient-to-br from-violet to-[#3b1d99] p-6 text-white md:h-72 md:w-96 md:p-8">
                  <blockquote className="text-xl font-bold leading-snug md:text-2xl">&ldquo;{f.text}&rdquo;</blockquote>
                  <figcaption className="mt-3 text-sm font-semibold text-white/80">{f.by}</figcaption>
                </figure>
              ) : (
                <Link to={f.to} tabIndex={hidden ? -1 : 0} className="relative block h-56 w-72 overflow-hidden rounded-3xl border border-line bg-panel md:h-72 md:w-96">
                  <img src={f.src} alt={hidden ? "" : f.alt} loading={i < 4 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">{f.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);
