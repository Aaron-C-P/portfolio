// Client dashboard: sign up, build a site with AI, edit it, publish it, manage the plan.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const app = $('#app');
let ME = null;
let unsaved = false;

window.addEventListener('beforeunload', (e) => {
  if (unsaved) {
    e.preventDefault();
    e.returnValue = '';
  }
});

async function api(path, { method = 'GET', body } = {}) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch('/api' + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong.');
    Object.assign(err, { status: res.status, code: data.code, data });
    throw err;
  }
  return data;
}

function toast(html, bad = false, ms = 4200) {
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.innerHTML = html;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), ms);
}
const fail = (e) => toast(esc(e.message || e), true);

function modal(html, onMount) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => ov.remove();
  ov.addEventListener('click', (e) => {
    if (e.target === ov || e.target.closest('[data-close]')) close();
  });
  document.body.append(ov);
  onMount?.(ov.firstElementChild, close);
  return close;
}

const timeAgo = (t) => {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
const daysLeft = (t) => Math.max(0, Math.ceil((t - Date.now()) / 864e5));
const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const slugify = (s) =>
  String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30).replace(/-+$/g, '');
const debounce = (fn, ms) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

function statusPill(site) {
  if (site.adminLocked) return `<span class="pill offline">Paused by support</span>`;
  if (site.status === 'published' && site.hasUnpublishedChanges) return `<span class="pill changes">Live · unpublished edits</span>`;
  if (site.status === 'published') return `<span class="pill live">Live</span>`;
  if (site.status === 'offline') return `<span class="pill offline">Offline</span>`;
  return `<span class="pill draft">Draft</span>`;
}

const TIPS = [
  'Tip: once it’s built, tap any text on your site to change it.',
  'Tip: in edit mode, tap a photo to swap in your own.',
  'Tip: ask the AI things like “add a price list” or “make it more colourful”.',
  'Tip: nothing goes live until you press Publish.',
];

