// Shared by /api/resume-webhook (makes a code for a paid order), /api/resume-unlock and /api/resume-pdf (check one).
// Codes are derived, not stored: RS-<order id>-<issued time>-<8 character signature>. The signature is an HMAC of the
// order id and issue time with RESUME_CODE_SECRET, so a code cannot be guessed or invented, and it stops working
// after RESUME_CODE_DAYS (default 90). If Upstash is configured (see _store.js) a refund revokes the code at once.
// Codes you type into RESUME_CODES by hand (bank transfer, WiPay) keep working too and do not expire.

import { createHmac, timingSafeEqual } from "node:crypto";
import { isFlagged } from "./_store.js";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
const CODE_RE = /^RS-([0-9A-Z]{1,16})-([0-9A-Z]{1,10})-([A-Z0-9]{8})$/;

export const maxAgeDays = () => Math.max(1, Number(process.env.RESUME_CODE_DAYS) || 90);
const nowSeconds = () => Math.floor(Date.now() / 1000);

const mac = (secret, id, issued) => {
  const h = createHmac("sha256", secret).update(`${id}.${issued}`).digest();
  return Array.from({ length: 8 }, (_, i) => ALPHABET[h[i] % ALPHABET.length]).join("");
};

const same = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Makes the code for a payment provider order id (a number or numeric string). */
export function makeCode(orderId, secret = process.env.RESUME_CODE_SECRET, issuedAt = nowSeconds()) {
  if (!secret) throw new Error("RESUME_CODE_SECRET is not set");
  const id = BigInt(String(orderId).replace(/\D/g, "") || "0").toString(36).toUpperCase();
  const issued = issuedAt.toString(36).toUpperCase();
  return `RS-${id}-${issued}-${mac(secret, id, issued)}`;
}

/** Splits a derived code into its parts, or null when it is not shaped like one. */
export const parseCode = (code) => {
  const m = CODE_RE.exec(String(code).trim().toUpperCase());
  return m ? { id: m[1], issued: m[2], sig: m[3] } : null;
};

/** The id under which a refund revokes a code (the same base-36 id the code carries). */
export const revokeKey = (orderId) => `rs:revoked:${BigInt(String(orderId).replace(/\D/g, "") || "0").toString(36).toUpperCase()}`;

/**
 * Decides whether a code may be used right now.
 * Returns { ok: true, key } where key identifies the code for counting, or { ok: false, reason }.
 */
export async function verifyCode(code) {
  const clean = typeof code === "string" ? code.trim().toUpperCase().slice(0, 60) : "";
  if (!clean) return { ok: false, reason: "invalid" };

  const manual = (process.env.RESUME_CODES || "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (manual.some((c) => same(c, clean))) return { ok: true, key: clean, manual: true };

  const secret = process.env.RESUME_CODE_SECRET;
  const p = parseCode(clean);
  if (!secret || !p || !same(mac(secret, p.id, p.issued), p.sig)) return { ok: false, reason: "invalid" };

  const issuedAt = parseInt(p.issued, 36);
  if (!Number.isFinite(issuedAt) || nowSeconds() - issuedAt > maxAgeDays() * 86400) return { ok: false, reason: "expired" };
  if (await isFlagged(`rs:revoked:${p.id}`)) return { ok: false, reason: "revoked" };
  return { ok: true, key: clean, id: p.id };
}
