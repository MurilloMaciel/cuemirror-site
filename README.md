# cuemirror-site

Landing page do CueMirror (https://cuemirror.com) e as pÃ¡ginas de privacidade e termos. Site estÃ¡tico servido pelo GitHub Pages; nada Ã© carregado de terceiros em tempo de execuÃ§Ã£o.

## Estrutura

```
index.html, {pt,es,fr,de,it,id}/index.html  landing em EN (padrÃ£o), PT-BR, ES-ES, FR, DE, IT e ID  â† geradas
404.html, sitemap.xml, robots.txt          â† geradas
assets/site.css                            CSS Ãºnico (tokens de cor no topo)
assets/fonts/                              IBM Plex Sans 400/500/600 e Mono 500 (woff2 latin, OFL)
assets/img/{en,pt,es}/{dark,light}/        screenshots do app em WebP/AVIF, 480 e 720 px (fr/de/it/id usam os de EN: "assetLang" no i18n)
assets/og/og-{en,pt,es}.png                imagem de compartilhamento 1200Ã—630 (mesma regra do "assetLang")
favicon.svg, favicon-32.png, apple-touch-icon.png
CNAME                                      cuemirror.com
privacy*.md, terms*.md, _layouts, _includes  polÃ­tica e termos em 7 idiomas (Jekyll); _includes/head-custom.html redireciona pelo idioma do navegador
_src/config.json                           ÃšNICO lugar para e-mail, URLs legais e links das lojas
_src/i18n/{en,pt,es,fr,de,it,id}.json      todos os textos da landing
_tools/                                    scripts locais (nÃ£o publicados: pastas com "_" sÃ£o ignoradas pelo Jekyll)
```

## Editar textos e links

1. Textos: `_src/i18n/<idioma>.json`. Links e e-mail: `_src/config.json` (os itens com `TODO` estÃ£o marcados lÃ¡).
2. Gere as pÃ¡ginas a partir da raiz do repositÃ³rio (sÃ³ Node, sem `npm install`):
   ```
   node _tools/build-pages.mjs
   ```
3. Confira e faÃ§a commit dos HTML gerados. NÃ£o edite `index.html`, `pt/`, `es/` ou `404.html` Ã  mÃ£o: o prÃ³ximo build sobrescreve.

Links das lojas vazios mostram o botÃ£o desabilitado "Em breve". Ao preencher `appStoreUrl` e `googlePlayUrl` e rodar o build, viram links reais e o aviso some.

### Imagens, Ã­cones e OG (opcional)

Precisam das devDependencies (`sharp`, `puppeteer-core`, `lighthouse`) instaladas sÃ³ em `_tools/`:

```
cd _tools
npm install
npm run images     # screenshots de ~/OneDrive/Ãrea de Trabalho/app-store-assets/{lang}/{tema}/iphone/originals (ou CM_ASSETS=...)
npm run icons      # favicon e apple-touch-icon a partir da geometria do logo 6c
node build-og.mjs  # imagens OG (usa o Chrome instalado; CHROME_PATH=... se estiver em outro lugar)
node qa.mjs        # com o servidor local rodando: rolagem horizontal 360â€“1440 px, texto 200%, requisiÃ§Ãµes externas
```

## Testar localmente

```
python -m http.server 8000
```

Abra http://localhost:8000/, /pt/, /es/, /fr/, /de/, /it/ e /id/. As pÃ¡ginas de privacidade e termos sÃ£o `.md` processados pelo Jekyll do GitHub Pages, por isso sÃ³ funcionam depois de publicadas.

Para ver o tema claro, mude o tema do sistema ou use o DevTools (Rendering â€º Emulate CSS prefers-color-scheme).

## PublicaÃ§Ã£o (GitHub Pages + domÃ­nio)

NÃ£o adicionamos `.nojekyll`: as polÃ­ticas (`privacy*.md`, `terms*.md`) dependem do Jekyll. Os HTML da landing nÃ£o tÃªm front matter e sÃ£o copiados como estÃ£o.

Configure o DNS **antes** de publicar o `CNAME`. Com ele, `murillomaciel.github.io/cuemirror-site/...` passa a redirecionar para `cuemirror.com/...`, inclusive as URLs de privacidade e termos usadas hoje pelo app e pelas lojas.

Checklist de DNS no registrador de `cuemirror.com`:

- [ ] Registros **A** no domÃ­nio raiz (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- [ ] (Opcional, IPv6) Registros **AAAA** em `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
- [ ] **CNAME** de `www` â†’ `murillomaciel.github.io`
- [ ] Remover registros A/AAAA/CNAME antigos que conflitem (por exemplo, o "parking" do registrador)
- [ ] (Recomendado) Verificar o domÃ­nio em GitHub â€º Settings â€º Pages â€º Verified domains
- [ ] RepositÃ³rio â€º Settings â€º Pages: Custom domain `cuemirror.com`, aguardar o check de DNS
- [ ] Marcar **Enforce HTTPS** quando o certificado ficar pronto (pode levar atÃ© 24 h)
- [ ] Testar `https://cuemirror.com/`, `/pt/`, `/es/`, `/privacy.html`, `/terms.html` e `https://www.cuemirror.com/` (deve redirecionar)

## URLs das polÃ­ticas

- Privacidade: https://cuemirror.com/privacy.html (traduÃ§Ãµes em `privacy-{pt,es,fr,de,it,id}.html`)
- Termos: https://cuemirror.com/terms.html (traduÃ§Ãµes em `terms-{pt,es,fr,de,it,id}.html`)

As URLs sem sufixo estÃ£o em inglÃªs e redirecionam navegadores em portuguÃªs, espanhol, francÃªs, alemÃ£o, italiano ou indonÃ©sio para a traduÃ§Ã£o (`?lang=en` forÃ§a o inglÃªs).

Idioma novo: um `privacy-xx.md` e um `terms-xx.md`, o link no seletor do topo de todos eles, a entrada em `_includes/head-custom.html`, `_src/i18n/xx.json`, `LANGS` em `_tools/build-pages.mjs` e as URLs em `_src/config.json`. AtÃ© o DNS estar no ar, continuam valendo os endereÃ§os em `murillomaciel.github.io/cuemirror-site/`.
