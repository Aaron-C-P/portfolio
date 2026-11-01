import { useState } from "react";
import { motion } from "framer-motion";
import bookWrap from "@/assets/portfolio/book-gentle-architect.jpg";

/** The supplied artwork is a full wrap (back, spine, front). The front cover is the right-hand 2:3 panel. */
export const FrontCover = ({ className = "" }: { className?: string }) => (
  <div className={`relative aspect-[2/3] overflow-hidden rounded-md shadow-xl shadow-black/30 ring-1 ring-line ${className}`}>
    <img
      src={bookWrap}
      alt="Front cover of Gentle Architect: The Lonely Build by Aaron Prince, with a house under construction on blueprints"
      className="absolute top-0 h-full max-w-none"
      style={{ width: "209.2%", left: "-109.2%" }}
    />
  </div>
);

/** Front cover that turns over to show the back cover and spine. */
export const BookShowcase = ({ href }: { href?: string | null }) => {
  const [wrap, setWrap] = useState(false);
  return (
    <div className="grid items-center gap-6 rounded-3xl border border-line bg-panel p-5 md:grid-cols-[220px_1fr] md:p-8">
      <motion.div whileHover={{ rotate: -1.5, y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="mx-auto w-44 md:w-full">
        <FrontCover />
      </motion.div>
      <div>
        <p className="font-hand text-2xl text-violet-light">My book</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">Gentle Architect: The Lonely Build</h2>
        <p className="mt-1 text-sm text-soft">Memoir and personal growth · Self-published · On becoming the architect of your own life</p>
        <p className="mt-3 text-soft">
          Reflections that began as quiet notes to myself: ambition, faith and becoming, written by someone who spends the day debugging code and the night drafting chapters.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Find the book
            </a>
          )}
          <button type="button" onClick={() => setWrap(!wrap)} aria-expanded={wrap} className="btn-ghost">
            {wrap ? "Hide the full cover" : "See the back cover and spine"}
          </button>
        </div>
      </div>
      {wrap && (
        <motion.img
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          src={bookWrap}
          alt="Full cover of Gentle Architect: back cover with the author biography, the spine and the front cover"
          className="w-full rounded-xl border border-line md:col-span-2"
        />
      )}
    </div>
  );
};
