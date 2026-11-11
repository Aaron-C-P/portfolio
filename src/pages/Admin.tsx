import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, LogOut, Lock, Plus, RefreshCw, Search } from "lucide-react";
import { adminCall, fetchAvailable, type Lead } from "@/lib/collect";
import { usePageTitle } from "@/components/studio/parts";

const field = "w-full rounded-xl border border-line bg-white/5 px-4 py-2.5 text-fg outline-none transition focus:border-violet-light";
const chip = (on: boolean) => `rounded-full border px-4 py-1.5 text-sm ${on ? "border-violet-light bg-violet/10" : "border-line"}`;
const KEY = "admin-key";
const DAY = 86400000;
const errors: Record<string, string> = {
  wrong_password: "That password is not right.",
  locked: "Too many wrong tries. Wait 15 minutes and try again.",
  admin_disabled: "Admin is not switched on yet: set ADMIN_KEY in the Apps Script project.",
  network: "Could not reach the leads service. Check the Apps Script deployment.",
  bad_email: "That email address does not look right.",
  missing_name: "A name is required.",
  not_found: "That lead no longer exists. Refresh the list.",
  busy: "The sheet is busy. Try again in a moment.",
};
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

type Draft = { name: string; email: string; topic: string; organisation: string; kind: string; message: string; notes: string };
const blank: Draft = { name: "", email: "", topic: "", organisation: "", kind: "contact", message: "", notes: "" };

const LeadForm = ({ initial, submitLabel, busy, onSubmit, onCancel }: { initial: Draft; submitLabel: string; busy: boolean; onSubmit: (d: Draft) => void; onCancel: () => void }) => {
  const [d, setD] = useState(initial);
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(d);
      }}
      className="mt-3 grid gap-3 sm:grid-cols-2"
    >
      <label className="text-sm">
        Name
        <input required value={d.name} onChange={set("name")} className={field} />
      </label>
      <label className="text-sm">
        Email
        <input required type="email" value={d.email} onChange={set("email")} className={field} />
      </label>
      <label className="text-sm">
        Topic
        <input value={d.topic} onChange={set("topic")} className={field} />
      </label>
      <label className="text-sm">
        Company or role
        <input value={d.organisation} onChange={set("organisation")} className={field} />
      </label>
      <label className="text-sm">
        Type
        <select value={d.kind} onChange={set("kind")} className={field}>
          <option value="contact">Message</option>
          <option value="resume">Résumé request</option>
          <option value="chat">Live chat</option>
        </select>
      </label>
      <span className="hidden sm:block" />
      <label className="text-sm sm:col-span-2">
        Message
        <textarea rows={3} value={d.message} onChange={set("message")} className={field} />
      </label>
      <label className="text-sm sm:col-span-2">
        Private notes (only you see these)
        <textarea rows={2} value={d.notes} onChange={set("notes")} className={field} />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? "Saving..." : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
};

const csv = (rows: Lead[]) => {
  const cols: (keyof Lead)[] = ["Timestamp", "ID", "Kind", "Name", "Email", "Topic", "Organisation", "Message", "Notes", "Source", "Device", "Page", "Status"];
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c] ?? "")).join(","))].join("\r\n");
};

type Line = { from: string; text: string; at?: string };

