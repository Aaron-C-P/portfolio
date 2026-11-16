// Optional shared counters, used to cap how often a code can be used and to revoke refunded codes.
// Uses Upstash Redis over plain HTTPS (free tier is plenty): set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// in Vercel. Without them every function returns null, and callers fall back to the stateless checks.

export const storeReady = () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function cmd(args) {
  if (!storeReady()) return null;
  try {
    const r = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!r.ok) return null;
    return (await r.json()).result ?? null;
  } catch {
    return null;
  }
}

/** Adds 1 to a counter that expires after `ttlSeconds`. Returns the new count, or null when the store is off. */
export async function bump(key, ttlSeconds) {
  const n = await cmd(["INCR", key]);
  if (n === 1) await cmd(["EXPIRE", key, String(ttlSeconds)]);
  return typeof n === "number" ? n : null;
}

export const flag = (key, ttlSeconds) => cmd(["SET", key, "1", "EX", String(ttlSeconds)]);
export const isFlagged = async (key) => (await cmd(["GET", key])) === "1";
