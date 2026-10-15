// Writes favicon.svg, favicon-32.png and apple-touch-icon.png from the app's logo 6c geometry
// (androidApp/.../ic_launcher_foreground.xml, read-only). Run from _tools: `npm run icons`.
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const BG = "#101113", LINES = "#e8a13c", WATER = "#3a3d42";

// Small sizes keep their own measures (like CueMirrorLogoMark): at 32px the 2-unit waterline of the
// launcher drawing would vanish, so bars are 3 units and the waterline 1.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="${BG}"/>
<g fill="${LINES}"><rect x="6" y="5.5" width="20" height="3"/><rect x="9.5" y="10.5" width="13" height="3"/></g>
<rect x="4.5" y="15.5" width="23" height="1" fill="${WATER}"/>
<g fill="${LINES}" opacity=".4"><rect x="9.5" y="18.5" width="13" height="3"/><rect x="6" y="23.5" width="20" height="3"/></g>
</svg>
`;

// Launcher composition, 288-unit canvas, content scaled up a little for the touch icon.
const launcher = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288">
<rect width="288" height="288" fill="${BG}"/>
<g transform="translate(144 144) scale(1.3) translate(-144 -144)">
<g fill="${LINES}"><path d="M102,94H186V107H102Z"/><path d="M116.5,117H171.5V130H116.5Z"/></g>
<path fill="${WATER}" d="M96,143H192V145H96Z"/>
<g fill="${LINES}" opacity=".4"><path d="M116.5,158H171.5V171H116.5Z"/><path d="M102,181H186V194H102Z"/></g>
</g>
</svg>`;

await writeFile(new URL("favicon.svg", ROOT), favicon);
await sharp(Buffer.from(favicon), { density: 384 }).resize(32, 32).png().toFile(new URL("favicon-32.png", ROOT).pathname.slice(1));
await sharp(Buffer.from(launcher), { density: 300 }).resize(180, 180).png().toFile(new URL("apple-touch-icon.png", ROOT).pathname.slice(1));
console.log("icons ok");
