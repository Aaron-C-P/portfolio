// Vercel Serverless Function: builds the paid ATS résumé PDF. Lives at /api/resume-pdf.
// POST { code, resume }. The PDF only exists on the server, so it cannot be produced without a valid, unexpired,
// unrefunded code. The résumé text is used to draw the file and is neither stored nor logged.

import { jsPDF } from "jspdf";
import { verifyCode, maxAgeDays } from "./_resumeCodes.js";
import { tooMany } from "./_guard.js";
import { bump } from "./_store.js";
import { sanitizeResume } from "../src/lib/resumeBlocks.js";
import { buildResumePdf } from "../src/lib/resumePdfBuilder.js";
import { isTemplateId } from "../src/lib/resumeTemplates.js";
import { cleanVariant } from "../src/lib/resumeArt.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.RESUME_CODES && !process.env.RESUME_CODE_SECRET) return res.status(503).json({ error: "Not configured" });
  if (await tooMany(req, "pdf", 20, 600)) return res.status(429).json({ error: "Too many requests. Wait a few minutes." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const v = await verifyCode(body?.code);
  if (!v.ok) return res.status(401).json({ ok: false, reason: v.reason });

  // Each code can be used for a limited number of downloads, so one purchase cannot be shared around widely.
  const cap = Math.max(1, Number(process.env.RESUME_MAX_DOWNLOADS) || 25);
  const n = await bump(`rs:dl:${v.key}`, maxAgeDays() * 86400);
  if (n !== null && n > cap) return res.status(429).json({ ok: false, reason: "limit" });

  try {
    const resume = sanitizeResume(body?.resume);
    if (!resume.name.trim()) return res.status(400).json({ error: "Add your name first." });
    const template = isTemplateId(body?.template) ? body.template : "classic"; // unknown ids fall back, never throw
    const doc = buildResumePdf(jsPDF, resume, template, true, cleanVariant(body?.variant)); // art remix number, 0-99
    const bytes = Buffer.from(doc.output("arraybuffer"));
    const slug = resume.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-resume.pdf"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(bytes);
  } catch (err) {
    console.error("resume-pdf: build failed", err?.message);
    return res.status(500).json({ error: "Could not build the PDF" });
  }
}
