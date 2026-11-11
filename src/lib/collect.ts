/** Stores form submissions in the Google Sheet through the Apps Script web app (docs/apps-script). */
const COLLECT_URL =
  (import.meta.env.VITE_COLLECT_URL as string | undefined) ||
  "https://script.google.com/macros/s/AKfycbxDCTMV5sxGzsHiZRtGrnnb89aa9gW_8REfuZgOhyOVoEsM4EUYAkpwubWS9aV6I-LMyA/exec";

export type LeadKind = "contact" | "resume";
export type ChatLine = { from: "visitor" | "ai" | "aaron"; text: string; at?: string };

const headers = { "Content-Type": "text/plain;charset=utf-8" }; // plain text avoids a CORS preflight, which Apps Script cannot answer

const pageMeta = () => {
  const q = new URLSearchParams(window.location.search);
  return {
    page: window.location.pathname,
    referrer: document.referrer,
    utm_source: q.get("utm_source") ?? "",
    utm_medium: q.get("utm_medium") ?? "",
    utm_campaign: q.get("utm_campaign") ?? "",
    device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

/**
 * Sends one submission. Resolves true when the sheet accepted it. Never throws, so the
 * visitor's Formspree email still goes out even if the sheet is down.
 */
export async function collect(kind: LeadKind, data: FormData): Promise<boolean> {
  const fields: Record<string, string> = {};
  data.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("_")) fields[key] = value;
  });
  // The same id on a retry lets the server skip a second write.
  const body = JSON.stringify({ kind, cid: crypto.randomUUID(), fields, meta: pageMeta() });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(COLLECT_URL, { method: "POST", headers, body, keepalive: true });
      const reply = (await res.json()) as { ok: boolean; error?: string };
      if (reply.ok) return true;
      if (reply.error !== "busy" && reply.error !== "server") {
        console.warn("Lead not stored:", reply.error);
        return false; // a rejection such as a bad email will not improve on retry
      }
    } catch {
      // The browser could not read the reply. Send once more without reading it, so the row is still written.
      try {
        await fetch(COLLECT_URL, { method: "POST", mode: "no-cors", headers, body, keepalive: true });
        return true;
      } catch {
        /* offline: fall through to the next attempt */
      }
    }
  }
  console.warn("Lead could not be stored in the sheet.");
  return false;
}

export type Lead = Record<"Timestamp" | "ID" | "Kind" | "Name" | "Email" | "Topic" | "Organisation" | "Message" | "Page" | "Referrer" | "Source" | "Medium" | "Campaign" | "Device" | "Viewport" | "Timezone" | "Status" | "Notes" | "Priority" | "Intent", string>;

/** Admin requests. The password is checked by the Apps Script, never by this site. */
export async function adminCall<T extends object = object>(payload: object): Promise<({ ok: true } & T) | { ok: false; error: string }> {
  try {
    const res = await fetch(COLLECT_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    return await res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}

/** Live chat with a person. The conversation id and secret come back from chat_start and stay in this browser. */
export const chatStart = (fields: { name: string; email: string; message: string }, transcript: ChatLine[], hints: { intent: string; priority: string }) =>
  adminCall<{ id: string; token: string; available: boolean }>({
    action: "chat_start",
    cid: crypto.randomUUID(),
    fields,
    transcript: transcript.slice(-20),
    meta: { page: window.location.pathname, device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop", ...hints },
  });
export const chatPoll = (id: string, token: string, have: number) => adminCall<{ messages: ChatLine[]; total: number; available: boolean }>({ action: "chat_poll", id, token, have });
export const chatSend = (id: string, token: string, text: string) => adminCall({ action: "chat_send", id, token, text });

/** Whether Aaron has switched himself to online. The health check of the Apps Script reports it. */
export const fetchAvailable = (): Promise<boolean> =>
  fetch(COLLECT_URL)
    .then((r) => r.json())
    .then((r: { available?: boolean }) => !!r.available)
    .catch(() => false);
