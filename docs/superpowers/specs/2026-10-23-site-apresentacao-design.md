# Site de apresentação — Atacadão das Tintas

**Data:** 2026-10-23
**Escopo:** uma página estática que funciona como cartão de visita digital da empresa.
**Status:** aguardando aprovação.

---

## 1. Intenção

O perfil `@atacadaodast` no Instagram não cumpre o papel de apresentação: bio ambígua, sem link,
sem endereço e sem caminho de contato, com a última publicação em janeiro de 2026. Quem chega lá
não consegue responder às três perguntas que trazem um cliente: *o que vocês vendem, onde ficam e
como eu falo com vocês*.

O site existe para responder essas três perguntas em menos de dez segundos, no celular, e levar a
pessoa ao WhatsApp com um toque. Ele será o link da bio e o endereço enviado por mensagem.

Não é uma loja. Não é um catálogo com preços. É um cartão de visita que não se perde.

## 2. Objetivos

1. Em até 2 rolagens de tela no celular, entregar: o que a loja vende, cidade, endereço, horário e contato.
2. Contato em um toque: botão de WhatsApp sempre visível, telefone clicável.
3. Identidade visual derivada da logo, sem "aspecto de IA" e sem template reconhecível.
4. Página com 0 KB de JavaScript obrigatório e orçamento total abaixo de 300 KB.
5. Custo de operação R$ 0 (hospedagem em plano gratuito, sem domínio próprio).
6. Manutenção por edição de código, sem CMS, sem build, sem dependências.

## 3. Não-objetivos

- Carrinho, checkout, pagamento ou integração com o e-commerce existente da marca homônima (empresa diferente).
- Login, área de cliente, blog, newsletter, formulário de contato (o WhatsApp é o canal).
- Múltiplas páginas, rotas, i18n.
- Analytics de terceiros, pixels de rastreamento, banner de cookies.
- Dark mode na primeira versão (ver §10).

## 4. Anti-objetivos

O projeto falha se:

- o site ficar mais pesado que o Instagram que o originou (referência: ~300 KB);
- precisar de `npm install` para publicar uma alteração de texto;
- o visitante precisar de mais de um toque para iniciar uma conversa;
- a página parecer um template genérico (hero centralizado, cards arredondados, gradiente, ícones de biblioteca);
- o horário exibido estiver errado ou ambíguo.

## 5. Restrições

- **Conteúdo vem do dono**, por edição de código. Decisão explícita: nada de painel de edição.
- **Sem domínio próprio** nesta fase: subdomínio gratuito do provedor.
- **Sem assets vetoriais:** a logo existe apenas em PNG raster (3534×861 px, fundo transparente) e CDR.
  Não há SVG, e não há Inkscape/ImageMagick no ambiente.
- **Sem fotos da loja ainda.** O layout precisa sobreviver sem elas e melhorar quando chegarem.
- Tempo de atenção do visitante: segundos, em 4G, no celular.

## 6. Abordagens consideradas

| # | Abordagem | O que ganha | O que perde | Veredito |
|---|---|---|---|---|
| 1 | HTML + CSS puro, sem build, sem dependências | Peso mínimo, zero manutenção de toolchain, editar e publicar | Sem componentes; mudanças estruturais são manuais | **Escolhida** |
| 2 | Gerador estático (Astro/11ty) | Componentes, otimização de imagem | `package.json`, build, dependências para manter em uma página só | Descartada: custo > ganho |
| 3 | Builder visual (Framer/Carrd) | Edição visual, rápido | Código de terceiros, dependência de plataforma, contraria "enxuto" | Descartada |

Sobre a direção visual, foram desenhadas três alternativas navegáveis (A · Balcão, B · Amostra,
H · Híbrido). A escolhida foi a **H**, por unir a legibilidade editorial da A com o leque de cores
da B — que é a tradução gráfica do símbolo da marca — sem escurecer a página inteira.

