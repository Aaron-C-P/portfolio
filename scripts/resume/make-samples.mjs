// Run: node scripts/resume/make-samples.mjs <outDir>
// Writes one real PDF per template (using a fictional sample résumé) so the designs can be looked at.
import { writeFileSync, mkdirSync } from "node:fs";
import { jsPDF } from "jspdf";
import { buildResumePdf } from "../../src/lib/resumePdfBuilder.js";
import { sanitizeResume } from "../../src/lib/resumeBlocks.js";
import { TEMPLATES } from "../../src/lib/resumeTemplates.js";

const out = process.argv[2] || "resume-samples";
mkdirSync(out, { recursive: true });
const resume = {
  name: "Jordan Brown", title: "Customer Support Representative", email: "jordan.brown@example.com", phone: "876-555-0100", location: "Kingston, Jamaica", links: "linkedin.com/in/jordan-brown-sample",
  summary: "Support representative who resolves customer problems quickly and explains fixes in plain language. Comfortable with ticketing tools, phone and chat.",
  experience: [
    { role: "Customer Service Agent", org: "Island Retail", dates: "2023 - Present", bullets: ["Resolved 25+ customer tickets per day with a 96% satisfaction score", "Trained 6 new staff on the point-of-sale system, cutting onboarding from 2 weeks to 4 days", "Wrote 12 help articles that reduced repeat questions by 30%"] },
    { role: "Call Centre Trainee", org: "ConnectCare", dates: "2022 - 2023", bullets: ["Handled 60 calls per shift and resolved 80% on first contact"] },
  ],
  education: [{ school: "University of Technology, Jamaica", what: "BSc Information Technology", dates: "2019 - 2023" }],
  skills: "Customer support, Troubleshooting, Zendesk, Microsoft Excel, Active listening",
};
for (const t of TEMPLATES) writeFileSync(`${out}/${t.id}.pdf`, Buffer.from(buildResumePdf(jsPDF, sanitizeResume(resume), t.id).output("arraybuffer")));
console.log("wrote", TEMPLATES.length, "pdfs to", out);
