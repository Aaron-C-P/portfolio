import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Layers, ScanText, Shuffle } from "lucide-react";
import { ResumeDoc } from "@/components/studio/ResumeDoc";
import { resumeBlocks } from "@/lib/resumeFormat";
import { templateById } from "@/lib/resumeTemplates.js";
import type { Resume } from "@/lib/resumeEngine";

const PAGE_W = 816;
const PAGE_H = 1056;

/** What an applicant tracking system reads: the words, in order. Locked previews show structure only, never the text. */
const AtsReading = ({ r, locked }: { r: Resume; locked: boolean }) => (
  <div className="h-full w-full overflow-hidden rounded-sm bg-[#07111f]/95 p-[54pt] font-mono text-emerald-300" style={{ fontSize: "10pt", lineHeight: 1.45 }}>
    <div className="mb-3 text-[9pt] uppercase tracking-widest text-emerald-500">ATS reading order{locked ? " (text hidden until you unlock)" : ""}</div>
    {resumeBlocks(r).map((b, i) => {
      const plain = b.kind === "name" || b.kind === "heading";
      const text = !locked || plain ? b.text : "█".repeat(Math.min(48, Math.max(8, Math.round(b.text.length * 0.8))));
      return <div key={i} className={b.kind === "heading" ? "mt-3 font-bold text-emerald-200" : b.kind === "name" ? "font-bold text-emerald-100" : ""}>{b.kind === "bullet" ? "- " : ""}{text}{b.aside && !locked ? `   ${b.aside}` : ""}</div>;
    })}
  </div>
);

/**
 * A live, interactive 3D résumé. The page is built from three real layers floating at different depths:
 * the generated ART at the back, the TEXT on top of it, and an optional ATS X-ray plane showing exactly what a
 * tracking system reads. Move the pointer to tilt it; "Explode" pulls the layers apart so you can see the idea:
 * the art is decoration, the text is the product. Everything is CSS 3D, no WebGL, so it works on any phone.
 */
