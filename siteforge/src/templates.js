// Built-in website template. Used when no AI key is configured (free demo mode) and as a
// reliable fallback. Produces a complete, mobile-first one-page site from the client's brief.

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const COLOR_NAMES = {
  red: '#dc2626', orange: '#ea580c', yellow: '#ca8a04', gold: '#b8860b', green: '#15803d',
  teal: '#0f766e', blue: '#1d4ed8', navy: '#1e3a8a', purple: '#7c3aed', pink: '#db2777',
  black: '#111827', brown: '#92400e', maroon: '#7f1d1d',
};

const PRESETS = [
  { re: /barber|salon|hair|nail|beauty|spa|lash|brow|makeup/i, color: '#b0306e', services: [
    ['Cuts & styling', 'Fresh, precise looks tailored to you — walk in or book ahead.'],
    ['Grooming & treatments', 'Care that keeps you looking sharp between visits.'],
    ['Special occasions', 'Weddings, graduations and big nights — we get you ready.'] ] },
  { re: /restaurant|food|cook|kitchen|cafe|café|bakery|jerk|catering|grill|bar\b|patty|juice/i, color: '#d9480f', services: [
    ['Signature dishes', 'The plates our customers come back for, made fresh every day.'],
    ['Catering & events', 'Feeding a crowd? We cater parties, office lunches and celebrations.'],
    ['Takeout & delivery', 'Call or WhatsApp your order and we’ll have it ready.'] ] },
  { re: /plumb|electric|contract|construct|repair|mechanic|garage|auto|roof|paint|clean|ac\b|hvac|weld/i, color: '#1d4ed8', services: [
    ['Repairs', 'Fast, honest fixes done right the first time.'],
    ['Installations', 'Professional installs with clean, careful work.'],
    ['Free estimates', 'Tell us what you need and get a clear quote before we start.'] ] },
  { re: /tutor|school|class|lesson|academy|teach|csec|cape|training/i, color: '#7c3aed', services: [
    ['One-to-one lessons', 'Focused sessions that move at your pace.'],
    ['Group classes', 'Learn together, stay motivated, save money.'],
    ['Exam preparation', 'Practice, past papers and strategy so you walk in confident.'] ] },
  { re: /church|ministry|worship|fellowship/i, color: '#6d28d9', services: [
    ['Sunday service', 'Come as you are and worship with us.'],
    ['Community outreach', 'Serving our neighbours with love, food and support.'],
    ['Youth ministry', 'A place for young people to grow, belong and lead.'] ] },
  { re: /tour|travel|taxi|transport|transfer|charter|excursion/i, color: '#0e9f6e', services: [
    ['Airport transfers', 'On time, comfortable and stress-free from the moment you land.'],
    ['Island tours', 'See the places worth seeing with a driver who knows the way.'],
    ['Private charters', 'Your schedule, your stops — just tell us the plan.'] ] },
  { re: /shop|store|boutique|fashion|cloth|apparel|jewel|accessor/i, color: '#be185d', services: [
    ['New arrivals', 'Fresh pieces in regularly — follow us so you don’t miss out.'],
    ['Best sellers', 'The favourites our customers keep coming back for.'],
    ['Custom orders', 'Looking for something specific? Message us and we’ll source it.'] ] },
  { re: /photo|video|media|design|studio|creative/i, color: '#0f172a', services: [
    ['Shoots', 'Portraits, events and brand content captured beautifully.'],
    ['Editing', 'Polished, professional results delivered on time.'],
    ['Packages', 'Simple packages for every budget — ask for our rates.'] ] },
  { re: /fitness|gym|trainer|yoga|workout|coach/i, color: '#ea580c', services: [
    ['Personal training', 'A plan built around your goals, with someone in your corner.'],
    ['Group sessions', 'High-energy classes that keep you coming back.'],
    ['Nutrition coaching', 'Simple, realistic eating habits that support your training.'] ] },
];
const DEFAULT_PRESET = { color: '#0f766e', services: [
  ['What we do', 'Describe your main service here in a sentence or two.'],
  ['How we work', 'Tell customers what working with you is like.'],
  ['Why choose us', 'Share what makes your business the right choice.'] ] };

