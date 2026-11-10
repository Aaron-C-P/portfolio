import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Inbox } from "lucide-react";
import { adminCall, type Lead } from "@/lib/collect";

/**
 * Leads panel for the landing page. It renders nothing for visitors: it only appears in a
 * browser where the admin has logged in at /admin, and the leads come from the Apps Script
 * only because the stored password is accepted there.
 */
export const AdminStrip = () => {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    let key = "";
    try {
      key = sessionStorage.getItem("admin-key") ?? "";
    } catch {
      return;
    }
    if (!key) return;
    adminCall<{ leads: Lead[] }>({ action: "admin_list", key }).then((res) => {
      if (res.ok) setLeads(res.leads.filter((l) => l.Status !== "TEST"));
      else sessionStorage.removeItem("admin-key");
    });
  }, []);

  if (!leads) return null;
  const waiting = leads.filter((l) => l.Status === "New");
  return (
    <section aria-label="Your leads" className="mx-auto max-w-6xl px-5 pt-6">
      <div className="rounded-3xl border border-violet-light/50 bg-violet/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-bold">
            <Inbox className="h-5 w-5 text-violet-light" aria-hidden="true" />
            {waiting.length === 0 ? "No leads waiting" : `${waiting.length} ${waiting.length === 1 ? "lead" : "leads"} waiting for a reply`}
            <span className="text-sm font-normal text-soft">(only you can see this)</span>
          </p>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-light">
            Open all leads <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {waiting.slice(0, 3).map((l) => (
          <p key={l.ID} className="mt-3 truncate text-sm text-soft">
            <span className="font-semibold text-fg">{l.Name}</span> · {l.Kind === "resume" ? "résumé request" : l.Topic || "message"} · {l.Email}
          </p>
        ))}
      </div>
    </section>
  );
};
