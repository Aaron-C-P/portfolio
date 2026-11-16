// Ten résumé templates. All of them are ATS-safe: one column, real text, standard built-in fonts, no tables,
// icons, images or text boxes. They differ only in typography, header alignment, section rules, spacing and
// one dark accent colour, so the choice is about taste and not about whether a system can read the file.
// Used by the browser preview and, identically, by the server PDF builder. Types are in resumeTemplates.d.ts.
//
// Sizes are in points (the PDF's unit). font is "helvetica" (sans) or "times" (serif).

const base = { font: "helvetica", nameSize: 20, titleSize: 12, bodySize: 10.5, headingSize: 11, nameAlign: "left", headingAlign: "left", rule: 0.6, accent: [0, 0, 0], headingColor: "black", gap: 12, lineGap: 2.5, bullet: "-" };

export const TEMPLATES = [
  { ...base, id: "classic", name: "Classic", note: "The safe default. Clean sans-serif, thin rule under each heading." },
  { ...base, id: "executive", name: "Executive", font: "times", nameSize: 22, nameAlign: "center", bodySize: 11, rule: 0.8, gap: 13, note: "Serif with a centred name. Formal and senior." },
  { ...base, id: "modern", name: "Modern", nameSize: 22, accent: [30, 58, 138], headingColor: "accent", bullet: "•", note: "Navy headings and rules with round bullets." },
  { ...base, id: "compact", name: "Compact", nameSize: 18, bodySize: 9.5, headingSize: 10, gap: 8, lineGap: 1.5, note: "Tighter type and spacing. Fits more on one page." },
  { ...base, id: "spacious", name: "Spacious", nameSize: 22, bodySize: 11, gap: 18, lineGap: 4, note: "Roomy and easy to skim. Best for shorter résumés." },
  { ...base, id: "academic", name: "Academic", font: "times", bodySize: 11, rule: 0.5, note: "Serif and understated. Good for study, research and education roles." },
  { ...base, id: "centered", name: "Centred", nameSize: 22, nameAlign: "center", headingAlign: "center", note: "Name and headings centred on the page." },
  { ...base, id: "bold", name: "Bold", nameSize: 26, headingSize: 12, rule: 1.8, gap: 14, note: "Large name and heavy rules. Confident and easy to spot." },
  { ...base, id: "minimal", name: "Minimal", rule: 0, headingColor: "accent", accent: [70, 70, 70], note: "No lines. Soft grey headings and lots of white space." },
  { ...base, id: "teal", name: "Teal", nameSize: 22, accent: [15, 118, 110], headingColor: "accent", rule: 0.8, bullet: "•", note: "A calm teal accent on headings and rules." },
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
export const isTemplateId = (id) => TEMPLATES.some((t) => t.id === id);
