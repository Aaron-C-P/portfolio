# AI endpoints on Cloudflare (no Vercel)

Free Cloudflare Workers plan is enough.

```
cd worker
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler deploy
```

Wrangler prints a URL like `https://aaron-ai.<you>.workers.dev`. Put it in the site build as
`VITE_API_BASE=https://aaron-ai.<you>.workers.dev` (Vercel/Netlify/GitHub Pages env, or `.env.production`) and rebuild.
Then set `ALLOWED_ORIGINS` in `wrangler.toml` to your real site address and deploy again.

Optional second router if OpenRouter is down: `wrangler secret put AI_FALLBACK_API_KEY`, and set `AI_FALLBACK_BASE_URL`
(for example `https://api.groq.com/openai/v1`) and `AI_FALLBACK_MODEL` as vars.

Check it: `curl https://aaron-ai.<you>.workers.dev/health`