## 7. Decisões tomadas com o dono

- Ação principal: **WhatsApp**. Secundária: ver produtos.
- **Horário de funcionamento** é conteúdo de primeira ordem, não rodapé.
- Edição **via código** (sem CMS).
- Sem domínio próprio agora.
- Dark/light mode: **fase 2**, registrado em §10.
- O site é de uma empresa **diferente** da que opera `atacadaodastintas.com.br`.

## 8. Identidade visual

### 8.1 Cores (extraídas da logo)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F7F6F3` | fundo padrão (papel) |
| `--color-heading` | `#333468` | títulos, navy da marca (11,4:1 no fundo) |
| `--color-fg` | `#1F2033` | texto corrido |
| `--color-muted` | `#5A5B72` | texto secundário (6,2:1) |
| `--color-accent` | `#ED3237` | acento em texto ≥ 24 px, faixa espectral, elementos não textuais |
| `--color-accent-text` | `#C42B2F` | mesma família, para texto pequeno (5,1:1) — numeração de seção e "aberto agora" |
| `--color-dark` | `#282954` | bloco de CTA final |
| `--color-line` | `rgba(51,52,104,.16)` | fios de 1 px |
| `--spectrum-1..6` | `#ED3237` `#E9A13B` `#E8C43B` `#4C9A52` `#2387C7` `#703C94` | leque de cores |

Regras: o vermelho da marca `#ED3237` tem 4,1:1 e só pode aparecer em texto ≥ 24 px ou em elemento
não textual; abaixo disso usa-se `--color-accent-text`, imperceptivelmente mais escuro. Navy é a cor
de leitura; o leque aparece como faixa e como marcador de linha de produto, nunca em blocos grandes
de fundo.

### 8.2 Tipografia

- Títulos: **Archivo** 700/800 — grotesca industrial que ecoa o wordmark sem imitá-lo.
- Texto: **IBM Plex Sans** 400/600.
- Rótulos, números, horários: **IBM Plex Mono** 400.
- Auto-hospedadas em woff2, subset latino, `font-display: swap`, preload apenas na Archivo 800.
- Escala: 12 / 13 / 14.5 / 16 / 18 / 25 / 38 / 54 / 82 px (títulos com `clamp()`).

### 8.3 Componentes (sete, e nada além)

1. Botão sólido (navy) e fantasma (contorno 1,5 px).
2. Faixa espectral de 6 cores (hero) e marcador quadrado de 9 px (linhas de produto).
3. Seção com cabeçalho numerado (`01`, `02`, `03`) e fio inferior.
4. Linha de produto: número + marcador de cor + nome + descrição + etiqueta à direita.
5. Bloco de endereço/horário: tabela de horários com destaque do dia atual.
6. Bloco de CTA em navy, largura total.
7. Rodapé: logo pequena, CNPJ, Instagram.

### 8.4 Movimento

Apenas `:hover` e `:focus-visible` (deslocamento de 1 px no botão). Nenhuma animação de entrada,
nenhum parallax, nenhum carrossel. Respeitar `prefers-reduced-motion`.

## 9. Estrutura da página

Ordem fixa, uma página, âncoras `#produtos`, `#loja`, `#contato`.

