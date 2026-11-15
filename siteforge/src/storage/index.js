// Storage = "the bucket". Locally it's a folder (data/bucket); in production it's any
// S3-compatible bucket (Cloudflare R2 recommended: free egress, 10 GB free).
//
// Layout:  sites/<siteId>/index.html        <- the published website
//          sites/<siteId>/assets/<file>     <- images the client uploaded
import path from 'node:path';
import { config } from '../config.js';
import { LocalStorage } from './local.js';

let driver;
if (config.storage.driver === 's3') {
  const { S3Storage } = await import('./s3.js');
  driver = new S3Storage(config.storage);
} else {
  driver = new LocalStorage(path.join(config.dataDir, 'bucket'));
}
export const storage = driver;

export { contentTypeFor, UPLOAD_TYPES } from './mime.js';

export function safeKey(key) {
  const norm = path.posix.normalize(String(key).replace(/\\/g, '/')).replace(/^\/+/, '');
  if (norm.startsWith('..') || norm.includes('/../') || norm.includes('\0')) throw new Error('Bad key');
  return norm;
}

// Small read cache so busy client sites don't hit the bucket on every request.
const cache = new Map();
const CACHE_MS = 60_000;
export async function cachedGet(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await storage.get(key);
  if (cache.size > 500) cache.clear();
  cache.set(key, { value, at: Date.now() });
  return value;
}
export function invalidate(prefix) {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}
