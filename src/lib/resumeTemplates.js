// Ten résumé templates. Each has its own typography, colours and generated vector art (see resumeArt.js), and every
// one is still ATS-safe: one column, real text in a standard built-in font, no images, no tables, no text boxes.
// The art is shapes drawn behind the text, so a reader or applicant tracking system sees only the words.
// Used by the browser preview and, identically, by the server PDF builder. Types are in resumeTemplates.d.ts.
//
// Sizes are in points (the PDF's unit). font is "helvetica" (sans) or "times" (serif). `band` templates print the
// header in white on a dark band of height bandH; all others print black text over light tints.

const base = { font: "helvetica", nameSize: 22, titleSize: 12, bodySize: 10.5, headingSize: 11, nameAlign: "left", headingAlign: "left", rule: 0.6, accent: [0, 0, 0], headingColor: "black", gap: 12, lineGap: 2.5, bullet: "-", art: "", pal: [], band: false, bandH: 0 };

export const TEMPLATES = [
  { ...base, id: "classic", name: "Classic", nameSize: 20, note: "No artwork. Plain black on white, the safest choice for any system." },
  { ...base, id: "aurora", name: "Aurora", art: "waves", pal: [[79, 70, 229], [236, 72, 153], [14, 165, 233]], accent: [67, 56, 202], headingColor: "accent", nameSize: 26, rule: 0.8, bullet: "•", note: "Soft indigo, pink and blue waves across the top." },
  { ...base, id: "midnight", name: "Midnight", art: "band", pal: [[15, 23, 42], [30, 41, 59], [234, 179, 8]], band: true, bandH: 150, accent: [30, 58, 138], headingColor: "accent", nameSize: 28, rule: 1, note: "A dark header band with a gold edge. Your name in white." },
  { ...base, id: "mosaic", name: "Mosaic", art: "mosaic", pal: [[13, 148, 136], [20, 184, 166], [15, 118, 110]], accent: [15, 118, 110], headingColor: "accent", rule: 0.8, bullet: "•", note: "A pixel pattern generated from your name, so it is yours alone." },
  { ...base, id: "sunrise", name: "Sunrise", font: "times", art: "sunrise", pal: [[234, 88, 12], [245, 158, 11], [220, 38, 38]], accent: [154, 52, 18], headingColor: "accent", nameSize: 26, bodySize: 11, rule: 0.8, note: "Warm serif with rising discs of orange and gold." },
  { ...base, id: "blocks", name: "Blocks", art: "blocks", pal: [[244, 63, 94], [251, 146, 60], [250, 204, 21], [56, 189, 248]], accent: [159, 18, 57], headingColor: "accent", rule: 0, nameSize: 24, bullet: "•", note: "Colour blocks down the left edge of every page." },
  { ...base, id: "confetti", name: "Confetti", art: "confetti", pal: [[168, 85, 247], [34, 197, 94], [251, 191, 36]], accent: [107, 33, 168], headingColor: "accent", nameAlign: "center", headingAlign: "center", nameSize: 26, bullet: "•", note: "A playful scatter of dots. Name and headings centred." },
  { ...base, id: "geo", name: "Geometric", art: "geo", pal: [[51, 65, 85], [225, 29, 72], [100, 116, 139]], accent: [190, 18, 60], headingColor: "accent", nameSize: 30, headingSize: 12, rule: 1.8, gap: 14, note: "Sharp overlapping triangles with a big name and heavy rules." },
  { ...base, id: "rings", name: "Rings", art: "rings", pal: [[22, 163, 74], [132, 204, 22], [5, 150, 105]], accent: [21, 128, 61], headingColor: "accent", rule: 0, gap: 16, lineGap: 3.5, note: "Thin green rings, no rules and lots of white space." },
  { ...base, id: "topo", name: "Topo", font: "times", art: "topo", pal: [[120, 53, 15], [161, 98, 7], [63, 98, 18]], accent: [120, 53, 15], headingColor: "accent", nameSize: 26, bodySize: 11, rule: 0.5, note: "Map-style contour lines in earth tones, set in serif." },
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
export const isTemplateId = (id) => TEMPLATES.some((t) => t.id === id);
