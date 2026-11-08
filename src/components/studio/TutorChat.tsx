import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { BookOpen, Send, ShieldCheck } from "lucide-react";
import "katex/dist/katex.min.css";
import { retrieve, subjects, type TutorNote } from "@/lib/tutorKb";

type Msg = { role: "user" | "assistant"; content: string; sources?: string[]; offline?: boolean };
type Mode = "steps" | "hints" | "quiz";

const modes: { key: Mode; label: string; hint: string }[] = [
  { key: "steps", label: "Step by step", hint: "A full worked solution, then a practice question" },
  { key: "hints", label: "Hints only", hint: "Guides you without giving the answer" },
  { key: "quiz", label: "Quiz me", hint: "One question at a time, marked as you go" },
];

const suggestions = [
  "Show me how to solve a quadratic equation",
  "How do I factorise 2x^2 - 5x - 3?",
  "Explain compound interest",
  "How should I structure my SBA?",
  "How do I write a strong paragraph?",
];

const greeting: Msg = {
  role: "assistant",
  content:
    "Hi, I'm a study tutor. Pick a subject, choose how you want to learn, and ask me anything. I will show my working, and **I help you learn it so you can do the work yourself**.",
};

export const Markdown = ({ children }: { children: string }) => (
  <div className="tutor-md text-sm leading-relaxed">
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  </div>
);

const offlineReply = (found: TutorNote[]): Msg =>
  found.length
    ? {
        role: "assistant",
        offline: true,
        content: `The live tutor is not reachable right now, so here is the closest note I have.\n\n### ${found[0].title}\n\n${found[0].body}`,
        sources: found.map((n) => n.title),
      }
    : {
        role: "assistant",
        offline: true,
        content:
          "The live tutor is not reachable right now and I have no saved note on that yet. Try again shortly, or ask about quadratics, factorising, equations, indices, interest, trigonometry, statistics, probability, sets, SBA structure or paragraph writing.",
      };

export const TutorChat = () => {
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(subjects[0]);
  const [mode, setMode] = useState<Mode>("steps");
  const [live, setLive] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const found = retrieve(q, subject);
    let reply: Msg | null = null;

    if (live) {
      try {
        const history = next.map(({ role, content }) => ({ role, content })).filter((_, i, a) => a.slice(0, i + 1).some((m) => m.role === "user"));
        const r = await fetch("/api/tutor", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history, subject, mode, notes: found.map(({ title, body }) => ({ title, body })) }),
        });
        if (r.ok && (r.headers.get("content-type") || "").includes("application/json")) {
          const data = await r.json();
          if (typeof data?.reply === "string" && data.reply.trim()) {
            reply = { role: "assistant", content: data.reply.trim(), sources: found.map((n) => n.title) };
          }
        }
        if (!reply) setLive(false);
      } catch {
        setLive(false);
      }
    }

    setMessages((m) => [...m, reply ?? offlineReply(found)]);
    setLoading(false);
  }

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-violet bg-violet text-white" : "border-line text-soft hover:border-violet-light hover:text-fg"}`;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-lg">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-soft">Subject</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm outline-none focus:border-violet-light"
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Learning mode">
            {modes.map((m) => (
              <button key={m.key} type="button" title={m.hint} aria-pressed={mode === m.key} onClick={() => setMode(m.key)} className={chip(mode === m.key)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={listRef} className="h-[28rem] space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
              <div className={`max-w-[92%] rounded-2xl px-4 py-3 ${m.role === "user" ? "rounded-br-sm bg-violet text-sm text-white" : "rounded-bl-sm bg-white/5 text-fg"}`}>
                {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
                {m.sources && m.sources.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-2 text-xs text-soft">
                    <BookOpen className="h-3.5 w-3.5 text-violet-light" aria-hidden="true" />
                    Matched notes: {m.sources.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3" aria-label="Thinking">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => send(s)} disabled={loading} className="rounded-full border border-line px-3 py-1.5 text-xs text-soft transition-colors hover:border-violet-light hover:text-fg disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question, or paste a problem you are stuck on..."
            aria-label="Message the tutor"
            className="flex-1 rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-violet-light"
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet text-white disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
      <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs text-soft">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-light" aria-hidden="true" />
        AI tutor: it can make mistakes, so check important work with your teacher. Please do not share personal details.
      </p>
    </div>
  );
};
