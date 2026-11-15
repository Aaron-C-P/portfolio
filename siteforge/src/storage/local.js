// Folder-on-disk storage for development. Same interface as the S3 driver.
import fs from 'node:fs/promises';
import path from 'node:path';

export class LocalStorage {
  constructor(dir) {
    this.dir = path.resolve(dir);
  }
  file(key) {
    const p = path.resolve(this.dir, key);
    if (!p.startsWith(this.dir + path.sep)) throw new Error('Bad key');
    return p;
  }
  async put(key, body) {
    const p = this.file(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, body);
  }
  async get(key) {
    try {
      return await fs.readFile(this.file(key));
    } catch (e) {
      if (e.code === 'ENOENT' || e.code === 'EISDIR') return null;
      throw e;
    }
  }
  async delete(key) {
    await fs.rm(this.file(key), { force: true });
  }
  async list(prefix) {
    const base = this.file(prefix.replace(/\/+$/, '') + '/x').replace(/[\\/]x$/, '');
    const out = [];
    async function walk(dir, rel) {
      let entries = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) await walk(path.join(dir, e.name), r);
        else {
          const st = await fs.stat(path.join(dir, e.name));
          out.push({ key: `${prefix.replace(/\/+$/, '')}/${r}`, size: st.size, modified: st.mtimeMs });
        }
      }
    }
    await walk(base, '');
    return out;
  }
  async deletePrefix(prefix) {
    const base = this.file(prefix.replace(/\/+$/, '') + '/x').replace(/[\\/]x$/, '');
    await fs.rm(base, { recursive: true, force: true });
  }
}
