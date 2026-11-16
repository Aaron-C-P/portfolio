// Vercel Serverless Function: checks a Résumé Studio unlock code. Lives at /api/resume-unlock.
// The browser only learns whether the code is valid; it cannot read the list or work a code out.
// A valid code does NOT let the browser make the PDF itself: the PDF is built on the server by /api/resume-pdf,
// which checks the code again on every download.

import { verifyCode } from "./_resumeCodes.js";
import { tooMany } from "./_guard.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.RESUME_CODES && !process.env.RESUME_CODE_SECRET) return res.status(503).json({ error: "Unlock is not configured" });
  if (await tooMany(req, "unlock", 8, 600)) return res.status(429).json({ error: "Too many tries. Wait a few minutes." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  const v = await verifyCode(body?.code);
  if (v.ok) return res.status(200).json({ ok: true });
  return res.status(401).json({ ok: false, reason: v.reason });
}
