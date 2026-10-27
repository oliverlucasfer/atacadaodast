import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";

const dims = (path) => {
  const b = readFileSync(path);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

const esperados = [
  ["assets/img/favicon-16.png", 16],
  ["assets/img/favicon-32.png", 32],
  ["assets/img/apple-touch-icon.png", 180],
  ["assets/img/og-1200x630.png", 1200],
];

for (const [arquivo, largura] of esperados) {
  test(`${arquivo} existe em ${largura}px`, () => {
    assert.ok(existsSync(arquivo), `${arquivo} nao existe`);
    const { w } = dims(arquivo);
    assert.equal(w, largura);
  });
}

test("og tem 630 de altura", () => {
  assert.equal(dims("assets/img/og-1200x630.png").h, 630);
});

test("simbolo recortado tem pelo menos 200px", () => {
  assert.ok(existsSync("assets/logo/simbolo.png"));
  assert.ok(dims("assets/logo/simbolo.png").w >= 200);
});

test("mapa.svg tem viewBox 600x450 e titulo", () => {
  const svg = readFileSync("assets/img/mapa.svg", "utf8");
  assert.match(svg, /viewBox="0 0 600 450"/);
  assert.match(svg, /<title[^>]*>./);
});

test("tres fontes woff2 somando no maximo 100 KB", () => {
  const arquivos = readdirSync("assets/fonts").filter((f) => f.endsWith(".woff2"));
  assert.equal(arquivos.length, 3, `encontrados: ${arquivos.join(", ")}`);
  for (const nome of ["archivo-800", "plex-sans-400", "plex-mono-400"]) {
    assert.ok(arquivos.includes(`${nome}.woff2`), `faltou ${nome}.woff2`);
  }
  const total = arquivos.reduce((s, f) => s + statSync(`assets/fonts/${f}`).size, 0);
  assert.ok(total <= 100 * 1024, `${total} bytes`);
});

test("nenhum peso 600 sem arquivo próprio (evita negrito falsificado)", () => {
  // Com apenas o 400 de Plex Sans, pedir 600 faz o navegador sintetizar o negrito.
  // Baixar o 600 custava 45 KB por uma unica linha da tabela; a enfase do dia
  // atual vem da cor e do marcador "· hoje". Se um dia o 600 for necessario,
  // baixe o arquivo, declare o @font-face e apague esta excecao.
  const pesos = [...readFileSync("assets/css/styles.css", "utf8").matchAll(/font-weight:\s*(\d+)/g)].map((m) => m[1]);
  assert.ok(!pesos.includes("600"), "peso 600 usado sem arquivo correspondente");
});

test("versoes leves das imagens cabem no orcamento", () => {
  assert.ok(statSync("assets/img/simbolo-96.png").size <= 25 * 1024);
  assert.ok(statSync("assets/img/logo-rodape.png").size <= 15 * 1024);
});

test("index.html faz preload apenas da Archivo 800", () => {
  const html = readFileSync("index.html", "utf8");
  const preloads = [...html.matchAll(/<link[^>]+rel="preload"[^>]*>/g)].map((m) => m[0]);
  assert.equal(preloads.length, 1);
  assert.match(preloads[0], /archivo-800\.woff2/);
});
