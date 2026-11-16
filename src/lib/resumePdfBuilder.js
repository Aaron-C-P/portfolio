// Draws the ATS résumé as a real text PDF. Runs on the server only (api/resume-pdf.js), after a paid code is
// verified, so the PDF cannot be produced from the browser without paying. jsPDF draws text with a standard
// built-in font, so every word stays selectable and readable by an applicant tracking system.
import { resumeBlocks } from "./resumeBlocks.js";

export function buildResumePdf(jsPDF, r, compress = true) {
  const doc = new jsPDF({ unit: "pt", format: "letter", compress });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 54; // 0.75 inch margins
  const maxW = W - M * 2;
  let y = M;

  const ensure = (need) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const font = (style, size) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  doc.setProperties({ title: `${r.name || "Resume"} - Resume`, author: r.name || undefined, subject: "Resume", creator: "Resume Studio" });
  doc.setTextColor(0, 0, 0);

  for (const b of resumeBlocks(r)) {
    if (b.kind === "name") {
      font("bold", 20);
      ensure(26);
      doc.text(b.text, M, (y += 20));
      y += 4;
    } else if (b.kind === "title") {
      font("normal", 12);
      ensure(16);
      doc.text(b.text, M, (y += 12));
      y += 3;
    } else if (b.kind === "contact") {
      font("normal", 10);
      for (const line of doc.splitTextToSize(b.text, maxW)) {
        ensure(14);
        doc.text(line, M, (y += 10));
        y += 3;
      }
    } else if (b.kind === "heading") {
      font("bold", 11);
      ensure(34);
      y += 12;
      doc.text(b.text, M, (y += 11));
      doc.setDrawColor(0);
      doc.setLineWidth(0.6);
      doc.line(M, y + 3, W - M, y + 3);
      y += 8;
    } else if (b.kind === "role") {
      font("bold", 10.5);
      ensure(30);
      const dateW = b.aside ? doc.getTextWidth(b.aside) + 12 : 0;
      doc.splitTextToSize(b.text, maxW - dateW).forEach((line, i) => {
        ensure(14);
        doc.text(line, M, (y += 10.5));
        if (i === 0 && b.aside) {
          font("normal", 10.5);
          doc.text(b.aside, W - M, y, { align: "right" });
          font("bold", 10.5);
        }
        y += 3;
      });
    } else if (b.kind === "bullet") {
      font("normal", 10.5);
      doc.splitTextToSize(b.text, maxW - 14).forEach((line, i) => {
        ensure(14);
        y += 10.5;
        if (i === 0) doc.text("-", M + 3, y);
        doc.text(line, M + 14, y);
        y += 2.5;
      });
    } else {
      font("normal", 10.5);
      for (const line of doc.splitTextToSize(b.text, maxW)) {
        ensure(14);
        doc.text(line, M, (y += 10.5));
        y += 2.5;
      }
    }
  }
  return doc;
}
