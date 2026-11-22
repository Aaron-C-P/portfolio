import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { AppTile, ResumeStudioIcon } from "@/components/studio/AppIcon";
import { Spider } from "@/components/studio/Spider";

const KEY = "whats-new-closed-v2";
const WEBBER_URL = "https://webber-beryl.vercel.app/";

const card = "group relative flex items-center gap-3 rounded-2xl border border-line bg-panel/95 p-2 pr-4 shadow-2xl shadow-violet/20 transition hover:border-violet-light";

/** Two floating, animated app cards on the landing page so visitors see right away that there are two apps. */
export const WhatsNew = () => {
  const calm = useReducedMotion();
  const [gone, setGone] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  if (gone) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private mode: it just shows again next visit */
    }
    setGone(true);
  };

  const float = calm ? undefined : { y: [0, -10, 0], rotate: [-1.2, 1.2, -1.2] };
  const T = (delay: number) => ({ duration: 3.4, repeat: Infinity, ease: "easeInOut" as const, delay });
  const ping = (tone: string) =>
    calm ? null : <span aria-hidden="true" className={`pointer-events-none absolute left-2 top-2 h-12 w-12 animate-ping rounded-[1.4rem] opacity-40 ${tone}`} />;

  return (
    <div className="fixed bottom-5 left-3 z-40 flex max-w-[calc(100vw-6rem)] flex-col items-start gap-3 sm:left-5" aria-label="What’s new: two apps">
      <div className="flex items-center gap-2 pl-1">
        <span className="rounded-full bg-fuchsia-500 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">2 new apps</span>
        <button onClick={dismiss} aria-label="Hide the new apps badge" className="rounded-full bg-panel/90 p-1 text-soft shadow hover:text-fg"><X className="h-3.5 w-3.5" /></button>
      </div>

      <motion.div animate={float} transition={T(0)}>
        <Link to="/resume-builder" className={card}>
          {ping("bg-violet")}
          <AppTile tone="violet" size="h-12 w-12"><ResumeStudioIcon className="h-7 w-7 text-white" /></AppTile>
          <span className="leading-tight">
            <span className="block text-base font-bold">Résumé Studio</span>
            <span className="block text-xs text-soft">Design it live in 3D</span>
          </span>
        </Link>
      </motion.div>

      <motion.div animate={float} transition={T(0.6)}>
        <a href={WEBBER_URL} target="_blank" rel="noopener noreferrer" className={card}>
          {ping("bg-amber-300")}
          <AppTile tone="amber" size="h-12 w-12"><Spider className="h-7 w-7" /></AppTile>
          <span className="leading-tight">
            <span className="block text-base font-bold">The Webber</span>
            <span className="block text-xs text-soft">A website in minutes</span>
          </span>
        </a>
      </motion.div>
    </div>
  );
};
