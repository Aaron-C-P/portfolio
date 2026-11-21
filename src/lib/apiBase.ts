/** Where the AI endpoints live. Empty = same site (Vercel /api). Set VITE_API_BASE to the Cloudflare Worker URL to host them elsewhere. */
export const apiUrl = (path: string): string => `${(import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ?? ""}${path}`;