1. **Cabeçalho** — símbolo isolado (28–34 px) + nome em texto ("Atacadão" em Archivo 700 e "DAS
   TINTAS" em mono 9 px espaçado), telefone clicável e botão de WhatsApp. Sticky no desktop,
   estático no mobile. O lockup completo não é usado aqui: abaixo de ~40 px de altura a linha
   "DAS TINTAS" fica ilegível. O lockup completo aparece no rodapé (≥ 22 px) e na imagem Open Graph.
2. **Hero assimétrico** — título em navy com a palavra "atacado" em vermelho, texto de apoio e CTAs
   à direita. Eyebrow com cidade/UF.
3. **Leque de cores** — 6 blocos, `gap: 2px`, 128 px de altura no desktop; 72 px em linha única no mobile.
   Rótulos em mono abaixo, ocultos no mobile.
4. **01 · O que você encontra** — 5 linhas (acrílicas, esmaltes/vernizes, texturas/massas,
   ferramentas, máquina de cores), cada uma com marcador na cor correspondente.
5. **02 · A loja** — endereço, tabela de horário com o dia atual destacado, contato; à direita, **cartão
   de mapa** com o ponto marcado e botão "Abrir no Maps" (sem foto da fachada: a fachada está em obra).
6. **03 · Contato** — bloco navy com CTA de WhatsApp.
7. **Rodapé** — logo, CNPJ, Instagram.

### 9.1 Conteúdo textual

Tom direto, sem superlativo de propaganda. Exemplos aprovados: "A cor que a sua obra pede.";
"Dúvida de quantidade ou de produto? A gente responde pelo WhatsApp."

**Regra do dono:** nenhuma menção a preço, valor, desconto ou condição comercial no texto do site.
"Atacado" permanece porque é o nome e o modelo de venda, não uma promessa de preço. Há teste cobrindo
isso (`tests/content.test.mjs`).

## 10. Dark mode (fase 2)

Fica fora da primeira versão, mas com a arquitetura preparada para entrar sem refatoração. Isto é o
que já está decidido e o que falta decidir.

### 10.1 O que a v1 já garante

- Todos os tokens são **semânticos** (`--color-bg`, `--color-fg`, `--color-heading`, `--color-line`),
  nunca literais (`--navy`) dentro dos componentes. Um bloco `@media (prefers-color-scheme: dark)` em
  `tokens.css` deve bastar para a versão automática — **0 KB de JS**.
- Nenhuma cor é aplicada por `style=""` no HTML; tudo passa por token.

### 10.2 O que falta decidir na fase 2

**Decidido:** tema **automático** (segue o sistema) **+ botão de alternar**, com a preferência salva em
`localStorage`. O toggle acrescenta **≤ 1,2 KB inline** (script no `<head>`, para evitar flash de tema),
somando **≤ 2,7 KB** ao teto de 1,5 KB de §11.8.

### 10.3 Paleta escura proposta (a validar)

| Token | Claro | Escuro |
|---|---|---|
| `--color-bg` | `#F7F6F3` | `#1B1C24` (navy profundo, não preto) |
| `--color-fg` | `#1F2033` | `#E8E7F0` |
| `--color-heading` | `#333468` | `#C9CAE6` (navy clareado — o navy puro desaparece) |
| `--color-accent` | `#ED3237` | `#FF5A5F` (vermelho clareado: o da marca dá 3,9:1 no escuro) |
| `--color-dark` (bloco CTA) | `#282954` | inverte para papel `#F7F6F3` com texto navy |
| leque | 6 matizes | mesmos 6 matizes |

### 10.4 Dois efeitos colaterais — decisão adiada para a implementação

Ficam documentados aqui com as opções e o custo de cada uma. **A escolha é do dono no momento da
implementação da fase 2**, não agora.

1. **Logo.** O wordmark é navy sobre transparente e desaparece no fundo escuro. Opções:
   (a) obter do dono o símbolo isolado + uma versão clara do wordmark — melhor resultado;
   (b) gerar a versão clara por filtro CSS sobre o PNG — resolve em minutos, mas achata o anel
   multicolorido se aplicado ao lockup inteiro (só funciona se aplicado ao wordmark recortado);
   (c) manter o cabeçalho claro no tema escuro — custo zero, resultado inconsistente.
   É o principal risco de qualidade da fase 2.
2. **Mapa.** A imagem de mapa clara vira um retângulo luminoso no meio da página escura. Opções:
   (a) moldura papel ao redor do mapa — custo zero, mantém a legibilidade do mapa;
   (b) gerar uma segunda imagem do mapa em estilo escuro — +50 KB e mais um asset para manter.

**Custo estimado da fase 2:** 2–3 h, incluindo conferência de contraste AA nos dois temas.

## 11. Técnico

### 11.1 Arquivos

```
atacadaodast/
├── index.html
├── assets/
│   ├── css/tokens.css
│   ├── css/styles.css
│   ├── logo/            (logo atual + símbolo isolado + favicon)
│   └── img/             (fotos, AVIF/WebP)
├── docs/superpowers/specs/
└── README.md            (onde fica cada texto, como publicar)
```

### 11.2 JavaScript

Nenhum obrigatório. Um único módulo `assets/js/hours.js` (ESM, ≤ 1,5 KB) marca o dia atual na tabela
de horários e exibe a etiqueta "aberto agora", considerando o fuso `America/Sao_Paulo`. Fica em arquivo
separado — e não inline — para que a lógica de horário seja testável por `node --test` sem duplicação.
O conteúdo deve estar correto **sem** ele.

A etiqueta precisa entender o **intervalo de almoço** (12h–14h de segunda a sexta): ao meio-dia o
site deve dizer "fechado — abre às 14h", não "aberto". Fora do almoço, "aberto até 18h" / "aberto
até 12h" no sábado.

Feriados não são calculados: a tabela sempre exibe "Feriados: fechado — confirme no WhatsApp" e a
etiqueta se limita a dias úteis e sábado, sem prometer abertura em feriado.

### 11.3 Fontes

Auto-hospedadas (4 arquivos, ~90 KB somados). Sem Google Fonts em produção: elimina requisição a
terceiros, evita CLS e não depende de disponibilidade externa.

### 11.4 Imagens

`<picture>` com AVIF + WebP, `width`/`height` explícitos, `loading="lazy"` fora da primeira dobra.
Fotos reais obrigatórias; nada de banco de imagens. Enquanto não existirem, usar bloco de
placeholder sóbrio — nunca ilustração genérica.

### 11.5 Mapa

No lugar da foto da fachada (a fachada está em reforma), a seção da loja traz um **cartão de mapa**:

- **Mapa estático** gerado uma vez a partir das tiles do OpenStreetMap e commitado como
  `assets/img/mapa.webp` (~40–60 KB, 1200×900). Sem iframe, sem JS, sem cookies de terceiros,
  sem requisição em tempo de execução.
- Atribuição obrigatória ao OpenStreetMap (ODbL) em legenda de 10 px.
- Ponto marcado com o pino do site e etiqueta com o endereço.
- Botão "Abrir no Maps" apontando para `https://www.google.com/maps/search/?api=1&query=...` — abre
  o app no celular, que é o comportamento que resolve a vida de quem está indo à loja.
- **Enquanto não houver endereço/coordenadas reais**, usar traçado esquemático em SVG inline (0 KB)
  no mesmo formato. Ambos ocupam a mesma caixa 4:3, então a troca é de uma linha.

### 11.6 SEO e compartilhamento

`lang="pt-BR"`, `<title>`, `meta description`, Open Graph + Twitter card com imagem 1200×630 gerada
a partir da logo, favicon em três tamanhos (16, 32 e 180 px) a partir do **anel chapado**, e
**JSON-LD `LocalBusiness`** com nome, endereço, telefone, `openingHoursSpecification`
e `sameAs` (Instagram). `robots.txt` liberando indexação.

### 11.7 Acessibilidade

- HTML semântico (`header`, `main`, `section`, `footer`, `address`), um `h1` só.
- Contraste AA em todo texto; vermelho restrito a textos ≥ 24 px ou elementos não textuais.
- `:focus-visible` visível em todos os interativos; skip link para o conteúdo.
- Alvos de toque ≥ 44×44 px.
- Tabela de horários como tabela real, com o dia atual indicado também em texto (não só em cor).

### 11.8 Performance (critérios de aceite)

| Métrica | Meta |
|---|---|
| Peso total da página | ≤ 300 KB |
| CSS | ≤ 14 KB (crítico inline) |
| JS | ≤ 1,5 KB em um arquivo, não obrigatório (a página funciona sem) |
| Peso da imagem da fachada | ≤ 120 KB (AVIF, 1200 px de largura) — o teto de 300 KB inclui as fotos |
| LCP em 4G simulado | ≤ 1,5 s |
| CLS | < 0,02 |
| Lighthouse (mobile) | ≥ 95 em Performance, Acessibilidade, Boas práticas e SEO |

### 11.9 Publicação

Repositório Git local + GitHub, conectado ao **Cloudflare Pages** (build command vazio, output `/`).
Push em `main` publica. HTTPS e CDN automáticos, endereço `atacadaodastintas.netlify.app`. Domínio próprio
depois é só apontar DNS — nenhuma mudança de código.

## 12. Dependências e pendências

| Item | Bloqueia | Observação |
|---|---|---|
| WhatsApp (DDD + número) | CTA principal | **pendente** — bloqueia o go-live |
| Coordenadas da loja | mapa estático | necessárias para gerar `mapa.webp`; até lá, SVG esquemático |
| Linhas de produto | conteúdo | dono vai detalhar; "máquina de cores" é suposição a confirmar |
| E-mail | rodapé | opcional, não informado |
| **Símbolo isolado da logo (PNG transparente)** | qualidade de favicon/OG | será recortado de `LOGO_AF.png` e simplificado para o favicon; um vetor do dono melhora o resultado |
| Fotos internas (equipe, estoque, obras) | qualidade visual, fase 2 | a fachada está em obra; o mapa ocupa esse lugar |
| Conta Cloudflare + repo GitHub | publicação | assume-se GitHub existente |

### Conteúdo confirmado

| Campo | Valor |
|---|---|
| Marca | Atacadão das Tintas |
| Cidade / bairro | Vitória da Conquista — BA · Centro |
| Endereço | Av. Presidente Dutra, 2237 — Centro, Vitória da Conquista / BA · CEP 45000-010 |
| CNPJ | 24.807.913/0001-82 |
| Instagram | https://www.instagram.com/atacadaodast/ |
| Horário | Seg–sex 08:00–12:00 e 14:00–18:00 · Sáb 08:00–12:00 · Dom e feriados fechado |
| Linhas de produto | tintas, materiais para pintura, texturas, bases (lista final a detalhar) |
| WhatsApp | **pendente** |

### Horário definido

Segunda a sexta: 08:00–12:00 e 14:00–18:00 · Sábado: 08:00–12:00 · Domingo e feriados: fechado.

## 13. O que fica a cargo de quem constrói

- Nomes de classes, organização interna do CSS, uso ou não de camadas `@layer`.
- Escolha do subset exato das fontes e da ferramenta de compressão de imagem.
- Textos definitivos de apoio, desde que respeitem o tom de §9.1.
- Geração da imagem Open Graph (1200×630) a partir da logo.
- Estrutura do `README.md` de manutenção.

## 14. Decisões do dono (resolvidas)

1. **Vai ao ar só com o conteúdo real.** Nada de NAP de exemplo em produção: sem telefone falso no
   ar e sem JSON-LD `LocalBusiness` apontando para endereço inexistente. Consequência para o plano:
   existe um **portão de go-live** — a construção termina quando o endereço, telefone, WhatsApp,
   CNPJ, Instagram e as linhas de produto reais estiverem preenchidos. Enquanto isso, o site roda
   localmente e pode ser publicado sob URL de preview do Cloudflare (que não é indexada).
2. **Desambiguar a homônima:** cidade e bairro entram no `<title>`, no `og:site_name` e no JSON-LD —
   "Atacadão das Tintas — {bairro}, {cidade}". O nome exibido na página continua sendo o da marca.
