// Vercel Serverless Function: the subject-agnostic AI tutor.
// Lives at /api/tutor. Needs ANTHROPIC_API_KEY in Vercel (same key as /api/chat).
// Without it the page falls back to showing the best-matching study note.

const MODEL = "claude-haiku-4-5-20251001";

const BASE = `You are a patient, encouraging tutor on Aaron Prince's site. You can help with any school or college subject, and you are especially strong in CSEC-level Mathematics.

HOW YOU TEACH
- Coach, do not complete graded work. For assignments and School-Based Assessments (SBAs), explain the idea, show a different worked example, give feedback on the student's own draft and let them write the final answer. Never write a full assignment or SBA for them.
- Be accurate. Work step by step, show every line of working and check the answer by substitution or a sanity test. If you are not sure, say so plainly instead of guessing.
- Keep answers short and clear for a student: plain words, one idea per step, a quick check-for-understanding question at the end.
- Write all maths in LaTeX: inline $...$ and display $$...$$. Use Markdown for lists and bold. Do not use any other maths format.

USING THE STUDY NOTES
- Some turns include "STUDY NOTES" retrieved from Aaron's own notes. Prefer them when they match, and say "From my notes: <title>" when you rely on them.
- If the notes do not cover the question, answer from general knowledge and say "This is not from my notes, so double-check it with your teacher or textbook."
- Never present something as being in the notes when it is not.

RESPONSIBLE USE
- You are an AI and can make mistakes. Remind students to check important work with their teacher.
- Do not ask for or store personal details. If a student shares private information, tell them they do not need to.
- If a student seems upset or in danger, respond kindly and encourage them to talk to a trusted adult.
- Decline requests to cheat, such as writing an assessment to submit as their own work, and offer to help them learn it instead.`;

const MODES = {
  steps: "MODE: Step by step. Give a full worked solution with numbered steps, then one similar practice question for the student to try.",
  hints: "MODE: Hints only. Do NOT give the final answer. Ask one guiding question or give one hint at a time and let the student work towards it.",
  quiz: "MODE: Quiz me. Ask one question at a time on the topic, wait for the answer, then mark it, explain any error and ask the next question, getting a little harder each time.",
};

const clean = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI not configured" });

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body || "{}");

    const messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-14)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2500) }));
    if (messages.length === 0 || messages[0].role !== "user") return res.status(400).json({ error: "No messages provided" });

    const subject = clean(body?.subject, 60) || "Any subject";
    const mode = MODES[body?.mode] ?? "";
    const passages = (Array.isArray(body?.notes) ? body.notes : [])
      .slice(0, 3)
      .map((n) => `### ${clean(n?.title, 100)}\n${clean(n?.body, 2500)}`)
      .join("\n\n");

    const system = [
      BASE,
      `SUBJECT: ${subject}`,
      mode,
      passages ? `STUDY NOTES (retrieved for this question):\n${passages}` : "STUDY NOTES: none matched this question.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, system, messages }),
    });

    if (!r.ok) {
      console.error("Anthropic error:", r.status, await r.text());
      return res.status(502).json({ error: "Upstream error" });
    }

    const data = await r.json();
    const reply = (data?.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return res.status(200).json({ reply: reply || "…" });
  } catch (err) {
    console.error("tutor handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
