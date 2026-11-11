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

## Admin page (aaronprince.vercel.app/admin)

Set the password in the script, not in the website: Project Settings → Script properties → add
`ADMIN_KEY` with your chosen password, then redeploy a new version. The site never contains the
password; the script checks it and only returns leads when it matches. Eight wrong tries in
15 minutes lock the page for everyone until the window passes. Without `ADMIN_KEY` the page stays off.
Use something longer than a word and a year: this page shows your visitors' emails.
Never commit the password to this repo; it is public.

On the page you can search, filter, add a lead by hand, edit any field, keep private notes,
mark replied or archive (one or many), delete (one or many, always after a confirmation),
and export what is shown as CSV. Deletes are permanent: they remove the row from the sheet.
Archive is the reversible way to put a lead away.
After changing `Code.gs`, paste it again and use Deploy → Manage deployments → New version,
or the new buttons will answer "Something went wrong". An older Leads sheet gets its new
`Notes` column header automatically.

## Automation

- **Daily digest:** run `installTriggers` once from the editor. Each morning around 8am you get one email
  listing new leads from the last 24 hours and leads still waiting for a reply after 2 days.
  Quiet days send nothing. Replied, Archived and TEST rows are ignored.
- **Automatic confirmation to visitors:** off by default because it sends email from your account.
  To switch it on, add the script property `AUTO_REPLY` with the value `on`. It tells the person their
  message arrived (and says it is automatic), sends at most one per address every few hours and at most
  20 a day, and never goes to `@test.invalid` addresses. Switch it off by deleting the property.
- **Assistant leads:** the "Ask Aaron" guide on every page can take a message. It lands in the same
  Leads sheet with the topic "Sent through the assistant".

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

## A real person behind the assistant

When a visitor asks for a person, is frustrated, wants to hire you, or the assistant is unsure, it offers
"Ask Aaron to reply personally". The visitor gives a name and email, the chat so far is saved, and you get an email
straight away (subject `LIVE CHAT (hot|warm|normal)`).

- Answer in **/admin**: filter "Live chat", open the conversation, type a reply. The visitor sees it in their chat
  (it checks every 10 seconds while open, every 45 seconds when closed) and also gets it by email.
- The **Online for chat / Away** button in /admin tells visitors whether you are around.
- Conversations live in a second sheet tab called `Chat`. Each has a secret key kept in the visitor's browser, so
  nobody can read someone else's chat. Ten wrong guesses lock a conversation for 15 minutes.
- Apps Script has a daily run-time quota (about 90 minutes on a free Google account). Polling uses a little of it,
  so this suits a handful of live chats a day, not hundreds.
- **After pasting the new Code.gs: Deploy, Manage deployments, edit, New version.** The sheet gets its three new
  columns (Token, Priority, Intent) on the next lead.

### The intent model (scikit-learn style)

`scripts/intent/examples.txt` holds labelled example messages. `node scripts/intent/train.mjs` trains TF-IDF
(words and word pairs) plus multinomial logistic regression, prints 5-fold cross-validated accuracy and writes
`src/data/intentModel.json`, which `src/lib/intent.ts` runs in the browser. It is 76% accurate overall and about
90% right when it is confident, so it only decides who gets offered a person; it never blocks anyone. Add real
visitor messages to the examples file and retrain to improve it. `scripts/intent/train_sklearn.py` does the same
with scikit-learn (`pip install scikit-learn`); it could not be run on the build machine, where Windows blocked
scipy, so it is untested. The Node trainer is the one that produced the shipped model.

## Tests

`node docs/apps-script/mock-test.cjs` runs the handler against a mock of Google's services.
It checks logic only, not Sheets formulas or Google quotas.
