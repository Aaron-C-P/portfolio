// Vercel Serverless Function: Aaron's own résumé, shaped for whoever is asking. Lives at /api/my-resume.
// POST { name, email, organisation, focus, posting, template, variant }.
// The résumé is built ONLY from the master data in the repo (src/data/myResume.json): the caller chooses a focus or
// pastes a job posting, but never supplies résumé content, so this cannot be used as a free PDF generator for
// other people's text. Every request is also written to the sheet, so the "who wanted it, and for what" list builds itself.

import { jsPDF } from "jspdf";
import master from "../src/data/myResume.json" with { type: "json" };
import { tailor } from "../src/lib/tailorResume.js";
import { sanitizeResume } from "../src/lib/resumeBlocks.js";
import { buildResumePdf } from "../src/lib/resumePdfBuilder.js";
import { isTemplateId } from "../src/lib/resumeTemplates.js";
import { cleanVariant } from "../src/lib/resumeArt.js";
import { tooMany } from "./_guard.js";

const COLLECT_URL =
  process.env.VITE_COLLECT_URL ||
  "https://script.google.com/macros/s/AKfycbxDCTMV5sxGzsHiZRtGrnnb89aa9gW_8REfuZgOhyOVoEsM4EUYAkpwubWS9aV6I-LMyA/exec";

const clip = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (await tooMany(req, "myresume", 8, 600)) return res.status(429).json({ error: "Too many requests. Please wait a few minutes." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  body = body && typeof body === "object" ? body : {};

  if (clip(body.website, 50)) return res.status(400).json({ error: "Rejected" }); // honeypot: real people never fill this in
  const name = clip(body.name, 120);
  const email = clip(body.email, 160).toLowerCase();
  if (!name) return res.status(400).json({ error: "Please add your name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: "Please add a valid email." });

  const organisation = clip(body.organisation, 120);
  const posting = clip(body.posting, 6000);
  const template = isTemplateId(body.template) ? body.template : "classic";
  const variant = cleanVariant(body.variant);

  try {
    const t = tailor(master, { focus: clip(body.focus, 20), posting, contact: true });
    const resume = sanitizeResume(t.resume);

    // Record the request. A failure here never blocks the download.
    try {
      await fetch(COLLECT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          kind: "resume",
          cid: `myresume-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          fields: {
            name,
            email,
            organisation,
            topic: `Résumé downloaded: ${t.focusLabel}`,
            message: `Focus: ${t.focus}${body.focus ? " (chosen)" : " (detected from the posting)"}. Template: ${template}. Matched: ${t.matched.join(", ") || "none"}. ${posting ? `Posting excerpt: ${posting.slice(0, 300)}` : "No posting pasted."}`,
          },
          meta: { page: "/api/my-resume" },
        }),
      });
    } catch (err) {
      console.error("my-resume: could not log request", err?.message);
    }

    const doc = buildResumePdf(jsPDF, resume, template, true, variant);
    const bytes = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Aaron-Prince-Resume-${t.focus}.pdf"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(bytes);
  } catch (err) {
    console.error("my-resume: build failed", err?.message);
    return res.status(500).json({ error: "Could not build the résumé" });
  }
}
