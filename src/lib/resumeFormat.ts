import { resumeBlocks } from "./resumeBlocks.js";
import type { Resume } from "@/lib/resumeEngine";

/**
 * The one résumé format, built for applicant tracking systems (ATS): a single column, standard section
 * headings, real text, plain bullets, no tables, columns, icons, images or text boxes. The blocks come from
 * resumeBlocks.js, which the server also uses to draw the PDF, so the preview and the PDF always match.
 */
export { resumeBlocks };
export type { Block } from "./resumeBlocks.js";

/** Exactly the text an ATS will extract, in reading order. */
export const atsText = (r: Resume): string =>
  resumeBlocks(r)
    .map((b) => (b.kind === "heading" ? `\n${b.text}` : b.kind === "bullet" ? `- ${b.text}` : b.aside ? `${b.text} | ${b.aside}` : b.text))
    .join("\n")
    .trim();

export interface AtsCheck {
  ok: boolean;
  text: string;
}

/** Checks the things that make an ATS misread a résumé. The format itself already avoids the layout traps. */
export function atsChecks(r: Resume): AtsCheck[] {
  const text = atsText(r);
  const dates = [...r.experience.map((j) => j.dates), ...r.education.map((s) => s.dates)].map((d) => d.trim()).filter(Boolean);
  const dated = dates.every((d) => /\d{4}/.test(d));
  const fancy = /[•●■★✓→»❤☀-➿\ud83c-\ud83e]/.test(text);
  const long = r.experience.flatMap((j) => j.bullets).some((b) => b.trim().split(/\s+/).length > 40);
  return [
    { ok: true, text: "Single column, standard headings, plain bullets: nothing for the ATS to misread" },
    { ok: true, text: "The PDF contains real, selectable text (not an image)" },
    { ok: !!r.name.trim() && /\S+@\S+\.\S+/.test(r.email) && !!r.phone.trim(), text: "Name, email and phone are in the body of the page, not a header or footer" },
    { ok: dates.length > 0 && dated, text: "Every job and school has dates with a four-digit year (for example 2021 - 2025)" },
    { ok: !fancy, text: "No emoji, arrows, stars or unusual symbols that some systems drop" },
    { ok: !long, text: "No bullet longer than about 40 words" },
    { ok: r.experience.some((j) => j.role.trim()) && r.experience.every((j) => !j.role.trim() || !!j.org.trim()), text: "Each job has a title and an employer" },
  ];
}
