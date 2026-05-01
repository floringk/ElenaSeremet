/**
 * Generates site-chrome assets in `public/` from the hero source image.
 * Run from repo root: node scripts/bootstrap-public-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "mockups/content/images/Elena-scaled.jpg");
const publicDir = path.join(root, "public");

async function main() {
  await fs.mkdir(publicDir, { recursive: true });

  await sharp(src)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(publicDir, "og-default.jpg"));

  await sharp(src)
    .resize(180, 180, { fit: "cover", position: "center" })
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  const buf32 = await sharp(src)
    .resize(32, 32, { fit: "cover", position: "center" })
    .png()
    .toBuffer();
  const buf16 = await sharp(src)
    .resize(16, 16, { fit: "cover", position: "center" })
    .png()
    .toBuffer();

  const ico = await pngToIco([buf32, buf16]);
  await fs.writeFile(path.join(publicDir, "favicon.ico"), ico);

  console.log("Wrote public/og-default.jpg, apple-touch-icon.png, favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
