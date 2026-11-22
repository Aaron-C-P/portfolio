import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DB_MEMORY = '1';
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'asb-test-'));
const { extractHtml, cleanHtml } = await import('../src/ai.js');
const { templateSite, waDigits, pickColor } = await import('../src/templates.js');

test('extracts the HTML document from an AI reply', async () => {
  const html = extractHtml('SUMMARY: did a thing\n```html\n<!DOCTYPE html><html><head></head><body>hi</body></html>\n```');
  assert.equal(html, '<!DOCTYPE html><html><head></head><body>hi</body></html>');
  assert.throws(() => extractHtml('no page here'));
});

test('cleanHtml removes <base> and adds a viewport tag', async () => {
  const out = cleanHtml('<html><head><base href="http://x/"></head><body></body></html>');
  assert.match(out, /^<!DOCTYPE html>/);
  assert.doesNotMatch(out, /<base/);
  assert.match(out, /name="viewport"/);
});

test('template escapes client input and builds WhatsApp links', async () => {
  const html = templateSite({ name: '<script>x</script> Cutz', whatsapp: '555-1234', type: 'Barber' });
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.match(html, /https:\/\/wa\.me\/18765551234/);
  assert.equal(waDigits('(876) 555-1234'), '18765551234');
  assert.equal(pickColor('dark green please', '#000'), '#15803d');
});