// Google Fonts families with weights each font actually has (asking for a missing weight fails the request).
const VIBES = {
  modern: { head: 'Space Grotesk', body: 'Inter', fonts: 'family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700', radius: '18px', weight: 700 },
  bold: { head: 'Archivo Black', body: 'Archivo', fonts: 'family=Archivo+Black&family=Archivo:wght@400;600;700', radius: '6px', weight: 400 },
  elegant: { head: 'Playfair Display', body: 'Lato', fonts: 'family=Playfair+Display:wght@600;700&family=Lato:wght@400;700', radius: '2px', weight: 600 },
  playful: { head: 'Fredoka', body: 'Nunito', fonts: 'family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700', radius: '28px', weight: 600 },
};

export function pickVibe(v) {
  const s = String(v || '').toLowerCase();
  if (/bold|loud|street|strong/.test(s)) return 'bold';
  if (/elegant|luxury|classy|premium|classic/.test(s)) return 'elegant';
  if (/fun|playful|friendly|kids|colou?rful/.test(s)) return 'playful';
  return 'modern';
}

export function pickColor(input, fallback) {
  const s = String(input || '').trim().toLowerCase();
  if (/^#?[0-9a-f]{6}$/.test(s)) return s.startsWith('#') ? s : `#${s}`;
  for (const [name, hex] of Object.entries(COLOR_NAMES)) if (s.includes(name)) return hex;
  return fallback;
}

export function waDigits(n) {
  let d = String(n || '').replace(/\D/g, '');
  if (d.length === 7) d = '1876' + d; // local Jamaican number
  if (d.length === 10 && d.startsWith('876')) d = '1' + d;
  return d;
}

export function templateSite(brief) {
  const b = brief || {};
  const name = (b.name || 'Your Business').trim();
  const text = `${b.type || ''} ${b.description || ''}`;
  const preset = PRESETS.find((p) => p.re.test(text)) || DEFAULT_PRESET;
  const vibe = VIBES[pickVibe(b.vibe)];
  const brand = pickColor(b.color, preset.color);
  const c = brand.slice(1);
  const wa = waDigits(b.whatsapp);
  const tel = String(b.phone || '').replace(/[^\d+]/g, '');
  const desc =
    (b.description || '').trim() ||
    `${name} is here to serve you with quality, care and a smile. Get in touch today.`;
  const tagline = [b.type, b.location].filter(Boolean).map((s) => String(s).trim()).join(' · ');
  const primaryCta = wa
    ? `<a class="btn btn-primary" href="https://wa.me/${wa}">Chat on WhatsApp</a>`
    : tel
      ? `<a class="btn btn-primary" href="tel:${esc(tel)}">Call us now</a>`
      : b.email
        ? `<a class="btn btn-primary" href="mailto:${esc(b.email)}">Email us</a>`
        : `<a class="btn btn-primary" href="#contact">Get in touch</a>`;
  const secondCta = wa && tel ? `<a class="btn btn-ghost" href="tel:${esc(tel)}">Call ${esc(b.phone)}</a>` : `<a class="btn btn-ghost" href="#services">See what we offer</a>`;
  const contactRows = [
    b.phone && `<li><span>Phone</span><a href="tel:${esc(tel)}">${esc(b.phone)}</a></li>`,
    wa && `<li><span>WhatsApp</span><a href="https://wa.me/${wa}">Message us</a></li>`,
    b.email && `<li><span>Email</span><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></li>`,
    b.location && `<li><span>Find us</span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + b.location)}">${esc(b.location)}</a></li>`,
    `<li><span>Hours</span><p>${b.hours ? esc(b.hours) : 'Add your opening hours'}</p></li>`,
    b.instagram && `<li><span>Instagram</span><a href="https://instagram.com/${esc(String(b.instagram).replace(/^@/, ''))}">@${esc(String(b.instagram).replace(/^@/, ''))}</a></li>`,
  ].filter(Boolean).join('\n          ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}${b.location ? ' — ' + esc(b.location) : ''}</title>
<meta name="description" content="${esc(desc.slice(0, 155))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${vibe.fonts}&display=swap" rel="stylesheet">
<style>
:root{--brand:${brand};--ink:#14161c;--muted:#5b6170;--bg:#fbfaf7;--card:#fff;--line:#e8e5de;--radius:${vibe.radius};--head:'${vibe.head}',system-ui,sans-serif;--body:'${vibe.body}',system-ui,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--body);color:var(--ink);background:var(--bg);line-height:1.6;font-size:1.0625rem}
img{max-width:100%;display:block}
a{color:inherit}
:focus-visible{outline:3px solid var(--brand);outline-offset:3px}
.wrap{width:min(1120px,92%);margin:0 auto}
h1,h2,h3{font-family:var(--head);font-weight:${vibe.weight};line-height:1.1;letter-spacing:-.01em}
.nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 0}
.logo{font-family:var(--head);font-weight:${vibe.weight};font-size:1.25rem;text-decoration:none;display:flex;align-items:center;gap:.5rem}
.logo i{width:.75rem;height:.75rem;border-radius:50%;background:var(--brand);display:inline-block}
.links{display:flex;gap:1.5rem;font-size:.95rem}
.links a{text-decoration:none;color:var(--muted)}
.links a:hover{color:var(--ink)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.85rem 1.4rem;border-radius:var(--radius);font-weight:700;text-decoration:none;transition:transform .15s,box-shadow .15s;font-size:1rem}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--brand);color:#fff;box-shadow:0 10px 24px -10px var(--brand)}
.btn-ghost{border:2px solid var(--ink);color:var(--ink)}
.nav .btn{padding:.55rem 1rem;font-size:.9rem}
.hero{padding:4.5rem 0 3.5rem;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;inset:-40% -20% auto auto;width:60vw;height:60vw;background:radial-gradient(circle,color-mix(in srgb,var(--brand) 22%,transparent),transparent 65%);z-index:-1}
.hero .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:3rem;align-items:center}
.eyebrow{display:inline-block;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--brand);margin-bottom:1rem}
.hero h1{font-size:clamp(2.6rem,6vw,4.6rem);margin-bottom:1.2rem}
.hero p{font-size:1.15rem;color:var(--muted);max-width:34rem;margin-bottom:2rem}
.ctas{display:flex;flex-wrap:wrap;gap:.8rem}
.hero-img{border-radius:calc(var(--radius) * 1.6);overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.45);transform:rotate(1.5deg)}
.hero-img img{width:100%;aspect-ratio:4/5;object-fit:cover}
section{padding:4.5rem 0}
.head{max-width:40rem;margin-bottom:2.5rem}
.head h2{font-size:clamp(2rem,4vw,2.8rem);margin-bottom:.6rem}
.head p{color:var(--muted)}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:1.75rem;position:relative}
.card b{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:color-mix(in srgb,var(--brand) 14%,#fff);color:var(--brand);font-family:var(--head);margin-bottom:1rem}
.card h3{font-size:1.3rem;margin-bottom:.4rem}
.card p{color:var(--muted)}
.about .wrap{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.about img{border-radius:calc(var(--radius) * 1.4);width:100%;aspect-ratio:4/3;object-fit:cover}
.about p{color:var(--muted);margin-bottom:1rem}
.gallery{background:var(--ink);color:#fff}
.gallery .head p{color:#b9bcc6}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius)}
.grid img:nth-child(2){margin-top:2rem}.grid img:nth-child(4){margin-top:2rem}
.quotes{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
blockquote{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--brand);border-radius:var(--radius);padding:1.6rem;font-size:1.1rem}
blockquote cite{display:block;margin-top:.8rem;font-style:normal;font-weight:700;color:var(--muted);font-size:.95rem}
.contact-box{background:var(--brand);color:#fff;border-radius:calc(var(--radius) * 1.6);padding:clamp(2rem,5vw,3.5rem);display:grid;grid-template-columns:1fr 1fr;gap:2.5rem}
.contact-box h2{font-size:clamp(2rem,4vw,2.8rem);margin-bottom:.8rem}
.contact-box .btn-primary{background:#fff;color:var(--ink);box-shadow:none}
.contact-box ul{list-style:none;display:grid;gap:1rem}
.contact-box li span{display:block;font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;opacity:.8}
.contact-box li a,.contact-box li p{font-weight:700;font-size:1.1rem;text-decoration:none}
footer{padding:2rem 0 3rem;color:var(--muted);font-size:.9rem}
footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem}
@media (max-width:860px){
  .links{display:none}
  .hero{padding-top:2.5rem}
  .hero .wrap,.about .wrap,.contact-box,.quotes{grid-template-columns:1fr}
  .hero-img{transform:none}
  .hero-img img{aspect-ratio:4/3}
  .cards{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr 1fr}
  .grid img:nth-child(n){margin-top:0}
  section{padding:3.2rem 0}
}
@media (max-width:600px){
  .nav .btn{display:none}
  .logo{font-size:1.1rem}
  .hero h1{font-size:2.5rem}
}
</style>
</head>
<body>
<header class="nav">
  <div class="wrap">
    <a class="logo" href="#home"><i></i>${esc(name)}</a>
    <nav class="links"><a href="#services">Services</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a></nav>
    ${primaryCta}
  </div>
</header>

<section id="home" class="hero">
  <div class="wrap">
    <div>
      ${tagline ? `<span class="eyebrow">${esc(tagline)}</span>` : ''}
      <h1>${esc(name)}</h1>
      <p>${esc(desc)}</p>
      <div class="ctas">${primaryCta}${secondCta}</div>
    </div>
    <div class="hero-img"><img src="/_ph/900x1100/main-photo?c=${c}" alt="${esc(name)} — main photo"></div>
  </div>
</section>

<section id="services">
  <div class="wrap">
    <div class="head"><h2>What we offer</h2><p>Everything you need, done properly. Ask us about anything you don’t see here.</p></div>
    <div class="cards">
      ${preset.services.map(([t, d], i) => `<article class="card"><b>${i + 1}</b><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="about" class="about">
  <div class="wrap">
    <img src="/_ph/1000x750/about-us?c=${c}" alt="Inside ${esc(name)}">
    <div>
      <span class="eyebrow">About us</span>
      <div class="head" style="margin-bottom:1rem"><h2>Built on care and good work</h2></div>
      <p>${esc(desc)}</p>
      <p>Tell your story here: how you started, who you serve, and what customers can count on when they choose ${esc(name)}.</p>
    </div>
  </div>
</section>

<section id="gallery" class="gallery">
  <div class="wrap">
    <div class="head"><h2>Take a look</h2><p>A few photos of our work. Replace these with your own.</p></div>
    <div class="grid">
      <img src="/_ph/600x600/gallery-1?c=${c}" alt="Gallery photo 1">
      <img src="/_ph/600x600/gallery-2?c=${c}" alt="Gallery photo 2">
      <img src="/_ph/600x600/gallery-3?c=${c}" alt="Gallery photo 3">
      <img src="/_ph/600x600/gallery-4?c=${c}" alt="Gallery photo 4">
    </div>
  </div>
</section>

<section id="reviews">
  <div class="wrap">
    <div class="head"><h2>What our customers say</h2></div>
    <div class="quotes">
      <blockquote>Add a real customer review here.<cite>— Customer name</cite></blockquote>
      <blockquote>Add another review here — screenshots from WhatsApp or Google work great.<cite>— Customer name</cite></blockquote>
    </div>
  </div>
</section>

<section id="contact">
  <div class="wrap">
    <div class="contact-box">
      <div>
        <h2>Ready when you are</h2>
        <p style="margin-bottom:1.5rem;opacity:.9">Message us, call, or stop by — we’d love to hear from you.</p>
        ${primaryCta}
      </div>
      <ul>
          ${contactRows}
      </ul>
    </div>
  </div>
</section>

<footer>
  <div class="wrap"><span>© ${new Date().getFullYear()} ${esc(name)}</span><span>${esc(b.location || '')}</span></div>
</footer>
</body>
</html>
`;
}

// Branded placeholder image (served at /_ph/WxH/label?c=hex on every host).
export function placeholderSvg(size, label, color) {
  const m = String(size).match(/^(\d{2,4})x(\d{2,4})$/);
  const w = m ? Math.min(2400, +m[1]) : 800;
  const h = m ? Math.min(2400, +m[2]) : 600;
  const hex = /^[0-9a-f]{6}$/i.test(color || '') ? color : '64748b';
  const text = esc(String(label || 'photo').replace(/\.svg$/, '').replace(/[-_]+/g, ' ').slice(0, 40));
  const s = Math.max(12, Math.round(Math.min(w, h) / 18));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${hex}" stop-opacity=".95"/><stop offset="1" stop-color="#${hex}" stop-opacity=".55"/></linearGradient>
<radialGradient id="r" cx=".8" cy=".2" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="100%" height="100%" fill="#1b1d24"/><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#r)"/>
<g transform="translate(${w / 2} ${h / 2 - s})" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="${Math.max(2, s / 8)}" stroke-linejoin="round">
<rect x="${-s * 1.3}" y="${-s * 0.9}" width="${s * 2.6}" height="${s * 1.9}" rx="${s * 0.3}"/><circle r="${s * 0.55}" cy="${s * 0.05}"/><path d="M${-s * 0.5} ${-s * 0.9} l${s * 0.2} ${-s * 0.35} h${s * 0.6} l${s * 0.2} ${s * 0.35}"/></g>
<text x="50%" y="${h / 2 + s * 1.6}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${s}" font-weight="600" fill="#fff" fill-opacity=".9">${text}</text>
</svg>`;
}
