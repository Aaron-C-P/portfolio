// Offline fallback for the AI chat, used when /api/chat is unavailable
// (local dev, or no ANTHROPIC_API_KEY set on Vercel).
export function localReply(raw: string): string {
  const t = raw.toLowerCase();
  const has = (...ks: string[]) => ks.some((k) => t.includes(k));
  if (has("hello", "hi ", "hey", " yo", "gwaan", "good morning", "good day", "greet"))
    return "Hey! Good to meet you. Ask me about my projects, my stack, or how to get in touch.";
  if (has("egzit"))
    return "EGZIT is my full-stack moving-logistics marketplace â€” AI-assisted inventory, QR tracking, real-time WebSockets, geospatial routing, and Stripe checkout. Built with React, TypeScript, PostgreSQL and Supabase.";
  if (has("bns", "scotia", "lunch"))
    return "BNS Lunch Pre-Order is a live internal tool I built for Bank of Nova Scotia staff in Mandeville â€” a clean UI over a Google Sheets backend with duplicate-submission control so each order lands exactly once.";
  if (has("preq", "taj", "queue", "tax admin"))
    return "SoftQ / TAJ Pre-Queue is a real-time scheduling system for Tax Administration Jamaica. The key piece is concurrency-safe booking â€” no double-booking â€” which cuts in-person wait times.";
  if (has("jamoment"))
    return 'Jamoment is my own venture: a marketplace for authentic Jamaican experiences with verified local hosts and an AI "Dream Engine" for curation â€” built so tourism money stays local. Real places, real people, real moments.';
  if (has("cake", "bakery", "christmas", "concurrency", "lock", "race"))
    return "The Christmas Cake Order Platform is a live client system. Under real simultaneous load some customers hit a system-busy error \u2014 one global lock that every request, including reads, queued behind. I reproduced it in a discrete-event simulation first, then moved reads out of the lock and added a last-good fallback, jittered-backoff retries and idempotency keys. In simulation a 40-customer burst went from 9 failures to zero. 406 automated tests pass.";
  if (has("wallet", "finance", "budget", "spending"))
    return "The Personal Finance Wallet is a Python and SQLite system \u2014 income, expenses, transfers, refunds, merchants and categories, with budgeting, spending alerts, projected month-end expenditure, and summaries across monthly, three-month, twelve-month and all-time periods. Transaction validation, duplicate detection and audit logging keep the data traceable.";
  if (has("filetrack", "file track", "custody", "audit"))
    return "FileTrack Pro tracks physical records \u2014 every movement time-stamped against holder, location and a mandatory reason code, batch IDs for bulk moves, an onboarding path for legacy files with no code, and corrections tagged distinctly so an amendment can never be mistaken for an original entry.";
  if (has("dashboard", "narrat", "kpi", "report"))
    return "I built a reporting layer that writes itself. KPIs recalculate live \u2014 orders, open, fulfilled, money received, outstanding \u2014 and then it writes a plain-English summary of what the numbers mean: best seller, busiest day, delivery versus collection split, and a sell-out forecast from the current run rate. An attention panel raises only what needs a decision that day. No manual reporting step.";
  if (has("errand", "grocery", "price history", "shopping", "delivery", "pickup"))
    return "Errands is a pickup and delivery service for Mandeville \u2014 pharmacy, food and grocery runs brought to your door. Behind it is a relational data model of products, categories, price history, locations, customers, trips and orders, so price movement across stores is visible rather than guessed.";
  if (has("vectra", "agent", "job search"))
    return "Vectra is an AI agent I built to automate the repetitive half of job searching \u2014 parsing role requirements, matching them against a structured profile, and tailoring application material per posting rather than firing out one generic CV. I built it because I was living the problem.";
  if (has("ccna", "cisco", "network cert"))
    return "I've completed CCNA: Introduction to Networks with Cisco Networking Academy, alongside Cisco Networking Basics and Introduction to Cyber Security. The full CCNA is in progress.";
  if (has("orbita"))
    return "Orbita Commerce is a full-stack storefront â€” secure checkout, role-based access control, and stored procedures, with prepared statements against SQL injection. PHP + MySQL.";
  if (has("vault"))
    return "Vault Guardian is an encrypted password manager â€” secure storage and generation using industry-standard encryption, keeping credentials safe at rest and in transit.";
  if (has("hurricane", "weather", "storm"))
    return "Hurricane Watch JA is a real-time weather-monitoring app for Jamaica with live camera feeds and storm updates during severe weather.";
  if (has("hire", "available", "reach", "contact", "email", "work with", "collab", "resume", "cv", "open to"))
    return "I'm open to full-stack / web-developer roles, remote-friendly. The best way to reach me is aaron7prince@gmail.com, or the contact form lower down. My rÃ©sumÃ© is being updated right now â€” email me and I'll send the latest copy.";
  if (has("stack", "tech", "language", "framework", "tool", "skill"))
    return "Front end: React, Next.js, TypeScript, Tailwind, Redux. Back end: Node, Python, REST + GraphQL. Data: PostgreSQL, MySQL, Mongo, Supabase. Cloud/DevOps: Docker, Kubernetes, AWS. And AI: LangGraph + RAG. Security is my throughline.";
  if (has("security", "secure", "owasp", "rbac", "hack", "vuln"))
    return "Security is my engineering bias â€” secure coding, OWASP / SQL-injection prevention, RBAC, and data integrity from the first commit, not bolted on later.";
  if (has("langgraph", "rag", "llm", "claude", " ai", "ai ", "agent", "model"))
    return "On the AI side I work with LangGraph and RAG pipelines, and I use Claude Code in my workflow â€” always human-validated. This chat is a small example of that.";
  if (has("intern", "larvation", "experience", "worked", "career"))
    return "I was a Web Development Intern at Larvation Web LLC (remote, 2026) â€” building full-stack features and RESTful APIs in Node.js + TypeScript on the Nuxt stack, in agile reviews with senior engineers.";
  if (has("school", "study", "degree", "university", "education", "ncu", "graduate", "gpa", "class of"))
    return "I'm a BSc Computer Science graduate from Northern Caribbean University â€” Class of 2026, Top Student in Software Engineering, GPA 3.5 and Honor Roll.";
  if (has("write", "writing", "book", "article", "gleaner", "observer", "author", "publish"))
    return 'I write too â€” a self-published book, "Gentle Architect: The Lonely Build," an academic paper on GenAI, and op-eds and features in the Jamaica Gleaner and Observer.';
  if (has("where", "location", "jamaica", "based", "live", "from"))
    return "I'm based in Mandeville, Manchester, Jamaica â€” and happy to work remote.";
  if (has("who are you", "yourself", "about you", "your name"))
    return "I'm Aaron Prince \u2014 a Computer Science graduate from Jamaica who builds systems that replace manual work. Paper tallies, hand-compiled reports, spreadsheets nobody trusts: I find them and automate them, with validation and audit trails built in. Ask me about my work or how to hire me.";
  if (has("philosophy", "motto", "principle", "believe"))
    return "Two things. Most things aren't hard, only unfamiliar \u2014 so I keep building until they're familiar. And the real defect is almost never where it shows: a report nobody trusts is usually a capture problem, not a reporting problem. Fix it where the data enters.";
  if (has("project", "build", "portfolio", "made"))
    return "I've shipped a bunch â€” EGZIT (AI logistics marketplace), the BNS staff tool, TAJ Pre-Queue, plus my own venture Jamoment, and smaller builds like Vault Guardian and Hurricane Watch JA. Want detail on any one?";
  return "Good question. I'm a small offline version of Aaron's AI right now, so for anything specific the surest bet is to email aaron7prince@gmail.com. You can also ask me about his projects, stack, or background.";
}

