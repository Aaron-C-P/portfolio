import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Globe, Pencil, Sparkles, Undo2, Wallet } from "lucide-react";
import { Note, Reveal, SectionHead, StatusBadge, Tilt, usePageTitle } from "@/components/studio/parts";
import { collect } from "@/lib/collect";

const steps = [
  { Icon: Sparkles, title: "Describe the business", text: "A short form: name, what you do, where you are, how people reach you. AI builds the whole site in about a minute." },
  { Icon: Pencil, title: "Edit it yourself", text: "Tap any text to change it, tap a photo to swap it, or ask the AI for bigger changes like \"add a price list\"." },
  { Icon: Globe, title: "Get your own link", text: "Publish to your own address, and later your own domain. Your files sit in cloud storage, not on a laptop." },
  { Icon: Undo2, title: "Undo, pause or cancel", text: "Every change is saved with one-tap restore. Take the site offline whenever you like, or cancel the plan and it switches off." },
];

const points = [
  "Works well on a phone, for the owner and for their customers",
  "Version history, so a bad edit is never permanent",
  "Plans with AI limits, so costs stay predictable",
  "Pay by card, or by bank transfer or WiPay with a paid-until date",
  "An admin panel to see every client, plan and the monthly income",
  "No developer needed for small changes",
];

/** A drawn mock of the builder, so visitors can see the idea without a live demo. */
const Mock = () => (
  <Tilt max={6} className="mx-auto max-w-3xl">
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-violet/20">
      <div className="flex items-center gap-2 border-b border-line bg-raise px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 rounded-full bg-black/30 px-3 py-0.5 font-mono text-xs text-soft">shine-squad.yourdomain.com</span>
        <span className="ml-auto rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300">Published</span>
      </div>
      <div className="grid gap-0 md:grid-cols-[200px_1fr]">
        <div className="space-y-3 border-b border-line p-4 text-sm md:border-b-0 md:border-r">
          <p className="font-semibold">Ask the AI</p>
          <p className="rounded-xl bg-raise p-3 text-soft">Add a price list and a Saturday booking button.</p>
          <p className="rounded-xl bg-violet/30 p-3">Done. I added three packages and a WhatsApp booking button.</p>
          <p className="text-xs text-soft">Version 4 · undo any time</p>
        </div>
        <div className="space-y-3 bg-white p-6 text-ink">
          <p className="text-2xl font-extrabold">Shine Squad</p>
          <p className="text-sm text-ink/70">A car wash that comes to you, in Kingston.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Basic wash", "Full detail", "Interior"].map((t) => (
              <div key={t} className="rounded-xl bg-violet/10 p-3 text-sm font-semibold">
                {t}
              </div>
            ))}
          </div>
          <span className="inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Chat on WhatsApp</span>
        </div>
      </div>
    </div>
  </Tilt>
);

const SiteForge = () => {
  usePageTitle("SiteForge");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("topic", "SiteForge waitlist");
    data.set("message", `SiteForge waitlist. Business: ${String(data.get("business") || "not given")}`);
    setState("sending");
    setState((await collect("contact", data)) ? "done" : "error");
  };

  const input = "mt-1 w-full rounded-xl border border-line bg-raise px-3 py-2";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <Reveal className="max-w-3xl">
        <Note>Now building</Note>
        <h1 className="h-section mt-1 md:text-6xl">SiteForge: a website you can edit yourself.</h1>
        <p className="mt-4 text-lg text-soft">
          Most small businesses pay a developer once, then call them back for every change. SiteForge flips that: AI builds the site, the owner edits it, and a simple monthly plan keeps it online. Cancel and it goes offline.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatusBadge status="In progress" />
          <a href="#waitlist" className="btn-primary">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>

      <div className="mt-14">
        <Mock />
      </div>
      <p className="mt-3 text-center text-xs text-soft">An illustration of the builder, not a live site.</p>

      <section className="mt-20">
        <SectionHead eyebrow="How it works" title="From idea to live site in one sitting." />
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="h-full rounded-3xl border border-line bg-panel p-6">
                <Icon className="h-7 w-7 text-violet-light" aria-hidden="true" />
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-1 text-soft">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <Reveal>
          <Note>What you get</Note>
          <ul className="mt-3 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-soft">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <Note>Where it stands</Note>
          <div className="mt-3 rounded-3xl border border-line bg-panel p-6 text-soft">
            <p>The platform is built and working on my computer: sign-up, AI site builder, editing, publishing, version history, billing hooks and an admin panel.</p>
            <p className="mt-3">Not live yet: it still needs its server, domain and payment account. Prices are not final. I am looking for the first few businesses to try it.</p>
            <p className="mt-3 flex items-center gap-2 text-cream">
              <Wallet className="h-4 w-4" aria-hidden="true" /> Early users get a say in the price.
            </p>
          </div>
        </Reveal>
      </section>

      <section id="waitlist" className="mt-20 scroll-mt-28">
        <Reveal className="mx-auto max-w-xl rounded-[2rem] border border-violet-light/40 bg-gradient-to-br from-violet/30 to-panel p-8">
          <h2 className="text-2xl font-bold">Want a site you can edit yourself?</h2>
          <p className="mt-2 text-soft">Leave your details and I will message you when the first spots open. No payment, no obligation.</p>
          {state === "done" ? (
            <p role="status" className="mt-6 rounded-2xl bg-emerald-400/15 p-4 text-emerald-200">
              Thank you, you are on the list. I will be in touch.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold">
                Your name
                <input name="name" required autoComplete="name" className={input} />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input name="email" type="email" required autoComplete="email" className={input} />
              </label>
              <label className="block text-sm font-semibold">
                What is your business?
                <input name="business" className={input} placeholder="e.g. mobile car wash, bakery, salon" />
              </label>
              <button disabled={state === "sending"} className="btn-primary w-full justify-center disabled:opacity-60">
                {state === "sending" ? "Sending…" : "Join the waitlist"}
              </button>
              {state === "error" && (
                <p role="alert" className="text-sm text-red-300">
                  That did not go through. Please try again, or use the Contact page.
                </p>
              )}
            </form>
          )}
        </Reveal>
        <p className="mt-6 text-center text-sm text-soft">
          Prefer to talk first?{" "}
          <Link to="/contact" className="text-cream underline">
            Contact me
          </Link>
          .
        </p>
      </section>
    </div>
  );
};

export default SiteForge;
