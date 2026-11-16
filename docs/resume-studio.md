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
3. In Vercel set `RESUME_CODES` to a comma-separated list of unlock codes, e.g. `RS-4F9K2,RS-7M3QD`.
   When a payment is confirmed (an email from the provider or your bank), email the buyer an unused code and remove it from the list when used.
4. Re-paste `docs/apps-script/Code.gs` in Apps Script and deploy a **New version** so the `builder` kind is accepted.

## Known limits
- The paywall is a watermark plus a server-checked code. A determined user can remove the watermark with browser tools, and a code can be shared. For $10 that is a reasonable trade; real enforcement needs accounts and server-side PDF generation.
- Codes are issued by hand until a payment webhook is added. A provider webhook that emails a code automatically is the next step.
- No accounts yet: the résumé lives in the browser that built it.
