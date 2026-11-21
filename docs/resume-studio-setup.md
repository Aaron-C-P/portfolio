# Résumé Studio: go-live checklist

Do these in order. Each step says what to copy and where it goes. Nothing here needs code changes.
Every change to a Vercel environment variable only takes effect after you redeploy (Deployments > the latest one > Redeploy).

## 0. Make two secrets (1 minute)
Make two long random strings and keep them somewhere safe (a password manager):
- `RESUME_CODE_SECRET` (any 32+ random characters). Changing it later invalidates every code already sent.
- `RESUME_WEBHOOK_SECRET` (any 20+ random characters). You will type the same value into Lemon Squeezy in step 1.

## 1. Lemon Squeezy (takes the money)
First confirm it will pay you in Jamaica: check their current supported payout countries and methods (bank or PayPal) before you invest more time. If it does not work for you, use another provider that gives you a hosted payment link and sends a signed "order paid" webhook; the code expects Lemon Squeezy's format, so tell me and I will adapt it.
1. Create an account and a store. Switch on **Test mode** (top of the dashboard) while you set up.
2. Products > New product: name "Résumé Studio", pricing **Single payment**, **$10 USD**. Publish it.
3. Open the product > Share: copy the **checkout link**. This is `VITE_RESUME_CHECKOUT_URL`.
4. Settings > Webhooks > add:
   - URL: `https://aaronprince.vercel.app/api/resume-webhook`
   - Signing secret: your `RESUME_WEBHOOK_SECRET`
   - Events: tick **order_created** and **order_refunded**
5. Optional but recommended once it works: copy the product's variant id and set it as `RESUME_VARIANT_ID`, so other products in your store never trigger a code.

## 2. Resend (emails the code to the buyer)
1. Create a free account at resend.com.
2. Domains > Add your domain (the one you bought). Add the DNS records it shows at your domain registrar, then wait for it to say Verified. (Without a verified domain Resend only sends to your own address.)
3. API Keys > create one. This is `RESEND_API_KEY`.
4. Decide the sender, for example `Aaron <orders@yourdomain.com>`. This is `RESUME_FROM_EMAIL`.
If you skip Resend, everything still works: each paid order's sheet row says "send this code by hand" and contains the code.

## 3. Upstash (download limits, rate limits, instant refund revoke) - optional, free
1. Create an account at upstash.com > Create database (Redis), pick a region near you.
2. On the database page open the **REST API** section. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## 4. Vercel environment variables
Project > Settings > Environment Variables. Add (Production):
| Name | Value |
| --- | --- |
| `VITE_RESUME_CHECKOUT_URL` | the Lemon Squeezy checkout link (step 1.3) |
| `RESUME_CODE_SECRET` | step 0 |
| `RESUME_WEBHOOK_SECRET` | step 0, same as in Lemon Squeezy |
| `RESEND_API_KEY` | step 2.3 |
| `RESUME_FROM_EMAIL` | step 2.4 |
| `UPSTASH_REDIS_REST_URL` | step 3 (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | step 3 (optional) |
| `RESUME_VARIANT_ID` | step 1.5 (optional) |
Optional tuning: `RESUME_CODE_DAYS` (default 90), `RESUME_MAX_DOWNLOADS` (default 25), `SITE_URL`.
Then **Redeploy**.

## 5. Google Sheet (records every order)
Open the Apps Script project, paste in the latest `docs/apps-script/Code.gs`, then Deploy > Manage deployments > edit > **New version** > Deploy. Without this the sheet rejects the `builder` rows (orders, paid, refunds).

## 6. Test it end to end (Lemon Squeezy is still in Test mode)
1. Open https://aaronprince.vercel.app/resume-builder, load the example, go to the last step, enter a name and email, tick the box, press **Pay**.
2. On the Lemon Squeezy page pay with their **test card** (`4242 4242 4242 4242`, any future date, any CVC).
3. Within a minute you should have: an email with a code (check spam), and a "Résumé Studio PAID" row in your sheet.
4. Enter the code under "Already paid?" and press Unlock. The preview shows real text. Press **Download ATS-ready PDF** and open the file: you should be able to select and copy the text.
5. In Lemon Squeezy refund the test order. Try the code again: it should say the order was refunded (instant with Upstash; with no Upstash you get a REFUND row instead).
6. Switch Lemon Squeezy to **Live mode**, repeat once with a real $10 payment (you can refund yourself), then tell people.

## If something does not work
| Symptom | Likely cause |
| --- | --- |
| Pay button opens nothing | `VITE_RESUME_CHECKOUT_URL` missing, or you did not redeploy |
| Paid but no email and no PAID row | Webhook URL or signing secret mismatch. Lemon Squeezy > Webhooks > the delivery log shows the response |
| PAID row but no email | Resend key, sender or domain not verified: send the code from the row by hand |
| "Unlocking is not switched on yet" | `RESUME_CODE_SECRET` missing |
| Sheet shows nothing | Apps Script not redeployed as a New version |
| Download says "Could not build the PDF" | Check the Vercel function log for `/api/resume-pdf` |

## Paying by bank transfer or WiPay (no Lemon Squeezy)

If a customer pays you directly, make their unlock code yourself. No redeploy is needed:

```
$env:RESUME_CODE_SECRET="<the same value you set on Vercel>"; npm run resume:code -- RS-THEIR-REFERENCE
```

Email them the code it prints. The Get it page tells them where to type it. Codes last 90 days.
