import { Link } from "react-router-dom";
import { ArrowRight, Download, Mail, MessageCircle, Phone } from "lucide-react";
import { brand, profilePhoto } from "@/data/studio";
import { saveContact, whatsapp } from "@/lib/contact";

const action = "flex items-center justify-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm font-medium transition hover:border-violet-light";

/** Compact version of the digital business card, for embedding in other pages. */
export const ContactCard = () => (
  <div className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-xl">
    <div className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-left">
      <img src={profilePhoto} alt="Aaron Prince" className="h-24 w-24 shrink-0 rounded-full border-4 border-panel object-cover object-[56%_22%] shadow" />
      <div>
        <p className="text-2xl font-extrabold">{brand.name}</p>
        <p className="font-hand text-2xl text-violet-light">Computer Science graduate, tutor and developer</p>
        <p className="mt-1 text-sm text-soft">Assignment help · SBA help · CSEC Mathematics · Web and data solutions</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 border-t border-line p-6 sm:grid-cols-4">
      <a href={brand.phoneHref} className={action}>
        <Phone className="h-4 w-4 text-violet-light" aria-hidden="true" /> Call
      </a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={action}>
        <MessageCircle className="h-4 w-4 text-violet-light" aria-hidden="true" /> WhatsApp
      </a>
      <a href={`mailto:${brand.email}`} className={action}>
        <Mail className="h-4 w-4 text-violet-light" aria-hidden="true" /> Email
      </a>
      <button type="button" onClick={saveContact} className={action}>
        <Download className="h-4 w-4 text-violet-light" aria-hidden="true" /> Save contact
      </button>
    </div>
    <Link to="/card" className="flex items-center justify-between border-t border-line px-6 py-4 text-sm font-medium text-violet-light transition hover:bg-white/5">
      Open my full digital card <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  </div>
);
