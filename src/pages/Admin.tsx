import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, LogOut, RefreshCw } from "lucide-react";
import { adminCall, type Lead } from "@/lib/collect";
import { usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-fg outline-none transition focus:border-violet-light";
const KEY = "admin-key";
const errors: Record<string, string> = {
  wrong_password: "That password is not right.",
  locked: "Too many wrong tries. Wait 15 minutes and try again.",
  admin_disabled: "Admin is not switched on yet: set ADMIN_KEY in the Apps Script project.",
  network: "Could not reach the leads service. Check the Apps Script deployment.",
};

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const DAY = 86400000;

const Admin = () => {
  usePageTitle("Admin");
  // Keep this page out of search results.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const [key, setKey] = useState(() => sessionStorage.getItem(KEY) ?? "");
  const [input, setInput] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState<"All" | "New" | "Replied" | "Archived">("New");
  const [kind, setKind] = useState<"all" | "contact" | "resume">("all");
  const [tests, setTests] = useState(false);

  const load = useCallback(async (k: string) => {
    setBusy(true);
    setError("");
    const res = await adminCall<{ leads: Lead[] }>({ action: "admin_list", key: k });
    setBusy(false);
    if (res.ok) {
      sessionStorage.setItem(KEY, k);
      setKey(k);
      setLeads(res.leads);
    } else {
      sessionStorage.removeItem(KEY);
      setKey("");
      setLeads(null);
      setError(errors[res.error] ?? "Something went wrong.");
    }
  }, []);

  useEffect(() => {
    if (key && !leads) void load(key);
  }, [key, leads, load]);

  const setStatus = async (id: string, status: string) => {
    const res = await adminCall({ action: "admin_update", key, id, status });
    if (res.ok) setLeads((l) => l?.map((x) => (x.ID === id ? { ...x, Status: status } : x)) ?? l);
    else setError(errors[res.error] ?? "Could not update that lead.");
  };

  const real = useMemo(() => (leads ?? []).filter((l) => l.Status !== "TEST"), [leads]);
  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: real.length,
      week: real.filter((l) => now - new Date(l.Timestamp).getTime() < 7 * DAY).length,
      waiting: real.filter((l) => l.Status === "New").length,
    };
  }, [real]);
  const topic = useMemo(() => {
    const n: Record<string, number> = {};
    real.forEach((l) => l.Topic && (n[l.Topic] = (n[l.Topic] ?? 0) + 1));
    return Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [real]);

  const rows = (leads ?? []).filter(
    (l) => (tests ? l.Status === "TEST" : l.Status !== "TEST") && (show === "All" || l.Status === show || tests) && (kind === "all" || l.Kind === kind)
  );

  if (!leads) {
    return (
      <div className="mx-auto max-w-sm px-5 pb-32 pt-40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(input);
          }}
          className="space-y-5 rounded-3xl border border-line bg-panel p-6"
        >
          <p className="flex items-center gap-2 text-2xl font-bold">
            <Lock className="h-5 w-5 text-violet-light" aria-hidden="true" /> Admin
          </p>
          <label htmlFor="pw" className="block text-sm font-medium">
            Password
          </label>
          <input id="pw" type="password" autoComplete="current-password" required value={input} onChange={(e) => setInput(e.target.value)} className={field} />
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Checking..." : "See leads"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-32">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Leads</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load(key)} disabled={busy} className="btn-ghost">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(KEY);
              setKey("");
              setLeads(null);
              setInput("");
            }}
            className="btn-ghost"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Total", stats.total],
          ["Last 7 days", stats.week],
          ["Waiting for a reply", stats.waiting],
        ].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-panel p-5">
            <p className="text-3xl font-extrabold">{n}</p>
            <p className="text-sm text-soft">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-soft">
        {stats.total === 0
          ? "Nothing has come in yet."
          : `${stats.week} in the last 7 days, ${stats.waiting} still waiting for a reply.${topic ? ` Most asked about: ${topic}.` : ""}`}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {(["New", "Replied", "Archived", "All"] as const).map((s) => (
          <button key={s} type="button" onClick={() => { setTests(false); setShow(s); }} aria-pressed={!tests && show === s} className={`rounded-full border px-4 py-1.5 ${!tests && show === s ? "border-violet-light bg-violet/10" : "border-line"}`}>
            {s}
          </button>
        ))}
        <span className="mx-1 border-l border-line" />
        {(["all", "contact", "resume"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={`rounded-full border px-4 py-1.5 capitalize ${kind === k ? "border-violet-light bg-violet/10" : "border-line"}`}>
            {k === "all" ? "Everything" : k === "resume" ? "Résumé" : "Contact"}
          </button>
        ))}
        <span className="mx-1 border-l border-line" />
        <button type="button" onClick={() => setTests((t) => !t)} aria-pressed={tests} className={`rounded-full border px-4 py-1.5 ${tests ? "border-violet-light bg-violet/10" : "border-line"}`}>
          Test rows
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="rounded-2xl border border-line bg-panel p-6 text-soft">Nothing here.</li>}
        {rows.map((l) => (
          <li key={l.ID} className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{l.Name}</p>
                <a href={`mailto:${l.Email}`} className="text-violet-light underline">
                  {l.Email}
                </a>
              </div>
              <div className="text-right text-sm text-soft">
                <p>{when(l.Timestamp)}</p>
                <p>
                  {l.Kind === "resume" ? "Résumé request" : "Message"} · {l.Status}
                </p>
              </div>
            </div>
            {(l.Topic || l.Organisation) && (
              <p className="mt-3 text-sm text-soft">
                {[l.Topic, l.Organisation].filter(Boolean).join(" · ")}
              </p>
            )}
            {l.Message && <p className="mt-3 whitespace-pre-wrap">{l.Message}</p>}
            <p className="mt-3 text-xs text-soft">
              from {l.Source || "direct"} · {l.Device} · {l.Page}
            </p>
            {l.Status !== "TEST" && (
              <div className="mt-4 flex gap-2 text-sm">
                {l.Status !== "Replied" && (
                  <button type="button" onClick={() => void setStatus(l.ID, "Replied")} className="btn-ghost">
                    Mark replied
                  </button>
                )}
                {l.Status !== "Archived" && (
                  <button type="button" onClick={() => void setStatus(l.ID, "Archived")} className="btn-ghost">
                    Archive
                  </button>
                )}
                {l.Status !== "New" && (
                  <button type="button" onClick={() => void setStatus(l.ID, "New")} className="btn-ghost">
                    Back to new
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
