// Content types for files served from the bucket.
import path from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};
export const contentTypeFor = (key) => TYPES[path.extname(key).toLowerCase()] || 'application/octet-stream';

// Only safe image types can be uploaded by clients (SVG can carry scripts, so it's excluded).
export const UPLOAD_TYPES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico']);
