# Résumé Studio (`/resume-builder`)

A résumé app at $10 per résumé. Free to build and preview; the clean PDF is unlocked by a code.

## User journey
1. **The job**: paste a posting. Key terms are extracted (smoothed term weights).
2. **Your details**: contact, summary, experience, education, skills. Autosaved in the browser only.
3. **Improve it**: job-match score, bullet-by-bullet feedback, checklist, layout suggestion. All free, so the value is clear before any ask.
4. **Get it**: watermarked preview, then name/email (and consent) to place an order, then payment, then an unlock code.
   After applying, the user can report "got an interview?", which feeds the layout bandit.

Only name, email, phone and order details go to the Google Sheet (kind `builder`). The résumé text never leaves the browser.

## What the "optimiser" actually is (src/lib/resumeEngine.ts)
- **Bayesian keyword match**: smoothed term weights from the posting, boosted in "required/must" lines; score is the posterior mean of a Beta(2,2)-prior coverage over weighted keywords.
- **Bullet strength**: logistic regression on 9 readable features. Weights in `src/data/bulletModel.json`, trained by `scripts/resume/train.mjs` (runs on this PC) or `scripts/resume/train_sklearn.py` (scikit-learn; run on a machine that allows scipy). Trained on 50 hand-written bullets, so treat it as a starter heuristic. Add real, reviewed bullets to `scripts/resume/examples.txt` and retrain.
- **Layout bandit**: Thompson sampling over three layouts with Beta priors; the sensible default for the person starts with a head start. Outcomes are stored per device today. To learn across all users, aggregate the `builder` "outcome" rows in the sheet.
None of this predicts being hired. It measures fit to a posting and how specific the bullets are.

## To switch payments on
1. Pick a provider that accepts you (see siteforge/docs/DEPLOY.md on Lemon Squeezy; confirm it supports Jamaica). Create a $10 product and copy its hosted checkout link.
2. In Vercel set `VITE_RESUME_CHECKOUT_URL` to that link and redeploy. Card details are entered on the provider's page, never on this site.
   Without it the page shows bank-transfer instructions from `src/data/pay.ts` (fill in the bank details there).
3. **Automatic codes (Lemon Squeezy).** In Vercel set:
   - `RESUME_CODE_SECRET`: any long random string (keep it private; changing it invalidates earlier codes)
   - `RESUME_WEBHOOK_SECRET`: the signing secret you type into Lemon Squeezy in the next line
   - `RESEND_API_KEY` and `RESUME_FROM_EMAIL` (e.g. `Aaron <orders@yourdomain.com>`): a free Resend account; the sending domain must be verified in Resend
   - optional `RESUME_VARIANT_ID`: the variant id of the $10 product, so other products in your store do not trigger codes
   - optional `SITE_URL` (defaults to https://aaronprince.vercel.app)

   In Lemon Squeezy: Settings > Webhooks > add `https://aaronprince.vercel.app/api/resume-webhook`, the same signing secret, event **order_created**.
   When an order is paid the webhook makes the buyer's code, adds a "Résumé Studio PAID" row to your sheet (with the code, so you can resend it by hand if needed) and emails the code.
   Without Resend set up, the sheet row says "send this code by hand", and you copy it from there.
   Codes are derived from the order id with `RESUME_CODE_SECRET`, so nothing is stored and they cannot be guessed.
   **Manual option (bank transfer or WiPay):** set `RESUME_CODES` to a comma-separated list such as `RS-4F9K2,RS-7M3QD`, email a code to the buyer when you see the payment, and remove it from the list afterwards. Manual and automatic codes work together.
   Test the whole thing with `node scripts/resume/webhook.test.mjs`, then do one real $10 test order (Lemon Squeezy has a test mode) before announcing it.
4. Re-paste `docs/apps-script/Code.gs` in Apps Script and deploy a **New version** so the `builder` kind is accepted.

## Known limits
- The paywall is a watermark plus a server-checked code. A determined user can remove the watermark with browser tools, and a code can be shared. For $10 that is a reasonable trade; real enforcement needs accounts and server-side PDF generation.
- Card payments get codes automatically; bank transfer and WiPay payments still need a code from you.
- The webhook is written for Lemon Squeezy's `order_created` event. It has been tested with signed sample events, not with a live Lemon Squeezy order. Refunds do not revoke a code.
- No accounts yet: the résumé lives in the browser that built it.
