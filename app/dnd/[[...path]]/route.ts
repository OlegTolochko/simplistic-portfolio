// Serves the AI Dungeon Master progress page from a plain folder on the host,
// so updates are a file copy and never need a rebuild.
// Supports HTTP range requests: iOS Safari only plays video when the server answers them with 206.
import { open, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export const dynamic = "force-dynamic";

const ROOT = process.env.DND_STATUS_DIR || path.join(homedir(), "dnd-status");
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

async function readSlice(file: string, start: number, length: number) {
  const fh = await open(file, "r");
  try {
    const buf = Buffer.alloc(length);
    await fh.read(buf, 0, length, start);
    return buf;
  } finally {
    await fh.close();
  }
}

async function serve(req: Request, ctx: { params: Promise<{ path?: string[] }> }, head: boolean) {
  const { path: parts = [] } = await ctx.params;
  const rel = parts.length ? parts.join("/") : "index.html";
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(path.resolve(ROOT) + path.sep)) return new Response("Not found", { status: 404 });
  try {
    let s = await stat(file);
    let target = file;
    if (s.isDirectory()) { target = path.join(file, "index.html"); s = await stat(target); }
    const size = s.size;
    const type = TYPES[path.extname(target).toLowerCase()] || "application/octet-stream";
    const base: Record<string, string> = { "content-type": type, "cache-control": "no-cache", "accept-ranges": "bytes" };
    const range = req.headers.get("range");
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m && (m[1] || m[2])) {
      let start: number, end: number;
      if (m[1]) { start = +m[1]; end = m[2] ? Math.min(+m[2], size - 1) : size - 1; }
      else { const n = +m[2]; start = Math.max(0, size - n); end = size - 1; }
      if (start >= size || start > end) {
        return new Response(null, { status: 416, headers: { ...base, "content-range": `bytes */${size}` } });
      }
      const len = end - start + 1;
      const headers = { ...base, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(len) };
      return new Response(head ? null : await readSlice(target, start, len), { status: 206, headers });
    }
    const headers = { ...base, "content-length": String(size) };
    return new Response(head ? null : await readSlice(target, 0, size), { status: 200, headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) { return serve(req, ctx, false); }
export function HEAD(req: Request, ctx: { params: Promise<{ path?: string[] }> }) { return serve(req, ctx, true); }
