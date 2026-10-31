import { useForm, ValidationError } from "@formspree/react";
import { Send } from "lucide-react";
import { brand } from "@/data/studio";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-fg placeholder:text-soft/60 outline-none transition focus:border-violet-light";

const Resume = () => {
  usePageTitle("Request my résumé");
  const [state, submit] = useForm("mnjqgkgz");
  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-32">
      <Reveal>
        <Note className="text-3xl">Résumé</Note>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-5xl">Request my résumé.</h1>
        <p className="mt-4 text-lg text-soft">
          My résumé includes contact details, so I send it directly rather than posting it publicly. Leave your email and I will reply with the latest copy.
        </p>
      </Reveal>
      <Reveal delay={0.08} className="mt-8">
        {state.succeeded ? (
          <div role="status" className="rounded-3xl border border-emerald-400/40 bg-emerald-400/5 p-8">
            <p className="text-2xl font-bold">Request received.</p>
            <p className="mt-2 text-soft">I will send my résumé to the email address you gave.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-line bg-panel p-6 md:p-8">
            <input type="hidden" name="_subject" value="Résumé request" />
            <input type="hidden" name="request" value="resume" />
            <div>
              <label htmlFor="r-name" className="mb-1 block text-sm font-medium">Your name</label>
              <input id="r-name" name="name" required autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="r-email" className="mb-1 block text-sm font-medium">Your email</label>
              <input id="r-email" name="email" type="email" required autoComplete="email" className={field} />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 block text-sm text-red-400" />
            </div>
            <div>
              <label htmlFor="r-org" className="mb-1 block text-sm font-medium">Company or role (optional)</label>
              <input id="r-org" name="organisation" className={field} />
            </div>
            <button type="submit" disabled={state.submitting} className="btn-primary disabled:opacity-60">
              <Send className="h-4 w-4" /> {state.submitting ? "Sending…" : "Send request"}
            </button>
            <p className="text-sm text-soft">
              Prefer email? Write to <a className="underline" href={`mailto:${brand.email}`}>{brand.email}</a>.
            </p>
          </form>
        )}
      </Reveal>
    </div>
  );
};

export default Resume;
