# Lead collector setup (5 minutes)

The site already posts every contact and résumé request to your Apps Script web app
(`src/lib/collect.ts`). The script behind that URL needs the handler in `Code.gs`.

1. Open your script project at script.google.com (the one that owns the `/exec` URL).
2. Replace everything in the editor with the contents of `Code.gs`. Save.
3. Choose the function **setup** in the toolbar and press **Run**. Approve the permissions
   (Sheets, Gmail send, script storage). It creates a spreadsheet called "Portfolio Leads" with a
   **Leads** tab and a **Dashboard** tab, and sets the notification email to your Google account.
   The log shows the spreadsheet link.
4. **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**
   Keep "Execute as: Me" and "Who has access: Anyone". Editing the existing deployment keeps the
   same `/exec` URL. A brand new deployment would give a new URL that the site does not know.
5. Check it: opening the `/exec` URL in a browser should show `{"ok":true,"service":"portfolio-leads"}`.

## What you get

- **Leads** tab: one row per submission with time, ID, kind, name, email, topic, organisation,
  message, page, referrer, source (utm_source, referrer site or "direct"), device and Status.
  Change Status from `New` to `Replied` when you answer; the dashboard counts what is still waiting.
- **Dashboard** tab: totals, last 7 and 30 days, waiting for a reply, topics, sources, a per-day chart and
  a written summary of the story so far.
- An email to you for every real lead, with Reply-To set to the visitor.
- Rows whose email ends in `@test.invalid` are marked `TEST`, never emailed, and left out of the numbers.
  Delete them whenever you like.

## Protections

Honeypot field, five submissions per email per hour, size limits, formula injection defused,
the same browser retry is never written twice, and writes are serialised with a lock.

## Change the notification email

Project Settings → Script properties → `NOTIFY_EMAIL`.

## Tests

`node docs/apps-script/mock-test.cjs` runs the handler against a mock of Google's services.
It checks logic only, not Sheets formulas or Google quotas.
