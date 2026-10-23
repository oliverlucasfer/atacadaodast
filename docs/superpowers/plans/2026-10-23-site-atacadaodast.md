# Site de apresentação — Atacadão das Tintas · Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar uma página estática única que apresenta o Atacadão das Tintas (Vitória da Conquista/BA), informa endereço, horário e contato, e leva o visitante ao WhatsApp em um toque.

**Architecture:** HTML + CSS + um único módulo JS de ~1 KB, sem build e sem dependências de runtime. A página é construída portando o mockup aprovado (`mockups/hibrido.html`) para `index.html`, trocando conteúdo de exemplo por conteúdo real e cores literais por tokens. Hospedagem no Cloudflare Pages a partir de um repositório Git.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `clamp()`), JavaScript ESM (apenas `Intl` para fuso), Node 20+ apenas para testes e scripts de desenvolvimento (`node --test`, `node:zlib`).

**Spec:** `docs/superpowers/specs/2026-10-23-site-apresentacao-design.md`

## Global Constraints

- Sem build: nenhum `package.json` com dependências, nenhum bundler, nenhum passo de compilação.
- Sem requisições a terceiros em runtime: nenhuma fonte do Google, nenhum iframe, nenhum analytics, nenhum CDN.
- JS total ≤ 1,5 KB, em **um** arquivo (`assets/js/hours.js`), estritamente progressivo: a página funciona sem ele.
- CSS total ≤ 14 KB.
- Peso total da página ≤ 300 KB, incluindo imagens.
- Cores apenas por token (`var(--color-*)`); nenhum hex em `styles.css`.
- `#ED3237` só em texto ≥ 24 px ou elemento não textual; texto pequeno usa `#C42B2F`.
- Fuso de referência: `America/Sao_Paulo`, independente do fuso do visitante.
- `lang="pt-BR"`, exatamente um `<h1>`, landmarks semânticos, alvos de toque ≥ 44×44 px.
- Horário oficial: seg–sex 08:00–12:00 e 14:00–18:00; sáb 08:00–12:00; dom e feriados fechado.
- Conteúdo real: Av. Presidente Dutra, 2237 — Centro, Vitória da Conquista/BA · CEP 45000-010 · CNPJ 24.807.913/0001-82 · `https://www.instagram.com/atacadaodast/`.
- **WhatsApp está pendente.** Nenhum link pode apontar para número inventado. O bloco usa `data-pending="whatsapp"` e o script de go-live falha enquanto ele existir.
- Zero placeholder em produção: o deploy só acontece com `scripts/check-golive.mjs` passando.

## Review Focus

1. **Intervalo de almoço.** Às 12h05, 13h30 e 13h59 de um dia útil a etiqueta deve dizer "fechado — abre às 14h", nunca "aberto". Um `if` que só compara com o horário de fechamento erra isso e o cliente bate na porta fechada.
2. **Fuso do visitante.** Um visitante com o celular em outro fuso (ou um servidor em UTC) deve ver o status de Vitória da Conquista, não o do aparelho. `getHours()` local passa nos testes do autor e falha na vida real.
3. **Limites exatos.** 12:00 deve ser "fechado"; 14:00 deve ser "aberto"; 18:00 deve ser "fechado"; 08:00 deve ser "aberto". Erros de `<=` viram informação errada.
4. **Sábado e domingo.** Sábado depois das 12h e domingo o dia inteiro devem apontar a próxima abertura correta (segunda, 08h) — não "fechado" seco, e nunca "aberto".
5. **Página sem JS.** Com JavaScript bloqueado ou falhando, a tabela de horários continua correta, o CTA continua visível e nada fica em branco. Nenhum conteúdo pode depender do script.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Conteúdo, estrutura semântica, metadados, JSON-LD |
| `assets/css/tokens.css` | Único lugar com valores de cor, tipo, espaço |
| `assets/css/styles.css` | Layout e componentes; consome apenas tokens |
| `assets/js/hours.js` | `statusFor(date)` + atualização da etiqueta no DOM |
| `assets/logo/` | `LOGO_AF_HORIZONTAL.png`, `LOGO_AF.png`, `simbolo.png` |
| `assets/img/` | `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png`, `og-1200x630.png`, `mapa.svg` |
| `assets/fonts/` | 4 arquivos woff2 (Archivo 800, Plex Sans 400/600, Plex Mono 400) |
| `tests/*.test.mjs` | Testes com `node:test`, sem dependências |
| `scripts/serve.mjs` | Servidor estático local para desenvolvimento |
| `scripts/make-assets.ps1` | Geração de favicons, símbolo recortado e imagem OG |
| `scripts/check-golive.mjs` | Portão de publicação: falha se houver pendência |
| `README.md` | Onde fica cada texto, como publicar, como trocar o mapa |
| `docs/superpowers/specs/…` | Spec aprovada (já existe) |

