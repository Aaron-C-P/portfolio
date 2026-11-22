# The build team

Building a site is not one giant AI request. Three agents work together and talk to each other; the owner watches the
conversation on the building screen.

| Agent | Job |
| --- | --- |
| Lead Developer | Plans the site, hands out small jobs, reviews every result, changes the plan when something fails |
| Content Writer | Writes the words, **at most two sections per pass**, inside a word budget |
| Page Builder | Turns the approved plan and words into the finished page |

When the writer fails (breaks the format, times out, goes overboard past 150% of its word budget, or invents a phone
number) it tells the lead. The lead changes the path: first one section at a time and 40% shorter, then shorter again,
then the built-in wording. A build always finishes. With no AI key the same team runs offline.

Code: `src/agents.js`. Messages are stored in `agent_events` and returned by `GET /api/jobs/:id?after=<seq>`.

## What each website costs to host

`GET /api/sites/:id/usage` (owner) and `GET /api/admin/usage` (admin) report, per website: bytes in the bucket
(`sites/<id>/`), files, drafts and saved versions in the database, and what is cached in server memory. The admin page
shows them as a table with server memory and total cache.

## Tests

`npm test` includes `test/team.test.js` (misbehaving writers, 200 builds at once) and `test/journey.test.js`
(sign up, build, publish, visit, edit, unpublish, 25 owners at once, per-tenant numbers).
