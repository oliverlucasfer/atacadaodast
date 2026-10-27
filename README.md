# Atacadão das Tintas — site de apresentação

Página única, estática, sem build e sem dependências de runtime. É o cartão de visita digital da
loja: apresenta as linhas de produto, o endereço, o horário e leva ao WhatsApp.

- **Produção:** `https://atacadaodastintas.netlify.app` (no ar desde 27/10/2026)
- **Spec:** `docs/superpowers/specs/2026-10-23-site-apresentacao-design.md`
- **Plano de implementação:** `docs/superpowers/plans/2026-10-23-site-atacadaodast.md`

## Rodar localmente

```bash
node scripts/serve.mjs 8080
# abra http://127.0.0.1:8080
```

Não é preciso `npm install`. Tudo usa apenas o Node (18+).

## Rodar os testes

```bash
node --test
```

Cobrem: contraste dos tokens (WCAG), presença do conteúdo real, orçamento de CSS e JS, classes do
layout mobile, lógica de horário (inclusive fuso e intervalo de almoço), ativos de marca, metadados e
o portão de publicação.

## Onde fica cada coisa

| O que você quer mudar | Onde |
|---|---|
| Título e descrição para o Google | `index.html` → `<title>` e `<meta name="description">` |
| Endereço, CEP | `index.html` → seção "A loja" + JSON-LD no `<head>` |
| Tabela de horário | `index.html` → `<table class="horarios">` **e** `assets/js/hours.js` (constantes `ABRE`, `MEIO`, `TARDE`, `FECHA`) |
| Textos das linhas de produto | `index.html` → `<article class="linha-produto">` |
| Link do WhatsApp | `index.html` → os **três** elementos com `href="https://wa.me/5577988380528"` (cabeçalho, hero e CTA final) **e** o `telephone` do JSON-LD |
| Cores e fontes | `assets/css/tokens.css` (único lugar com valores de cor) |
| Sitemap e indexação | `sitemap.xml` (uma URL só; atualize o `lastmod`) e `robots.txt` |
| Layout | `assets/css/styles.css` |

> **Atenção:** mudar o horário exige editar **os dois** lugares — a tabela visível e as constantes do
> `hours.js` (em minutos: 480 = 8h, 720 = 12h, 840 = 14h, 1080 = 18h). Há teste cobrindo a lógica,
> mas não a divergência entre HTML e JS.

## Publicar

Hospedagem no **Netlify** (plano free). O `_redirects` na raiz já está no formato nativo do Netlify e
mantém `mockups/`, `docs/`, `tests/` e `scripts/` fora do ar.

1. Netlify: **Add new site → Import an existing project → GitHub** → repositório `oliverlucasfer/atacadaodast`.
2. *Build command*: **vazio**. *Publish directory*: **`.`** (já declarado em `netlify.toml`).
3. Branch de produção: `main`.

Cada push em `main` publica. HTTPS e CDN são automáticos, e o endereço é
`https://atacadaodastintas.netlify.app`.

Se o nome do site no Netlify não for `atacadaodastintas`, troque os seis valores de URL absoluta no
`<head>` (`canonical`, `og:url`, `og:image`, `twitter:image` e os campos `url`/`image` do JSON-LD).

## Checklist antes de publicar

```bash
node scripts/check-golive.mjs
```

O script falha de propósito enquanto houver pendência. Estado em 27/10/2026:

- [x] **Número de WhatsApp** — `+55 77 98838-0528` nos três CTAs (`https://wa.me/5577988380528`)
      e no `telephone` do JSON-LD. O link resolve em `api.whatsapp.com/send/?phone=5577988380528`.
- [x] **Deploy** — Netlify, publish na raiz (`netlify.toml`), deploy automático a cada push na `main`.
      `_redirects` bloqueia `docs/`, `tests/`, `mockups/` e `scripts/` (o `!` depois do 302 é obrigatório:
      sem ele o Netlify serve o arquivo).
- [x] **Lighthouse mobile** — 100 / 100 / 100 / 100 (performance / acessibilidade / boas práticas / SEO),
      LCP 1,3 s e CLS 0 em 4G simulado.
- [x] **Fontes** — só Archivo 800 e Plex Sans/Mono 400. O 600 da spec §8.2 foi descartado: só a linha
      do dia atual o usava, abaixo da dobra, e custava 45,7 KB (página 73 KB em vez de 118 KB).
- [x] **Linhas de produto conferidas com o dono** (27/10/2026): Tintas · Máquina de cores ·
      Texturas e massas · Bases e preparação · Materiais para pintura. **Não vende** ferramentas
      (escada, espátula, desempenadeira), EPI nem misturador; spray e thinner existem. Faz entrega em
      Vitória da Conquista **e região** (sem mencionar cobrança). Marcas não são citadas.
- [x] **Rich Results validado** (27/10/2026) — 2 itens válidos: *Empresas locais* e *Organização*.
      Zero erros. Único aviso é `priceRange` ausente (opcional) — omitido de propósito: o dono proíbe
      menção a preço, e preencher seria inventar dado.

## Regenerar ativos

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/make-assets.ps1
```

Gera: `assets/logo/simbolo.png` (recorte do anel), `assets/img/simbolo-96.png`, `logo-rodape.png`,
`favicon-16/32.png`, `apple-touch-icon.png` e `og-1200x630.png`. Exige Windows com .NET/System.Drawing.
O script detecta sozinho a coluna que separa o anel do texto (hoje em x=804).

Fontes (uma vez, se precisar trocar):

```bash
node scripts/fetch-fonts.mjs
```

## Mapa

Hoje é um **SVG esquemático** (`assets/img/mapa.svg`) — a fachada está em reforma e não há coordenadas
verificadas. Quando houver:

1. gere um mapa estático (OpenStreetMap) 1200×900 e salve como `assets/img/mapa.webp`;
2. troque o `<img src="assets/img/mapa.svg">` por `mapa.webp`, mantendo `width="600" height="450"` e o `alt`;
3. mantenha a atribuição ao OpenStreetMap numa legenda de 10px (licença ODbL);
4. atualize o link "Abrir no Maps" se o endereço mudar.

## Fase 2 (não implementado)

- **Dark mode** com botão de alternar (spec §10). A base já está pronta: todos os tokens são semânticos.
  Bloqueio conhecido: o wordmark é navy e desaparece no fundo escuro — precisa de versão clara.
- Fotos internas da loja (equipe, estoque, obras).
