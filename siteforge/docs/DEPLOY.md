# Putting it live on your domain

The goal: `yourdomain.com` runs your app, and `*.yourdomain.com` (every client subdomain)
reaches the same app, which then serves each client's site from the bucket.

## 1. Put your domain on Cloudflare (free)

1. Create a Cloudflare account and "Add a site" with your domain.
2. At the company where you bought the domain, change the nameservers to the two Cloudflare gives you.
3. Cloudflare's free certificate covers both `yourdomain.com` and `*.yourdomain.com`, so every
   client site gets https automatically.

## 2. Create the bucket (Cloudflare R2)

1. In Cloudflare: **R2 → Create bucket** (e.g. `client-sites`). Keep it private; the app reads from it.
2. **R2 → Manage API tokens → Create token** with Object Read & Write on that bucket.
3. Put the values in `.env`:
   ```
   STORAGE_DRIVER=s3
   S3_BUCKET=client-sites
   S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=...
   S3_SECRET_ACCESS_KEY=...
   ```
R2's free allowance includes 10 GB of storage and has no charge for visitors downloading
files, which covers a lot of small-business sites.

## 3. Run the app on a server

Any small Linux server (VPS) works; a basic plan costs a few dollars a month.

```
# on the server
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs git
git clone <your repo> app && cd app
npm install --omit=dev
cp .env.example .env   # then edit it (see below)
sudo npm install -g pm2
pm2 start src/server.js --name sitebuilder
pm2 save && pm2 startup  # restarts the app if the server reboots
```

Production `.env` essentials:
```
APP_URL=https://yourdomain.com
ROOT_DOMAIN=yourdomain.com
NODE_ENV=production
ADMIN_EMAILS=you@example.com
ANTHROPIC_API_KEY=...
```

**Keep the `data/` folder safe.** It holds the database (accounts, plans, drafts). Back it up daily, e.g.
`sqlite3 data/app.db ".backup data/backup-$(date +%F).db"` and copy that somewhere else.

## 4. Connect the domain to the server (Cloudflare Tunnel, no open ports)

1. Cloudflare dashboard → **Zero Trust → Networks → Tunnels → Create a tunnel**, and run the
   install command it shows on your server.
2. Add two public hostnames, both pointing to `http://localhost:3000`:
   - `yourdomain.com`
   - `*.yourdomain.com`
3. Check that DNS has proxied (orange cloud) records for `@` and `*`.

Open `https://yourdomain.com`, sign up with your admin email, build a test site and publish it.
It should load at `https://test-name.yourdomain.com`.

## 5. Card payments with Lemon Squeezy

Stripe doesn't accept businesses based in Jamaica. Lemon Squeezy does subscriptions, handles
sales tax as the merchant of record, and pays out to a Jamaican bank account or PayPal.

1. Create a store, then two **subscription** products: Starter and Business (monthly).
2. For each product copy the **checkout link** and the **variant ID** into `.env`:
   ```
   LEMON_CHECKOUT_STARTER=https://yourstore.lemonsqueezy.com/buy/...
   LEMON_CHECKOUT_BUSINESS=https://yourstore.lemonsqueezy.com/buy/...
   LEMON_VARIANT_STARTER=123456
   LEMON_VARIANT_BUSINESS=123457
   ```
3. **Settings → Webhooks → +**: URL `https://yourdomain.com/webhooks/lemonsqueezy`, a signing
   secret of your choice (also put it in `LEMON_WEBHOOK_SECRET`), and tick the `subscription_*` events.
4. Restart the app. "Choose plan" now opens checkout; paying, cancelling and failed payments
   update the client's plan automatically. Clients get a "Manage subscription" link to cancel or update their card.

Clients who prefer WiPay, bank transfer or cash: take the payment, then in **/admin** set their
plan and a "Paid until" date.

## 6. A client wants their own domain

1. In **/admin → Websites**, type their domain (e.g. `bobsbarber.com`) and Save.
2. Their domain must point at your app with https. The easy way is **Cloudflare for SaaS**
   (custom hostnames) on your zone: add their domain as a custom hostname, and they add the CNAME
   record Cloudflare gives them at their registrar.

This is a good paid add-on.

## 7. Keep your AI costs in check

Every AI build or change counts against the plan's monthly limit (`AI_LIMIT_*`). The admin panel
shows AI runs and tokens used this month. Check Anthropic's current prices and set the limits so
each plan stays comfortably profitable.

## Supabase (permanent database and files)

1. Create a Supabase project. In **Project Settings > Database** copy the **Transaction pooler** connection string (port 6543) into the host's `DATABASE_URL`.
2. In **Storage** create a private bucket (for example `client-sites`) and, under **S3 connection**, create access keys. Set `STORAGE_DRIVER=s3`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
3. Also set `APP_URL` (your public URL), `ADMIN_EMAILS` (who is admin) and optionally `OPENROUTER_API_KEY`.
4. The tables are created automatically on first start.

Try it locally with dummy data first: `node scripts/demo-server.mjs`, then in another terminal `node scripts/seed-demo.mjs http://localhost:3077 30`. Log in as `admin@demo.test` (admin) or `tenant1@demo.test` (a tenant), password `demo-password-1`. Run the tests with `npm test`.
