// How much room each website (tenant) takes up. Three places hold a tenant's data:
//   bucket    sites/<id>/...        the published page and uploaded photos (S3/R2 or a folder)
//   database  draft + saved versions (SQLite)
//   cache     pages kept in this server's memory so busy sites are fast (cleared after 60 s)
import { q } from './db.js';
import { storage, cacheStats } from './storage/index.js';

const mb = (n) => Math.round((n / 1048576) * 100) / 100;

export async function siteUsage(siteId) {
  const items = await storage.list(`sites/${siteId}/`).catch(() => []);
  const bucketBytes = items.reduce((a, o) => a + (o.size || 0), 0);
  const draft = q.get('SELECT COALESCE(LENGTH(draft_html), 0) AS n FROM sites WHERE id = ?', siteId)?.n || 0;
  const v = q.get('SELECT COUNT(*) AS c, COALESCE(SUM(LENGTH(html)), 0) AS n FROM site_versions WHERE site_id = ?', siteId);
  const cacheBytes = cacheStats(`sites/${siteId}/`).bytes;
  const dbBytes = draft + v.n;
  return {
    bucketBytes,
    bucketFiles: items.length,
    databaseBytes: dbBytes,
    versions: v.c,
    memoryBytes: cacheBytes,
    totalBytes: bucketBytes + dbBytes,
    totalMb: mb(bucketBytes + dbBytes),
  };
}

/** Whole-server view: process memory plus every tenant, biggest first. */
export async function fleetUsage() {
  const sites = q.all('SELECT s.id, s.slug, s.name, s.status, u.email FROM sites s JOIN users u ON u.id = s.user_id');
  const rows = [];
  for (const s of sites) rows.push({ ...s, ...(await siteUsage(s.id)) });
  rows.sort((a, b) => b.totalBytes - a.totalBytes);
  const m = process.memoryUsage();
  return {
    server: { rssMb: mb(m.rss), heapMb: mb(m.heapUsed), cacheMb: mb(cacheStats('').bytes), cacheEntries: cacheStats('').entries },
    totals: { sites: rows.length, bucketMb: mb(rows.reduce((a, r) => a + r.bucketBytes, 0)), databaseMb: mb(rows.reduce((a, r) => a + r.databaseBytes, 0)) },
    sites: rows,
  };
}
