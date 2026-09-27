/**
 * Generates simple teal placeholder PNGs for PWA manifest (requires `sharp`).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

async function main() {
  const sharp = (await import("sharp")).default;
  const teal = { r: 26, g: 140, b: 140 };
  for (const size of [192, 512]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="rgb(${teal.r},${teal.g},${teal.b})"/>
      <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.22}" fill="none" stroke="white" stroke-width="${Math.max(2, size / 64)}"/>
    </svg>`;
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    const out = path.join(publicDir, `icon-${size}.png`);
    fs.writeFileSync(out, buf);
    console.log("Wrote", out);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
