// Owner admin panel.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const day = (t) => (t ? new Date(t).toISOString().slice(0, 10) : '');
const nice = (t) => (t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

function toast(msg, bad = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.innerHTML = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 5000);
}

async function api(path, body) {
  const res = await fetch('/api/admin' + path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {});
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function stateLabel(c) {
  const s = c.state;
  if (c.isAdmin) return '<span class="pill draft">Admin</span>';
  if (s.reason === 'subscription') return `<span class="pill live">Paying · card${s.status === 'past_due' ? ' (past due)' : ''}</span>`;
  if (s.reason === 'manual') return `<span class="pill live">Paying · manual</span>`;
  if (s.reason === 'trial') return `<span class="pill changes">Trial · ends ${nice(s.until)}</span>`;
  return '<span class="pill offline">Inactive</span>';
}

async function load() {
  const { totals, clients, sites, plans } = await api('/overview');
  $('#stats').innerHTML = [
    [`$${totals.mrr}`, 'Monthly revenue'],
    [totals.paying, 'Paying clients'],
    [totals.trials, 'On free trial'],
    [totals.inactive, 'Inactive'],
    [totals.liveSites, 'Live websites'],
    [totals.aiCalls, 'AI runs this month'],
  ].map(([v, l]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join('');

  $('#clients').innerHTML = `<thead><tr><th>Client</th><th>Status</th><th>Plan</th><th>Paid until</th><th>Sites</th><th>Joined</th><th></th></tr></thead><tbody>
    ${clients.map((c) => `<tr data-id="${c.id}">
      <td><b>${esc(c.name || '—')}</b><br><span class="muted small">${esc(c.email)}</span></td>
      <td>${stateLabel(c)}</td>
      <td><select class="input" data-plan>${['trial', 'starter'].map((p) => `<option value="${p}" ${c.plan === p ? 'selected' : ''}>${esc(plans[p].name)}</option>`).join('')}</select></td>
      <td><input class="input" type="date" data-paid value="${day(c.paidUntil)}"></td>
      <td>${c.live} live / ${c.sites}</td>
      <td class="muted">${nice(c.createdAt)}</td>
      <td><button class="btn btn-dark btn-sm" data-save>Save</button>
          <button class="btn btn-line btn-sm" data-trial>+7 trial days</button>
          <button class="btn btn-ghost btn-sm" data-reset>Reset password</button></td>
    </tr>`).join('') || '<tr><td colspan="7" class="muted">No clients yet.</td></tr>'}</tbody>`;

  $('#sites').innerHTML = `<thead><tr><th>Website</th><th>Owner</th><th>Status</th><th>Custom domain</th><th>Updated</th><th></th></tr></thead><tbody>
    ${sites.map((s) => `<tr data-site="${s.id}">
      <td><b>${esc(s.name)}</b><br><a class="small" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\//, ''))}</a></td>
      <td class="muted">${esc(s.email)}</td>
      <td>${s.admin_locked ? '<span class="pill offline">Paused by you</span>' : `<span class="pill ${s.status === 'published' ? 'live' : s.status === 'offline' ? 'offline' : 'draft'}">${esc(s.status)}</span>`}</td>
      <td><input class="input" data-domain placeholder="theirbusiness.com" value="${esc(s.custom_domain || '')}"></td>
      <td class="muted">${nice(s.updated_at)}</td>
      <td><button class="btn btn-dark btn-sm" data-sitesave>Save</button>
          <button class="btn btn-line btn-sm" data-lock="${s.admin_locked ? 0 : 1}">${s.admin_locked ? 'Un-pause' : 'Pause site'}</button></td>
    </tr>`).join('') || '<tr><td colspan="6" class="muted">No websites yet.</td></tr>'}</tbody>`;

  $$('#clients tr[data-id]').forEach((tr) => {
    const id = tr.dataset.id;
    $('[data-save]', tr).onclick = () => act(() => api(`/users/${id}`, { plan: $('[data-plan]', tr).value, paidUntil: $('[data-paid]', tr).value || null }), 'Client updated.');
    $('[data-trial]', tr).onclick = () => act(() => api(`/users/${id}`, { extendTrialDays: 7 }), 'Trial extended by 7 days.');
    $('[data-reset]', tr).onclick = async () => {
      if (!confirm('Reset this client’s password? They will be logged out.')) return;
      try {
        const { tempPassword } = await api(`/users/${id}/reset-password`, {});
        prompt('Send the client this temporary password:', tempPassword);
      } catch (e) {
        toast(esc(e.message), true);
      }
    };
  });
  $$('#sites tr[data-site]').forEach((tr) => {
    const id = tr.dataset.site;
    $('[data-sitesave]', tr).onclick = () => act(() => api(`/sites/${id}`, { customDomain: $('[data-domain]', tr).value }), 'Website updated.');
    const lock = $('[data-lock]', tr);
    lock.onclick = () => act(() => api(`/sites/${id}`, { locked: lock.dataset.lock === '1' }), lock.dataset.lock === '1' ? 'Site paused.' : 'Site un-paused.');
  });
}

async function act(fn, msg) {
  try {
    await fn();
    toast(msg);
    await load();
  } catch (e) {
    toast(esc(e.message), true);
  }
}

$('#reload').onclick = () => load().catch((e) => toast(esc(e.message), true));
load().catch((e) => toast(esc(e.message), true));