/** One live conversation: the whole thread, refreshed while open, with a box to answer as Aaron. */
const Thread = ({ id, adminKey, onAuthLost }: { id: string; adminKey: string; onAuthLost: () => void }) => {
  const [lines, setLines] = useState<Line[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const lost = useRef(onAuthLost);
  lost.current = onAuthLost;

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      if (document.hidden) return;
      const r = await adminCall<{ messages: Line[] }>({ action: "admin_thread", key: adminKey, id });
      if (stop) return;
      if (r.ok) setLines(r.messages);
      else if (r.error === "wrong_password" || r.error === "locked") lost.current();
    };
    void pull();
    const t = window.setInterval(() => void pull(), 10000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, [id, adminKey]);

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setErr("");
    const r = await adminCall<{ messages: Line[] }>({ action: "admin_reply", key: adminKey, id, text: body });
    setSending(false);
    if (r.ok) {
      setLines(r.messages);
      setText("");
    } else setErr(r.error === "wrong_password" || r.error === "locked" ? "Logged out." : "Could not send. Try again.");
  };

  return (
    <div className="mt-4 rounded-2xl border border-violet-light/40 p-4">
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {lines === null && <p className="text-sm text-soft">Loading...</p>}
        {lines?.map((m, i) => (
          <div key={i} className={`flex ${m.from === "aaron" ? "justify-end" : ""}`}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.from === "aaron" ? "bg-violet text-white" : m.from === "ai" ? "bg-white/5 italic text-soft" : "bg-white/10"}`}>
              <span className="block text-[11px] uppercase tracking-wide opacity-70">{m.from === "aaron" ? "You" : m.from === "ai" ? "AI guide" : "Visitor"}</span>
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={reply} className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply as Aaron (also emailed to them)" aria-label="Reply as Aaron" maxLength={2000} className={`${field} flex-1`} />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary disabled:opacity-50">
          {sending ? "Sending..." : "Reply"}
        </button>
      </form>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
    </div>
  );
};

const Admin = () => {
  usePageTitle("Admin");
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
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState<"All" | "New" | "Replied" | "Archived">("New");
  const [kind, setKind] = useState<"all" | "contact" | "resume" | "chat" | "booking" | "testimonial">("all");
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [tests, setTests] = useState(false);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null); // lead id, or "bulk"

  const logout = () => {
    sessionStorage.removeItem(KEY);
    setKey("");
    setLeads(null);
    setInput("");
  };

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

  // New live chats should appear without pressing Refresh.
  useEffect(() => {
    if (!key || !leads) return;
    const t = window.setInterval(async () => {
      if (document.hidden) return;
      const res = await adminCall<{ leads: Lead[] }>({ action: "admin_list", key });
      if (res.ok) setLeads(res.leads);
    }, 30000);
    return () => window.clearInterval(t);
  }, [key, leads]);

  useEffect(() => {
    if (!key) return;
    void fetchAvailable().then(setAvailable);
  }, [key]);

  /** Runs one admin action. Returns the reply, or null after showing why it failed. */
  const run = async <T extends object>(payload: object, done: string) => {
    setBusy(true);
    setError("");
    const res = await adminCall<T>({ ...payload, key });
    setBusy(false);
    if (!res.ok) {
      if (res.error === "wrong_password" || res.error === "locked") return logout(), null;
      setError(errors[res.error] ?? "Something went wrong.");
      return null;
    }
    setNotice(done);
    return res;
  };

  const toggleAvailable = async () => {
    const res = await run<{ available: boolean }>({ action: "admin_available", available: !available }, !available ? "Visitors now see that you are online." : "Visitors now see that you are away.");
    if (res) setAvailable(res.available);
  };
  const merge = (changed: Lead[]) => setLeads((l) => l?.map((x) => changed.find((c) => c.ID === x.ID) ?? x) ?? l);
  const status = async (ids: string[], s: string) => {
    const res = await run<{ leads: Lead[] }>({ action: "admin_update", ids, status: s }, ids.length > 1 ? `${ids.length} leads set to ${s}.` : `Marked ${s.toLowerCase()}.`);
    if (res) merge(res.leads);
  };
  const remove = async (ids: string[]) => {
    const res = await run({ action: "admin_delete", ids }, `Deleted ${ids.length} ${ids.length === 1 ? "lead" : "leads"}.`);
    if (res) {
      setLeads((l) => l?.filter((x) => !ids.includes(x.ID)) ?? l);
      setPicked(new Set());
      setConfirm(null);
    }
  };
  const create = async (d: Draft) => {
    const res = await run<{ lead: Lead }>({ action: "admin_create", fields: d }, "Lead added.");
    if (res) {
      setLeads((l) => [res.lead, ...(l ?? [])]);
      setAdding(false);
      setShow("All");
      setTests(false);
    }
  };
  const save = async (id: string, d: Draft) => {
    const res = await run<{ leads: Lead[] }>({ action: "admin_update", id, fields: d }, "Saved.");
    if (res) {
      merge(res.leads);
      setEditing(null);
    }
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

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (leads ?? []).filter(
      (l) =>
        (tests ? l.Status === "TEST" : l.Status !== "TEST" && (show === "All" || l.Status === show)) &&
        (kind === "all" || l.Kind === kind) &&
        (!needle || [l.Name, l.Email, l.Topic, l.Organisation, l.Message, l.Notes, l.ID].some((v) => v?.toLowerCase().includes(needle)))
    );
  }, [leads, tests, show, kind, q]);
  const sel = rows.filter((r) => picked.has(r.ID)).map((r) => r.ID);

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
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void toggleAvailable()} aria-pressed={available} className={chip(available)}>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${available ? "bg-green-500" : "bg-slate-400"}`} aria-hidden="true" />
            {available ? "Online for chat" : "Away"}
          </button>
          <button type="button" onClick={() => { setAdding(!adding); setEditing(null); }} className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add lead
          </button>
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() => {
              const url = URL.createObjectURL(new Blob([csv(rows)], { type: "text/csv" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-ghost disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </button>
          <button type="button" onClick={() => void load(key)} disabled={busy} className="btn-ghost">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </button>
          <button type="button" onClick={logout} className="btn-ghost">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </div>

      {adding && (
        <div className="mt-5 rounded-2xl border border-violet-light/50 bg-panel p-5">
          <p className="font-bold">New lead</p>
          <LeadForm initial={blank} submitLabel="Add lead" busy={busy} onSubmit={(d) => void create(d)} onCancel={() => setAdding(false)} />
        </div>
      )}

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

      <div role="status" className="mt-4 min-h-6 text-sm">
        {error ? <span className="text-red-500">{error}</span> : <span className="text-emerald-600">{notice}</span>}
      </div>

      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" aria-hidden="true" />
        <input type="search" aria-label="Search leads" placeholder="Search name, email, topic, message, notes" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} pl-11`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["New", "Replied", "Archived", "All"] as const).map((s) => (
          <button key={s} type="button" onClick={() => { setTests(false); setShow(s); }} aria-pressed={!tests && show === s} className={chip(!tests && show === s)}>
            {s}
          </button>
        ))}
        <span className="mx-1 border-l border-line" />
        {(["all", "contact", "resume", "chat", "booking", "testimonial"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={chip(kind === k)}>
            {k === "all" ? "Everything" : k === "resume" ? "Résumé" : k === "chat" ? "Live chat" : k === "booking" ? "Bookings" : k === "testimonial" ? "Testimonials" : "Contact"}
          </button>
        ))}
        <span className="mx-1 border-l border-line" />
        <button type="button" onClick={() => setTests((t) => !t)} aria-pressed={tests} className={chip(tests)}>
          Test rows
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sel.length === rows.length}
              onChange={(e) => setPicked(e.target.checked ? new Set(rows.map((r) => r.ID)) : new Set())}
            />
            {sel.length ? `${sel.length} selected` : `Select all ${rows.length}`}
          </label>
          {sel.length > 0 &&
            (confirm === "bulk" ? (
              <>
                <span className="font-semibold text-red-600">Delete {sel.length} permanently? This cannot be undone.</span>
                <button type="button" disabled={busy} onClick={() => void remove(sel)} className="rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setConfirm(null)} className="btn-ghost">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={busy} onClick={() => void status(sel, "Replied")} className="btn-ghost">
                  Mark replied
                </button>
                <button type="button" disabled={busy} onClick={() => void status(sel, "Archived")} className="btn-ghost">
                  Archive
                </button>
                <button type="button" onClick={() => setConfirm("bulk")} className="btn-ghost text-red-600">
                  Delete
                </button>
              </>
            ))}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {rows.length === 0 && <li className="rounded-2xl border border-line bg-panel p-6 text-soft">Nothing here.</li>}
        {rows.map((l) => (
          <li key={l.ID} className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Select ${l.Name}`}
                className="mt-2"
                checked={picked.has(l.ID)}
                onChange={(e) => {
                  const n = new Set(picked);
                  if (e.target.checked) n.add(l.ID);
                  else n.delete(l.ID);
                  setPicked(n);
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold">
                      {l.Name}
                      {l.Kind === "chat" && l.Priority === "hot" && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 align-middle text-xs font-semibold text-white">Hot</span>}
                      {l.Kind === "chat" && l.Priority === "warm" && <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 align-middle text-xs font-semibold text-white">Warm</span>}
                    </p>
                    <a href={`mailto:${l.Email}`} className="break-all text-violet-light underline">
                      {l.Email}
                    </a>
                  </div>
                  <div className="text-right text-sm text-soft">
                    <p>{when(l.Timestamp)}</p>
                    <p>
                      {l.Kind === "resume" ? "Résumé request" : l.Kind === "chat" ? "Live chat" : l.Kind === "booking" ? "Call booking" : l.Kind === "testimonial" ? "Testimonial" : "Message"} · {l.Status}
                    </p>
                  </div>
                </div>

                {editing === l.ID ? (
                  <LeadForm
                    initial={{ name: l.Name, email: l.Email, topic: l.Topic, organisation: l.Organisation, kind: l.Kind, message: l.Message, notes: l.Notes ?? "" }}
                    submitLabel="Save changes"
                    busy={busy}
                    onSubmit={(d) => void save(l.ID, d)}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <>
                    {(l.Topic || l.Organisation) && <p className="mt-3 text-sm text-soft">{[l.Topic, l.Organisation].filter(Boolean).join(" · ")}</p>}
                    {l.Message && <p className="mt-3 whitespace-pre-wrap">{l.Message}</p>}
                    {l.Notes && (
                      <p className="mt-3 whitespace-pre-wrap rounded-xl border border-amber-500/40 bg-amber-300/10 px-3 py-2 text-sm">
                        <span className="font-semibold">Note: </span>
                        {l.Notes}
                      </p>
                    )}
                    {l.Kind === "chat" && l.Intent && <p className="mt-2 text-xs text-soft">Model read this as: {l.Intent.replace(/_/g, " ")}</p>}
                    {l.Kind === "chat" && (
                      <div className="mt-3">
                        <button type="button" onClick={() => setOpenChat(openChat === l.ID ? null : l.ID)} aria-expanded={openChat === l.ID} className="btn-primary">
                          {openChat === l.ID ? "Hide conversation" : l.Status === "TEST" ? "Open test conversation" : "Open conversation and reply"}
                        </button>
                        {openChat === l.ID && <Thread id={l.ID} adminKey={key} onAuthLost={logout} />}
                      </div>
                    )}
                    <p className="mt-3 text-xs text-soft">
                      from {l.Source || "direct"} · {l.Device || "n/a"} · {l.Page} · {l.ID}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      {l.Status !== "TEST" && l.Status !== "Replied" && (
                        <button type="button" disabled={busy} onClick={() => void status([l.ID], "Replied")} className="btn-ghost">
                          Mark replied
                        </button>
                      )}
                      {l.Status !== "TEST" && l.Status !== "Archived" && (
                        <button type="button" disabled={busy} onClick={() => void status([l.ID], "Archived")} className="btn-ghost">
                          Archive
                        </button>
                      )}
                      {l.Status !== "TEST" && l.Status !== "New" && (
                        <button type="button" disabled={busy} onClick={() => void status([l.ID], "New")} className="btn-ghost">
                          Back to new
                        </button>
                      )}
                      <button type="button" onClick={() => { setEditing(l.ID); setAdding(false); }} className="btn-ghost">
                        Edit
                      </button>
                      {confirm === l.ID ? (
                        <>
                          <span className="font-semibold text-red-600">Delete permanently?</span>
                          <button type="button" disabled={busy} onClick={() => void remove([l.ID])} className="rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white">
                            Yes, delete
                          </button>
                          <button type="button" onClick={() => setConfirm(null)} className="btn-ghost">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setConfirm(l.ID)} className="btn-ghost text-red-600">
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
