// Renders assets/og/og-{en,pt,es}.png (1200×630) with headless Chrome and the local fonts.
// Run from _tools: `node build-og.mjs` (needs Chrome; set CHROME_PATH if it is elsewhere).
import puppeteer from "puppeteer-core";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const fonts = pathToFileURL(join(ROOT, "assets/fonts")).href;
await mkdir(join(ROOT, "assets/og"), { recursive: true });

const html = t => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:400;src:url(${fonts}/ibm-plex-sans-latin-400-normal.woff2)}
@font-face{font-family:P;font-weight:600;src:url(${fonts}/ibm-plex-sans-latin-600-normal.woff2)}
@font-face{font-family:M;font-weight:500;src:url(${fonts}/ibm-plex-mono-latin-500-normal.woff2)}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#101113;color:#f2f1ee;font-family:P;display:flex;align-items:center;gap:72px;padding:0 96px}
svg{width:200px;flex:none}
.l{fill:#e8a13c}.w{fill:#3a3d42}
.name{font-weight:600;font-size:40px;letter-spacing:-.02em;display:flex;align-items:center;gap:14px}
h1{font-weight:600;font-size:88px;line-height:1.02;letter-spacing:-.035em;margin-top:28px}
p{font-family:M;font-weight:500;font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:#e8a13c;margin-top:36px}
</style></head><body>
<svg viewBox="96 94 96 100"><path class="l" d="M102 94h84v13h-84zM116.5 117h55v13h-55z"/><path class="w" d="M96 143h96v2H96z"/><path class="l" opacity=".4" d="M116.5 158h55v13h-55zM102 181h84v13h-84z"/></svg>
<div><div class="name">CueMirror</div><h1>${t.h1}</h1><p>${t.badge}</p></div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--allow-file-access-from-files"] });
for (const lang of ["en", "pt", "es"]) {
  const t = JSON.parse(await readFile(join(ROOT, `_src/i18n/${lang}.json`), "utf8"));
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  const tmp = join(ROOT, "_tools", `.og-${lang}.html`);
  await (await import("node:fs/promises")).writeFile(tmp, html(t));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ROOT, `assets/og/og-${lang}.png`) });
  await (await import("node:fs/promises")).unlink(tmp);
  await page.close();
}
await browser.close();
console.log("og ok");
