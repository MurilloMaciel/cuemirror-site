// Generates index.html, pt/index.html, es/index.html, 404.html, sitemap.xml and robots.txt from
// _src/config.json and _src/i18n/*.json. Node built-ins only, no npm install needed.
// Run from the repo root: `node _tools/build-pages.mjs`. The generated files are committed, so the
// site itself needs no build step.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = async p => JSON.parse(await readFile(join(ROOT, p), "utf8"));
const config = await read("_src/config.json");
const LANGS = ["en", "pt", "es"];
const T = Object.fromEntries(await Promise.all(LANGS.map(async l => [l, await read(`_src/i18n/${l}.json`)])));
const SITE = config.siteUrl.replace(/\/$/, "");
const YEAR = 2026;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const logo = (cls = "logo") => `<svg class="${cls}" viewBox="96 94 96 100" width="29" height="30" aria-hidden="true" focusable="false"><path class="logo__line" d="M102 94h84v13h-84zM116.5 117h55v13h-55z"/><path class="logo__water" d="M96 143h96v2H96z"/><path class="logo__line" opacity=".4" d="M116.5 158h55v13h-55zM102 181h84v13h-84z"/></svg>`;

const icon = {
  check: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z"/></svg>`,
  lock: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 22q-.8 0-1.4-.6Q4 20.8 4 20V10q0-.8.6-1.4Q5.2 8 6 8h1V6q0-2.1 1.5-3.5Q9.9 1 12 1t3.5 1.5Q17 3.9 17 6v2h1q.8 0 1.4.6.6.6.6 1.4v10q0 .8-.6 1.4-.6.6-1.4.6Zm0-2h12V10H6Zm6-3q.8 0 1.4-.6.6-.6.6-1.4t-.6-1.4Q12.8 13 12 13t-1.4.6Q10 14.2 10 15t.6 1.4q.6.6 1.4.6ZM9 8h6V6q0-1.3-.9-2.1Q13.3 3 12 3t-2.1.9Q9 4.7 9 6Z"/></svg>`,
  mail: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20q-.8 0-1.4-.6Q2 18.8 2 18V6q0-.8.6-1.4Q3.2 4 4 4h16q.8 0 1.4.6.6.6.6 1.4v12q0 .8-.6 1.4-.6.6-1.4.6Zm8-7L4 8v10h16V8Zm0-2 8-5H4ZM4 8V6v12Z"/></svg>`,
  arrow: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.2 13H4v-2h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4z"/></svg>`,
};

