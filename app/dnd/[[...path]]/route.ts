// Serves the AI Dungeon Master progress page from a plain folder on the host,
// so updates are a file copy and never need a rebuild.
import { readFile, stat } from "node:fs/promises";
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
};

export async function GET(_req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path: parts = [] } = await ctx.params;
  const rel = parts.length ? parts.join("/") : "index.html";
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(path.resolve(ROOT) + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const s = await stat(file);
    const target = s.isDirectory() ? path.join(file, "index.html") : file;
    const body = await readFile(target);
    const type = TYPES[path.extname(target).toLowerCase()] || "application/octet-stream";
    return new Response(body, { headers: { "content-type": type, "cache-control": "no-cache" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