---

## Task 1: Fundação do projeto e servidor local

**Files:**
- Create: `.gitignore`, `README.md`, `scripts/serve.mjs`, `tests/smoke.test.mjs`

**Interfaces:**
- Produces: `node scripts/serve.mjs [porta]` serve a raiz do projeto em `http://127.0.0.1:<porta>` (padrão 8080), com `text/html` para `/` e tipos corretos para `.css`, `.js`, `.png`, `.svg`.

- [ ] **Step 1: Inicializar o repositório**

```bash
git init
git add -A
git commit -m "chore: estado inicial (spec + mockup aprovado)"
```

- [ ] **Step 2: Criar `.gitignore`** com `.superpowers/`, `node_modules/`, `.DS_Store`, `*.log`.

- [ ] **Step 3: Escrever o teste que falha**

`tests/smoke.test.mjs`: inicia `serve.mjs` em porta efêmera, faz `fetch("/")` e espera `200` com `content-type: text/html`; depois `fetch("/assets/css/tokens.css")` e espera `200` com `text/css`.

- [ ] **Step 4: Rodar e ver falhar**

Run: `node --test tests/smoke.test.mjs`
Expected: FAIL — `ENOENT` em `scripts/serve.mjs`.

- [ ] **Step 5: Implementar `scripts/serve.mjs`** com `node:http` + `node:fs/promises`, sem dependências: resolve o caminho dentro da raiz (bloqueia `..`), mapeia extensão→MIME, devolve 404 em arquivo inexistente.

- [ ] **Step 6: Rodar e ver passar**

Run: `node --test tests/smoke.test.mjs`
Expected: PASS (2 testes).

- [ ] **Step 7: Commit** — `feat: servidor estático de desenvolvimento`

---

## Task 2: Tokens de design e prova de contraste

**Files:**
- Create: `assets/css/tokens.css`, `tests/tokens.test.mjs`

**Interfaces:**
- Produces: custom properties na raiz — `--color-bg`, `--color-fg`, `--color-heading`, `--color-muted`, `--color-accent`, `--color-accent-text`, `--color-dark`, `--color-line`, `--spectrum-1`…`--spectrum-6`; `--font-display`, `--font-body`, `--font-mono`; `--step-*` de espaço; `--max-w: 1220px`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/tokens.test.mjs` lê `assets/css/tokens.css` e:
(a) extrai os hex dos tokens e verifica os pares com a fórmula WCAG:

```js
const lum = (hex) => {
  const c = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255)
    .map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4);
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
};
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
```

Asserções: `fg/bg ≥ 7`, `heading/bg ≥ 7`, `muted/bg ≥ 4.5`, `accent-text/bg ≥ 4.5`, `branco/dark ≥ 4.5`, `branco/heading ≥ 4.5`.
(b) verifica que `accent` (`#ED3237`) **não** passa 4,5 em `bg` — o teste documenta por que o token separado existe.

- [ ] **Step 2: Rodar e ver falhar** — `node --test tests/tokens.test.mjs` → FAIL (arquivo não existe).

- [ ] **Step 3: Escrever `tokens.css`** com os valores da spec §8.1 e as famílias tipográficas de §8.2 (`"Archivo"`, `"IBM Plex Sans"`, `"IBM Plex Mono"` com fallback `system-ui`/`monospace`).

- [ ] **Step 4: Rodar e ver passar** — `node --test tests/tokens.test.mjs` → PASS (7 testes).

- [ ] **Step 5: Commit** — `feat: tokens de design com contraste AA verificado`

---

## Task 3: Conteúdo e estrutura semântica

**Files:**
- Create: `index.html`, `tests/content.test.mjs`