export const Stage3D = ({ r, templateId, variant, locked, onRemix, id }: { r: Resume; templateId: string; variant: number; locked: boolean; onRemix?: (dir?: 1 | -1) => void; id?: string }) => {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [explode, setExplode] = useState(false);
  const [xray, setXray] = useState(false);
  const rx = useSpring(useMotionValue(0), { stiffness: 90, damping: 14 });
  const ry = useSpring(useMotionValue(0), { stiffness: 90, damping: 14 });
  const t = templateById(templateId);
  const textRef = useRef<HTMLDivElement>(null);
  const [pageH, setPageH] = useState(PAGE_H); // grows by whole pages when the résumé runs onto a second page
  const pages = Math.round(pageH / PAGE_H);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setPageH(Math.max(PAGE_H, Math.ceil(el.offsetHeight / PAGE_H) * PAGE_H));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setScale(Math.min(0.9, el.clientWidth / PAGE_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const aim = (e: React.PointerEvent) => {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - b.left) / b.width - 0.5) * 34);
    rx.set(-((e.clientY - b.top) / b.height - 0.5) * 22);
  };
  const rest = () => {
    rx.set(0);
    ry.set(0);
  };

  // Exploded layers are fanned out (art down-left, text centre, ATS plane up-right and smaller) so each stays visible.
  const z = explode
    ? { art: "translate3d(-90px,70px,-160px)", text: "translate3d(0,0,40px)", ats: "translate3d(110px,-60px,200px) scale(.72)" }
    : { art: "translateZ(0)", text: "translateZ(6px)", ats: "translateZ(40px)" };
  const layer = (tf: string) => ({ position: "absolute" as const, inset: 0, transform: tf, transformOrigin: "top center", transition: reduce ? "none" : "transform .7s cubic-bezier(.2,.8,.2,1), opacity .4s" });

  return (
    <div>
      <div ref={box} id={id} onPointerMove={aim} onPointerLeave={rest} className="relative mx-auto w-full max-w-[560px] select-none" style={{ perspective: 1500, height: pageH * scale + 30, touchAction: "pan-y" }} aria-label={`Live 3D preview of the ${t.name} template. Move the pointer to tilt it.`} role="img">
        <div aria-hidden="true" className="absolute inset-x-8 bottom-0 h-6 rounded-[50%] bg-black/40 blur-xl" />
        <motion.div style={{ position: "relative", width: PAGE_W, height: pageH, rotateX: rx, rotateY: ry, scale, transformStyle: "preserve-3d", transformOrigin: "top center", marginLeft: "50%", x: "-50%" }} className={reduce ? "" : "rs-float"}>
          <div style={{ ...layer(z.art), boxShadow: "0 30px 60px rgba(0,0,0,.35)" }}>
            <motion.div key={`${templateId}-${variant}`} initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: 22, scale: 0.96 }} animate={{ opacity: 1, rotateY: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }} style={{ position: "absolute", inset: 0, transformOrigin: "left center" }}><ResumeDoc r={r} templateId={templateId} variant={variant} locked={locked} layer="art" minH={pageH} /></motion.div>
            {Array.from({ length: pages - 1 }, (_, k) => (
              <div key={k} aria-hidden="true" className="absolute inset-x-0 border-t-2 border-dashed border-black/25" style={{ top: PAGE_H * (k + 1) }}>
                <span className="absolute right-3 top-1 text-[22px] font-semibold text-black/40">Page {k + 2} starts about here</span>
              </div>
            ))}
          </div>
          <div ref={textRef} style={{ ...layer(z.text), inset: "auto", top: 0, left: 0, width: PAGE_W }}><ResumeDoc id="resume-preview" r={r} templateId={templateId} variant={variant} locked={locked} layer="text" minH={PAGE_H} /></div>
          <div style={{ ...layer(z.ats), opacity: xray ? 1 : 0, pointerEvents: "none" }}><AtsReading r={r} locked={locked} /></div>
        </motion.div>
        {explode && (
          <ul aria-hidden="true" className="pointer-events-none absolute right-0 top-4 space-y-12 text-right text-[11px] font-semibold">
            {xray && <li className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">3 · What an ATS reads</li>}
            <li className="rounded-full bg-violet/30 px-3 py-1 text-cream">2 · Your words</li>
            <li className="rounded-full bg-white/10 px-3 py-1 text-soft">1 · Generated art (decoration)</li>
          </ul>
        )}
      </div>
      <style>{`@keyframes rsfloat{0%,100%{translate:0 0}50%{translate:0 -8px}}.rs-float{animation:rsfloat 6s ease-in-out infinite}`}</style>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setExplode((v) => !v)} aria-pressed={explode} className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm ${explode ? "border-violet-light bg-violet/30 text-cream" : "border-line text-soft hover:text-fg"}`}><Layers className="h-4 w-4" /> Explode layers</button>
        <button type="button" onClick={() => setXray((v) => !v)} aria-pressed={xray} className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm ${xray ? "border-emerald-300 bg-emerald-400/15 text-emerald-100" : "border-line text-soft hover:text-fg"}`}><ScanText className="h-4 w-4" /> ATS X-ray</button>
        {onRemix && (
          <span className="inline-flex items-center gap-1">
            <button type="button" onClick={() => onRemix(-1)} aria-label="Previous remix" className="rounded-full border border-line px-3 py-1.5 text-sm text-soft hover:text-fg">‹</button>
            <button type="button" onClick={() => onRemix(1)} className="inline-flex items-center gap-1.5 rounded-full border border-violet-light bg-violet/20 px-4 py-1.5 text-sm text-cream hover:bg-violet/30"><Shuffle className="h-4 w-4" /> Remix the art <span className="font-mono text-xs text-soft">#{variant + 1}</span></button>
            <button type="button" onClick={() => onRemix(1)} aria-label="Next remix" className="rounded-full border border-line px-3 py-1.5 text-sm text-soft hover:text-fg">›</button>
          </span>
        )}
      </div>
    </div>
  );
};
