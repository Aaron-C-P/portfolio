# Content inventory (audit of current site)

Source: repo `Aaron-C-P/portfolio` (main, 7 commits), GitHub public profile, live Cake-Sale README. Collected 2026-10-31.

## Current stack
Vite 7, React 19, TypeScript 5.9, Tailwind 3 (custom `portfolio-*` tokens, blue/indigo on white), framer-motion, lucide-react, Formspree (contact form), small shadcn-style UI kit (button, input, textarea, toast). `tsc --noEmit` passes. Single-page, scroll-spy navigation; no router.

## Identity (from repo)
- Aaron Prince, BSc Computer Science, Northern Caribbean University (Jan 2022 - Aug 2026), GPA 3.5, Honor Roll. DeCarteret College, 5 CAPE subjects.
- Positioning line: Software Engineering | Web Development | Network Design | Cybersecurity.
- Links: GitHub `Aaron-C-P`, LinkedIn `linkedin.com/in/aaron-prince-b912b121`, email and phone in `src/App.tsx`.
- Certifications, achievements and publication (Madden, Prince, Stennett & Higgs, 2025) in `PortfolioAbout.tsx`.

## Projects already on the site (8)
EGZIT, BNS Lunch Pre-Order, SoftQ/PreQ (TAJ), Hurricane Watch Jamaica, Vault Guardian, Orbita Commerce, R Code Data Lab, Smart Baby Bed Set.

## Projects missing from the site
- **Chef Hudson's Christmas Cakes** (`Cake-Sale`, live at cake-sale-christmas.vercel.app, last push 2026-10-28). Mobile-first ordering site: React + TS + MUI, Google Apps Script backend, Google Sheet as database, baker dashboard at `/admin`, bank-transfer payment flow, 340+ tests, Vercel hosting. Prices J$3,000 (1 lb) and J$4,000 (2 lb).
- **Errands / ErrandFlow** (live at errands-ap.vercel.app; no public GitHub repo). Pickup and delivery service for Mandeville. Customers pick a category (pharmacy pickups, food pickups, groceries and shopping, something else), the service confirms a price, then delivers to the door. Pages: Home, Menu, My Order, Track, Admin, with a cart. Dark UI with orange accent. Tab title is "ErrandFlow" after load and "Errands" while loading; deep links like `/menu` return 404, so the app likely uses hash routes. Stack not confirmed.

## Issues found
1. Root-level duplicates of four components (`PortfolioAbout.tsx`, `PortfolioBlog.tsx`, `PortfolioNavBar.tsx`, `PortfolioProjects.tsx`) are tracked in git and unused. Delete.
2. Hero headline typo "Web Developement" and a stray tab character.
3. `package.json` name is `portfilio`, `<title>` is just "Portfolio"; no meta description or social tags.
4. Hero says "finished my courses ... will graduate August 2026"; today is 2026-10-31, so copy is stale.
5. Education end date still shows "(Expected)".
6. 4 of 8 projects have no image; project cards depend on text only.
7. Dead repos on GitHub (`egzit-final`, `egzit-1`, `Egzit-1.0`, `Egzit`) are duplicates of EGZIT; link only `Egzit-1.0-Final`.
8. Single page with scroll-spy: no routes, no per-project pages, no Journey timeline, no Services page.

## Planned structure
Home, Projects (+ per-project detail), Journey (timeline), Services, About, Contact. Add react-router; keep existing Formspree contact.
