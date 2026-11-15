# Managed website platform (working name: SiteForge)

Status: idea, chosen as the next application to build. Captured from Aaron's own notes.

## The idea in one line
Instead of building one website per client and being called back for every change, offer clients a platform where they
build their site with AI, each site is stored as files in a bucket, each client gets their own link, and they come back
to edit it themselves. They can cancel the subscription and the site goes offline. It should earn without daily work.

## Why this over one-off site builds
- Most people starting a business around Aaron's network try the same thing: build websites for people. It is crowded.
- Clients want to update their site at times. With one-off builds they must always come back to the developer.
- A subscription platform gives recurring income that does not need daily hours.

## How it works (static sites on object storage)
1. Client signs in, describes the business, and the AI generates a site (HTML/CSS/JS plus images) into a project.
2. Client edits in a visual editor (text, images, sections, colours). Every save writes the site files to an S3 bucket
   under `sites/<siteId>/`.
3. A CDN (CloudFront) serves each site from its own link: `<name>.<domain>` first, a custom domain later.
4. Billing (Stripe subscription) controls state. Active = published. Cancelled/unpaid = unpublished (files kept 30 days,
   then deleted). Resubscribe = back online.

Yes, an S3 bucket can host this: static hosting is what Wix-style output reduces to. The hard parts are the editor,
tenancy and billing, not the hosting.

## Architecture sketch
| Piece | Choice | Notes |
| --- | --- | --- |
| Editor + dashboard | React (this stack) | Sites list, editor, plan status |
| Auth | Cognito or Supabase Auth | One account per client |
| Site files | S3 bucket, prefix per site | Versioned so edits can be undone |
| Serving | CloudFront + wildcard cert on the business domain | `*.domain` routing via a small edge function mapping host to prefix |
| AI generation | Anthropic API via a server route | Same pattern as `api/chat.js`; rate limited per plan |
| Billing | Stripe Billing + webhooks | Webhook flips `published` flag |
| Metadata | Postgres/Supabase or DynamoDB | users, sites, plan state, domains |

## Risks and open questions
- Abuse: phishing or illegal sites on your domain. Needs terms, reporting, takedown, and review of new sites.
- AI cost: set generation limits per plan so margins hold.
- Quality: AI output must be editable and responsive; start with a fixed set of section templates the AI fills in.
- Support load: the goal is low touch, so the editor must be self-explanatory and have an undo/version history.
- Competition (Wix, Squarespace, Framer, Carrd): win on local focus (Jamaica), simple pricing, human help when needed.
- Payments: confirm Stripe is available for a Jamaican business, otherwise use a local processor or invoicing at first.

## Milestones
1. Validate: offer it as a service to 3 real clients (done by hand with a shared editor) and see if they pay monthly.
2. Prototype: AI generates a one-page site from a form, saved to S3, served at a test link.
3. Editor: edit text/images, publish, version history.
4. Accounts and billing: Stripe subscription controls published state.
5. Custom domains, templates, launch.

## Decisions Aaron still needs to make
- Business/product name and which domain this runs on (domain was just purchased).
- Starting price and plan tiers.
- AWS or Cloudflare (R2 + Workers is cheaper to serve and simpler for wildcard sites).

## Update: working app imported
A complete first version now lives in [`/siteforge`](../../siteforge/README.md) (working name SiteCraft): accounts with
free trial, AI site builder with a built-in template fallback, tap-to-edit, version history, publish/offline, bucket
storage (local folder, or S3/R2), Lemon Squeezy billing, per-plan AI limits and an admin panel.
Verified locally: its 6 unit tests pass, and an end-to-end run signed up, built a site, published it at `/s/<name>/`,
took it offline, and read the admin overview. Not yet verified: real AI output (needs `ANTHROPIC_API_KEY`), the S3/R2
bucket, live card payments, wildcard subdomains on the real domain, and custom domains.
It is a separate Node app (not part of the portfolio's Vite build) and needs a small always-on server, not Vercel.
