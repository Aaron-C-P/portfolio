import { Check } from "lucide-react";
import { Fit, ResumeDoc } from "@/components/studio/ResumeDoc";
import { TEMPLATES } from "@/lib/resumeTemplates.js";
import type { Resume } from "@/lib/resumeEngine";

/** A grid of all ten templates, each showing the given résumé. Pick one with a click or the keyboard. */
export const TemplateGallery = ({ r, selected, onSelect, locked }: { r: Resume; selected: string; onSelect: (id: string) => void; locked: boolean }) => (
  <div role="radiogroup" aria-label="Résumé template" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    {TEMPLATES.map((t) => {
      const on = t.id === selected;
      return (
        <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => onSelect(t.id)} className={`group rounded-2xl border p-2 text-left transition ${on ? "border-violet-light bg-violet/20" : "border-line bg-panel hover:border-violet-light/60"}`}>
          <div className="pointer-events-none overflow-hidden rounded-lg shadow-md">
            <Fit>
              <ResumeDoc r={r} templateId={t.id} locked={locked} />
            </Fit>
          </div>
          <p className="mt-2 flex items-center gap-1 px-1 text-sm font-bold">{on && <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />}{t.name}</p>
          <p className="px-1 pb-1 text-xs text-soft">{t.note}</p>
        </button>
      );
    })}
  </div>
);
