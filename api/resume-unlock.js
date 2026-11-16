// Vercel Serverless Function: checks a Résumé Studio unlock code. Lives at /api/resume-unlock.
// Set RESUME_CODES in Vercel as a comma-separated list of codes you give out after a payment is confirmed,
// e.g. RESUME_CODES=RS-4F9K2,RS-7M3QD. Remove a code from the list to retire it.
// The browser never sees the list: it only learns whether the code it sent is valid.

import { timingSafeEqual } from "node:crypto";
import { isDerivedCode } from "./_resumeCodes.js";

const same = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const tries = new Map(); // best-effort throttle per instance
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const list = (process.env.RESUME_CODES || "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (list.length === 0 && !process.env.RESUME_CODE_SECRET) return res.status(503).json({ error: "Unlock is not configured" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (tries.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 8) return res.status(429).json({ error: "Too many tries. Wait a few minutes." });
  tries.set(ip, [...recent, now]);

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase().slice(0, 40) : "";
  const ok = code.length > 0 && (list.some((c) => same(c, code)) || isDerivedCode(code));
  return res.status(ok ? 200 : 401).json({ ok });
}
