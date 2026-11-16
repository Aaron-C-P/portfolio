// Shared by /api/resume-webhook (makes a code for a paid order) and /api/resume-unlock (checks one).
// Codes are derived, not stored: RS-<order id in base36>-<8 character signature>. The signature is an
// HMAC of the order id with RESUME_CODE_SECRET, so a code cannot be guessed or invented without the secret,
// and no database is needed. Codes you type into RESUME_CODES by hand keep working as well.

import { createHmac, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
const ID_RE = /^[0-9A-Z]{1,16}$/;

const mac = (secret, id) => {
  const h = createHmac("sha256", secret).update(id).digest();
  return Array.from({ length: 8 }, (_, i) => ALPHABET[h[i] % ALPHABET.length]).join("");
};

const same = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Makes the code for a payment provider order id (a number or numeric string). */
export function makeCode(orderId, secret = process.env.RESUME_CODE_SECRET) {
  if (!secret) throw new Error("RESUME_CODE_SECRET is not set");
  const id = BigInt(String(orderId).replace(/\D/g, "") || "0").toString(36).toUpperCase();
  return `RS-${id}-${mac(secret, id)}`;
}

/** True when the code was made by makeCode with this secret. */
export function isDerivedCode(code, secret = process.env.RESUME_CODE_SECRET) {
  if (!secret || typeof code !== "string") return false;
  const m = /^RS-([0-9A-Z]{1,16})-([A-Z0-9]{8})$/.exec(code.trim().toUpperCase());
  if (!m || !ID_RE.test(m[1])) return false;
  return same(mac(secret, m[1]), m[2]);
}
