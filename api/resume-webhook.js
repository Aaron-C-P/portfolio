// Vercel Serverless Function: payment webhook for Résumé Studio. Lives at /api/resume-webhook.
// Point your Lemon Squeezy webhook here (event: order_created). When an order is paid it makes the buyer's
// unlock code, records the order in the Google Sheet, and emails the code through Resend.
//
// Vercel env: RESUME_WEBHOOK_SECRET (the signing secret you typed into Lemon Squeezy), RESUME_CODE_SECRET (any long
// random string), RESEND_API_KEY, RESUME_FROM_EMAIL (e.g. "Aaron <orders@yourdomain.com>", a domain verified in Resend),
// optional RESUME_VARIANT_ID (only orders for this product variant get a code), optional SITE_URL.

import { createHmac, timingSafeEqual } from "node:crypto";
import { makeCode, maxAgeDays, revokeKey } from "./_resumeCodes.js";
import { flag, storeReady } from "./_store.js";

export const config = { api: { bodyParser: false } }; // the signature is over the raw bytes

const COLLECT_URL =
  process.env.VITE_COLLECT_URL ||
  "https://script.google.com/macros/s/AKfycbxDCTMV5sxGzsHiZRtGrnnb89aa9gW_8REfuZgOhyOVoEsM4EUYAkpwubWS9aV6I-LMyA/exec";

const readRaw = async (req) => {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
};

export const validSignature = (raw, signature, secret) => {
  if (!secret || !signature) return false;
  const want = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const got = Buffer.from(String(signature));
  return want.length === got.length && timingSafeEqual(want, got);
};

const emailBody = (code, site) =>
  `Thank you for your order.\n\nYour Résumé Studio unlock code is:\n\n    ${code}\n\n` +
  `How to use it:\n1. Open ${site}/resume-builder (use the same browser you built your résumé in).\n2. Go to the last step, "Get it".\n3. Type the code under "Already paid?" and press Unlock.\n\n` +
  `The code is personal to you, so please do not share it. It works for ${maxAgeDays()} days, with edits and re-downloads of your résumé. If anything goes wrong, reply to this email and I will sort it out.\n\nAaron Prince`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const secret = process.env.RESUME_WEBHOOK_SECRET;
  if (!secret || !process.env.RESUME_CODE_SECRET) return res.status(503).json({ error: "Webhook not configured" });

  const raw = await readRaw(req);
  if (!validSignature(raw, req.headers["x-signature"], secret)) return res.status(401).json({ error: "Bad signature" });

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Bad JSON" });
  }

  const name = event?.meta?.event_name;
  const attrs = event?.data?.attributes || {};
  // A refund switches the code off straight away (needs the Upstash store); otherwise it is flagged for you in the sheet.
  if (name === "order_refunded" && event?.data?.type === "orders") {
    const orderId = String(event.data.id);
    const revoked = storeReady() ? await flag(revokeKey(orderId), maxAgeDays() * 86400 + 86400) : null;
    try {
      await fetch(COLLECT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          kind: "builder",
          cid: `lemon-refund-${orderId}`,
          fields: {
            name: String(attrs.user_name || "Résumé Studio buyer").slice(0, 120),
            email: String(attrs.user_email || "refund@resume.invalid").toLowerCase(),
            topic: "Résumé Studio REFUND",
            message: `Refunded order ${orderId}. ${revoked !== null ? "Its code has been switched off automatically." : "Automatic revoking is not set up (no Upstash store): this code still works until it expires. Rotate RESUME_CODE_SECRET only if it is being abused."}`,
          },
          meta: { page: "/api/resume-webhook" },
        }),
      });
    } catch (err) {
      console.error("resume-webhook: refund record failed", err);
    }
    return res.status(200).json({ ok: true, revoked: revoked !== null });
  }
  if (name !== "order_created" || event?.data?.type !== "orders") return res.status(200).json({ ignored: true });
  if (attrs.status && attrs.status !== "paid") return res.status(200).json({ ignored: "not paid" });

  const wanted = process.env.RESUME_VARIANT_ID;
  const variant = String(attrs.first_order_item?.variant_id ?? "");
  if (wanted && variant !== String(wanted)) return res.status(200).json({ ignored: "other product" });

  const email = String(attrs.user_email || "").toLowerCase();
  const buyer = String(attrs.user_name || "Résumé Studio buyer").slice(0, 120);
  const orderId = String(event.data.id);
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(200).json({ ignored: "no email" });

  const code = makeCode(orderId);
  const site = (process.env.SITE_URL || "https://aaronprince.vercel.app").replace(/\/+$/, "");

  // 1. Always keep a record in the sheet, with the code, so a failed email can be fixed by hand.
  try {
    await fetch(COLLECT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        kind: "builder",
        cid: `lemon-order-${orderId}`, // same id on a retry, so the sheet does not get a second row
        fields: { name: buyer, email, topic: "Résumé Studio PAID", message: `Paid order ${orderId}. Unlock code: ${code}. Email ${process.env.RESEND_API_KEY ? "sent automatically" : "NOT sent (no email service set up): send this code by hand"}.` },
        meta: { page: "/api/resume-webhook" },
      }),
    });
  } catch (err) {
    console.error("resume-webhook: sheet record failed", err);
  }

  // 2. Email the code.
  if (!process.env.RESEND_API_KEY || !process.env.RESUME_FROM_EMAIL) return res.status(200).json({ ok: true, emailed: false });
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: process.env.RESUME_FROM_EMAIL, to: [email], subject: "Your Résumé Studio unlock code", text: emailBody(code, site) }),
    });
    if (!r.ok) {
      console.error("resume-webhook: email failed", r.status, await r.text());
      return res.status(502).json({ error: "Email failed" }); // the provider retries the webhook
    }
  } catch (err) {
    console.error("resume-webhook: email error", err);
    return res.status(502).json({ error: "Email failed" });
  }
  return res.status(200).json({ ok: true, emailed: true });
}
