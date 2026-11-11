import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, Volume2, VolumeX, X } from "lucide-react";
import avatar from "@/assets/portfolio/aaron-avatar.jpg";
import { collect } from "@/lib/collect";
import { askAI, chipsFor, greetingFor, intentFor, offlineReply, type Msg } from "@/lib/assistant";

type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

const recognitionCtor = (): RecognitionCtor | undefined => {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

const speak = (text: string) => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ""));
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
};

const field = "w-full rounded-xl border border-line bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-violet-light";

const Face = ({ className = "h-8 w-8" }: { className?: string }) => (
  <img src={avatar} alt="" className={`${className} shrink-0 rounded-full object-cover object-[55%_22%]`} />
);

export const Assistant = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => [{ role: "assistant", content: greetingFor(window.location.pathname) }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState(() => {
    try {
      return localStorage.getItem("assistant-voice") === "on";
    } catch {
      return false;
    }
  });
  const [lead, setLead] = useState<"closed" | "open" | "sending" | "sent">("closed");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<Recognition | null>(null);
  const canListen = typeof window !== "undefined" && !!recognitionCtor();

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, lead]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else window.speechSynthesis?.cancel();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname.startsWith("/admin") || pathname === "/ask") return null;

  const reply = (content: string, spoken: boolean) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
    if (spoken || voice) speak(content);
  };

  const send = async (text: string, viaVoice = false) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);

    const intent = intentFor(q);
    if (intent.kind === "go") {
      reply(intent.reply, viaVoice);
      setTimeout(() => {
        navigate(intent.path);
        setOpen(false);
      }, 700);
      return;
    }
    if (intent.kind === "lead") {
      reply(intent.reply, viaVoice);
      setLead("open");
      return;
    }
    setLoading(true);
    const answer = (await askAI(next, pathname)) ?? offlineReply(q);
    setLoading(false);
    reply(answer, viaVoice);
  };

  const listen = () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e) => {
      setListening(false);
      void send(e.results[0][0].transcript, true);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r;
    setListening(true);
    r.start();
  };

  const toggleVoice = () => {
    const on = !voice;
    setVoice(on);
    try {
      localStorage.setItem("assistant-voice", on ? "on" : "off");
    } catch {
      /* preference not saved */
    }
    if (!on) window.speechSynthesis?.cancel();
  };

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("topic", "Sent through the assistant");
    setLead("sending");
    const ok = await collect("contact", data);
    setLead(ok ? "sent" : "open");
    reply(ok ? "Sent. Aaron will reply to the email you gave." : "I could not send that just now. Please email aaron7prince@gmail.com instead.", false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div role="dialog" aria-label="Chat with Aaron's guide" className="flex max-h-[min(36rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl">
          <div className="flex items-center gap-3 border-b border-line bg-white/5 px-4 py-3">
            <Face className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">Aaron</p>
              <p className="flex items-center gap-1.5 text-xs text-soft">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" /> Portfolio guide
              </p>
            </div>
            <button type="button" onClick={toggleVoice} aria-pressed={voice} aria-label={voice ? "Turn spoken replies off" : "Turn spoken replies on"} className="rounded-lg p-2 text-soft hover:text-violet-light">
              {voice ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-soft hover:text-violet-light">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="min-h-40 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "assistant" && <Face />}
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${m.role === "user" ? "rounded-br-sm bg-violet text-white" : "rounded-bl-sm bg-white/5"}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2" aria-label="Typing">
                <Face />
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white/5 px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            {(lead === "open" || lead === "sending") && (
              <form onSubmit={submitLead} className="space-y-2 rounded-2xl border border-line p-3">
                <input name="name" required placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
                <input name="email" type="email" required placeholder="Your email" aria-label="Your email" autoComplete="email" className={field} />
                <textarea name="message" required rows={3} placeholder="What do you need?" aria-label="Your message" className={field} />
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div className="flex gap-2">
                  <button type="submit" disabled={lead === "sending"} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60">
                    {lead === "sending" ? "Sending..." : "Send to Aaron"}
                  </button>
                  <button type="button" onClick={() => setLead("closed")} className="btn-ghost !px-4 !py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chipsFor(pathname).map((c) => (
              <button key={c} type="button" disabled={loading} onClick={() => void send(c)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-soft transition hover:border-violet-light hover:text-cream disabled:opacity-50">
                {c}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? "Listening..." : "Ask, or say where to go"} aria-label="Message Aaron's guide" className={`${field} flex-1`} />
            {canListen && (
              <button type="button" onClick={listen} aria-pressed={listening} aria-label={listening ? "Stop listening" : "Speak to Aaron"} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${listening ? "border-red-500 text-red-500" : "border-line text-violet-light"}`}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet text-white disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-center text-[11px] text-soft">An AI guide. It can get things wrong; email aaron7prince@gmail.com for anything important.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close the guide" : "Ask Aaron's guide"}
        className="group relative flex items-center gap-3 rounded-full border border-violet-light/60 bg-panel py-1.5 pl-1.5 pr-4 shadow-xl transition hover:-translate-y-0.5"
      >
        <span className="relative">
          <Face className="h-12 w-12 ring-2 ring-violet-light" />
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-panel bg-green-500 motion-safe:animate-pulse" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-bold">Ask Aaron</span>
          <span className="block text-[11px] text-soft">Type or talk</span>
        </span>
      </button>
    </div>
  );
};
