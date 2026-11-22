// AI website generation and editing, streamed.
// Providers: OpenRouter (free models, with automatic fallback between them) or Anthropic Claude.
// With no key at all, new sites are built from the built-in template, so the whole product
// can be demoed for free.
import { config } from './config.js';
import { templateSite } from './templates.js';
import { listModels, resolveModelChain, dailyBudget, recordCall, providerName } from './models.js';

export const aiEnabled = () => providerName() !== 'none';

const SHARED_RULES = `
- Mobile-first and fully responsive: most visitors are on phones.
- All CSS in one <style> tag in <head>. You may load up to two Google Fonts with <link>. No other external CSS, no JS frameworks, no external scripts.
- JavaScript is optional. If used, keep it to one small <script> at the end of <body> (for example a mobile menu toggle). The page must look right and work without JavaScript.
- Use semantic <section> elements with ids (for example #home, #services, #about, #gallery, #reviews, #contact) and a sticky header with anchor links.
- Photos: use <img> tags with src="/_ph/WIDTHxHEIGHT/short-label?c=HEX", for example src="/_ph/1200x800/hero-shop?c=1f6feb", where HEX is the main brand color without the #. These are placeholders the owner replaces with real photos, so always write a descriptive alt. Never use external image URLs and never use CSS background-image for photos.
- Keep every image whose src starts with "assets/" exactly as it is: those are the owner's own uploaded photos.
- Use only the real details provided (name, phone, email, address, hours, prices). Never invent phone numbers, addresses, emails, prices, awards, years in business or customer names. If a detail is missing, write copy that does not need it, or a clearly editable placeholder such as "Add your opening hours".
- Never write fake testimonials attributed to invented people. A reviews section may only contain placeholders like "Add a real customer review here." with "— Customer name".
- If a WhatsApp number is given, add a prominent "Chat on WhatsApp" button linking to https://wa.me/<digits only, with country code>. Phone numbers use tel: links, emails use mailto: links.
- There is no form backend: use WhatsApp, call or email buttons instead of a <form>.
- Include <title>, a meta description and a viewport meta tag. Use good contrast, alt text, visible focus styles and rem sizes.
- Keep the whole document under about 40 KB.`;

const GENERATE_SYSTEM = `You are a senior web designer and front-end developer who builds beautiful, conversion-focused one-page websites for small businesses (barbers, salons, restaurants, cook shops, tradespeople, churches, tutors, shops, tour operators and so on), many of them in Jamaica and the wider Caribbean.

Produce ONE complete, production-ready HTML document for the business described by the user.

Rules:
- Reply with the HTML document only, starting with <!DOCTYPE html> and ending with </html>. No markdown fences, no commentary.
${SHARED_RULES}
- Make it look custom and premium, not like a template: confident typography, generous spacing, a clear visual identity that fits the business type and the requested vibe, and tasteful details (subtle gradients, shapes, dividers, hover states).
- Write warm, specific, persuasive copy in the voice of the business. Lead with what the customer gets, and repeat the main call to action (WhatsApp, call or visit) near the top and at the bottom.`;

const EDIT_SYSTEM = `You edit an existing small-business website (one HTML document) to carry out the owner's request.

Rules:
- Reply with exactly one line "SUMMARY: <one short, plain sentence saying what you changed>", then the complete updated HTML document from <!DOCTYPE html> to </html>. No markdown fences, no other commentary.
- Change only what the request needs. Keep everything else exactly as it is, including the owner's own wording.
${SHARED_RULES}
- If the request can't be done in a static site (online payments, booking systems, logins), make the closest sensible change (for example a WhatsApp booking button) and say so in the SUMMARY.`;

function briefToText(b) {
  const lines = [
    ['Business name', b.name],
    ['Type of business', b.type],
    ['What they do / description', b.description],
    ['Location / address', b.location],
    ['Phone', b.phone],
    ['WhatsApp', b.whatsapp],
    ['Email', b.email],
    ['Instagram', b.instagram],
    ['Opening hours', b.hours],
    ['Style / vibe', b.vibe],
    ['Brand color', b.color],
    ['Anything else', b.extra],
  ];
  return lines
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join('\n');
}

// ---------------------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------------------

const RETRYABLE = new Set([402, 404, 408, 409, 425, 429, 500, 502, 503, 504, 520, 524, 529]);

export class AiError extends Error {
  constructor(message, { retryable = false, status } = {}) {
    super(message);
    this.retryable = retryable;
    this.status = status;
  }
}

// Reads a server-sent-events body and calls onData(json) for every "data:" event.
async function readSse(res, onData) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const data = chunk
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .join('');
      if (!data || data === '[DONE]') continue;
      let ev;
      try {
        ev = JSON.parse(data);
      } catch {
        continue;
      }
      onData(ev);
    }
  }
}

