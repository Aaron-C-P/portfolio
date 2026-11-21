import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { resumeBlocks } from "@/lib/resumeFormat";
import { templateById } from "@/lib/resumeTemplates.js";
import { artFor, PAGE_H as PT_H, PAGE_W as PT_W } from "@/lib/resumeArt.js";
import type { Resume } from "@/lib/resumeEngine";

const PAGE_W = 816; // US Letter at 96 dpi (612 pt), the page the PDF is drawn on
const PAGE_H = 1056;
const rgb = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Scales a full-size page to fit the space it is in, so the same preview works on a phone and in a gallery card. */
export const Fit = ({ children }: { children: ReactNode }) => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / PAGE_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="w-full" style={{ height: PAGE_H * scale }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
};

/**
 * One page of the résumé in a template, matching the PDF (same blocks, fonts, sizes, spacing and generated art).
 * The art is SVG drawn from the same shapes the PDF uses, behind the text. When `locked`, the body text is NOT in the
 * page at all: it is drawn as grey bars, so copying or a screenshot gets structure only. Names and headings stay.
 */
export const ResumeDoc = ({ r, templateId, locked, id, variant = 0, layer = "all" }: { r: Resume; templateId: string; locked: boolean; id?: string; variant?: number; layer?: "all" | "art" | "text" }) => {
  const t = templateById(templateId);
  const shapes = useMemo(() => (layer === "text" ? [] : artFor(t, r.name, variant)), [t, r.name, variant, layer]);
  const pt = (n: number) => `${n}pt`;
  const family = t.font === "times" ? '"Times New Roman", Times, serif' : "Helvetica, Arial, sans-serif";
  const align = (a: string) => (a === "center" ? ("center" as const) : ("left" as const));
  const blocks = resumeBlocks(r);
  const firstHeading = blocks.findIndex((b) => b.kind === "heading");
  const headerEnd = t.band && firstHeading > 0 ? firstHeading : 0; // blocks printed in white on the band

  const bar = (key: number, len: number, indent = false, onDark = false) => (
    <div key={key} aria-hidden="true" className={`rounded-full ${onDark ? "bg-white/25" : "bg-black/15"}`} style={{ height: pt(t.bodySize * 0.55), margin: `${pt(t.bodySize * 0.45)} 0`, marginLeft: indent ? pt(14) : 0, width: `${Math.min(96, 24 + len * 0.9)}%` }} />
  );

  const one = (b: (typeof blocks)[number], i: number, onDark: boolean) => {
    if (b.kind === "name") return <div key={i} style={{ fontSize: pt(t.nameSize), fontWeight: 700, textAlign: align(t.nameAlign), lineHeight: 1.15 }}>{b.text}</div>;
    if (b.kind === "heading") {
      return (
        <div key={i} style={{ marginTop: pt(t.gap), fontSize: pt(t.headingSize), fontWeight: 700, textAlign: align(t.headingAlign), color: t.headingColor === "accent" ? rgb(t.accent) : "#000", borderBottom: t.rule > 0 ? `${pt(t.rule)} solid ${t.headingColor === "accent" ? rgb(t.accent) : "#000"}` : "none", paddingBottom: pt(2), marginBottom: pt(5) }}>
          {b.text}
        </div>
      );
    }
    if (locked) return bar(i, b.text.length, b.kind === "bullet", onDark);
    if (b.kind === "title") return <div key={i} style={{ fontSize: pt(t.titleSize), textAlign: align(t.nameAlign) }}>{b.text}</div>;
    if (b.kind === "contact") return <div key={i} style={{ fontSize: pt(t.bodySize - 0.5), textAlign: align(t.nameAlign), marginTop: pt(2) }}>{b.text}</div>;
    if (b.kind === "role") {
      return (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: pt(5), fontSize: pt(t.bodySize), fontWeight: 700 }}>
          <span>{b.text}</span>
          {b.aside && <span style={{ fontWeight: 400, flexShrink: 0 }}>{b.aside}</span>}
        </div>
      );
    }
    if (b.kind === "bullet") return <div key={i} style={{ fontSize: pt(t.bodySize), paddingLeft: pt(14), textIndent: pt(-11), marginTop: pt(t.lineGap / 2) }}>{t.bullet} {b.text}</div>;
    return <div key={i} style={{ fontSize: pt(t.bodySize), marginTop: pt(t.lineGap / 2) }}>{b.text}</div>;
  };

  return (
    <div id={id} onContextMenu={locked ? (e) => e.preventDefault() : undefined} className={`relative overflow-hidden text-black ${layer === "text" ? "" : "bg-white"} ${locked ? "select-none" : ""}`} style={{ width: PAGE_W, minHeight: PAGE_H, padding: pt(t.band ? 44 : 54), paddingBottom: pt(54), paddingLeft: pt(54), paddingRight: pt(54), fontFamily: family, boxSizing: "border-box" }}>
      {shapes.length > 0 && (
        <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${PT_W} ${PT_H}`} width={PAGE_W} height={PAGE_H} className="pointer-events-none absolute left-0 top-0">
          {shapes.map((s, i) => {
            const fill = s.fill ? rgb(s.c) : "none";
            const stroke = s.fill ? "none" : rgb(s.c);
            if (s.k === "circle") return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={fill} stroke={stroke} strokeWidth={s.w} />;
            const pts = s.pts as number[];
            const p = pts.reduce<string[]>((a, v, j) => (j % 2 ? ((a[a.length - 1] += `,${v}`), a) : [...a, `${v}`]), []).join(" ");
            return s.fill ? <polygon key={i} points={p} fill={fill} /> : <polyline key={i} points={p} fill="none" stroke={stroke} strokeWidth={s.w} />;
          })}
        </svg>
      )}
      <div className="relative" style={layer === "art" ? { visibility: "hidden" } : undefined}>
        {headerEnd > 0 ? (
          <div style={{ color: "#fff", minHeight: pt(t.bandH - 44 - t.gap + 4) }}>{blocks.slice(0, headerEnd).map((b, i) => one(b, i, true))}</div>
        ) : null}
        {blocks.slice(headerEnd).map((b, i) => one(b, i + headerEnd, false))}
      </div>
      {locked && layer !== "art" && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span style={{ transform: "rotate(-30deg)", fontSize: 72, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(0,0,0,0.12)" }} className="select-none">PREVIEW</span>
        </div>
      )}
    </div>
  );
};
