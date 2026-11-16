// A small throttle for the code endpoints. Uses the shared store when it is configured (so the limit holds across
// all server instances); otherwise a per-instance memory fallback, which is weaker but still slows guessing.
import { bump, storeReady } from "./_store.js";

const memory = new Map();

/** Returns true when this client has used up `limit` attempts in the last `windowSeconds`. */
export async function tooMany(req, name, limit, windowSeconds) {
  const ip = String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (storeReady()) {
    const n = await bump(`rs:rate:${name}:${ip}`, windowSeconds);
    if (n !== null) return n > limit;
  }
  const now = Date.now();
  const key = `${name}:${ip}`;
  const recent = (memory.get(key) || []).filter((t) => now - t < windowSeconds * 1000);
  memory.set(key, [...recent, now]);
  return recent.length >= limit;
}
