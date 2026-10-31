import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { localReply } from "@/lib/localReply";
import profilePhoto from "@/assets/portfolio/profile-photo.jpg";

type Msg = { role: "user" | "assistant"; content: string };

const suggestedQuestions = [
  "What do you build?",
  "Tell me about the cake platform",
  "What is Vectra?",
  "Show me a dashboard you built",
  "Tell me about EGZIT",
  "What's Jamoment?",
  "Your tech stack?",
  "How can I reach you?",
];

const greeting: Msg = {
  role: "assistant",
  content: "Hey, I'm Aaron's AI clone. Ask me anything about his projects, his stack, or how to work with him.",
};

const Avatar = () => (
  <img src={profilePhoto} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover object-top" />
);

export const AICloneChat = () => {
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
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

    let replied = false;
    if (liveMode) {
      try {
        // History must start with a user message.
        const history = [...next];
        while (history.length && history[0].role === "assistant") history.shift();
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (r.ok && (r.headers.get("content-type") || "").includes("application/json")) {
          const data = await r.json();
          if (typeof data?.reply === "string" && data.reply.trim()) {
            setMessages((m) => [...m, { role: "assistant", content: data.reply.trim() }]);
            replied = true;
          }
        }
        if (!replied) setLiveMode(false);
      } catch {
        setLiveMode(false);
      }
    }
    if (!replied) {
      await new Promise((res) => setTimeout(res, 380));
      setMessages((m) => [...m, { role: "assistant", content: localReply(q) }]);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="bg-panel border border-line rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line bg-white/5">
          <Avatar />
          <div>
            <p className="font-semibold leading-tight">Aaron's AI</p>
            <p className="text-xs text-soft flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online · ask me anything
            </p>
          </div>
        </div>

        <div ref={listRef} className="h-96 overflow-y-auto p-5 space-y-4" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "assistant" && <Avatar />}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-violet text-white rounded-br-sm"
                    : "bg-white/5 text-fg rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar />
              <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1" aria-label="Typing">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-line">
          {suggestedQuestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-line text-soft hover:border-violet-light hover:text-cream transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 p-4 border-t border-line"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask my AI clone a question..."
            aria-label="Message Aaron's AI"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-violet-light"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="h-10 w-10 rounded-xl bg-violet text-white flex items-center justify-center disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
      <p className="text-xs text-soft mt-3 text-center">
        This is an AI clone of Aaron and may get things wrong. For anything important, email aaron7prince@gmail.com.
      </p>
    </div>
  );
};
