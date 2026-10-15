// Local QA: horizontal overflow at several widths, 200% text, both colour schemes, and any request
// that leaves the local server. Needs the site served at BASE (python -m http.server 8765).
// Usage from _tools: `node qa.mjs [screenshotDir]`.
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.BASE || "http://127.0.0.1:8765";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.argv[2];
const PAGES = ["/", "/pt/", "/es/", "/404.html"];
const WIDTHS = [360, 768, 1024, 1440];

if (OUT) await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const external = new Set();
let problems = 0;

for (const scheme of ["dark", "light"]) {
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      for (const zoom of [1, 2]) {
        const page = await browser.newPage();
        page.on("request", r => { if (!r.url().startsWith(BASE) && !r.url().startsWith("data:")) external.add(r.url()); });
        await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
        await page.setViewport({ width, height: 900 });
        await page.goto(BASE + path, { waitUntil: "networkidle0" });
        if (zoom === 2) await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
        const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
        if (r.sw > r.iw) { problems++; console.log(`OVERFLOW ${scheme} ${path} ${width}px text ${zoom * 100}%: ${r.sw} > ${r.iw}`); }
        if (OUT && (zoom === 1 || width === 360) && path !== "/es/") {
          const name = `${scheme}-${path.replace(/\W+/g, "_") || "root"}-${width}-${zoom * 100}.png`;
          await page.screenshot({ path: join(OUT, name), fullPage: true });
        }
        await page.close();
      }
    }
  }
}
await browser.close();
console.log(external.size ? `EXTERNAL REQUESTS:\n${[...external].join("\n")}` : "No external requests.");
console.log(problems ? `${problems} overflow problem(s).` : "No horizontal overflow.");