**Interfaces:**
- Consumes: nada (HTML autocontido; ainda sem CSS).
- Produces: âncoras `#produtos`, `#loja`, `#contato`; `article.linha-produto` para cada linha; `<table class="horarios">` com `data-dia="1"…"5"`; elemento `[data-status-horario]` vazio; CTA com `data-pending="whatsapp"`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/content.test.mjs` lê `index.html` e afirma:
(a) `<html lang="pt-BR">` e exatamente um `<h1>`;
(b) presença literal de `Av. Presidente Dutra, 2237`, `45000-010`, `Vitória da Conquista`, `24.807.913/0001-82`, `instagram.com/atacadaodast`;
(c) a tabela de horários contém `08:00–12:00` e `14:00–18:00` para seg–sex, `08:00 – 12:00` para sábado e `Fechado` para domingo;
(d) existe `<a href="https://www.google.com/maps/search/?api=1&query=...">&nbsp;` com o endereço codificado;
(e) nenhum `href` contém `90000-0000` ou número de telefone inventado;
(f) todo `<img>` tem `alt` não vazio e `width`/`height`.

- [ ] **Step 2: Rodar e ver falhar** — `node --test tests/content.test.mjs` → FAIL.

- [ ] **Step 3: Portar o markup de `mockups/hibrido.html` para `index.html`**, aplicando estes desvios — e só estes:

| Mockup | Produção |
|---|---|
| Logo horizontal no cabeçalho | `assets/logo/simbolo.png` (32 px) + `<span class="marca">Atacadão</span>` + `<span class="marca-sub">DAS TINTAS</span>`; lockup completo no rodapé a 22 px |
| Telefone `(31) 90000-0000` | omitido (WhatsApp pendente); o CTA usa `data-pending="whatsapp"` e `href="#"` |
| "Av. Exemplo, 1840" | `Av. Presidente Dutra, 2237 — Centro` |
| `Belo Horizonte / MG` | `Vitória da Conquista / BA` |
| Linhas de produto do mockup | `Tintas`, `Materiais para pintura`, `Texturas`, `Bases e preparação`, `Ferramentas e acessórios` — sem "máquina de cores" (não confirmado) |
| Horário 08–18 / 08–13 | seg–sex `08:00–12:00 · 14:00–18:00`, sáb `08:00 – 12:00`, dom/feriados `Fechado` |
| Mapa esquemático inline | `<img src="assets/img/mapa.svg">` com o mesmo `alt` |
| Barra de mockup no topo | removida |

Texto de apoio permitido pela spec §9.1: "Tintas, texturas, bases e tudo para a pintura — preço de atacado e atendimento de quem entende de obra."

Incluir também, ausente no mockup por ser de produção: `<a class="skip" href="#produtos">Ir para o conteúdo</a>` como primeiro elemento do `<body>`, e `<main id="produtos">` envolvendo as seções 01–03.

- [ ] **Step 4: Rodar e ver passar** — `node --test tests/content.test.mjs` → PASS.

- [ ] **Step 5: Commit** — `feat: estrutura e conteúdo da página`

---

## Task 4: Estilo desktop

**Files:**
- Create: `assets/css/styles.css`, `tests/css.test.mjs`

**Interfaces:**
- Consumes: tokens da Task 2, classes da Task 3.
- Produces: classes `.bar`, `.hero`, `.deck`, `.linha-produto`, `.loja`, `.cta`, `.foot`, `.btn`, `.btn-solid`, `.btn-ghost`; breakpoint único em `900px` (Task 5).

- [ ] **Step 1: Escrever o teste que falha**

`tests/css.test.mjs`:
(a) `styles.css` não contém hex literal (`/#[0-9a-f]{3,6}/i` → nenhum match);
(b) tamanho ≤ 14 KB;
(c) não há `@import`, `url(http`, `fonts.googleapis`;
(d) existe `.linha-produto`, `.horarios` e `.skip` (o link de pular precisa existir visualmente como
    fora de tela até receber foco: `.skip { position:absolute; left:-9999px }` e `.skip:focus { left:1rem; top:1rem; z-index:100 }`).

- [ ] **Step 2: Rodar e ver falhar** — FAIL.

- [ ] **Step 3: Portar o CSS de `mockups/hibrido.html`** para `styles.css`, trocando cada valor literal por `var(--…)` e removendo os estilos da barra de mockup. Manter: grid assimétrico do hero (1.6fr / .9fr), leque com `gap: 2px` e 128 px, fios de 1 px, tabela de horários com `font-variant-numeric: tabular-nums`, bloco CTA em `--color-dark`.

