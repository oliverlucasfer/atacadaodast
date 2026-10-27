import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, writeFileSync, mkdtempSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const css = readFileSync("assets/css/styles.css", "utf8");
const html = readFileSync("index.html", "utf8");

const regra = (seletor) => {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escapado}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
};

// --- 1. mapa cortado no mobile ---
test("a imagem do mapa escala sem cortar o desenho", () => {
  assert.match(regra(".mapcard img"), /width:\s*100%/);
  assert.match(regra(".mapcard img"), /height:\s*auto/);
});

// --- 2. alvos de toque por seletor (o teste anterior so procurava a string) ---
for (const alvo of [".mapbtn", ".contato-linha a", ".foot a", ".marca-link"]) {
  test(`alvo de toque de 44px em ${alvo}`, () => {
    const corpo = regra(alvo);
    const altura = corpo.match(/min-height:\s*(\d+)px/)?.[1];
    assert.ok(altura && Number(altura) >= 44, `min-height em ${alvo}: ${altura ?? "ausente"}`);
  });
}

// --- 3. mockups e docs nao podem ir ao ar ---
test("_redirects esconde mockups, docs, tests e scripts", () => {
  assert.ok(existsSync("_redirects"), "sem _redirects");
  const regras = readFileSync("_redirects", "utf8");
  for (const pasta of ["mockups", "docs", "tests", "scripts"]) {
    assert.match(regras, new RegExp(`^/${pasta}/\\*`, "m"), `sem regra para /${pasta}/`);
  }
});

test("robots.txt desindexa as pastas internas", () => {
  const txt = readFileSync("robots.txt", "utf8");
  for (const pasta of ["mockups", "docs", "tests", "scripts"]) {
    assert.match(txt, new RegExp(`Disallow:\\s*/${pasta}/`), `sem Disallow /${pasta}/`);
  }
});

// --- 4. o portao precisa exigir WhatsApp em TODO CTA que promete WhatsApp ---
test("portao falha se um CTA de WhatsApp apontar para outro lugar", () => {
  const htmlFake = `<!doctype html><html lang="pt-BR"><body>
    <a class="btn" href="https://wa.me/5577999999999">WhatsApp da loja</a>
    <a class="btn" href="#contato">Falar no WhatsApp</a>
    <script type="application/ld+json">{"name":"x","telephone":"+55 77 99999-9999","address":{"@type":"PostalAddress","streetAddress":"Av. Presidente Dutra, 2237 — Centro"}}</script>
  </body></html>`;

  const dir = mkdtempSync(join(tmpdir(), "golive-"));
  const arquivo = join(dir, "index.html");
  try {
    writeFileSync(arquivo, htmlFake);
    const r = spawnSync(process.execPath, ["scripts/check-golive.mjs", arquivo], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    assert.equal(r.status, 1, "o portao aceitou um CTA de WhatsApp sem wa.me");
    assert.match(r.stdout + r.stderr, /promete WhatsApp/i);
  } finally {
    unlinkSync(arquivo);
  }
});

// --- 5. movimento reduzido (spec 8.4) ---
test("respeita prefers-reduced-motion", () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

// --- 6. lockup do rodape no tamanho minimo da spec (22px) ---
test("logo do rodape tem 22px de altura", () => {
  assert.match(regra(".foot img"), /height:\s*22px/);
});

// --- 7. foco visivel sobre o bloco escuro ---
test("foco sobre o bloco navy usa cor clara", () => {
  assert.match(regra(".cta :focus-visible"), /outline:\s*2px solid var\(--color-on-dark\)/);
});

// --- 8. imagens abaixo da dobra preguiçosas (spec 11.4) ---
test("imagens abaixo da dobra usam loading=lazy", () => {
  const mapa = html.match(/<img[^>]+mapa\.svg[^>]*>/)?.[0] ?? "";
  const rodape = html.match(/<img[^>]+logo-rodape\.png[^>]*>/)?.[0] ?? "";
  assert.match(mapa, /loading="lazy"/);
  assert.match(rodape, /loading="lazy"/);
});

// --- 9. skip link move o foco de verdade ---
test("main aceita foco para o skip link", () => {
  assert.match(html, /<main id="produtos"[^>]*tabindex="-1"/);
});

// --- 10. bairro no JSON-LD (spec 14.2) ---
test("JSON-LD traz o bairro junto do logradouro", () => {
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.match(ld.address.streetAddress, /Centro/);
});

// --- 11. coerencia de horario entre HTML, JSON-LD e JS ---
test("horario coerente entre tabela, JSON-LD e hours.js", () => {
  const js = readFileSync("assets/js/hours.js", "utf8");
  assert.match(js, /ABRE\s*=\s*480/);
  assert.match(js, /MEIO\s*=\s*720/);
  assert.match(js, /TARDE\s*=\s*840/);
  assert.match(js, /FECHA\s*=\s*1080/);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const janelas = ld.openingHoursSpecification.map((h) => `${h.opens}-${h.closes}`);
  assert.deepEqual(janelas, ["08:00-12:00", "14:00-18:00", "08:00-12:00"]);

  assert.ok(html.includes("08:00–12:00 · 14:00–18:00"), "tabela diverge do JSON-LD");
  assert.ok(html.includes("08:00–12:00"), "tabela sem o sabado");
});
