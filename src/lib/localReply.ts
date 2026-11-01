// Offline fallback for the AI chat, used when /api/chat is unavailable
// (local dev, or no ANTHROPIC_API_KEY set on Vercel).
export function localReply(raw: string): string {
  const t = raw.toLowerCase();
  const has = (...ks: string[]) => ks.some((k) => t.includes(k));

  if (has("hello", "hi ", "hey", " yo", "gwaan", "good morning", "good day", "greet"))
    return "Hey! Good to meet you. Ask me what I do, my skills, my projects, or how to get my résumé.";
  if (has("what do you do", "what you do", "what does aaron do", "do you do"))
    return "I build practical technology for real businesses: ordering systems, reporting dashboards and data tools, and I make the data behind them accurate and traceable. I am a 2026 Computer Science graduate looking for data and reporting analytics, software development, or IT and networking roles.";
  if (has("hire", "available", "reach", "contact", "email", "work with", "collab", "open to", "looking for", "job", "role"))
    return "I am open to data and reporting analytics, software development, and IT or networking roles, remote or in Jamaica. Email aaron7prince@gmail.com or use the contact form, and you can request my résumé from the Request my résumé page.";
  if (has("resume", "résumé", "cv"))
    return "My résumé has my contact details, so I send it directly. Use the Request my résumé page on this site or email aaron7prince@gmail.com and I will reply with the latest copy.";
  if (has("stack", "tech", "language", "framework", "tool", "skill", "sql", "python", "power bi", "excel", "access"))
    return "Core toolkit: SQL (PostgreSQL, MySQL, SQL Server), Python for data processing and automation, dashboard and KPI design, database and schema design, data validation and audit logging, Microsoft Access, and Git, documentation and testing. Power BI is in progress. On the web side: React, TypeScript and Node.js.";
  if (has("cake", "chef hudson", "concurrency", "simulation", "idempotency"))
    return "Chef Hudson's Christmas Cakes is a live ordering platform for a baker. Customers were getting \"system busy\" errors because every request queued behind one lock. I reproduced it in a simulation first, then moved reads out of the lock and added retries with jittered backoff and idempotency keys. In simulation a 40-customer burst went from 9 errors to 0. Those are simulation figures, not live measurements.";
  if (has("errand"))
    return "Errands is a live pickup and delivery service for Mandeville, with request flows for orders, trips and prices.";
  if (has("egzit"))
    return "EGZIT is my moving-logistics marketplace: inventory with QR labels, a movers marketplace and tracking, on React, TypeScript, PostgreSQL and Supabase, with a 14-table schema and row-level security.";
  if (has("crib", "cradle", "esp32", "baby", "embedded", "hardware"))
    return "The Smart Rocking Baby Crib is a Human-Computer Interaction course project: a hanging cradle designed around an ESP32 with a rocking servo, temperature sensor, camera, status LED and cooling fan, drawn in dimensioned views and built as a painted-wood prototype where the servo, sensor, fan and camera all work. It is a learning prototype, not a certified infant product.";
  if (has("becoming"))
    return "Becoming is a working prototype that builds a private map of what a person wants from their own answers. Every item must quote their words, and it keeps competing explanations open instead of guessing a motive.";
  if (has("qr", "filepro", "filetrack"))
    return "My QR Data Lab is an experiment on using a QR code as a small key to larger backend logic, with a simulation of printing and photographing QR sheets (simulated, not real camera data). FileTrack Pro is a tamper-evident record-tracking design with overdue-exception reporting.";
  if (has("bns", "scotia", "lunch"))
    return "BNS Lunch Pre-Order is a live tool for Bank of Nova Scotia staff in Mandeville: a clean ordering page over a Google Sheet with duplicate-submission control.";
  if (has("wallet", "finance", "dashboard", "kpi", "analytics"))
    return "Personal Finance Wallet (Python, SQLite) tracks income, expenses, transfers and refunds with duplicate detection and audit logging. My Sales Performance Dashboard is a KPI and seasonality dashboard on illustrative data, built to practise reporting.";
  if (has("intern", "larvation", "experience", "worked", "career"))
    return "I was a Web Development Intern at Larvation Web LLC (remote, March to June 2026): SQL queries and schema changes on a production PostgreSQL database, data-processing routines and third-party API integrations, delivered with Git, code review, CI/CD and documentation.";
  if (has("certif", "security+", "ccna", "comptia", "cisco", "course"))
    return "CompTIA Security+ 701 (Infosec, 2025), Cisco Networking Academy CCNA: Introduction to Networks (2026), Introduction to Data Science (Simplilearn, 2024) and a Node.js Master Class (2026). In progress: Introduction to Power BI on DataCamp (Data Analyst in Power BI track), Microsoft Power BI Data Analyst and the full CCNA.";
  if (has("school", "study", "degree", "university", "education", "ncu", "graduate", "gpa", "class of"))
    return "B.Sc. in Computer Science from Northern Caribbean University, 2026. GPA 3.5, Honor Roll, Top Student in Software Engineering, and a Leadership Recognition Award.";
  if (has("security", "secure", "owasp", "rbac", "audit", "traceab"))
    return "Traceable by design is my habit: validation at the point of capture, audit logging, duplicate detection and access control from the start rather than bolted on later.";
  if (has("write", "writing", "book", "article", "gleaner", "observer", "author", "publish"))
    return "I write too: a self-published book, Gentle Architect: The Lonely Build, pieces in the Jamaica Gleaner and Jamaica Observer, and a co-authored peer-reviewed paper in Castledown's Artificial Intelligence in Language Education (2026). See the Writing page.";
  if (has("where", "location", "jamaica", "based", "live", "from"))
    return "I am based in Mandeville, Manchester, Jamaica, and happy to work remotely.";
  if (has("who are you", "yourself", "about you", "your name"))
    return "I am Aaron Prince, a Computer Science graduate from Jamaica. I find manual, untrusted processes (paper tallies, hand-compiled reports, messy spreadsheets) and replace them with systems that validate data where it enters and keep a trail.";
  if (has("philosophy", "motto", "principle", "believe"))
    return "Most things are not hard, only unfamiliar, so I keep building until they are familiar. And the real defect is rarely where it shows: I reproduce a failure before I fix it.";
  if (has("project", "build", "portfolio", "made", "work"))
    return "My work includes the cake ordering platform, Errands, EGZIT, Becoming, a QR experiment, a finance wallet, FileTrack Pro and a KPI dashboard. Each project page says whether it is deployed, a prototype or an experiment. Ask about any of them.";
  return "Good question. I am a small offline version of Aaron's AI, so for anything specific email aaron7prince@gmail.com. You can ask me what I do, my skills, projects, certifications or how to get my résumé.";
}
