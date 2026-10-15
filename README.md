# cuemirror-site

Landing page do CueMirror (https://cuemirror.com) e as páginas de privacidade e termos. Site estático servido pelo GitHub Pages; nada é carregado de terceiros em tempo de execução.

## Estrutura

```
index.html, pt/index.html, es/index.html   landing em EN (padrão), PT-BR e ES-ES  ← geradas
404.html, sitemap.xml, robots.txt          ← geradas
assets/site.css                            CSS único (tokens de cor no topo)
assets/fonts/                              IBM Plex Sans 400/500/600 e Mono 500 (woff2 latin, OFL)
assets/img/{en,pt,es}/{dark,light}/        screenshots do app em WebP/AVIF, 480 e 720 px
assets/og/og-{en,pt,es}.png                imagem de compartilhamento 1200×630
favicon.svg, favicon-32.png, apple-touch-icon.png
CNAME                                      cuemirror.com
privacy*.md, terms*.md, _layouts, _includes  políticas (Jekyll, já existentes)
_src/config.json                           ÚNICO lugar para e-mail, URLs legais e links das lojas
_src/i18n/{en,pt,es}.json                  todos os textos da landing
_tools/                                    scripts locais (não publicados: pastas com "_" são ignoradas pelo Jekyll)
```

## Editar textos e links

1. Textos: `_src/i18n/<idioma>.json`. Links e e-mail: `_src/config.json` (os itens com `TODO` estão marcados lá).
2. Gere as páginas a partir da raiz do repositório (só Node, sem `npm install`):
   ```
   node _tools/build-pages.mjs
   ```
3. Confira e faça commit dos HTML gerados. Não edite `index.html`, `pt/`, `es/` ou `404.html` à mão: o próximo build sobrescreve.

Links das lojas vazios mostram o botão desabilitado "Em breve". Ao preencher `appStoreUrl` e `googlePlayUrl` e rodar o build, viram links reais e o aviso some.

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

Abra http://localhost:8000/, /pt/ e /es/. As páginas de privacidade e termos são `.md` processados pelo Jekyll do GitHub Pages, por isso só funcionam depois de publicadas.

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

- Privacidade: https://cuemirror.com/privacy.html ([pt](https://cuemirror.com/privacy-pt.html) · [es](https://cuemirror.com/privacy-es.html))
- Termos: https://cuemirror.com/terms.html ([pt](https://cuemirror.com/terms-pt.html) · [es](https://cuemirror.com/terms-es.html))

As URLs sem sufixo estão em inglês e redirecionam navegadores em português ou espanhol para a tradução (`?lang=en` força o inglês). Até o DNS estar no ar, continuam valendo os endereços em `murillomaciel.github.io/cuemirror-site/`.
