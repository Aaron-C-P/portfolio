import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

// A fake OpenRouter: /models lists free models, /chat/completions behaves per model name.
const hits = [];
const PAGE = '<!DOCTYPE html><html><head><title>t</title></head><body><h1>Hamster Haven</h1></body></html>';
const sse = (res, text) => {
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  res.write(': OPENROUTER PROCESSING\n\n');
  for (const part of text.match(/[\s\S]{1,20}/g)) res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`);
  res.write(`data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 11, completion_tokens: 22 } })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
};
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    if (req.url === '/models') {
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify({ data: [
        { id: 'a/busy:free', name: 'Busy', context_length: 64000, pricing: { prompt: '0', completion: '0' } },
        { id: 'b/junk:free', name: 'Junk', context_length: 64000, pricing: { prompt: '0', completion: '0' } },
        { id: 'c/good:free', name: 'Good', context_length: 64000, pricing: { prompt: '0', completion: '0' } },
        { id: 'd/small:free', name: 'Too small', context_length: 4000, pricing: { prompt: '0', completion: '0' } },
        { id: 'e/paid', name: 'Paid', context_length: 64000, pricing: { prompt: '0.01', completion: '0.01' } },
      ] }));
    }
    const { model } = JSON.parse(body || '{}');
    hits.push(model);
    if (model === 'a/busy:free') {
      res.writeHead(429, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: { message: 'rate limited' } }));
    }
    if (model === 'b/junk:free') return sse(res, 'Sorry, I cannot build that.');
    sse(res, `SUMMARY: made a change\n${PAGE}`);
  });
});

let ai;
let models;
before(async () => {
  await new Promise((r) => server.listen(0, r));
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'asb-or-'));
  process.env.OPENROUTER_API_KEY = 'test-key';
  process.env.OPENROUTER_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.OPENROUTER_MODELS = 'a/busy:free,b/junk:free,c/good:free';
  process.env.OPENROUTER_DAILY_LIMIT = '6';
  ai = await import('../src/ai.js');
  models = await import('../src/models.js');
});
after(() => server.close());

test('only free text models with enough context are listed, in the configured order', async () => {
  const list = await models.listModels();
  assert.deepEqual(list.map((m) => m.id), ['a/busy:free', 'b/junk:free', 'c/good:free', 'd/small:free'].filter((id) => id !== 'd/small:free'));
});

test('falls through busy and junk models to one that works, and reports usage', async () => {
  hits.length = 0;
  const r = await ai.generateSite({ name: 'Hamster Haven' }, () => {}, { model: 'a/busy:free' });
  assert.deepEqual(hits, ['a/busy:free', 'b/junk:free', 'c/good:free']);
  assert.match(r.html, /Hamster Haven/);
  assert.equal(r.model, 'c/good:free');
  assert.deepEqual(r.usage, { input_tokens: 11, output_tokens: 22 });
});

test('edit returns the summary line and the page', async () => {
  const r = await ai.editSite(PAGE, 'add a price list', {}, () => {}, { model: 'c/good:free' });
  assert.equal(r.summary, 'made a change');
  assert.match(r.html, /<\/html>$/);
});

test('every attempt counts against the daily budget and the app stops cleanly at the limit', async () => {
  const before = models.dailyBudget();
  assert.equal(before.limit, 6);
  assert.ok(before.used >= 4);
  // use up whatever is left, then the next request is refused without calling the API
  while (models.dailyBudget().left > 0) models.recordCall('x', true);
  hits.length = 0;
  await assert.rejects(() => ai.generateSite({ name: 'x' }), /daily free AI limit/);
  assert.equal(hits.length, 0);
});

test('model ids from users must be free models', () => {
  assert.equal(models.isAllowedModel('qwen/qwen3-coder:free'), true);
  assert.equal(models.isAllowedModel('anthropic/claude-opus-4'), false);
  assert.equal(models.isAllowedModel(''), true);
});
