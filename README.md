# Aaron Prince — Portfolio

A personal portfolio site for Aaron Prince — full-stack web developer & Computer Science
graduate. Clean, light "engineering build-log" design with an interactive **AI clone** that
visitors can chat with.

Built with **Vite + React + TypeScript + Tailwind**, a Formspree contact form, and a small
**Vercel serverless function** that powers the AI chat via the Anthropic API.

---

## Quick start (local)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

> **Note:** `npm run dev` only runs the front end. The AI chat's serverless function
> (`/api/chat`) is **not** served by Vite, so during local dev the chat automatically falls
> back to a built-in offline responder. To test the *live* AI locally, run `vercel dev`
> (requires the Vercel CLI) with your API key set — see below.

### Build for production

```bash
npm run build      # type-checks (tsc) then builds to /dist
npm run preview     # preview the production build locally
```

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import** the GitHub repo. Vercel auto-detects Vite (build `npm run build`,
   output `dist`) and deploys the `/api` folder as serverless functions automatically.
3. Add the environment variable for the AI chat (next section), then deploy.

Every push to `main` redeploys automatically.

---

## 🔑 Enabling the AI clone (one-time setup)

The chat works out of the box using an **offline responder** (canned answers in Aaron's
voice). To upgrade it to a **live, conversational AI** powered by Claude:

1. Get an Anthropic API key from <https://console.anthropic.com>.
2. In Vercel → **Project → Settings → Environment Variables**, add:

   | Name                | Value             |
   | ------------------- | ----------------- |
   | `ANTHROPIC_API_KEY` | `sk-ant-...`      |

3. **Redeploy** (Deployments → ⋯ → Redeploy, or push a commit).

That's it. The front end calls `/api/chat`; if the key is present it returns live AI
responses, and if anything is missing it silently falls back to the offline responder so the
chat is **never broken**.

### Tuning the AI

Open [`api/chat.js`](api/chat.js):

- **Model** — `MODEL` defaults to `claude-haiku-4-5-20251001` (fast + low cost, great for a
  portfolio). For richer, longer answers swap it to `claude-sonnet-4-6`.
- **Personality** — the `SYSTEM_PROMPT` is where Aaron's bio, projects, stack, and voice are
  defined. Edit it to change how the clone talks or to add new facts.
- **Length / cost** — `max_tokens` (default `400`) caps reply length.

> 💡 The API key lives only in the serverless function (server-side) and is never exposed to
> the browser.

---

## Light / dark mode

The site ships with both **light and dark themes** and a toggle in the header (sun/moon). The
choice is saved in `localStorage`, and on first visit it follows the visitor's OS preference
(`prefers-color-scheme`). An inline script in `index.html` applies the theme before paint, so
there's no flash of the wrong mode. Theme colors are driven by CSS variables in
`src/index.css` (`:root` for light, `[data-theme="dark"]` for dark).

## Contact form

The contact form uses **Formspree** (form ID `mnjqgkgz`). Submissions are emailed to the
address configured on that Formspree form. To use a different form, replace the ID in
`src/App.tsx` (`useForm("mnjqgkgz")`).

---

## Project structure

```
api/
  chat.js                  # Vercel serverless function — AI clone (Anthropic API)
src/
  App.tsx                  # entire site (sections, data, AI chat component)
  index.css                # design system + all component styles (light theme)
  main.tsx                 # React entry
  assets/portfolio/        # images (profile, project mockups)
index.html                 # fonts + root
```

All content (projects, stack, writing, experience, links) lives in data arrays near the top
of `src/App.tsx` — edit there to update the site.

---

## Tech

React · TypeScript · Vite · Tailwind CSS · Formspree · Vercel Functions · Anthropic API
Fonts: Space Grotesk · JetBrains Mono · Inter.

© Aaron Prince. Designed & built in Jamaica.
