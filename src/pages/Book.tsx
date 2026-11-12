import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { packages } from "@/data/pay";
import { collect } from "@/lib/collect";
import { whatsappAbout } from "@/lib/contact";
import { SectionHead, usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg outline-none transition focus:border-violet-light";
const PARTS = ["Morning (8 to 12)", "Afternoon (12 to 5)", "Evening (5 to 8)"];

/** The next ten weekdays, so nobody can ask for a Sunday or a date in the past. */
const upcomingDays = () => {
  const out: { value: string; label: string }[] = [];
  const d = new Date();
  while (out.length < 10) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({ value: d.toDateString(), label: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }) });
  }
  return out;
};

const Book = () => {
  usePageTitle("Book a call");
  const days = useMemo(upcomingDays, []);
  const [params] = useSearchParams();
  const wanted = params.get("topic") === "Band booking" ? "Band booking" : "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (d.get("website")) return;
    const picks = [1, 2, 3]
      .map((n) => (d.get(`day${n}`) ? `${d.get(`day${n}`)}, ${d.get(`part${n}`)}` : ""))
      .filter(Boolean);
    if (!picks.length) return;
    const out = new FormData();
    out.set("name", String(d.get("name")));
    out.set("email", String(d.get("email")));
    out.set("topic", String(d.get("topic")));
    out.set(
      "message",
      [`Preferred times (Jamaica time):`, ...picks.map((p, i) => `${i + 1}. ${p}`), `Call me by: ${d.get("how")}`, d.get("phone") ? `Phone or WhatsApp: ${d.get("phone")}` : "", d.get("note") ? `Note: ${d.get("note")}` : ""]
        .filter(Boolean)
        .join("\n")
    );
    setState("sending");
    setState((await collect("booking", out)) ? "sent" : "failed");
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32">
      <SectionHead page eyebrow="Book a call" title="A free call, at a time that suits you." intro="Pick up to three times that work. I confirm one by email or WhatsApp, usually within a day. The call is not booked until I confirm." />
      {state === "sent" ? (
        <div role="status" className="space-y-3 rounded-3xl border border-violet-light/50 bg-panel p-6">
          <p className="flex items-center gap-2 text-2xl font-extrabold">
            <CalendarCheck className="h-6 w-6 text-violet-light" aria-hidden="true" /> Request sent
          </p>
          <p className="text-soft">I will confirm a time with you shortly. Nothing is booked until you hear from me.</p>
          <a href={whatsappAbout("a call I just requested")} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-flex">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Prefer WhatsApp? Message me
          </a>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-panel p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" required placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
            <input name="email" type="email" required placeholder="Your email" aria-label="Your email" autoComplete="email" className={field} />
          </div>
          <select name="topic" required defaultValue={wanted} aria-label="What is the call about" className={field}>
            <option value="" disabled>
              What is the call about?
            </option>
            {packages.map((p) => (
              <option key={p.name}>Quote: {p.name}</option>
            ))}
            <option>Band booking</option>
            <option>Student help</option>
            <option>Hiring or a job</option>
            <option>Something else</option>
          </select>
          {[1, 2, 3].map((n) => (
            <div key={n} className="grid gap-3 md:grid-cols-2">
              <select name={`day${n}`} required={n === 1} defaultValue="" aria-label={`Day option ${n}`} className={field}>
                <option value="">{n === 1 ? "First choice: day" : `Choice ${n}: day (optional)`}</option>
                {days.map((d) => (
                  <option key={d.value} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select name={`part${n}`} defaultValue={PARTS[1]} aria-label={`Time of day option ${n}`} className={field}>
                {PARTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          ))}
          <div className="grid gap-4 md:grid-cols-2">
            <select name="how" defaultValue="Phone call" aria-label="How should I call" className={field}>
              <option>Phone call</option>
              <option>WhatsApp call</option>
              <option>Video call</option>
            </select>
            <input name="phone" placeholder="Phone or WhatsApp number (optional)" aria-label="Phone or WhatsApp number" autoComplete="tel" className={field} />
          </div>
          <textarea name="note" rows={3} placeholder="Anything I should know before we talk? (optional)" aria-label="Note" className={field} />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <button type="submit" disabled={state === "sending"} className="btn-primary w-full justify-center !py-3 text-base disabled:opacity-60">
            {state === "sending" ? "Sending..." : "Request this call"}
          </button>
          {state === "failed" && (
            <p role="alert" className="text-sm text-red-400">
              Could not send. Email aaron7prince@gmail.com or message me on WhatsApp instead.
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default Book;
