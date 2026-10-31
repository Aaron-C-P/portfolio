import { useForm, ValidationError } from "@formspree/react";
import { Github, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react";
import { brand, services } from "@/data/studio";
import { Note, Reveal, usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-fg placeholder:text-soft/60 outline-none transition focus:border-violet-light";

const Contact = () => {
  usePageTitle("Contact");
  // Formspree emails each submission to the address on the form. If it ever fails, the email link below still works.
  const [state, submit] = useForm("mnjqgkgz");

  const channels = [
    { Icon: Mail, label: brand.email, href: `mailto:${brand.email}`, ext: false },
    { Icon: Phone, label: brand.phone, href: brand.phoneHref, ext: false },
    { Icon: Linkedin, label: "LinkedIn", href: brand.linkedin, ext: true },
    { Icon: Github, label: "GitHub", href: brand.github, ext: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <Reveal className="max-w-2xl">
        <Note className="text-3xl">Contact</Note>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-6xl">Tell me what you are trying to do.</h1>
        <p className="mt-5 text-lg text-soft">
          A rough description is fine. I read every message myself and will reply by email, usually within a couple of days. No obligation, no sales script.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <ul className="space-y-3">
            {channels.map(({ Icon, label, href, ext }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4 transition hover:border-violet-light/60"
                >
                  <Icon className="h-5 w-5 text-violet-light" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
            <li className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4 text-soft">
              <MapPin className="h-5 w-5 text-violet-light" /> {brand.location}
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          {state.succeeded ? (
            <div role="status" className="rounded-3xl border border-emerald-400/40 bg-emerald-400/5 p-8">
              <p className="text-2xl font-bold">Thank you. Your message was sent.</p>
              <p className="mt-2 text-soft">I will reply to the email address you gave.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 rounded-3xl border border-line bg-panel p-6 md:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Your name
                  </label>
                  <input id="name" name="name" required autoComplete="name" className={field} />
                  <ValidationError prefix="Name" field="name" errors={state.errors} className="mt-1 text-sm text-red-300" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={field} />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-sm text-red-300" />
                </div>
              </div>
              <div>
                <label htmlFor="topic" className="mb-2 block text-sm font-medium">
                  What do you need help with?
                </label>
                <select id="topic" name="topic" className={field} defaultValue="">
                  <option value="" disabled>
                    Choose the closest match
                  </option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.title} className="bg-panel">
                      {s.title}
                    </option>
                  ))}
                  <option value="Something else" className="bg-panel">
                    Something else
                  </option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Describe the problem or project
                </label>
                <textarea id="message" name="message" required rows={6} className={field} placeholder="What is slowing you down, and what would better look like?" />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-sm text-red-300" />
              </div>
              <button type="submit" disabled={state.submitting} className="btn-primary w-full disabled:opacity-60">
                {state.submitting ? "Sending..." : "Send message"} <Send className="h-4 w-4" />
              </button>
              <p className="text-center text-sm text-soft">
                Prefer email? Write to{" "}
                <a href={`mailto:${brand.email}`} className="text-cream underline">
                  {brand.email}
                </a>
                .
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