Adicionar, por estar ausente no mockup: `section { scroll-margin-top: 96px }` e `:focus-visible { outline: 2px solid var(--color-accent-text); outline-offset: 3px }`.

- [ ] **Step 4: Rodar e ver passar** — PASS.

- [ ] **Step 5: Verificar no navegador** — `node scripts/serve.mjs 8080`, abrir `http://127.0.0.1:8080`, comparar com `mockups/hibrido.html` em 1440 px. Registrar divergências visuais e corrigir antes do commit.

- [ ] **Step 6: Commit** — `feat: estilo desktop`

---

## Task 5: Responsivo

**Files:**
- Modify: `assets/css/styles.css` (bloco `@media (max-width: 900px)`)
- Create: `tests/responsive.test.mjs`

**Interfaces:**
- Consumes: Task 4.
- Produces: nenhuma API nova; comportamento em 390 px.

- [ ] **Step 1: Escrever o teste que falha**

`tests/responsive.test.mjs` afirma que `styles.css` contém `@media (max-width: 900px)` e, dentro dela: `.hero` com uma coluna, `.deck` com `repeat(6, 1fr)` e `72px`, `.deck-labels` com `display: none`, `.bar` sem `position: sticky`.

- [ ] **Step 2: Rodar e ver falhar** — FAIL.

- [ ] **Step 3: Implementar o bloco mobile** portando de `mockups/hibrido.html` (media query final) + ajustes: CTA do cabeçalho com `min-height: 44px`; `.linha-produto` em duas colunas; tabela de horários com `white-space: nowrap` na coluna de horário.

- [ ] **Step 4: Rodar e ver passar** — PASS.

- [ ] **Step 5: Verificar em 390 px** — DevTools em 390×844: sem rolagem horizontal (`document.documentElement.scrollWidth === 390`), cabeçalho sem sobreposição, leque em linha única.

- [ ] **Step 6: Commit** — `feat: versão mobile`

---

## Task 6: Horário dinâmico ("aberto agora")

**Files:**
- Create: `assets/js/hours.js`, `tests/hours.test.mjs`
- Modify: `index.html` (carregar `<script type="module" src="assets/js/hours.js">` e marcar a linha do dia atual)

**Interfaces:**
- Produces: `export function statusFor(date) -> string`, com exatamente estes retornos:
  `"Aberto agora · fecha às 12h"`, `"Aberto agora · fecha às 18h"`, `"Fechado · abre às 14h"`, `"Fechado · abre amanhã às 8h"`, `"Fechado · abre segunda às 8h"`.
  Também `export function marcarDiaAtual(date) -> number` (1–7, ISO, no fuso de São Paulo).

- [ ] **Step 1: Escrever o teste que falha**

`tests/hours.test.mjs` (datas com offset `-03:00`):

| Entrada | Esperado |
|---|---|
| ter 2026-10-27 10:00 | `Aberto agora · fecha às 12h` |
| ter 2026-10-27 12:00 | `Fechado · abre às 14h` |
| ter 2026-10-27 13:59 | `Fechado · abre às 14h` |
| ter 2026-10-27 14:00 | `Aberto agora · fecha às 18h` |
| ter 2026-10-27 18:00 | `Fechado · abre amanhã às 8h` |
| sáb 2026-10-31 11:00 | `Aberto agora · fecha às 12h` |
| sáb 2026-10-31 12:30 | `Fechado · abre segunda às 8h` |
| dom 2026-11-01 10:00 | `Fechado · abre segunda às 8h` |
| ter 2026-10-27T22:00:00+09:00 (Tóquio) | `Aberto agora · fecha às 12h` |

O último caso é o teste de fuso: 22h em Tóquio = 10h em São Paulo, terça.

Também afirmar: `marcarDiaAtual(new Date("2026-11-01T10:00:00-03:00")) === 7` (domingo) e que
`assets/js/hours.js` pesa ≤ 1,5 KB (orçamento da spec §11.2).

- [ ] **Step 2: Rodar e ver falhar** — FAIL.

- [ ] **Step 3: Implementar `hours.js`**

Usar `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', weekday:'short', hour:'2-digit', minute:'2-digit', hour12:false })` para obter dia e minutos **no fuso da loja**; converter para minutos do dia; comparar com as faixas `[480,720]` e `[840,1080]` (seg–sex) e `[480,720]` (sáb). Retornar a string correspondente. No `DOMContentLoaded`, escrever em `[data-status-horario]` e adicionar `data-hoje` à linha do dia.