// Shows the building screen while a background AI job runs.
function runJob(jobId, title = 'Building your website') {
  return new Promise((resolve, reject) => {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal building"><div class="orb"></div><h2>${esc(title)}</h2>
      <p class="muted" data-msg>Starting…</p><div class="progress"><i></i></div><p class="small muted" data-tip></p></div>`;
    document.body.append(ov);
    let i = 0;
    const tip = () => ($('[data-tip]', ov).textContent = TIPS[i++ % TIPS.length]);
    tip();
    const tipTimer = setInterval(tip, 5000);
    const finish = (fn, v) => {
      clearInterval(tipTimer);
      clearInterval(poll);
      ov.remove();
      fn(v);
    };
    const poll = setInterval(async () => {
      try {
        const { job } = await api(`/jobs/${jobId}`);
        $('.progress i', ov).style.width = `${job.progress}%`;
        if (job.message) $('[data-msg]', ov).textContent = job.message;
        if (job.status === 'done') {
          $('.progress i', ov).style.width = '100%';
          clearInterval(poll);
          setTimeout(() => finish(resolve, job), 400);
        } else if (job.status === 'error') finish(reject, new Error(job.error || 'Something went wrong.'));
      } catch (e) {
        if (e.status === 401 || e.status === 404) finish(reject, e);
      }
    }, 1200);
  });
}

function planNeeded(message) {
  modal(`<h2>Choose a plan</h2><p class="muted">${esc(message)}</p>
    <div class="actions"><button class="btn btn-ghost" data-close>Not now</button><a class="btn btn-dark" href="#billing" data-close>See plans</a></div>`);
}

// ---------------- routing ----------------
async function loadMe() {
  ME = await api('/me');
  return ME;
}

async function route() {
  unsaved = false;
  const hash = location.hash || '#/';
  try {
    await loadMe();
  } catch (e) {
    app.innerHTML = `<div class="page"><p>Can’t reach the server. ${esc(e.message)}</p></div>`;
    return;
  }
  document.title = `${ME.brand} — Dashboard`;
  if (!ME.user) return viewAuth(hash === '#login' ? 'login' : 'signup');
  if (hash === '#signup' || hash === '#login') return (location.hash = '#/');
  if (hash.startsWith('#site/')) return viewBuilder(hash.slice(6));
  if (hash === '#new') return viewNew();
  if (hash === '#billing') return viewBilling();
  return viewDashboard();
}
window.addEventListener('hashchange', route);
route();

function shell(active, inner) {
  return `<header class="topbar"><div class="in">
      <a class="logo" href="#/"><i>✦</i><span class="word">${esc(ME.brand)}</span></a>
      <nav class="nav">
        <a href="#/" class="${active === 'sites' ? 'on' : ''}">My websites</a>
        <a href="#billing" class="${active === 'billing' ? 'on' : ''}">Plan</a>
        ${ME.user.isAdmin ? '<a href="/admin">Admin</a>' : ''}
      </nav>
      <div class="spacer"></div>
      <button class="btn btn-line btn-sm" data-logout>Log out</button>
    </div></header><main class="page">${inner}</main>`;
}
function bindShell() {
  $('[data-logout]').onclick = async () => {
    await api('/auth/logout', { method: 'POST' });
    location.hash = '#login';
  };
}

function accountBanner() {
  const a = ME.account;
  if (!a.active)
    return `<div class="banner bad"><p><b>Your plan has ended.</b> Your websites are offline until you choose a plan — nothing has been deleted.</p><a class="btn btn-dark btn-sm" href="#billing">Choose a plan</a></div>`;
  if (a.reason === 'trial') {
    const d = daysLeft(a.until);
    return `<div class="banner trial"><p><b>Free trial:</b> ${d} day${d === 1 ? '' : 's'} left. Pick a plan any time to keep your site online.</p><a class="btn btn-dark btn-sm" href="#billing">See plans</a></div>`;
  }
  if (a.status === 'past_due')
    return `<div class="banner bad"><p><b>Your last payment didn’t go through.</b> Update your card to keep your site online.</p><a class="btn btn-dark btn-sm" href="#billing">Fix payment</a></div>`;
  if (a.status === 'cancelled')
    return `<div class="banner trial"><p>Your subscription is cancelled and ends on <b>${fmtDate(a.until)}</b>. Your site goes offline after that.</p><a class="btn btn-dark btn-sm" href="#billing">Keep my site</a></div>`;
  return '';
}

// ---------------- sign up / log in ----------------
function viewAuth(mode) {
  app.innerHTML = `<div class="auth">
    <section class="pitch">
      <a class="logo" href="/"><i>✦</i>${esc(ME.brand)}</a>
      <div style="position:relative;z-index:1">
        <h1>Your business online today.</h1>
        <p>Tell us about your business and AI builds your website in about a minute. Change it any time from your phone — no tech skills, no waiting on a developer.</p>
        <ul>
          <li>Your own link: <b>yourname.${esc(ME.siteDomain || '')}</b></li>
          <li>Change words and photos yourself, any time</li>
          <li>Ask the AI for bigger changes</li>
          <li>Pause or cancel whenever you want</li>
        </ul>
      </div>
      <p class="small" style="color:#7d828f;position:relative;z-index:1">© ${new Date().getFullYear()} ${esc(ME.brand)}</p>
    </section>
    <section class="panel">
      <form class="stack" novalidate>
        <div class="tabs"><button type="button" data-mode="signup">Create account</button><button type="button" data-mode="login">Log in</button></div>
        <div><h2 data-h style="font-size:28px"></h2><p class="muted" data-sub></p></div>
        <label class="field" data-namef>Your name<input class="input" name="name" autocomplete="name"></label>
        <label class="field">Email<input class="input" name="email" type="email" autocomplete="email" inputmode="email" required></label>
        <label class="field">Password<input class="input" name="password" type="password" required minlength="8"></label>
        <p class="error-text" data-err></p>
        <button class="btn btn-dark btn-lg btn-block" data-submit></button>
      </form>
    </section>
  </div>`;
  const form = $('form');
  const set = (m) => {
    mode = m;
    $$('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    $('[data-namef]').classList.toggle('hidden', m === 'login');
    $('[data-h]').textContent = m === 'login' ? 'Welcome back' : 'Build your website free';
    $('[data-sub]').textContent = m === 'login' ? 'Log in to edit your website.' : `${ME.trialDays}-day free trial. No card needed.`;
    $('[data-submit]').textContent = m === 'login' ? 'Log in' : 'Create my account';
    form.password.autocomplete = m === 'login' ? 'current-password' : 'new-password';
    $('[data-err]').textContent = '';
    history.replaceState(null, '', `#${m}`);
  };
  $$('.tabs button').forEach((b) => (b.onclick = () => set(b.dataset.mode)));
  set(mode);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('[data-submit]');
    btn.disabled = true;
    try {
      await api(`/auth/${mode}`, {
        method: 'POST',
        body: { name: form.name.value, email: form.email.value, password: form.password.value },
      });
      location.hash = mode === 'signup' ? '#new' : '#/';
    } catch (err) {
      $('[data-err]').textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  };
}

// ---------------- dashboard ----------------
async function viewDashboard() {
  const { sites } = await api('/sites');
  const L = ME.limits;
  const canAdd = sites.length < L.maxSites;
  app.innerHTML = shell('sites', `
    ${accountBanner()}
    <div class="page-head">
      <div><h1>Your websites</h1><p class="muted">Build, edit and publish — right from your phone if you like.</p></div>
      ${sites.length ? `<a class="btn btn-gold" href="#new" ${canAdd ? '' : 'data-limit'}>+ New website</a>` : ''}
    </div>
    ${sites.length ? `<div class="sites">${sites.map(siteCard).join('')}</div>` : `
      <div class="card empty">
        <div class="art">✨</div>
        <h2>Let’s build your first website</h2>
        <p class="muted" style="max-width:32rem">Answer a few questions about your business and the AI designs a full website in about a minute. You can change anything after.</p>
        <a class="btn btn-gold btn-lg" href="#new">Build my website</a>
      </div>`}
    ${ME.aiEnabled ? `
      <div class="card" style="padding:18px;margin-top:22px;max-width:420px">
        <div style="display:flex;justify-content:space-between"><b>AI edits this month</b><span class="muted">${L.aiUsed} / ${L.aiPerMonth}</span></div>
        <div class="meter" style="margin-top:10px"><i style="width:${Math.min(100, (L.aiUsed / Math.max(1, L.aiPerMonth)) * 100)}%"></i></div>
      </div>` : ''}
  `);
  bindShell();
  $$('.thumb iframe').forEach((f) => (f.style.transform = `scale(${f.parentElement.clientWidth / 1280})`));
  $$('[data-limit]').forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        planNeeded(`Your plan includes ${L.maxSites} website${L.maxSites === 1 ? '' : 's'}. Upgrade to add more.`);
      }),
  );
}

