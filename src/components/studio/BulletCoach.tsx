import { useState } from "react";
import { Sparkles } from "lucide-react";

/** Free AI rewrite of one résumé bullet (via /api/resume-ai). Never invents numbers: gaps come back as [placeholders]. */
export const BulletCoach = ({ bullet, posting, onUse }: { bullet: string; posting: string; onUse: (text: string) => void }) => {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");

  const ask = async () => {
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/resume-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "bullet", bullet, posting }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok || !data.text) throw new Error(res.status === 503 ? "The AI coach is not switched on yet." : data.error || "Try again in a minute.");
      setSuggestion(data.text);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Try again in a minute.");
      setState("error");
    }
  };

  return (
    <div className="mt-2">
      {!suggestion && (
        <button className="inline-flex items-center gap-1 text-violet-light underline disabled:opacity-60" disabled={state === "busy"} onClick={ask}>
          <Sparkles className="h-3.5 w-3.5" /> {state === "busy" ? "Thinking…" : "Improve with AI"}
        </button>
      )}
      {state === "error" && <span className="ml-2 text-amber-200">{error}</span>}
      {suggestion && (
        <div className="rounded-lg border border-violet-light/40 bg-violet/10 p-2">
          <p>{suggestion}</p>
          <p className="mt-1 text-xs text-soft">Fill in any [placeholder] with your real figure. Only keep what is true.</p>
          <div className="mt-1 flex gap-3">
            <button className="font-semibold text-violet-light underline" onClick={() => { onUse(suggestion); setSuggestion(""); }}>Use this</button>
            <button className="text-soft underline" onClick={() => setSuggestion("")}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};