- [ ] **Step 4: Rodar e ver passar** — PASS (9 testes).

- [ ] **Step 5: Verificar o fallback sem JS** — desabilitar JavaScript no navegador e recarregar: a tabela continua completa e o CTA visível; o `[data-status-horario]` fica vazio (sem texto quebrado).

- [ ] **Step 6: Commit** — `feat: status de aberto/fechado com fuso e almoço`

---

## Task 7: Ativos de marca

**Files:**
- Create: `scripts/make-assets.ps1`, `assets/logo/simbolo.png`, `assets/img/favicon-16.png`, `assets/img/favicon-32.png`, `assets/img/apple-touch-icon.png`, `assets/img/og-1200x630.png`, `assets/img/mapa.svg`, `assets/fonts/*.woff2`, `tests/assets.test.mjs`
- Modify: `assets/css/tokens.css` (`@font-face`), `index.html` (preload)

**Interfaces:**
- Produces: `mapa.svg` (600×450, `viewBox="0 0 600 450"`), ícones 16/32/180 px, `og-1200x630.png` e as famílias `Archivo`, `IBM Plex Sans` e `IBM Plex Mono` disponíveis sob os nomes usados nos tokens.

- [ ] **Step 1: Escrever o teste que falha**

`tests/assets.test.mjs` lê o cabeçalho IHDR de cada PNG (bytes 16–23) e afirma largura/altura esperadas (16×16, 32×32, 180×180, 1200×630); afirma que `mapa.svg` contém `viewBox="0 0 600 450"` e um `<title>`; afirma que `simbolo.png` existe e tem largura ≥ 200 px; afirma que existem 4 arquivos `.woff2` em `assets/fonts/` somando ≤ 100 KB; e que `index.html` faz `rel="preload"` **apenas** de `archivo-800.woff2`.

- [ ] **Step 2: Rodar e ver falhar** — FAIL (arquivos ausentes).

- [ ] **Step 3: Escrever `make-assets.ps1`** usando `System.Drawing` (já disponível no Windows, sem instalar nada):
  - recorta o anel de `LOGO_AF_HORIZONTAL.png` (a região quadrada à esquerda do wordmark; o script recebe `-CropX/-CropW` como parâmetros e registra no README o retângulo usado);
  - gera `simbolo.png` com o recorte;
  - gera os três ícones redimensionando o recorte sobre fundo `#F7F6F3`;
  - compõe `og-1200x630.png`: fundo `#F7F6F3`, lockup centralizado a 420 px de largura, faixa espectral de 6 blocos no rodapé da imagem.

- [ ] **Step 4: Rodar e ver passar** — `powershell -File scripts/make-assets.ps1 && node --test tests/assets.test.mjs` → PASS.

- [ ] **Step 5: Subir `mapa.svg`** copiando o SVG do mockup, adicionando `<title>Mapa da loja na Av. Presidente Dutra, 2237</title>` e mantendo a etiqueta com o endereço real.

- [ ] **Step 6: Baixar e commitar as fontes**

Requisitar `https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400&display=swap` com `User-Agent` de navegador moderno (para receber `woff2`), baixar as URLs `latin` e salvar como `assets/fonts/archivo-800.woff2`, `plex-sans-400.woff2`, `plex-sans-600.woff2`, `plex-mono-400.woff2`. Declarar os quatro `@font-face` em `tokens.css` com `font-display: swap` e `unicode-range` latino. No `<head>`, `preload` apenas do `archivo-800.woff2`.

Nenhuma referência a `fonts.googleapis.com` ou `fonts.gstatic.com` pode permanecer no HTML/CSS — o teste de `assets` e o de `css` cobrem isso.

- [ ] **Step 7: Conectar os ativos** — `index.html` passa a usar `simbolo.png` no cabeçalho, os favicons no `<head>` e `mapa.svg` na seção da loja.

- [ ] **Step 8: Commit** — `feat: símbolo, favicons, imagem OG, mapa e fontes`

> A spec §11.4 prevê `<picture>` com AVIF/WebP para fotos. Na v1 não existem fotos (a fachada está em
> obra e o mapa ocupa o lugar), então esse item fica satisfeito apenas pelo `mapa.svg`. Fica registrado
> como pendência da fase 2, junto com as fotos internas.

