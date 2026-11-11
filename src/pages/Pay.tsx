import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { bank, bankReady, packages } from "@/data/pay";
import { collect } from "@/lib/collect";
import { whatsappAbout } from "@/lib/contact";
import { SectionHead, usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg outline-none transition focus:border-violet-light";
const code = () => `AP-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

const Pay = () => {
  usePageTitle("Pay");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const reference = code();
    const out = new FormData();
    out.set("name", String(d.get("name")));
    out.set("email", String(d.get("email")));
    out.set("topic", "Payment reference");
    out.set("message", `Reference ${reference}. For: ${d.get("for")}. Amount I will send: ${d.get("amount") || "not stated"}. I have not paid yet, this only generated the reference.`);
    setBusy(true);
    await collect("contact", out); // best effort: the visitor still gets the code if the sheet is down
    setBusy(false);
    setRef(reference);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32">
      <SectionHead page eyebrow="Pay" title="Pay by bank transfer." intro="After we have agreed the work and the price, pay here. Use your reference code on the transfer so I can match it to you." />
      {!ref ? (
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-panel p-6">
          <input name="name" required placeholder="Your name" aria-label="Your name" autoComplete="name" className={field} />
          <input name="email" type="email" required placeholder="Your email" aria-label="Your email" autoComplete="email" className={field} />
          <select name="for" required defaultValue="" aria-label="What you are paying for" className={field}>
            <option value="" disabled>What are you paying for?</option>
            {packages.map((p) => <option key={p.name}>{p.name}</option>)}
            <option>Student help session</option>
            <option>Something else we agreed</option>
          </select>
          <input name="amount" placeholder="Agreed amount (optional)" aria-label="Agreed amount" className={field} />
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Creating..." : "Get my reference code"}</button>
        </form>
      ) : (
        <div className="space-y-5 rounded-3xl border border-violet-light/50 bg-panel p-6">
          <p className="text-sm text-soft">Your reference code</p>
          <p className="flex items-center gap-3 text-3xl font-extrabold tracking-wide">
            {ref}
            <button type="button" aria-label="Copy reference code" onClick={() => { void navigator.clipboard?.writeText(ref); setCopied(true); }} className="btn-ghost !px-3 !py-2 text-sm">
              <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? "Copied" : "Copy"}
            </button>
          </p>
          {bankReady ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {([["Account name", bank.accountName], ["Bank", bank.bank], ["Account number", bank.accountNumber], ["Branch", bank.branch], ["Currency", bank.currency]] as const).map(([k, v]) => (
                <div key={k}><dt className="text-soft">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
          ) : (
            <p className="rounded-xl border border-amber-500/40 bg-amber-300/10 px-4 py-3 text-sm">
              Transfer details are shared directly, not posted here. Message Aaron with this code and he will send them.
            </p>
          )}
          <p className="text-sm text-soft">Put the code in the transfer description, then message me once it is sent. Work starts when the payment is confirmed.</p>
          <a href={whatsappAbout(`paying with reference ${ref}`)} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Message Aaron about this payment
          </a>
        </div>
      )}
    </div>
  );
};

export default Pay;
