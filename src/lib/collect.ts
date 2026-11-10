/** Stores form submissions in the Google Sheet through the Apps Script web app (docs/apps-script). */
const COLLECT_URL =
  (import.meta.env.VITE_COLLECT_URL as string | undefined) ||
  "https://script.google.com/macros/s/AKfycbxDCTMV5sxGzsHiZRtGrnnb89aa9gW_8REfuZgOhyOVoEsM4EUYAkpwubWS9aV6I-LMyA/exec";

export type LeadKind = "contact" | "resume";

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

export type Lead = Record<"Timestamp" | "ID" | "Kind" | "Name" | "Email" | "Topic" | "Organisation" | "Message" | "Page" | "Referrer" | "Source" | "Medium" | "Campaign" | "Device" | "Viewport" | "Timezone" | "Status", string>;

/** Admin requests. The password is checked by the Apps Script, never by this site. */
export async function adminCall<T extends object = object>(payload: object): Promise<({ ok: true } & T) | { ok: false; error: string }> {
  try {
    const res = await fetch(COLLECT_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    return await res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}
