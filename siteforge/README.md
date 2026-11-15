# AI Site Builder (working name: SiteCraft)

A website builder + CMS you run as a monthly subscription business.

Clients sign up, describe their business, and AI builds their website in about a minute.
The site files go into a bucket (Cloudflare R2 / S3), and each client gets their own link:
`theirname.yourdomain.com`. They can come back any time to change text and photos, ask the
AI for bigger changes, undo changes, take the site offline, or cancel. If they stop paying,
their site goes offline automatically, and it comes back when they pay again.

You get an admin panel with every client, their plan, their sites and your monthly revenue.

## What's in it

| For your clients | For you |
| --- | --- |
| Sign up with a free trial (14 days by default) | Admin panel: clients, plans, monthly revenue, AI usage |
| AI builds the full site from a short form | Card subscriptions through Lemon Squeezy (works for Jamaican sellers) |
| Tap any text on the site to edit it, tap a photo to replace it | "Paid until" date for clients who pay by WiPay, bank transfer or cash |
| "Ask the AI" for bigger changes ("add a price list") | Pause any client site, reset passwords, extend trials |
| Version history with one-tap restore | Per-plan AI limits so your AI bill can't run away |
| Publish / take offline / delete | "Made with YourBrand" badge on cheaper plans (free advertising) |
| Works well on phones | Client custom domains (set in admin) |

## Run it on your computer (Windows, Mac or Linux)

1. Install **Node.js 22.13 or newer** (the current LTS from nodejs.org is fine).
2. In this folder:
   ```
   npm install
   copy .env.example .env      (Mac/Linux: cp .env.example .env)
   npm start
   ```
3. Open **http://localhost:3000** and click "Start free".
4. Client sites show up at **http://their-name.localhost:3000** (Chrome and Edge handle
   `*.localhost` automatically). They're also at `http://localhost:3000/s/their-name/`.

To see the admin panel, put your email in `ADMIN_EMAILS` in `.env`, restart, sign up with that
email, then go to **http://localhost:3000/admin**.

Without an AI key, new sites are built from the built-in template, so you can demo everything
for free. To switch on real AI, get an API key at console.anthropic.com and set
`ANTHROPIC_API_KEY` in `.env`.

Run the tests with `npm test`.

## How it works

```
yourdomain.com            -> landing page, client dashboard (/app), admin (/admin), API
name.yourdomain.com       -> that client's published site, read from the bucket
clientdomain.com          -> a client's site on their own domain (set in admin)

Bucket layout:
  sites/<siteId>/index.html        the published page
  sites/<siteId>/assets/<file>     photos the client uploaded
```

- **Drafts and history** live in the database. **Publish** copies the draft into the bucket.
- **Take offline** or **unpaid** → visitors see a "back soon" page; nothing is deleted.
- AI jobs run in the background and the page polls for progress, so slow AI replies never
  time out behind Cloudflare.
- One Node process does everything. The database is SQLite (built into Node), stored in `data/`.

## Project layout

```
src/server.js          routing by domain, pages, previews
src/sites.js           client API: accounts, sites, AI build/edit, photos, publish
src/ai.js              Claude prompts + streaming
src/templates.js       built-in site template + photo placeholders
src/billing.js         Lemon Squeezy checkout + webhook
src/admin.js           admin API
src/auth.js            passwords, sessions, plan/trial status
src/storage/           local folder or S3/R2 bucket
public/                landing page, dashboard and admin (plain HTML/CSS/JS, no build step)
docs/DEPLOY.md         putting it live on your domain
```

## Going live

See **docs/DEPLOY.md**. In short: put your domain on Cloudflare, create an R2 bucket, run the
app on a small server, point `yourdomain.com` and `*.yourdomain.com` at it, and add your Lemon
Squeezy links.

## Ideas for later

- Multi-page sites (menu, gallery pages)
- Email password reset (for now, reset from the admin panel)
- Contact forms that land in the client's dashboard
- Booking / appointment requests
- Simple visitor stats per site
- Move to Postgres if you outgrow SQLite (thousands of clients)
