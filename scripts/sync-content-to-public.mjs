/**
 * Copies mockups/content/images → public/content/images for static serving on Vercel.
 * Keeps mockups/ for build-time SSG; avoids bundling hundreds of MB into serverless functions.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "mockups", "content", "images");
const dest = path.join(root, "public", "content", "images");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, ent.name);
    const destPath = path.join(to, ent.name);
    if (ent.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (ent.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(src)) {
  console.warn("sync-content-to-public: no source at", src);
  process.exit(0);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

copyDir(src, dest);
console.log("sync-content-to-public: copied mockups/content/images → public/content/images");
