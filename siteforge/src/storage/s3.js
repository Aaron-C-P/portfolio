// S3-compatible bucket storage: AWS S3, Cloudflare R2, Backblaze B2, DigitalOcean Spaces...
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { contentTypeFor } from './mime.js';

export class S3Storage {
  constructor({ bucket, region, endpoint, accessKeyId, secretAccessKey }) {
    if (!bucket) throw new Error('S3_BUCKET is required when STORAGE_DRIVER=s3');
    this.bucket = bucket;
    this.client = new S3Client({
      region: region || 'auto',
      endpoint: endpoint || undefined,
      forcePathStyle: !!endpoint,
      credentials: accessKeyId ? { accessKeyId, secretAccessKey } : undefined,
    });
  }
  async put(key, body) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentTypeFor(key),
        CacheControl: key.endsWith('.html') ? 'no-cache' : 'public, max-age=86400',
      }),
    );
  }
  async get(key) {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return Buffer.from(await res.Body.transformToByteArray());
    } catch (e) {
      if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) return null;
      throw e;
    }
  }
  async delete(key) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
  async list(prefix) {
    const out = [];
    let token;
    do {
      const res = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token }),
      );
      for (const o of res.Contents || [])
        out.push({ key: o.Key, size: o.Size, modified: o.LastModified?.getTime() });
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    return out;
  }
  async deletePrefix(prefix) {
    const items = await this.list(prefix.replace(/\/*$/, '/'));
    for (let i = 0; i < items.length; i += 1000) {
      const chunk = items.slice(i, i + 1000);
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: chunk.map((o) => ({ Key: o.key })) },
        }),
      );
    }
  }
}
