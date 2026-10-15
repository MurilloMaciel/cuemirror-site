// Copies the real app screenshots (no frame, no promo text) into assets/img/{lang}/{theme}/
// as WebP and AVIF at 480 and 720px wide. Run from _tools: `npm run images`.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const SOURCE = process.env.CM_ASSETS ||
  join(homedir(), "OneDrive", "Área de Trabalho", "app-store-assets");
const OUT = new URL("../assets/img/", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const NAMES = ["01-reader", "02-editor", "03-library", "04-settings", "05-quick"];
const WIDTHS = [480, 720];

for (const lang of ["en", "pt", "es"]) {
  for (const theme of ["dark", "light"]) {
    const dir = join(OUT, lang, theme);
    await mkdir(dir, { recursive: true });
    for (const name of NAMES) {
      const src = join(SOURCE, lang, theme, "iphone", "originals", `${name}.png`);
      for (const width of WIDTHS) {
        const img = sharp(src).resize({ width });
        await img.clone().webp({ quality: 74, effort: 6 }).toFile(join(dir, `${name}-${width}.webp`));
        await img.clone().avif({ quality: 52, effort: 6 }).toFile(join(dir, `${name}-${width}.avif`));
      }
    }
    console.log(lang, theme, "ok");
  }
}
const meta = await sharp(join(OUT, "en", "dark", "01-reader-720.webp")).metadata();
console.log("output size", meta.width, "x", meta.height);
