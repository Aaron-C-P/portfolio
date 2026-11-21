import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Copy, Check } from "lucide-react";
import { Spider } from "@/components/studio/Spider";
import { usePageTitle } from "@/components/studio/parts";
import { placeholderSvg, templateSite } from "@/lib/webberTemplate";

/** The hosted app serves /_ph/ placeholders; offline we inline them as data URIs so the demo shows real images. */
const inlinePhotos = (h: string) =>
  h.replace(/\/_ph\/(\d+x\d+)\/([\w-]+)\?c=([0-9a-fA-F]{6})/g, (_m, size: string, label: string, c: string) => `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg(size, label, c))}`);

const field = "w-full rounded-xl border border-line bg-panel px-4 py-3 text-base text-fg placeholder:text-soft/70 focus:border-violet-light focus:outline-none";

const start = {
  name: "Fresh Cutz Barber Shop",
  type: "Barber shop",
  location: "Kingston, Jamaica",
  description: "Sharp cuts, fades and beard trims. Walk-ins welcome, appointments on WhatsApp.",
  phone: "876 555 0142",
  whatsapp: "876 555 0142",
  email: "",
  hours: "Mon–Sat 9am–7pm",
  instagram: "",
  vibe: "bold",
  color: "",
};

const Webber = () => {
  usePageTitle("The Webber: build a site");
  const [b, setB] = useState<Record<string, string>>(start);
  const [done, setDone] = useState(false);
  const html = useMemo(() => inlinePhotos(templateSite(b)), [b]);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setB((p) => ({ ...p, [k]: e.target.value }));

  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(b.name || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-600">
        <Spider className="h-5 w-5" /> The Webber · working demo
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Let’s web you in.</h1>
      <p className="mt-4 max-w-2xl text-xl text-soft">
        Describe a business and watch its website build as you type. Download it as one file you can host anywhere.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Describe the business">
          {[
            ["name", "Business name"],
            ["type", "What kind of business"],
            ["location", "Where"],
            ["phone", "Phone"],
            ["whatsapp", "WhatsApp number"],
            ["email", "Email"],
            ["hours", "Opening hours"],
            ["instagram", "Instagram handle"],
          ].map(([k, label]) => (
            <label key={k} className="block">
              <span className="mb-1 block text-sm text-soft">{label}</span>
              <input className={field} value={b[k]} onChange={set(k)} />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-sm text-soft">Describe it in a sentence or two</span>
            <textarea className={field} rows={3} value={b.description} onChange={set("description")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-soft">Style</span>
              <select className={field} value={b.vibe} onChange={set("vibe")}>
                <option value="modern">Modern</option>
                <option value="bold">Bold</option>
                <option value="elegant">Elegant</option>
                <option value="playful">Playful</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-soft">Colour (name or #hex)</span>
              <input className={field} value={b.color} onChange={set("color")} placeholder="auto" />
            </label>
          </div>
        </form>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-violet/10">
            <iframe title="Live preview of the generated site" srcDoc={html} className="block h-[640px] w-full bg-white" sandbox="" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={download} className="btn-primary">
              <Download className="h-4 w-4" /> Download the site
            </button>
            <button onClick={copy} className="btn-ghost">
              {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {done ? "Copied" : "Copy HTML"}
            </button>
            <Link to="/work/the-webber" className="btn-ghost">How it was built</Link>
          </div>
          <p className="mt-4 text-sm text-soft">
            This demo runs entirely in your browser using The Webber’s built-in designer, so nothing you type is sent anywhere. The hosted version adds AI edits, its own link and a monthly plan.{" "}
            <Link to="/contact" className="underline">Want one for your business?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Webber;
