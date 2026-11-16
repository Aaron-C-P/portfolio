import type { Resume } from "@/lib/resumeEngine";

/**
 * The one résumé format, built for applicant tracking systems (ATS): a single column, standard section
 * headings, real text, plain bullets, no tables, columns, icons, images or text boxes. The same structure
 * feeds the PDF and the "what an ATS reads" view, so what the user sees is what the ATS gets.
 */
export interface Block {
  kind: "name" | "title" | "contact" | "heading" | "role" | "text" | "bullet";
  text: string;
  /** Right-aligned text on the same line (dates). Printed as "  |  dates" in the plain-text view. */
  aside?: string;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function resumeBlocks(r: Resume): Block[] {
  const out: Block[] = [];
  if (r.name.trim()) out.push({ kind: "name", text: clean(r.name) });
  if (r.title.trim()) out.push({ kind: "title", text: clean(r.title) });
  const contact = [r.email, r.phone, r.location, r.links].map(clean).filter(Boolean).join(" | ");
  if (contact) out.push({ kind: "contact", text: contact });

  if (r.summary.trim()) out.push({ kind: "heading", text: "PROFESSIONAL SUMMARY" }, { kind: "text", text: clean(r.summary) });

  const jobs = r.experience.filter((j) => j.role.trim());
  if (jobs.length) {
    out.push({ kind: "heading", text: "WORK EXPERIENCE" });
    for (const j of jobs) {
      out.push({ kind: "role", text: [clean(j.role), clean(j.org)].filter(Boolean).join(", "), aside: clean(j.dates) || undefined });
      j.bullets.filter((b) => b.trim()).forEach((b) => out.push({ kind: "bullet", text: clean(b) }));
    }
  }

  const schools = r.education.filter((s) => s.school.trim());
  if (schools.length) {
    out.push({ kind: "heading", text: "EDUCATION" });
    for (const s of schools) out.push({ kind: "role", text: [clean(s.what), clean(s.school)].filter(Boolean).join(", "), aside: clean(s.dates) || undefined });
  }

  const skills = r.skills.split(",").map(clean).filter(Boolean);
  if (skills.length) out.push({ kind: "heading", text: "SKILLS" }, { kind: "text", text: skills.join(", ") });
  return out;
}

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
