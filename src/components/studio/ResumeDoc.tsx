import { useEffect, useRef, useState, type ReactNode } from "react";
import { resumeBlocks } from "@/lib/resumeFormat";
import { templateById } from "@/lib/resumeTemplates.js";
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
 * One page of the résumé in a template, matching the PDF (same blocks, fonts, sizes and spacing).
 * When `locked`, the body text is NOT in the page at all: it is drawn as grey bars, so copying or a screenshot
 * gets structure only. Names and section headings stay visible.
 */
export const ResumeDoc = ({ r, templateId, locked, id }: { r: Resume; templateId: string; locked: boolean; id?: string }) => {
  const t = templateById(templateId);
  const pt = (n: number) => `${n}pt`;
  const family = t.font === "times" ? '"Times New Roman", Times, serif' : "Helvetica, Arial, sans-serif";
  const align = (a: string) => (a === "center" ? ("center" as const) : ("left" as const));
  const bar = (key: number, len: number, indent = false) => (
    <div key={key} aria-hidden="true" className="rounded-full bg-black/15" style={{ height: pt(t.bodySize * 0.55), margin: `${pt(t.bodySize * 0.45)} 0`, marginLeft: indent ? pt(14) : 0, width: `${Math.min(96, 24 + len * 0.9)}%` }} />
  );
  return (
    <div id={id} onContextMenu={locked ? (e) => e.preventDefault() : undefined} className={`relative bg-white text-black ${locked ? "select-none" : ""}`} style={{ width: PAGE_W, minHeight: PAGE_H, padding: pt(54), fontFamily: family, boxSizing: "border-box" }}>
      {resumeBlocks(r).map((b, i) => {
        if (b.kind === "name") return <div key={i} style={{ fontSize: pt(t.nameSize), fontWeight: 700, textAlign: align(t.nameAlign), lineHeight: 1.15 }}>{b.text}</div>;
        if (b.kind === "heading") {
          return (
            <div key={i} style={{ marginTop: pt(t.gap), fontSize: pt(t.headingSize), fontWeight: 700, textAlign: align(t.headingAlign), color: t.headingColor === "accent" ? rgb(t.accent) : "#000", borderBottom: t.rule > 0 ? `${pt(t.rule)} solid ${t.headingColor === "accent" ? rgb(t.accent) : "#000"}` : "none", paddingBottom: pt(2), marginBottom: pt(5) }}>
              {b.text}
            </div>
          );
        }
        if (locked) return bar(i, b.text.length, b.kind === "bullet");
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
      })}
      {locked && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span style={{ transform: "rotate(-30deg)", fontSize: 72, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(0,0,0,0.12)" }} className="select-none">PREVIEW</span>
        </div>
      )}
    </div>
  );
};