const alternates = () => [
  ...LANGS.map(l => `<link rel="alternate" hreflang="${T[l].htmlLang}" href="${SITE}${T[l].path}">`),
  `<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
].join("\n");

const langNav = (t, cls, full) => `<${full ? 'div role="group"' : "nav"} class="${cls}" aria-label="${esc(t.languageLabel)}"><ul>${LANGS.map(l => {
  const o = T[l], cur = l === t.lang;
  const label = full ? esc(o.languageName) : `<span aria-hidden="true">${l.toUpperCase()}</span><span class="vh">${esc(o.languageName)}</span>`;
  return `<li><a href="${o.path}" hreflang="${o.htmlLang}" lang="${o.htmlLang}" data-lang-switch${cur ? ' aria-current="page"' : ""}>${label}</a></li>`;
}).join("")}</ul></${full ? "div" : "nav"}>`;

const store = (name, url, t) => url
  ? `<a class="store" href="${esc(url)}" rel="noopener">${name}</a>`
  : `<span class="store store--soon" aria-disabled="true">${name}<small>${esc(t.soon)}</small></span>`;

const shot = (t, s, i) => {
  const base = `/assets/img/${t.lang}`;
  const set = (theme, ext) => `${base}/${theme}/${s.file}-480.${ext} 480w, ${base}/${theme}/${s.file}-720.${ext} 720w`;
  const sizes = "(min-width: 1120px) 200px, (min-width: 760px) 30vw, 62vw";
  return `<li class="shot">
<figure>
<div class="device device--shot"><picture>
<source media="(prefers-color-scheme: light)" type="image/avif" srcset="${set("light", "avif")}" sizes="${sizes}">
<source media="(prefers-color-scheme: light)" type="image/webp" srcset="${set("light", "webp")}" sizes="${sizes}">
<source type="image/avif" srcset="${set("dark", "avif")}" sizes="${sizes}">
<source type="image/webp" srcset="${set("dark", "webp")}" sizes="${sizes}">
<img src="${base}/dark/${s.file}-480.webp" width="720" height="1564" loading="lazy" decoding="async" alt="${esc(s.alt)}">
</picture></div>
<figcaption><span class="mono">0${i + 1}</span> ${esc(s.caption)}</figcaption>
</figure>
</li>`;
};

const jsonLd = t => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CueMirror",
  operatingSystem: "iOS, Android",
  applicationCategory: "MultimediaApplication",
  description: t.description,
  inLanguage: t.htmlLang,
  url: `${SITE}${t.path}`,
  image: `${SITE}/assets/og/og-${t.lang}.png`,
  publisher: { "@type": "Organization", name: "M3 Studio", email: config.supportEmail },
}).replace(/</g, "\\u003c");

const head = (t, { title, description, canonical, robots }) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${robots ? `<meta name="robots" content="${robots}">\n` : ""}<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#101113" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f4f2ed" media="(prefers-color-scheme: light)">
<link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${canonical ? `<link rel="canonical" href="${canonical}">\n${alternates()}` : ""}`;

const social = t => `<meta property="og:type" content="website">
<meta property="og:site_name" content="CueMirror">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:url" content="${SITE}${t.path}">
<meta property="og:locale" content="${t.ogLocale}">
${LANGS.filter(l => l !== t.lang).map(l => `<meta property="og:locale:alternate" content="${T[l].ogLocale}">`).join("\n")}
<meta property="og:image" content="${SITE}/assets/og/og-${t.lang}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.ogImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(t.title)}">
<meta name="twitter:description" content="${esc(t.description)}">
<meta name="twitter:image" content="${SITE}/assets/og/og-${t.lang}.png">
<meta name="twitter:image:alt" content="${esc(t.ogImageAlt)}">
<script type="application/ld+json">${jsonLd(t)}</script>`;

// Keeps the reader on the equivalent section when switching language (works without it too).
const switchScript = `<script>
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-lang-switch]");if(!a)return;var s=document.querySelectorAll("main section[id]"),id="";for(var i=0;i<s.length;i++){if(s[i].getBoundingClientRect().top<innerHeight*.4)id=s[i].id}if(id&&id!=="top")a.href=a.pathname+"#"+id});
</script>`;

const header = t => `<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header wrap">
<a class="brand" href="${t.path}" aria-label="${esc(t.homeLabel)}">${logo()}<span aria-hidden="true">CueMirror</span></a>
${langNav(t, "lang-nav", false)}
</header>`;

const footer = t => `<footer class="site-footer">
<div class="wrap footer-grid">
<p class="brand brand--small">${logo()}<span>© ${YEAR} M3 Studio</span></p>
<ul class="footer-links">
<li><a href="${esc(config.termsUrl[t.lang])}">${esc(t.footerTerms)}</a></li>
<li><a href="${esc(config.privacyUrl[t.lang])}">${esc(t.footerPrivacy)}</a></li>
</ul>
${langNav(t, "lang-nav lang-nav--footer", true)}
</div>
</footer>`;

const page = t => {
  const script = t.demoScript.map(p => `<p>${esc(p)}</p>`).join("");
  const bothStores = config.appStoreUrl && config.googlePlayUrl;
  const mail = `mailto:${config.supportEmail}`;
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
${head(t, { title: t.title, description: t.description, canonical: `${SITE}${t.path}` })}
${social(t)}
</head>
<body>
${header(t)}
<main id="main">
<section class="hero wrap" id="top" aria-labelledby="hero-title">
<div class="hero__copy">
<p class="eyebrow">${esc(t.eyebrow)}</p>
<h1 id="hero-title">${esc(t.h1)}</h1>
<p class="lead">${esc(t.subtitle)}</p>
<p class="badge">${esc(t.badge)}</p>
<div class="stores">
${bothStores ? "" : `<p class="stores__note">${esc(t.storesSoon)}</p>\n`}<div class="stores__row">${store("App Store", config.appStoreUrl, t)}${store("Google Play", config.googlePlayUrl, t)}</div>
</div>
</div>
<div class="hero__demo">
<div class="device device--demo" role="img" aria-label="${esc(t.demoLabel)}">
<div class="prompter">
<div class="prompter__track"><div class="prompter__text">${script}</div><div class="prompter__text">${script}</div></div>
<div class="prompter__line"></div>
</div>
</div>
</div>
</section>

<section class="section wrap" id="how" aria-labelledby="how-title">
<p class="eyebrow">${esc(t.howEyebrow)}</p>
<h2 id="how-title">${esc(t.howTitle)}</h2>
<ol class="steps">
${t.steps.map((s, i) => `<li class="step"><span class="step__n mono" aria-hidden="true">0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("\n")}
</ol>
</section>

<section class="section wrap" id="plans" aria-labelledby="plans-title">
<p class="eyebrow">${esc(t.plansEyebrow)}</p>
<h2 id="plans-title">${esc(t.plansTitle)}</h2>
<div class="plans">
<article class="plan" aria-labelledby="free-title">
<h3 id="free-title">${esc(t.freeName)}</h3>
<p class="plan__note">${esc(t.freeNote)}</p>
<ul class="ticks">${t.freeList.map(x => `<li>${icon.check}<span>${esc(x)}</span></li>`).join("")}</ul>
</article>
<article class="plan plan--premium" aria-labelledby="premium-title">
<h3 id="premium-title"><span class="tag mono">${icon.lock}PREMIUM</span><span class="vh">${esc(t.premiumName)}</span></h3>
<p class="plan__note">${esc(t.premiumNote)}</p>
<ul class="ticks">${t.premiumList.map(x => `<li>${icon.check}<span>${esc(x)}</span></li>`).join("")}</ul>
</article>
</div>
</section>

<section class="section wrap" id="screens" aria-labelledby="screens-title">
<p class="eyebrow">${esc(t.screensEyebrow)}</p>
<h2 id="screens-title">${esc(t.screensTitle)}</h2>
<ul class="gallery" tabindex="0" aria-label="${esc(t.screensScrollLabel)}">
${t.screens.map((s, i) => shot(t, s, i)).join("\n")}
</ul>
</section>

<section class="section wrap split" id="privacy" aria-labelledby="privacy-title">
<div>
<h2 class="eyebrow" id="privacy-title">${esc(t.privacyEyebrow)}</h2>
<p class="statement">${esc(t.privacyText)}</p>
<p><a class="link-arrow" href="${esc(config.privacyUrl[t.lang])}">${esc(t.privacyLink)}${icon.arrow}</a></p>
</div>
</section>

<section class="section wrap split" id="support" aria-labelledby="support-title">
<div>
<p class="eyebrow">${esc(t.supportEyebrow)}</p>
<h2 id="support-title">${esc(t.supportTitle)}</h2>
<p class="muted">${esc(t.supportText)}</p>
<p class="support-mail"><a href="${mail}">${esc(config.supportEmail)}</a></p>
<p><a class="button" href="${mail}">${icon.mail}${esc(t.supportCta)}</a></p>
</div>
</section>
</main>
${footer(t)}
${switchScript}
</body>
</html>
`;
};

const notFound = () => {
  const t = T.en;
  const msgs = [
    ["en", "Page not found.", "Go to the home page"],
    ["pt", "Página não encontrada.", "Ir para a página inicial"],
    ["es", "Página no encontrada.", "Ir a la página de inicio"],
  ];
  return `<!doctype html>
<html lang="en">
<head>
${head(t, { title: "Page not found — CueMirror", description: "This page does not exist.", robots: "noindex" })}
</head>
<body>
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header wrap">
<a class="brand" href="/" aria-label="${esc(t.homeLabel)}">${logo()}<span aria-hidden="true">CueMirror</span></a>
</header>
<main id="main" class="wrap notfound">
<p class="eyebrow mono">404</p>
${msgs.map(([l, h, a], i) => `<div lang="${T[l].htmlLang}" class="notfound__item">${i === 0 ? `<h1>${h}</h1>` : `<p class="notfound__h">${h}</p>`}<p><a class="link-arrow" href="${T[l].path}">${a}${icon.arrow}</a></p></div>`).join("\n")}
</main>
${footer(t)}
</body>
</html>
`;
};

const sitemap = () => {
  const alt = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${T[l].htmlLang}" href="${SITE}${T[l].path}"/>`).join("\n")
    + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
  const legal = ["privacy", "terms"].flatMap(b => ["", "-pt", "-es"].map(s => `${SITE}/${b}${s}.html`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map(l => `  <url>\n    <loc>${SITE}${T[l].path}</loc>\n${alt}\n  </url>`).join("\n")}
${legal.map(u => `  <url>\n    <loc>${u}</loc>\n  </url>`).join("\n")}
</urlset>
`;
};

for (const l of LANGS) {
  const dir = join(ROOT, T[l].path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), page(T[l]));
}
await writeFile(join(ROOT, "404.html"), notFound());
await writeFile(join(ROOT, "sitemap.xml"), sitemap());
await writeFile(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("pages ok");
