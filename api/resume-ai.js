// Vercel Serverless Function: Résumé Studio AI coach. Lives at /api/resume-ai.
// Free to use in the preview (rate limited). Rewrites one bullet, or writes a short summary,
// without ever inventing facts: anything the person did not say becomes a [placeholder].
import { complete, aiConfigured } from "./_ai.js";
import { tooMany } from "./_guard.js";

const SYSTEM = `You are a careful résumé coach. You improve wording for the person's own résumé and applicant tracking systems (ATS).

RULES
- Never invent facts, employers, tools, numbers or results. If a number would help but the person did not give one, write a placeholder such as [X%] or [number] for them to fill in with the true figure.
- Use a strong action verb first, plain words, past tense for past jobs, one line (8 to 28 words), no first person, no buzzword filler.
- When a job posting is given, use its exact keywords only where the person's own text supports them.
- Reply with ONLY the requested text. No quotes, no explanation, no markdown.`;

const clean = (v, n) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!aiConfigured()) return res.status(503).json({ error: "AI not configured" });
  if (await tooMany(req, "resume-ai", 12, 600)) return res.status(429).json({ error: "Too many requests. Wait a few minutes." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  const posting = clean(body?.posting, 3000);
  const role = clean(body?.role, 120);
  let task;
  if (body?.action === "bullet") {
    const bullet = clean(body?.bullet, 400);
    if (bullet.length < 5) return res.status(400).json({ error: "Write the bullet first." });
    task = `Rewrite this résumé bullet${role ? ` (role: ${role})` : ""} so it is specific and result-focused. Keep it true to what it says.\n\nBullet: ${bullet}`;
  } else if (body?.action === "summary") {
    const facts = clean(body?.facts, 1500);
    if (facts.length < 20) return res.status(400).json({ error: "Add some experience first." });
    task = `Write a 2 to 3 sentence professional summary using only these facts.\n\nFacts: ${facts}`;
  } else {
    return res.status(400).json({ error: "Unknown action" });
  }
  if (posting) task += `\n\nJob posting (for keywords, do not copy sentences):\n${posting}`;

  try {
    const out = await complete({ system: SYSTEM, messages: [{ role: "user", content: task }], maxTokens: 220 });
    const text = (out?.text || "").replace(/^["'\-•\s]+|["']+$/g, "").trim();
    if (!text) return res.status(502).json({ error: "No suggestion. Try again." });
    return res.status(200).json({ text });
  } catch (err) {
    console.error("resume-ai error:", err.message);
    return res.status(502).json({ error: "The AI is busy. Try again in a minute." });
  }
}