async function httpError(res, who) {
  const body = await res.text().catch(() => '');
  let detail = body.slice(0, 200);
  try {
    const j = JSON.parse(body);
    detail = j.error?.message || j.message || detail;
  } catch {}
  const msg =
    res.status === 429
      ? `${who} is busy right now (rate limited).`
      : res.status === 402
        ? `${who} needs credits or has hit its free limit.`
        : `${who} returned an error (${res.status}). ${detail}`;
  return new AiError(msg, { retryable: RETRYABLE.has(res.status), status: res.status });
}

async function streamClaude({ system, user, onChars }) {
  const res = await fetch(`${config.ai.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.ai.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.ai.model,
      max_tokens: config.ai.maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
      stream: true,
    }),
  });
  if (!res.ok) throw await httpError(res, 'The AI service');
  let text = '';
  let stopReason = null;
  const usage = { input_tokens: 0, output_tokens: 0 };
  await readSse(res, (ev) => {
    if (ev.type === 'message_start') usage.input_tokens = ev.message?.usage?.input_tokens || 0;
    else if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
      text += ev.delta.text;
      onChars?.(text.length);
    } else if (ev.type === 'message_delta') {
      if (ev.usage?.output_tokens != null) usage.output_tokens = ev.usage.output_tokens;
      stopReason = ev.delta?.stop_reason || stopReason;
    } else if (ev.type === 'error') {
      throw new AiError(`AI error: ${ev.error?.message || 'unknown'}`, { retryable: true });
    }
  });
  if (stopReason === 'max_tokens') throw new AiError('The AI ran out of room before finishing. Try a shorter request.');
  return { text, usage, model: config.ai.model };
}

// One streamed request to one OpenRouter model (OpenAI-compatible chat completions).
async function streamOpenRouter({ model, system, user, onChars, signal }) {
  const or = config.ai.openrouter;
  const res = await fetch(`${or.baseUrl}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${or.apiKey}`,
      'http-referer': or.referer || config.appUrl,
      'x-title': or.title || config.brand,
    },
    body: JSON.stringify({
      model,
      max_tokens: or.maxTokens,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: true,
      usage: { include: true },
    }),
  });
  if (!res.ok) throw await httpError(res, 'OpenRouter');
  let text = '';
  let finish = null;
  const usage = { input_tokens: 0, output_tokens: 0 };
  await readSse(res, (ev) => {
    if (ev.error) throw new AiError(`${model}: ${ev.error.message || 'stream error'}`, { retryable: true });
    const choice = ev.choices?.[0];
    const piece = choice?.delta?.content;
    if (piece) {
      text += piece;
      onChars?.(text.length);
    }
    if (choice?.finish_reason) finish = choice.finish_reason;
    if (ev.usage) {
      usage.input_tokens = ev.usage.prompt_tokens || 0;
      usage.output_tokens = ev.usage.completion_tokens || 0;
    }
  });
  if (!text.trim()) throw new AiError(`${model} returned nothing.`, { retryable: true });
  if (finish === 'length') throw new AiError(`${model} ran out of room before finishing.`, { retryable: true });
  return { text, usage, model };
}

// Runs the request on the chosen free model, falling through to the next free models when one
// is busy, rate limited, returns junk, or cuts off. `parse` validates the reply, so a model that
// answers without a real web page also counts as a failure and the next one is tried.
async function runOpenRouter({ system, user, onChars, onProgress, model, parse }) {
  const budget = dailyBudget();
  if (budget.left <= 0)
    throw new AiError(
      `The daily free AI limit (${budget.limit} requests) has been reached. It resets at 00:00 UTC. You can still edit text and photos yourself.`,
    );
  const chain = await resolveModelChain(model);
  let lastErr;
  let tried = 0;
  for (const m of chain) {
    if (dailyBudget().left <= 0 || tried >= config.ai.openrouter.maxAttempts) break;
    tried++;
    if (tried > 1) onProgress?.(null, 'That model is busy, trying another…');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), config.ai.openrouter.timeoutMs);
    try {
      const r = await streamOpenRouter({ model: m, system, user, onChars, signal: ctrl.signal });
      const parsed = parse(r.text);
      recordCall(m, true);
      return { ...r, parsed };
    } catch (e) {
      recordCall(m, false);
      lastErr = e;
      const timedOut = e?.name === 'AbortError';
      const retry = timedOut || e.retryable || /did not contain a full web page/.test(e.message);
      console.warn(`[ai] ${m} failed: ${timedOut ? 'timed out' : e.message}`);
      if (!retry) throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new AiError(`The free AI models are busy right now. Please try again in a minute. (${lastErr?.message || 'no reply'})`);
}

// Provider dispatch. Returns { text, usage, model, parsed }.
async function complete({ system, user, onChars, onProgress, model, parse }) {
  if (providerName() === 'openrouter') return runOpenRouter({ system, user, onChars, onProgress, model, parse });
  const r = await streamClaude({ system, user, onChars });
  return { ...r, parsed: parse(r.text) };
}

// ---------------------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------------------

export function extractHtml(text) {
  const start = text.search(/<!doctype html|<html[\s>]/i);
  const end = text.toLowerCase().lastIndexOf('</html>');
  if (start < 0 || end < 0 || end < start) throw new AiError('The AI reply did not contain a full web page. Please try again.', { retryable: true });
  return text.slice(start, end + 7);
}

export function cleanHtml(html) {
  let out = html.replace(/<base\b[^>]*>/gi, '');
  if (!/^<!doctype html>/i.test(out.trim())) out = '<!DOCTYPE html>\n' + out.replace(/^\s*<!doctype[^>]*>/i, '');
  if (!/<meta[^>]+name=["']viewport["']/i.test(out))
    out = out.replace(/<head([^>]*)>/i, '<head$1>\n<meta name="viewport" content="width=device-width, initial-scale=1">');
  return out;
}

const progressFrom = (chars, expected) => Math.min(95, 8 + Math.round((chars / expected) * 87));

export async function generateSite(brief, onProgress = () => {}, { model, copy } = {}) {
  if (!aiEnabled()) {
    onProgress(60, 'Designing your site…');
    await new Promise((r) => setTimeout(r, 600));
    return { html: templateSite(brief), usage: null, model: null };
  }
  onProgress(5, 'Planning the layout…');
  const r = await complete({
    system: GENERATE_SYSTEM,
    user: `Build the website for this business:\n\n${briefToText(brief)}${copy ? `\n\nThe content writer has already written this copy. Use it exactly and do not add more blocks of text:\n${JSON.stringify(copy)}` : ''}`,
    model,
    onProgress,
    onChars: (n) =>
      onProgress(progressFrom(n, 28000), n < 3000 ? 'Choosing fonts and colours…' : n < 14000 ? 'Writing your pages…' : 'Adding the finishing touches…'),
    parse: (text) => cleanHtml(extractHtml(text)),
  });
  return { html: r.parsed, usage: r.usage, model: r.model };
}

export async function editSite(html, instruction, brief, onProgress = () => {}, { model } = {}) {
  if (!aiEnabled())
    throw new Error('AI editing is not switched on yet. You can still change text and photos with "Edit text & photos".');
  onProgress(5, 'Reading your site…');
  const r = await complete({
    system: EDIT_SYSTEM,
    user: `Business details:\n${briefToText(brief || {})}\n\nCurrent website:\n${html}\n\nOwner's request: ${instruction}`,
    model,
    onProgress,
    onChars: (n) => onProgress(progressFrom(n, html.length + 500), 'Making your changes…'),
    parse: (text) => {
      const prefix = text.slice(0, Math.max(0, text.search(/<!doctype html|<html[\s>]/i)));
      const m = prefix.match(/SUMMARY:\s*(.+)/i);
      return { html: cleanHtml(extractHtml(text)), summary: m ? m[1].trim().slice(0, 300) : 'Updated your site.' };
    },
  });
  return { html: r.parsed.html, summary: r.parsed.summary, usage: r.usage, model: r.model };
}

const COPY_SYSTEM = `You are the content writer on a small web team. Write short website copy for a small business, in a warm, specific voice.
Reply with ONE JSON object only, no markdown, using exactly the section ids you are asked for:
- "hero": one sentence.
- "services": an array of exactly 3 [title, one short sentence] pairs.
- "about": 2 short sentences.
Hard rules: stay inside each word budget. Never invent phone numbers, addresses, prices, awards, years in business or customer names. Use only facts from the brief.`;

/** The content writer agent: copy for a few sections at a time, inside a word budget. */
export async function writeCopy({ brief, units, scale = 1, model }) {
  const ask = units.map((u) => `- ${u.id} (${u.title}): max ${Math.round(u.budget * scale)} words`).join('\n');
  const r = await complete({
    system: COPY_SYSTEM,
    user: `Business:\n${briefToText(brief)}\n\nWrite these sections only:\n${ask}`,
    model,
    parse: (text) => {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new AiError('The writer did not return JSON.', { retryable: true });
      try {
        return JSON.parse(m[0]);
      } catch {
        throw new AiError('The writer returned broken JSON.', { retryable: true });
      }
    },
  });
  return r.parsed;
}

export { listModels };
