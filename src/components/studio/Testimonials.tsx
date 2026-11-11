import { useState } from "react";
import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { collect } from "@/lib/collect";
import { Reveal } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg outline-none transition focus:border-violet-light";

/** Shows approved quotes only. Anyone who worked with Aaron can send one; it is reviewed before it appears. */
export const Testimonials = () => {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (d.get("website")) return;
    d.set("topic", "Testimonial");
    setState("sending");
    setState((await collect("testimonial", d)) ? "sent" : "failed");
  };
  return (
    <section aria-labelledby="proof-title" className="mx-auto max-w-6xl px-5 pt-14 md:pt-24">
      <h2 id="proof-title" className="text-3xl font-extrabold md:text-5xl">
        {testimonials.length ? "What clients say" : "Worked with me?"}
      </h2>
      {testimonials.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <Reveal key={t.name} className="rounded-3xl border border-line bg-panel p-6">
              <Quote className="h-6 w-6 text-violet-light" aria-hidden="true" />
              <p className="mt-3 text-lg">{t.quote}</p>
              <p className="mt-3 font-semibold">
                {t.name}
                {t.role && <span className="font-normal text-soft">, {t.role}</span>}
              </p>
            </Reveal>
          ))}
        </div>
      )}
      <div className="mt-6 rounded-3xl border border-line bg-panel p-6 md:p-8">
        <p className="text-lg font-bold">{testimonials.length ? "Add yours" : "Leave a few words about the work."}</p>
        <p className="mt-1 text-sm text-soft">It comes to me first. Nothing is shown on this site until I have your permission to publish it.</p>
        {state === "sent" ? (
          <p role="status" className="mt-4 font-semibold text-emerald-500">
            Thank you. I will check with you before it goes on the site.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
            <input name="name" required placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
            <input name="email" type="email" required placeholder="Your email (not shown)" aria-label="Your email" autoComplete="email" className={field} />
            <input name="organisation" placeholder="Your business or role (optional)" aria-label="Business or role" className={`${field} md:col-span-2`} />
            <textarea name="message" required rows={3} placeholder="What did I do, and how did it help?" aria-label="Your words" className={`${field} md:col-span-2`} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="md:col-span-2">
              <button type="submit" disabled={state === "sending"} className="btn-primary disabled:opacity-60">
                {state === "sending" ? "Sending..." : "Send my words"}
              </button>
              {state === "failed" && (
                <span role="alert" className="ml-3 text-sm text-red-400">
                  Could not send. Email aaron7prince@gmail.com instead.
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
