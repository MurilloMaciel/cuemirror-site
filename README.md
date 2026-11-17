# cuemirror-site

Landing page do CueMirror (https://cuemirror.com) e as páginas de privacidade e termos. Site estático servido pelo GitHub Pages; nada é carregado de terceiros em tempo de execução.

## Estrutura

```
index.html, {pt,es,fr,de,it,id}/index.html  landing em EN (padrão), PT-BR, ES-ES, FR, DE, IT e ID  ← geradas
404.html, sitemap.xml, robots.txt          ← geradas
assets/site.css                            CSS único (tokens de cor no topo)
assets/fonts/                              IBM Plex Sans 400/500/600 e Mono 500 (woff2 latin, OFL)
assets/img/{en,pt,es}/{dark,light}/        screenshots do app em WebP/AVIF, 480 e 720 px (fr/de/it/id usam os de EN: "assetLang" no i18n)
assets/badges/                             selos oficiais das lojas (Apple SVG e Google Play PNG, 7 idiomas), baixados das páginas oficiais; nunca redesenhar
assets/og/og-{en,pt,es}.png                imagem de compartilhamento 1200×630 (mesma regra do "assetLang")
favicon.svg, favicon-32.png, apple-touch-icon.png
CNAME                                      cuemirror.com
privacy*.md, terms*.md, _layouts, _includes  política e termos em 7 idiomas (Jekyll); _includes/head-custom.html redireciona pelo idioma do navegador
_src/config.json                           ÚNICO lugar para e-mail, URLs legais e links das lojas
_src/i18n/{en,pt,es,fr,de,it,id}.json      todos os textos da landing
_tools/                                    scripts locais (não publicados: pastas com "_" são ignoradas pelo Jekyll)
```

## Editar textos e links

1. Textos: `_src/i18n/<idioma>.json`. Links e e-mail: `_src/config.json` (os itens com `TODO` estão marcados lá).
2. Gere as páginas a partir da raiz do repositório (só Node, sem `npm install`):
   ```
   node _tools/build-pages.mjs
   ```
3. Confira e faça commit dos HTML gerados. Não edite `index.html`, `pt/`, `es/` ou `404.html` à mão: o próximo build sobrescreve.

Com `appStoreUrl` e `googlePlayUrl` preenchidos, o hero mostra os selos oficiais de cada idioma (`assets/badges/`), com a mesma altura visual (a margem transparente do PNG do Google é compensada em `build-pages.mjs` e no CSS). Link vazio volta ao botão desabilitado "Em breve". `appStoreId` alimenta o Smart App Banner do iOS. Selo novo: Apple em https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/{idioma}, Google em https://play.google.com/intl/en_us/badges/static/images/badges/{idioma}_badge_web_generic.png (o EN vem do "Google Play Badge guidelines.zip" da mesma página, porque essa URL ainda entrega o desenho antigo em inglês; se o tamanho ou a margem transparente mudar, atualize `PLAY_BADGE`).

### Imagens, ícones e OG (opcional)

Precisam das devDependencies (`sharp`, `puppeteer-core`, `lighthouse`) instaladas só em `_tools/`:

```
cd _tools
npm install
npm run images     # screenshots de ~/OneDrive/Área de Trabalho/app-store-assets/{lang}/{tema}/iphone/originals (ou CM_ASSETS=...)
npm run icons      # favicon e apple-touch-icon a partir da geometria do logo 6c
node build-og.mjs  # imagens OG (usa o Chrome instalado; CHROME_PATH=... se estiver em outro lugar)
node qa.mjs        # com o servidor local rodando: rolagem horizontal 360–1440 px, texto 200%, requisições externas
```

## Testar localmente

```
python -m http.server 8000
```

Abra http://localhost:8000/, /pt/, /es/, /fr/, /de/, /it/ e /id/. As páginas de privacidade e termos são `.md` processados pelo Jekyll do GitHub Pages, por isso só funcionam depois de publicadas.

Para ver o tema claro, mude o tema do sistema ou use o DevTools (Rendering › Emulate CSS prefers-color-scheme).

## Publicação (GitHub Pages + domínio)

Não adicionamos `.nojekyll`: as políticas (`privacy*.md`, `terms*.md`) dependem do Jekyll. Os HTML da landing não têm front matter e são copiados como estão.

Configure o DNS **antes** de publicar o `CNAME`. Com ele, `murillomaciel.github.io/cuemirror-site/...` passa a redirecionar para `cuemirror.com/...`, inclusive as URLs de privacidade e termos usadas hoje pelo app e pelas lojas.

Checklist de DNS no registrador de `cuemirror.com`:

- [ ] Registros **A** no domínio raiz (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- [ ] (Opcional, IPv6) Registros **AAAA** em `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
- [ ] **CNAME** de `www` → `murillomaciel.github.io`
- [ ] Remover registros A/AAAA/CNAME antigos que conflitem (por exemplo, o "parking" do registrador)
- [ ] (Recomendado) Verificar o domínio em GitHub › Settings › Pages › Verified domains
- [ ] Repositório › Settings › Pages: Custom domain `cuemirror.com`, aguardar o check de DNS
- [ ] Marcar **Enforce HTTPS** quando o certificado ficar pronto (pode levar até 24 h)
- [ ] Testar `https://cuemirror.com/`, `/pt/`, `/es/`, `/privacy.html`, `/terms.html` e `https://www.cuemirror.com/` (deve redirecionar)

## URLs das políticas

- Privacidade: https://cuemirror.com/privacy.html (traduções em `privacy-{pt,es,fr,de,it,id}.html`)
- Termos: https://cuemirror.com/terms.html (traduções em `terms-{pt,es,fr,de,it,id}.html`)

As URLs sem sufixo estão em inglês e redirecionam navegadores em português, espanhol, francês, alemão, italiano ou indonésio para a tradução (`?lang=en` força o inglês).

Idioma novo: um `privacy-xx.md` e um `terms-xx.md`, o link no seletor do topo de todos eles, a entrada em `_includes/head-custom.html`, `_src/i18n/xx.json`, `LANGS` em `_tools/build-pages.mjs` e as URLs em `_src/config.json`. Até o DNS estar no ar, continuam valendo os endereços em `murillomaciel.github.io/cuemirror-site/`.

## Pendências

- [ ] Remover a frase de transição (comentário TRANSIÇÃO) dos terms*.md e atualizar a data quando as contas do Google Play e da App Store forem convertidas para a EmQube. Depois, atualizar o EULA próprio no App Store Connect.
