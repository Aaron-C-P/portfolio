# Aaron Prince: Portfolio

Personal portfolio for Aaron Prince, full-stack web developer and Computer Science graduate (Northern Caribbean University, 2026), based in Mandeville, Jamaica.

Built with **Vite + React + TypeScript + Tailwind**, **react-router**, a Formspree contact form, and a small **Vercel serverless function** that powers the AI chat through the Anthropic API.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks (tsc) then builds to /dist
```

`npm run dev` serves the front end only. `/api/chat` is not served by Vite, so the AI chat automatically falls back to a built-in offline responder (`src/lib/localReply.ts`). To test the live AI locally, run `vercel dev` with `ANTHROPIC_API_KEY` set.

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/projects`, `/projects/:slug` | Project list and detail pages |
| `/journey` | Timeline of education, work, certifications and projects |
| `/services` | What I can build for clients |
| `/writing` | Book, press features, academic work and recognition |
| `/ask` | AI clone chat |
| `/about`, `/contact` | Background and skills; contact form |

All projects, timeline entries, writing items, services and profile details live in `src/data/site.ts`. Edit that file to update the site.

## Deploying to Vercel

1. Import the GitHub repo in Vercel. It detects Vite (build `npm run build`, output `dist`) and deploys `/api` as serverless functions.
2. `vercel.json` rewrites every path except `/api/*` to `index.html` so deep links such as `/projects/errands` work.
3. Add the AI environment variable (below), then redeploy.

## AI chat

The chat calls `/api/chat` (`api/chat.js`). If `ANTHROPIC_API_KEY` is missing or the call fails, the front end silently uses the offline responder, so the chat never breaks.

In Vercel, go to **Project > Settings > Environment Variables** and add:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | your key from console.anthropic.com | Production (add Preview to test on PR deployments) |

Then redeploy. The key stays server-side and is never sent to the browser. In `api/chat.js` you can change `MODEL`, `max_tokens` and the `SYSTEM_PROMPT` (Aaron's bio, projects and voice).

## Resume

The navbar shows **Request Resume**, which opens a pre-written email, while the resume is being updated. To restore the download link, set `resumeAvailable: true` and point `resume` at the current file in `src/data/site.ts`.

## Contact form

Uses Formspree (form ID `mnjqgkgz`, set in `src/components/portfolio/PortfolioContact.tsx`). Submissions are emailed to the address configured on that form.

## Tech

React, TypeScript, Vite, Tailwind CSS, react-router, framer-motion, Formspree, Vercel Functions, Anthropic API.
