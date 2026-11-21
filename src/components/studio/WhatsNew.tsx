import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { AppTile, ResumeStudioIcon } from "@/components/studio/AppIcon";
import { Spider } from "@/components/studio/Spider";

const KEY = "whats-new-closed-v1";
const WEBBER_URL = "https://webber-beryl.vercel.app/";

/** A small floating badge on the landing page: tap it to see the two new apps. Remembers if it was closed. */
export const WhatsNew = () => {
  const calm = useReducedMotion();
  const [gone, setGone] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  if (gone) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode: it just shows again next visit */
    }
    setGone(true);
  };

  return (
    <div className="fixed bottom-5 left-4 z-40 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="w-[min(18rem,calc(100vw-2rem))] rounded-3xl border border-line bg-panel p-4 shadow-2xl"
            role="dialog"
            aria-label="What’s new"
          >
            <div className="flex items-center justify-between">
              <p className="font-hand text-2xl text-violet-light">What’s new</p>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1 text-soft hover:text-fg"><X className="h-4 w-4" /></button>
            </div>
            <Link to="/resume-builder" className="mt-2 flex items-center gap-3 rounded-2xl p-2 transition hover:bg-raise">
              <AppTile tone="violet" size="h-12 w-12"><ResumeStudioIcon className="h-7 w-7 text-white" /></AppTile>
              <span><span className="block font-semibold">Résumé Studio</span><span className="block text-sm text-soft">Design an ATS-ready résumé live in 3D</span></span>
            </Link>
            <a href={WEBBER_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-raise">
              <AppTile tone="amber" size="h-12 w-12"><Spider className="h-7 w-7" /></AppTile>
              <span><span className="block font-semibold">The Webber</span><span className="block text-sm text-soft">Describe a business, get a website</span></span>
            </a>
            <button onClick={dismiss} className="mt-2 w-full text-center text-xs text-soft underline hover:text-fg">Don’t show this again</button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="What’s new: Résumé Studio and The Webber"
        animate={calm ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex items-center gap-2 rounded-full bg-violet py-2 pl-2 pr-4 text-sm font-semibold text-white shadow-xl shadow-violet/30"
      >
        <span className="flex -space-x-2">
          <AppTile tone="violet" size="h-8 w-8"><ResumeStudioIcon className="h-5 w-5 text-white" /></AppTile>
          <AppTile tone="amber" size="h-8 w-8"><Spider className="h-5 w-5" /></AppTile>
        </span>
        <span className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> What’s new</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-fuchsia-400 ring-2 ring-white" />
      </motion.button>
    </div>
  );
};
