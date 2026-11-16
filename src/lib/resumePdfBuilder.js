// Draws the ATS résumé as a real text PDF in the chosen template. Runs on the server only (api/resume-pdf.js),
// after a paid code is verified, so the PDF cannot be produced from the browser without paying. jsPDF draws text
// with a standard built-in font, so every word stays selectable and readable by an applicant tracking system.
import { resumeBlocks } from "./resumeBlocks.js";
import { templateById } from "./resumeTemplates.js";
import { artFor } from "./resumeArt.js";

export function buildResumePdf(jsPDF, r, templateId = "classic", compress = true) {
  const t = templateById(templateId);
  const doc = new jsPDF({ unit: "pt", format: "letter", compress });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 54; // 0.75 inch margins
  const maxW = W - M * 2;
  let y = M;

  // The art is vector shapes only (no images), drawn first so the text sits on top of it.
  const art = artFor(t, r.name);
  const paint = (shapes) => {
    for (const s of shapes) {
      const style = s.fill ? "F" : "S";
      if (s.fill) doc.setFillColor(...s.c);
      else {
        doc.setDrawColor(...s.c);
        doc.setLineWidth(s.w || 1);
      }
      if (s.k === "circle") doc.circle(s.x, s.y, s.r, style);
      else {
        const rel = [];
        for (let i = 2; i < s.pts.length; i += 2) rel.push([s.pts[i] - s.pts[i - 2], s.pts[i + 1] - s.pts[i - 1]]);
        doc.lines(rel, s.pts[0], s.pts[1], [1, 1], style, !!s.fill);
      }
    }
  };
  paint(art);
  let inBand = t.band; // header text is white while we are on the dark band
  if (t.band) y = 44;

  const ensure = (need) => {
    if (y + need > H - M) {
      doc.addPage();
      paint(art.filter((s) => s.edge));
      y = M;
    }
  };
  const font = (style, size) => {
    doc.setFont(t.font, style);
    doc.setFontSize(size);
  };
  const black = () => (inBand ? doc.setTextColor(255, 255, 255) : doc.setTextColor(0, 0, 0));
  const accent = () => doc.setTextColor(...t.accent);
  const put = (text, x, yy, align) => doc.text(text, align === "center" ? W / 2 : x, yy, align === "center" ? { align: "center" } : undefined);

  doc.setProperties({ title: `${r.name || "Resume"} - Resume`, author: r.name || undefined, subject: "Resume", creator: "Resume Studio" });
  black();

  for (const b of resumeBlocks(r)) {
    if (b.kind === "name") {
      font("bold", t.nameSize);
      ensure(t.nameSize + 8);
      black();
      put(b.text, M, (y += t.nameSize), t.nameAlign);
      y += 4;
    } else if (b.kind === "title") {
      font("normal", t.titleSize);
      ensure(t.titleSize + 4);
      black();
      put(b.text, M, (y += t.titleSize), t.nameAlign);
      y += 3;
    } else if (b.kind === "contact") {
      font("normal", t.bodySize - 0.5);
      black();
      for (const line of doc.splitTextToSize(b.text, maxW)) {
        ensure(14);
        put(line, M, (y += t.bodySize - 0.5), t.nameAlign);
        y += 3;
      }
    } else if (b.kind === "heading") {
      font("bold", t.headingSize);
      if (inBand) {
        inBand = false;
        y = Math.max(y, t.bandH - t.gap + 4);
      }
      ensure(t.gap + t.headingSize + 16);
      y += t.gap;
      if (t.headingColor === "accent") accent();
      else black();
      put(b.text, M, (y += t.headingSize), t.headingAlign);
      if (t.rule > 0) {
        doc.setDrawColor(...(t.headingColor === "accent" ? t.accent : [0, 0, 0]));
        doc.setLineWidth(t.rule);
        doc.line(M, y + 3, W - M, y + 3);
      }
      y += 8;
      black();
    } else if (b.kind === "role") {
      font("bold", t.bodySize);
      ensure(30);
      black();
      const dateW = b.aside ? doc.getTextWidth(b.aside) + 12 : 0;
      doc.splitTextToSize(b.text, maxW - dateW).forEach((line, i) => {
        ensure(14);
        doc.text(line, M, (y += t.bodySize));
        if (i === 0 && b.aside) {
          font("normal", t.bodySize);
          doc.text(b.aside, W - M, y, { align: "right" });
          font("bold", t.bodySize);
        }
        y += t.lineGap + 0.5;
      });
    } else if (b.kind === "bullet") {
      font("normal", t.bodySize);
      black();
      doc.splitTextToSize(b.text, maxW - 14).forEach((line, i) => {
        ensure(14);
        y += t.bodySize;
        if (i === 0) doc.text(t.bullet, M + 3, y);
        doc.text(line, M + 14, y);
        y += t.lineGap;
      });
    } else {
      font("normal", t.bodySize);
      black();
      for (const line of doc.splitTextToSize(b.text, maxW)) {
        ensure(14);
        doc.text(line, M, (y += t.bodySize));
        y += t.lineGap;
      }
    }
  }
  return doc;
}