function siteCard(s) {
  const host = s.url.replace(/^https?:\/\//, '');
  return `<article class="card site-card">
    <a class="thumb" href="#site/${s.id}" aria-label="Edit ${esc(s.name)}">
      ${s.hasContent ? `<iframe src="/preview/${s.id}/" loading="lazy" tabindex="-1" sandbox="allow-same-origin" title="Preview of ${esc(s.name)}"></iframe>` : ''}
    </a>
    <div class="body">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3>${esc(s.name)}</h3>${statusPill(s)}</div>
      <a class="link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(host)}</a>
      <div class="actions">
        <a class="btn btn-dark btn-sm" href="#site/${s.id}">Edit site</a>
        ${s.status === 'published' ? `<a class="btn btn-line btn-sm" href="${esc(s.url)}" target="_blank" rel="noopener">View live ↗</a>` : ''}
      </div>
    </div>
  </article>`;
}

// ---------------- new site ----------------
const TYPES = ['Barber shop', 'Hair salon', 'Nail tech', 'Restaurant', 'Cook shop', 'Bakery', 'Bar & grill', 'Catering', 'Plumber', 'Electrician', 'Contractor', 'Auto mechanic', 'Cleaning service', 'Tutor', 'School', 'Church', 'Tour company', 'Taxi & transfers', 'Clothing store', 'Photographer', 'Fitness trainer', 'Event planner', 'Real estate', 'Other'];
const VIBES = ['Modern', 'Bold', 'Elegant', 'Playful'];
const COLORS = ['#0f766e', '#15803d', '#1d4ed8', '#7c3aed', '#be185d', '#dc2626', '#ea580c', '#b8860b', '#111827'];

function briefFields(b = {}) {
  return `
    <label class="field">Business name<input class="input" name="name" required maxlength="80" value="${esc(b.name)}" placeholder="e.g. Fresh Cutz Barber Shop"></label>
    <label class="field">What kind of business is it?<input class="input" name="type" list="types" value="${esc(b.type)}" placeholder="e.g. Barber shop"></label>
    <datalist id="types">${TYPES.map((t) => `<option value="${t}">`).join('')}</datalist>
    <label class="field">Describe your business <span class="hint">What do you sell or do? Who are your customers? What makes you different? Prices are welcome too.</span>
      <textarea class="input" name="description" rows="4" maxlength="1500" placeholder="e.g. Neighbourhood barber in Portmore since 2015. Fades, line-ups, beard trims and kids cuts. Walk-ins welcome, Saturday is our busiest day.">${esc(b.description)}</textarea></label>
    <div class="section-title">How customers reach you</div>
    <div class="row2">
      <label class="field">WhatsApp number<input class="input" name="whatsapp" inputmode="tel" value="${esc(b.whatsapp)}" placeholder="876 555 1234"></label>
      <label class="field">Phone<input class="input" name="phone" inputmode="tel" value="${esc(b.phone)}" placeholder="876 555 1234"></label>
      <label class="field">Email<input class="input" name="email" type="email" value="${esc(b.email)}" placeholder="you@example.com"></label>
      <label class="field">Location / address<input class="input" name="location" value="${esc(b.location)}" placeholder="e.g. Half Way Tree, Kingston"></label>
    </div>
    <details class="more"><summary>More details (optional)</summary>
      <div class="stack">
        <label class="field">Opening hours<input class="input" name="hours" value="${esc(b.hours)}" placeholder="Mon–Sat 9am–7pm"></label>
        <label class="field">Instagram<input class="input" name="instagram" value="${esc(b.instagram)}" placeholder="@yourbusiness"></label>
        <label class="field">Anything else the AI should know?<textarea class="input" name="extra" rows="3" placeholder="Sections you want, your slogan, specials…">${esc(b.extra)}</textarea></label>
      </div>
    </details>
    <div class="section-title">Look & feel</div>
    <div class="chips" data-vibes>${VIBES.map((v) => `<button type="button" class="chip ${String(b.vibe || 'Modern').toLowerCase() === v.toLowerCase() ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
    <div class="chips" data-colors style="align-items:center">
      <button type="button" class="chip ${b.color ? '' : 'on'}" data-c="">Let AI choose</button>
      ${COLORS.map((c) => `<button type="button" class="swatch ${b.color === c ? 'on' : ''}" data-c="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join('')}
    </div>`;
}

function readBrief(form) {
  const v = (n) => form.elements[n]?.value?.trim() || '';
  return {
    name: v('name'), type: v('type'), description: v('description'), whatsapp: v('whatsapp'), phone: v('phone'),
    email: v('email'), location: v('location'), hours: v('hours'), instagram: v('instagram'), extra: v('extra'),
    vibe: $('[data-vibes] .on', form)?.dataset.v || 'Modern',
    color: $('[data-colors] .on', form)?.dataset.c || '',
  };
}

function bindChips(form) {
  $$('[data-vibes] .chip', form).forEach((b) => (b.onclick = () => {
    $$('[data-vibes] .chip', form).forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
  }));
  $$('[data-colors] [data-c]', form).forEach((b) => (b.onclick = () => {
    $$('[data-colors] [data-c]', form).forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
  }));
}

function bindSlug(input, statusEl, current) {
  const check = debounce(async () => {
    const slug = slugify(input.value);
    if (!slug) return (statusEl.textContent = '');
    if (slug === current) {
      statusEl.className = 'slug-status ok';
      return (statusEl.textContent = '✓ This is your current address');
    }
    try {
      const r = await api(`/slug-check?slug=${encodeURIComponent(slug)}`);
      statusEl.className = 'slug-status ' + (r.problem ? 'bad' : 'ok');
      statusEl.textContent = r.problem ? r.problem : `✓ ${r.url.replace(/^https?:\/\//, '')} is available`;
    } catch {}
  }, 350);
  input.addEventListener('input', check);
  return check;
}

function viewNew() {
  app.innerHTML = shell('sites', `
    <div class="wizard">
      ${accountBanner()}
      <div class="page-head"><div><h1>Build a new website</h1><p class="muted">The more you tell us, the better your site. Everything can be changed later.</p></div></div>
      <form class="card stack" novalidate>
        ${briefFields()}
        <div class="section-title">Your web address</div>
        <div class="slug-field"><input name="slug" placeholder="your-business" autocapitalize="off" autocomplete="off" spellcheck="false"><span>.${esc(ME.siteDomain)}</span></div>
        <p class="slug-status" data-slug-status></p>
        <p class="error-text" data-err></p>
        <button class="btn btn-gold btn-lg">Build my website ✨</button>
      </form>
    </div>`);
  bindShell();
  const form = $('form');
  bindChips(form);
  let slugTouched = false;
  const check = bindSlug(form.slug, $('[data-slug-status]'));
  form.slug.addEventListener('input', () => (slugTouched = true));
  form.name.addEventListener('input', () => {
    if (!slugTouched) {
      form.slug.value = slugify(form.name.value);
      check();
    }
  });
  form.onsubmit = async (e) => {
    e.preventDefault();
    const brief = readBrief(form);
    if (!brief.name) return ($('[data-err]').textContent = 'Tell us your business name.');
    const btn = $('button.btn-gold', form);
    btn.disabled = true;
    $('[data-err]').textContent = '';
    try {
      const { site, jobId } = await api('/sites', { method: 'POST', body: { brief, slug: slugify(form.slug.value) || undefined } });
      try {
        await runJob(jobId, `Building ${brief.name}`);
      } catch (err) {
        fail(err);
      }
      location.hash = `#site/${site.id}`;
    } catch (err) {
      if (err.code === 'inactive' || err.code === 'site_limit') planNeeded(err.message);
      else $('[data-err]').textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  };
}

// ---------------- builder ----------------
const SUGGESTIONS = [
  'Make it look more premium',
  'Add a price list section',
  'Add a frequently asked questions section',
  'Make the headline shorter and punchier',
  'Use green and gold colours',
  'Add a section for opening hours',
];

async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 350_000) return { blob: file, name: file.name };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
    const blob = await new Promise((r) => canvas.toBlob(r, type, 0.82));
    if (!blob) return { blob: file, name: file.name };
    return { blob, name: file.name.replace(/\.[^.]+$/, '') + (type === 'image/jpeg' ? '.jpg' : '.webp') };
  } catch {
    return { blob: file, name: file.name };
  }
}

async function viewBuilder(id) {
  let data;
  try {
    data = await api(`/sites/${id}`);
  } catch (e) {
    fail(e);
    location.hash = '#/';
    return;
  }
  let { site, versions } = data;
  let editing = false;
  let tab = 'ai';

  app.innerHTML = `<div class="builder" data-mtab="preview">
    <div class="bbar">
      <a class="btn btn-ghost btn-sm" href="#/" data-back aria-label="Back to my websites">←</a>
      <div class="title"><b data-name></b><a data-url target="_blank" rel="noopener"></a></div>
      <span data-pill class="hide-m"></span>
      <div class="spacer"></div>
      <div class="seg hide-m" data-device><button data-d="desktop" class="on">Desktop</button><button data-d="phone">Phone</button></div>
      <button class="btn btn-line btn-sm" data-edit><span class="hide-m">✎ Edit text & photos</span><span class="m-only">✎ Edit</span></button>
      <button class="btn btn-dark btn-sm" data-publish>Publish</button>
    </div>
    <div class="bmain">
      <aside class="side">
        <div class="tabs"><button data-tab="ai">✨ AI</button><button data-tab="history">History</button><button data-tab="settings">Settings</button></div>
        <div class="content" data-panel></div>
      </aside>
      <section class="stage">
        <div class="editbar hidden" data-editbar><span class="dot"></span><span>Tap text to type. Tap a photo to replace it.</span>
          <button class="btn btn-ghost btn-sm" style="color:#fff" data-cancel>Cancel</button><button class="btn btn-gold btn-sm" data-save>Save</button></div>
        <div class="frame" data-frame><iframe data-iframe sandbox="allow-same-origin" title="Your site"></iframe></div>
      </section>
    </div>
    <nav class="mtabs">
      <button data-m="preview" class="on"><b>◱</b>Preview</button><button data-m="ai"><b>✨</b>AI</button>
      <button data-m="history"><b>↺</b>History</button><button data-m="settings"><b>⚙</b>Settings</button>
    </nav>
    <input type="file" accept="image/*" data-file hidden>
  </div>`;

  const root = $('.builder');
  const iframe = $('[data-iframe]');
  const panel = $('[data-panel]');
  const doc = () => iframe.contentDocument;

  function header() {
    $('[data-name]').textContent = site.name;
    const url = $('[data-url]');
    url.href = site.url;
    url.textContent = site.url.replace(/^https?:\/\//, '') + (site.status === 'published' ? ' ↗' : '');
    $('[data-pill]').innerHTML = statusPill(site);
    const pub = $('[data-publish]');
    pub.disabled = false;
    if (site.status === 'published' && !site.hasUnpublishedChanges) {
      pub.textContent = 'Live ✓';
      pub.className = 'btn btn-line btn-sm';
    } else {
      pub.textContent = site.status === 'published' ? 'Publish changes' : site.status === 'offline' ? 'Go live' : 'Publish';
      pub.className = 'btn btn-dark btn-sm';
    }
  }

  function loadPreview() {
    iframe.src = `/preview/${site.id}/?t=${Date.now()}`;
  }

  async function refresh() {
    const r = await api(`/sites/${site.id}`);
    site = r.site;
    versions = r.versions;
    header();
    renderPanel();
  }

  function setMobileTab(m) {
    root.dataset.mtab = m;
    $$('.mtabs button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    if (m !== 'preview') {
      tab = m;
      renderPanel();
    }
  }
  $$('.mtabs button').forEach((b) => (b.onclick = () => setMobileTab(b.dataset.m)));
  $$('.side .tabs button').forEach((b) => (b.onclick = () => {
    tab = b.dataset.tab;
    renderPanel();
  }));
  $$('[data-device] button').forEach((b) => (b.onclick = () => {
    $$('[data-device] button').forEach((x) => x.classList.toggle('on', x === b));
    $('[data-frame]').classList.toggle('phone', b.dataset.d === 'phone');
  }));

  // ----- edit text & photos (in place) -----
  const editorCss = `img{cursor:pointer!important}img:hover{outline:3px dashed #ffb703!important;outline-offset:-3px}
    [data-ce]:hover{outline:1px dashed rgba(255,183,3,.9);outline-offset:3px;cursor:text}
    [data-ce]:focus{outline:2px solid #ffb703!important;outline-offset:3px}`;
  function onDocClick(e) {
    const img = e.target.closest?.('img');
    if (img) {
      e.preventDefault();
      e.stopPropagation();
      pickPhoto(img);
      return;
    }
    if (e.target.closest?.('a')) e.preventDefault();
  }
  const onInput = () => (unsaved = true);
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.closest?.('h1,h2,h3,h4,h5,h6,a,button,li,small,span,strong,em,b,cite,label')) e.preventDefault();
  };
  // Each text block becomes its own editable box, so editing one heading can never
  // spill into the next section.
  const TEXT_TAGS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,td,th,dt,dd,label,small,cite,a,button,span,strong,em,b';
  function markEditable(d) {
    const mark = (el) => {
      if (el.closest('[data-ce]') || !el.textContent.trim() || el.closest('script,style,svg')) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-ce', '');
    };
    d.body.querySelectorAll(TEXT_TAGS).forEach(mark);
    d.body.querySelectorAll('div,section,article,header,footer,aside,nav').forEach((el) => {
      if (el.children.length === 0) mark(el);
    });
  }
  function unmarkEditable(d) {
    d.querySelectorAll('[data-ce]').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-ce');
    });
    d.querySelectorAll('style[data-editor]').forEach((s) => s.remove());
  }
  function enterEdit() {
    const d = doc();
    if (!d?.body) return;
    setMobileTab('preview');
    const st = d.createElement('style');
    st.setAttribute('data-editor', '');
    st.textContent = editorCss;
    d.head.append(st);
    markEditable(d);
    d.addEventListener('click', onDocClick, true);
    d.addEventListener('input', onInput);
    d.addEventListener('keydown', onKey);
    editing = true;
    $('[data-editbar]').classList.remove('hidden');
    $('[data-edit]').disabled = true;
  }
  function leaveEdit() {
    const d = doc();
    if (d) {
      unmarkEditable(d);
      d.removeEventListener('click', onDocClick, true);
      d.removeEventListener('input', onInput);
      d.removeEventListener('keydown', onKey);
    }
    editing = false;
    unsaved = false;
    $('[data-editbar]').classList.add('hidden');
    $('[data-edit]').disabled = false;
  }
  function pickPhoto(img) {
    const input = $('[data-file]');
    input.value = '';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      toast('Uploading photo…', false, 2000);
      try {
        const { blob, name } = await shrinkImage(file);
        const res = await fetch(`/api/sites/${site.id}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(name) },
          body: blob,
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || 'Upload failed.');
        img.src = j.path;
        img.removeAttribute('srcset');
        unsaved = true;
        toast('Photo added. Press <b>Save</b> to keep it.');
      } catch (e) {
        fail(e);
      }
    };
    input.click();
  }
  async function saveEdit() {
    const d = doc();
    unmarkEditable(d);
    const html = '<!DOCTYPE html>\n' + d.documentElement.outerHTML;
    try {
      const r = await api(`/sites/${site.id}/html`, { method: 'PUT', body: { html, note: 'Your text & photo edits' } });
      site = r.site;
      leaveEdit();
      await refresh();
      loadPreview();
      toast(site.status === 'published' ? 'Saved. Press <b>Publish changes</b> to update your live site.' : 'Saved.');
    } catch (e) {
      fail(e);
      enterEdit();
    }
  }
  $('[data-edit]').onclick = enterEdit;
  $('[data-save]').onclick = saveEdit;
  $('[data-cancel]').onclick = () => {
    if (unsaved && !confirm('Throw away your changes?')) return;
    leaveEdit();
    loadPreview();
  };
  $('[data-back]').onclick = (e) => {
    if (unsaved && !confirm('You have unsaved changes. Leave anyway?')) e.preventDefault();
  };

  // ----- publish -----
  async function publish() {
    if (editing) return toast('Save or cancel your edits first.', true);
    if (site.status === 'published' && !site.hasUnpublishedChanges) {
      return shareModal();
    }
    try {
      const r = await api(`/sites/${site.id}/publish`, { method: 'POST' });
      site = r.site;
      header();
      renderPanel();
      shareModal(true);
    } catch (e) {
      if (e.code === 'inactive') planNeeded(e.message);
      else fail(e);
    }
  }
  function shareModal(fresh = false) {
    const wa = `https://wa.me/?text=${encodeURIComponent(`Check out our website: ${site.url}`)}`;
    modal(`<h2>${fresh ? '🎉 You’re live!' : 'Your website is live'}</h2>
      <p class="muted">Anyone can visit it at:</p>
      <a class="btn btn-line" href="${esc(site.url)}" target="_blank" rel="noopener" style="white-space:normal">${esc(site.url.replace(/^https?:\/\//, ''))} ↗</a>
      <p class="small muted">Put this link in your WhatsApp status, Instagram bio and Google Business profile.</p>
      <div class="actions"><button class="btn btn-ghost" data-copy>Copy link</button><a class="btn btn-line" href="${wa}" target="_blank" rel="noopener">Share on WhatsApp</a><button class="btn btn-dark" data-close>Done</button></div>`,
      (m) => {
        $('[data-copy]', m).onclick = async () => {
          try {
            await navigator.clipboard.writeText(site.url);
            toast('Link copied.');
          } catch {
            prompt('Copy your link:', site.url);
          }
        };
      });
  }
  $('[data-publish]').onclick = publish;

  // ----- side panels -----
  function renderPanel() {
    $$('.side .tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    if (tab === 'history') return renderHistory();
    if (tab === 'settings') return renderSettings();
    return renderAI();
  }

  function renderAI() {
    const L = ME.limits;
    panel.innerHTML = `
      ${ME.aiEnabled ? '' : `<div class="notice">AI changes aren’t switched on yet. Use <b>✎ Edit</b> to change words and photos directly on your site.</div>`}
      <form class="ask stack" data-ask>
        <label class="field">What would you like to change?
          <textarea class="input" name="instruction" maxlength="2000" placeholder="e.g. Add a price list: haircut $1500, beard trim $800, kids cut $1000" ${ME.aiEnabled ? '' : 'disabled'}></textarea></label>
        <button class="btn btn-dark" ${ME.aiEnabled ? '' : 'disabled'}>✨ Make the change</button>
        ${ME.aiEnabled ? `<p class="small muted">${L.aiUsed} of ${L.aiPerMonth} AI changes used this month</p>` : ''}
      </form>
      <div><p class="small muted" style="margin-bottom:8px">Ideas</p>
        <div class="suggest">${SUGGESTIONS.map((s) => `<button type="button">${esc(s)}</button>`).join('')}</div></div>
      <div><p class="small muted" style="margin-bottom:8px">Recent changes</p>
        <div class="feed">${versions.slice(0, 5).map((v) => `<div class="item"><span>${esc(v.note || 'Change')}</span><span class="small muted">${timeAgo(v.created_at)}</span></div>`).join('') || '<p class="small muted">Nothing yet.</p>'}</div></div>`;
    const form = $('[data-ask]', panel);
    $$('.suggest button', panel).forEach((b) => (b.onclick = () => {
      form.instruction.value = b.textContent;
      form.instruction.focus();
    }));
    form.onsubmit = async (e) => {
      e.preventDefault();
      const instruction = form.instruction.value.trim();
      if (!instruction) return form.instruction.focus();
      if (editing) return toast('Save or cancel your edits first.', true);
      try {
        const { jobId } = await api(`/sites/${site.id}/ai-edit`, { method: 'POST', body: { instruction } });
        const job = await runJob(jobId, 'Making your change');
        await loadMe();
        await refresh();
        loadPreview();
        setMobileTab('preview');
        toast(`✨ ${esc(job.message || 'Done')}`, false, 6000);
      } catch (err) {
        if (err.code === 'inactive' || err.code === 'ai_limit') planNeeded(err.message);
        else fail(err);
      }
    };
  }

  function renderHistory() {
    panel.innerHTML = `
      <p class="muted small">Every change is saved here. Restore any version — your current one stays in the list too.</p>
      <div class="versions">${versions.map((v, i) => `
        <div class="item"><div><div>${esc(v.note || 'Change')}</div><div class="when">${timeAgo(v.created_at)}</div></div>
          ${i === 0 ? '<span class="pill draft">Current</span>' : `<button class="btn btn-line btn-sm" data-restore="${v.id}">Restore</button>`}</div>`).join('') || '<p class="small muted">No history yet.</p>'}
      </div>`;
    $$('[data-restore]', panel).forEach((b) => (b.onclick = async () => {
      if (editing) return toast('Save or cancel your edits first.', true);
      try {
        const r = await api(`/sites/${site.id}/restore/${b.dataset.restore}`, { method: 'POST' });
        site = r.site;
        await refresh();
        loadPreview();
        toast('Restored. Press Publish to put it live.');
      } catch (e) {
        fail(e);
      }
    }));
  }

  function renderSettings() {
    const live = site.status === 'published';
    panel.innerHTML = `
      <form class="stack" data-basic>
        <label class="field">Site name<input class="input" name="name" value="${esc(site.name)}" maxlength="80"></label>
        <label class="field">Web address
          <div class="slug-field"><input name="slug" value="${esc(site.slug)}" autocapitalize="off" spellcheck="false"><span>.${esc(ME.siteDomain)}</span></div></label>
        <p class="slug-status" data-slug-status></p>
        <button class="btn btn-dark">Save</button>
      </form>
      <div class="stack">
        <div class="section-title">Visibility</div>
        <p class="muted small">${live ? 'Your site is online for everyone.' : site.status === 'offline' ? 'Your site is offline. Visitors see a “back soon” page.' : 'Your site is a draft — only you can see it.'}</p>
        ${live ? `<button class="btn btn-line" data-offline>Take site offline</button>` : `<button class="btn btn-dark" data-golive>${site.status === 'offline' ? 'Put site back online' : 'Publish site'}</button>`}
        <p class="small muted">Also reachable at <a href="${esc(site.pathUrl)}" target="_blank" rel="noopener">${esc(location.host + site.pathUrl)}</a></p>
      </div>
      <details class="more"><summary>Business details & redesign</summary>
        <form class="stack" data-brief>
          ${briefFields(site.brief)}
          <button class="btn btn-dark" type="submit">Save details</button>
          ${ME.aiEnabled ? `<button class="btn btn-line" type="button" data-rebuild>✨ Redesign with AI</button>
          <p class="small muted">Redesign creates a brand-new design from these details. Your current version stays in History.</p>` : ''}
        </form>
      </details>
      <div class="danger"><b>Delete website</b><p class="small muted">Removes the site and its photos for good.</p>
        <button class="btn btn-line btn-sm" style="color:var(--red);justify-self:start" data-delete>Delete…</button></div>`;

    const basic = $('[data-basic]', panel);
    bindSlug(basic.slug, $('[data-slug-status]', panel), site.slug);
    basic.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const r = await api(`/sites/${site.id}`, { method: 'PATCH', body: { name: basic.name.value, slug: slugify(basic.slug.value) } });
        site = r.site;
        header();
        toast('Saved.');
        renderSettings();
      } catch (err) {
        fail(err);
      }
    };
    $('[data-offline]', panel)?.addEventListener('click', async () => {
      if (!confirm('Take your site offline? Visitors will see a “back soon” page until you publish again.')) return;
      try {
        site = (await api(`/sites/${site.id}/unpublish`, { method: 'POST' })).site;
        header();
        renderSettings();
        toast('Your site is offline.');
      } catch (err) {
        fail(err);
      }
    });
    $('[data-golive]', panel)?.addEventListener('click', publish);
    const bf = $('[data-brief]', panel);
    bindChips(bf);
    bf.onsubmit = async (e) => {
      e.preventDefault();
      try {
        site = (await api(`/sites/${site.id}`, { method: 'PATCH', body: { brief: readBrief(bf) } })).site;
        toast('Details saved.');
      } catch (err) {
        fail(err);
      }
    };
    $('[data-rebuild]', panel)?.addEventListener('click', async () => {
      if (!confirm('Create a brand-new design? Your current version stays in History.')) return;
      try {
        const { jobId } = await api(`/sites/${site.id}/regenerate`, { method: 'POST', body: { brief: readBrief(bf) } });
        await runJob(jobId, 'Redesigning your site');
        await loadMe();
        await refresh();
        loadPreview();
        setMobileTab('preview');
      } catch (err) {
        if (err.code === 'inactive' || err.code === 'ai_limit') planNeeded(err.message);
        else fail(err);
      }
    });
    $('[data-delete]', panel).onclick = () =>
      modal(`<h2>Delete ${esc(site.name)}?</h2><p class="muted">This removes the website and all its photos for good. Type <b>${esc(site.slug)}</b> to confirm.</p>
        <input class="input" data-confirm autocapitalize="off"><div class="actions"><button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-red" data-yes>Delete forever</button></div>`,
      (m, close) => {
        $('[data-yes]', m).onclick = async () => {
          try {
            await fetch(`/api/sites/${site.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ confirm: $('[data-confirm]', m).value.trim() }),
            }).then(async (r) => {
              if (!r.ok) throw new Error((await r.json()).error);
            });
            close();
            toast('Website deleted.');
            location.hash = '#/';
          } catch (err) {
            fail(err);
          }
        };
      });
  }

  header();
  renderPanel();
  if (site.hasContent) loadPreview();
  else {
    iframe.srcdoc = '<p style="font-family:sans-serif;padding:2rem;color:#666">Your site is still being built. Refresh in a moment.</p>';
  }
}

// ---------------- billing ----------------
function viewBilling() {
  const a = ME.account;
  const cur =
    a.reason === 'admin' ? 'You’re an admin — everything is unlocked.'
    : a.reason === 'trial' ? `You’re on the free trial (${daysLeft(a.until)} days left).`
    : a.reason === 'subscription' ? `You’re on the <b>${esc(ME.plans.find((p) => p.id === a.plan)?.name || a.plan)}</b> plan${a.until ? ` · ${a.status === 'cancelled' ? 'ends' : 'renews'} ${fmtDate(a.until)}` : ''}.`
    : a.reason === 'manual' ? `You’re on the <b>${esc(ME.plans.find((p) => p.id === a.plan)?.name || a.plan)}</b> plan, paid until ${fmtDate(a.until)}.`
    : 'You don’t have an active plan, so your websites are offline.';
  const money = (n) => `$${n}`;
  app.innerHTML = shell('billing', `
    ${accountBanner()}
    <div class="page-head"><div><h1>Plan & billing</h1><p class="muted">${cur}</p></div>
      ${ME.user.portalUrl ? `<a class="btn btn-line" href="${esc(ME.user.portalUrl)}" target="_blank" rel="noopener">Manage subscription / cancel ↗</a>` : ''}</div>
    <div class="plans">
      ${ME.plans.map((p) => {
        const current = (a.reason === 'subscription' || a.reason === 'manual') && a.plan === p.id;
        return `<div class="card plan ${p.id === 'business' ? 'featured' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center"><h2>${esc(p.name)}</h2>${p.id === 'business' ? '<span class="pill changes">Most popular</span>' : ''}</div>
          <div class="price">${money(p.price)}<small> / month</small></div>
          <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          ${current ? '<button class="btn btn-line" disabled>Current plan</button>' : `<button class="btn ${p.id === 'business' ? 'btn-gold' : 'btn-dark'}" data-plan="${p.id}">Choose ${esc(p.name)}</button>`}
        </div>`;
      }).join('')}
    </div>
    ${ME.contact?.whatsapp || ME.contact?.email ? `<p class="muted small" style="margin-top:22px">Prefer to pay by bank transfer or WiPay? ${contactLinks('Hi, I’d like to pay for my website plan. My account email is ' + ME.user.email)}</p>` : ''}
  `);
  bindShell();
  $$('[data-plan]').forEach((b) => (b.onclick = async () => {
    try {
      const r = await api(`/billing/checkout/${b.dataset.plan}`);
      if (r.url) return (location.href = r.url);
      modal(`<h2>Almost there</h2><p class="muted">${esc(r.message)}</p><p>${contactLinks(`Hi, I’d like the ${b.dataset.plan} plan. My account email is ${ME.user.email}`) || ''}</p>
        <div class="actions"><button class="btn btn-dark" data-close>OK</button></div>`);
    } catch (e) {
      fail(e);
    }
  }));
}

function contactLinks(text) {
  const c = ME.contact || {};
  const parts = [];
  if (c.whatsapp) parts.push(`<a href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp us</a>`);
  if (c.email) parts.push(`<a href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Website plan')}&body=${encodeURIComponent(text)}">email us</a>`);
  return parts.join(' or ');
}
