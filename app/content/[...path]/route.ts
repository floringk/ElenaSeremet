import fs from "node:fs";
import path from "node:path";

const baseDir = path.join(process.cwd(), "mockups", "content");

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".json": "application/json",
  ".txt": "text/plain"
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const relativePath = params.path.join("/");
  const fullPath = path.join(baseDir, relativePath);

  if (!fullPath.startsWith(baseDir) || !fs.existsSync(fullPath)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(fullPath);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400"
    }
  });
}
