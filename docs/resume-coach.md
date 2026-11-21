# Your living résumé

One set of true facts, many résumés. The page at `/resume` shapes the copy for whoever asks: they pick a role (web,
data, network, systems) or paste the job posting, and the most relevant experience comes first. The same facts, a
different lead. Nothing is invented: it only chooses, orders and trims what is in the master.

## Where things live

| File | What it is |
| --- | --- |
| `src/data/myResume.json` | The master: every true fact, tagged by role (`web`, `data`, `network`, `systems`) with a weight `w` (1 to 3) |
| `src/data/resumeLog.json` | Your inbox: things you learned or built, waiting for approval |
| `src/lib/tailorResume.js` | Chooses and orders facts for a role or posting. Used by the page and the PDF endpoint |
| `src/lib/resumeCoach.js` | The coach: wording feedback, gaps, unproven skills, freshness |
| `api/my-resume.js` | Builds the PDF on the server from the master only, logs who asked to your sheet |

References (other people's names and phone numbers) are deliberately **not** in the master or on the site. Say
"references available on request" and send them yourself.

## The routine (two minutes after you finish something)

1. Open `src/data/resumeLog.json` and add a line to `entries`:

```json
{ "id": "2026-12-01-dax", "date": "2026-12-01", "kind": "bullet", "job": "larvation",
  "text": "Built 6 DAX measures for a sales dashboard, cutting weekly reporting from 5 hours to 30 minutes",
  "tags": ["data"], "approve": false }
```

   Kinds: `skill` (`text`), `bullet` (`job` = `larvation`, `scotia` or `freelance`, plus `text`), `highlight` (`text`),
   `project` (`title`, `stack`, `text`), `cert` (`what`, `who`, `year`). Always add `tags`.

2. Run the coach:

```bash
npm run resume:coach
```

   It prints (and saves to `docs/resume-coach-report.md`): weak wording in your new lines (no number, weak verb, vague
   phrases), skills you list but never prove, thin spots per role, "in progress" certificates to finish, and the next
   moves worth making.

3. Fix the wording, set `"approve": true`, then publish it:

```bash
npm run resume:apply
git add -A && git commit -m "Update résumé" && git push origin studio studio:main
```

   Approved entries move into the master (stamped with today's date), and recent additions get a ranking boost that
   fades over about four months, so what you are learning now shows up instead of losing to older lines.

## How a version is chosen

- Focus: the visitor's pick wins; otherwise it is detected from the posting by counting each role's keywords; otherwise
  the default (`web`).
- Each line is ranked by its weight, whether it is tagged for that focus, how many words it shares with the posting,
  and how recent it is. The best ones are kept, in the order you wrote them.
- A role marked `lead` goes first for that focus (the bank role leads for data, network and systems). A role with an
  `only` list is left out for other focuses (the web version leaves out the bank job, like your web PDF).
- Skills are ranked the same way and the top 16 are listed.

## Honest limits

- The coach checks wording and gaps with simple rules. It cannot tell if a claim is true: only add what you really did.
- Numbers in the master that you wrote (9 failures to zero, 406 tests) are kept with their "in simulation" wording.
  Keep that wording; it is what makes them safe to say in an interview.
- Contact details are in the downloaded PDF and left out of the on-screen preview. Anyone can download a copy after
  giving a name and email; that email is saved to your sheet. If you would rather approve each person first, say so
  and the download can be turned into a request that waits for you.
- Re-paste `docs/apps-script/Code.gs` into Apps Script as a **New version** so downloaded copies are not treated as
  "waiting for a reply" in your morning digest.