---

## Task 8: Metadados, JSON-LD e compartilhamento

**Files:**
- Modify: `index.html` (`<head>`), `robots.txt`
- Create: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: `og-1200x630.png` (Task 7).
- Produces: `<title>`, `meta description`, Open Graph, Twitter card, `<script type="application/ld+json">`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/seo.test.mjs`:
(a) `<title>` = `Atacadão das Tintas — Centro, Vitória da Conquista / BA`;
(b) `meta name="description"` com 120–158 caracteres;
(c) `og:image` aponta para `assets/img/og-1200x630.png` (URL absoluta `https://atacadaodast.pages.dev/...`);
(d) o JSON-LD é parseável e tem `@type: "HardwareStore"` (ou `Store`), `name`, `address` com `streetAddress`, `addressLocality: "Vitória da Conquista"`, `addressRegion: "BA"`, `postalCode: "45000-010"`, `telephone` **ausente enquanto pendente**, `openingHoursSpecification` com dois intervalos seg–sex e um sábado, `sameAs: ["https://www.instagram.com/atacadaodast/"]`;
(e) `robots.txt` contém `Allow: /`.

- [ ] **Step 2: Rodar e ver falhar** — FAIL.

- [ ] **Step 3: Implementar** o `<head>` completo e o JSON-LD. Regra: **nenhum campo inventado** — sem `telephone`, sem `geo` e sem `priceRange` até existirem.

- [ ] **Step 4: Rodar e ver passar** — PASS.

- [ ] **Step 5: Validar o JSON-LD** no Rich Results Test (colar o HTML) e registrar o resultado no commit.

- [ ] **Step 6: Commit** — `feat: metadados, JSON-LD e imagem de compartilhamento`

---

## Task 9: Portão de publicação, README e deploy

**Files:**
- Create: `scripts/check-golive.mjs`, `tests/golive.test.mjs`, `README.md`
- Modify: `index.html` (remover `data-pending` quando o WhatsApp chegar)

**Interfaces:**
- Produces: `node scripts/check-golive.mjs` → exit 0 somente sem pendências; exit 1 listando cada uma.

- [ ] **Step 1: Escrever o teste que falha**

`tests/golive.test.mjs` roda o script e afirma: sai com código 1 e imprime `whatsapp pendente` (estado atual); depois, num `index.html` temporário com `data-pending` removido e um `href="https://wa.me/55..."` válido, sai com 0.

- [ ] **Step 2: Rodar e ver falhar** — FAIL.

- [ ] **Step 3: Implementar `check-golive.mjs`** verificando: nenhum `data-pending`; nenhum `0000-0000` nem `Exemplo`; `href` de WhatsApp casando `^https://wa\.me/55\d{10,11}$`; `telephone` presente no JSON-LD quando houver WhatsApp; todas as imagens referenciadas existindo em disco.

- [ ] **Step 4: Rodar e ver passar** — PASS.

- [ ] **Step 5: Escrever o `README.md`**: onde está cada texto (tabela seção → linha), como rodar local, como trocar o mapa quando houver coordenadas, como publicar, e a checklist de go-live.

- [ ] **Step 6: Publicar**

```bash
git remote add origin <repo>
git push -u origin main
```

No painel do Cloudflare Pages: conectar o repositório, *build command* vazio, *output directory* `/`, produção na branch `main`. Guardar a URL `*.pages.dev` de preview para revisão do dono.

- [ ] **Step 7: Verificação final** — `node --test tests/` (todos verdes), Lighthouse mobile ≥ 95 nas quatro categorias, soma dos bytes de `index.html` + CSS + JS + fontes + imagens ≤ 300 KB, e `node scripts/check-golive.mjs` (deve falhar até o WhatsApp chegar — isso é o comportamento correto).

- [ ] **Step 8: Commit** — `chore: portão de go-live, README e publicação`

---

## Ordem de execução e dependências

`1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9`.

As Tasks 7 e 8 podem rodar em paralelo com 4–6 (não tocam CSS), mas 7 altera `index.html`, então deve entrar depois de 3.

A Task 9 **não se completa** enquanto o WhatsApp não existir: o site fica em URL de preview, não indexada, e a Task 9 é retomada quando o número chegar. Isso é o portão definido na spec §14.
