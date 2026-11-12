import { localReply } from "@/lib/localReply";

export type Msg = { role: "user" | "assistant"; content: string };

type Route = { path: string; label: string; test: RegExp };

/** Where "Aaron" can take a visitor. Specific pages come before general ones. */
const routes: Route[] = [
  { path: "/work/chef-hudsons-christmas-cakes", label: "the Christmas cake platform", test: /\b(cakes?|chef hudson|christmas order)/ },
  { path: "/work/errands", label: "Errands", test: /\berrands?\b/ },
  { path: "/work/egzit", label: "EGZIT", test: /\begzit\b/ },
  { path: "/work/vectra", label: "Vectra", test: /\bvectra\b/ },
  { path: "/work/becoming", label: "Becoming", test: /\bbecoming\b/ },
  { path: "/work/jamoment", label: "Jamoment", test: /\bjamoment\b/ },
  { path: "/work/qr-data-lab", label: "QR Data Lab", test: /\bqr\b/ },
  { path: "/band", label: "the band page", test: /(\bband\b|live music|musician|\bgig\b|wedding music)/ },
  { path: "/book", label: "the booking page", test: /(\bbook\b|booking|schedule|appointment|meeting|\bcall\b)/ },
  { path: "/pay", label: "the payment page", test: /(\bpay\b|payment|invoice|bank transfer|deposit)/ },
  { path: "/assignment-help", label: "Student Help", test: /(assignment|\bsba\b|csec|\bmaths?\b|tutor|student|homework|essay)/ },
  { path: "/resume", label: "the résumé request page", test: /(resume|résumé|\bcv\b)/ },
  { path: "/card", label: "my digital card", test: /(digital card|business card|save (my |your )?contact)/ },
  { path: "/contact", label: "the contact page", test: /(contact|\bhire\b|get in touch|reach)/ },
  { path: "/work", label: "my work", test: /(projects?|portfolio|\bwork\b|case stud)/ },
  { path: "/journey", label: "my journey", test: /(journey|timeline|my story|background)/ },
  { path: "/skills", label: "my skills", test: /(skills?|\bstack\b|\btech\b)/ },
  { path: "/services", label: "my services", test: /(services?|pricing|what do you offer)/ },
  { path: "/writing", label: "my writing", test: /(writing|articles?|gleaner|observer|\bbook\b|published)/ },
  { path: "/feed", label: "the feed", test: /(\bfeed\b|\bnews\b|updates)/ },
  { path: "/about", label: "the About page", test: /(\babout\b|who are you)/ },
  { path: "/", label: "the home page", test: /(\bhome\b|landing|\bstart\b)/ },
];

const GO = /^(please )?(can you |could you )?(open|show( me)?|take me( to)?|go to|goto|navigate( to)?|bring me( to)?|visit|see)\b/;
const LEAD = /(leave|send|drop|write)( a| you a| aaron a)? (message|note)|message (you|aaron)|contact form|call me back|get back to me|reach out to me/;

export type Intent = { kind: "go"; path: string; reply: string } | { kind: "lead"; reply: string } | { kind: "ask" };

/** Free, instant commands. Anything else goes to the AI. */
export function intentFor(raw: string): Intent {
  const t = raw.toLowerCase().trim().replace(/[?.!,]+$/g, "");
  if (LEAD.test(t)) return { kind: "lead", reply: "Happy to pass a message to Aaron. Fill this in and he will reply by email." };
  const words = t.split(/\s+/).length;
  if (GO.test(t) || words <= 2) {
    const hit = routes.find((r) => r.test.test(t));
    if (hit && (GO.test(t) || t.length > 2)) return { kind: "go", path: hit.path, reply: `Opening ${hit.label}.` };
  }
  return { kind: "ask" };
}

/** Quick-reply chips that suit the page the visitor is on. */
export function chipsFor(path: string): string[] {
  if (path.startsWith("/work/")) return ["Explain this simply", "What was the hardest part?", "Show me all projects", "Leave a message"];
  if (path === "/assignment-help") return ["What do you help with?", "Tell me about CSEC Maths", "Take me to contact", "Leave a message"];
  if (path === "/contact" || path === "/resume") return ["Get your résumé", "Are you open to work?", "Leave a message"];
  if (path === "/work") return ["Which project should I read first?", "Show me the cake platform", "Leave a message"];
  if (path === "/about" || path === "/journey") return ["What are you looking for?", "Show me your work", "Leave a message"];
  return ["What do you build?", "Show me your projects", "I need student help", "Leave a message"];
}

export function greetingFor(path: string): string {
  if (path.startsWith("/work/")) return "You are reading one of my case studies. Want the short version, or the hard part?";
  if (path === "/assignment-help") return "Need help with an assignment, an SBA or CSEC Maths? Ask me, or leave a message.";
  if (path === "/contact") return "Easier than a form: tell me what you need and I will pass it on.";
  return "Hi, I am Aaron's guide. Ask me anything, tell me where to take you, or tap the mic and talk.";
}

/** Asks the site's AI (/api/chat). Returns null when it is unavailable, so the caller can fall back. */
export async function askAI(history: Msg[], page: string): Promise<string | null> {
  try {
    const turns = [...history];
    while (turns.length && turns[0].role === "assistant") turns.shift();
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: turns, page }),
    });
    if (!r.ok || !(r.headers.get("content-type") || "").includes("application/json")) return null;
    const data = (await r.json()) as { reply?: string };
    return typeof data.reply === "string" && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    return null;
  }
}

export const offlineReply = localReply;
