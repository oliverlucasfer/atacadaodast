import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const meta = (nome) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)="${nome}"[^>]+content="([^"]*)"`))?.[1];

test("titulo diferencia a marca pela cidade", () => {
  assert.equal(
    html.match(/<title>([^<]+)<\/title>/)?.[1],
    "Atacadão das Tintas — Centro, Vitória da Conquista / BA",
  );
});

test("description entre 120 e 158 caracteres", () => {
  const d = meta("description") ?? "";
  assert.ok(d.length >= 120 && d.length <= 158, `${d.length} caracteres: ${d}`);
});

test("Open Graph completo com imagem absoluta", () => {
  assert.equal(meta("og:type"), "website");
  assert.ok(meta("og:title"));
  assert.ok(meta("og:description"));
  assert.equal(meta("og:locale"), "pt_BR");
  assert.ok(meta("twitter:card"));
});

test("todas as URLs absolutas usam o dominio publicado", () => {
  const SITE = "https://atacadaodastintas.netlify.app";
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], `${SITE}/`);
  assert.equal(meta("og:url"), `${SITE}/`);
  assert.equal(meta("og:image"), `${SITE}/assets/img/og-1200x630.png`);
  assert.equal(meta("twitter:image"), `${SITE}/assets/img/og-1200x630.png`);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.url, `${SITE}/`);
  assert.equal(ld.image, `${SITE}/assets/img/og-1200x630.png`);

  assert.ok(!html.includes("atacadaodastintas.pages.dev"), "sobrou o endereco antigo no HTML");
  assert.ok(!html.includes("workers.dev"), "sobrou endereco de workers no HTML");
});

test("JSON-LD LocalBusiness valido e com o telefone real", () => {
  const bruto = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(bruto, "sem JSON-LD");
  const ld = JSON.parse(bruto);
  assert.equal(ld["@context"], "https://schema.org");
  assert.equal(ld["@type"], "HardwareStore");
  assert.equal(ld.name, "Atacadão das Tintas");
  assert.equal(ld.address["@type"], "PostalAddress");
  assert.equal(ld.address.streetAddress, "Av. Presidente Dutra, 2237 — Centro");
  assert.equal(ld.address.addressLocality, "Vitória da Conquista");
  assert.equal(ld.address.addressRegion, "BA");
  assert.equal(ld.address.postalCode, "45000-010");
  assert.deepEqual(ld.sameAs, ["https://www.instagram.com/atacadaodast/"]);
  assert.equal(ld.telephone, "+55 77 98838-0528");
  assert.ok(!("geo" in ld), "geo sem coordenadas verificadas");
  assert.equal(ld.openingHoursSpecification.length, 3);
});

test("a tag de verificacao do Search Console esta no head", () => {
  // Nao remover: o Google recheca a propriedade periodicamente.
  assert.match(
    html,
    /<meta name="google-site-verification" content="SzkHpNEaigz8Da1lZLpRu8ZPuYipW_GLKUeQfuF9Fug"\s*\/?>/,
  );
});

test("a tag de verificacao do Bing esta no head", () => {
  // Nao remover: o Bing recheca a propriedade periodicamente.
  assert.match(html, /<meta name="msvalidate\.01" content="31C689AA9D3E0335439464A3CF7A7111"\s*\/?>/);
});

test("sitemap.xml lista a home e o robots aponta para ele", () => {
  assert.ok(existsSync("sitemap.xml"), "falta sitemap.xml");
  const xml = readFileSync("sitemap.xml", "utf8");
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ["https://atacadaodastintas.netlify.app/"]);
  assert.match(xml, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);

  const robots = readFileSync("robots.txt", "utf8");
  assert.match(robots, /^Sitemap: https:\/\/atacadaodastintas\.netlify\.app\/sitemap\.xml$/m);
});

test("robots.txt libera indexacao", () => {
  assert.ok(existsSync("robots.txt"));
  const txt = readFileSync("robots.txt", "utf8");
  assert.match(txt, /User-agent:\s*\*/);
  assert.match(txt, /Allow:\s*\//);
});

test("_redirects forca o bloqueio das pastas internas", () => {
  // Sem o "!" o Netlify serve o arquivo (200) em vez de redirecionar, porque
  // arquivo existente tem precedencia sobre a regra.
  const linhas = readFileSync("_redirects", "utf8").split("\n");
  for (const pasta of ["mockups", "docs", "tests", "scripts"]) {
    const regra = linhas.find((l) => l.trim().startsWith(`/${pasta}/*`));
    assert.ok(regra, `sem regra para /${pasta}/`);
    assert.match(regra.trim(), /302!$/, `regra de /${pasta}/ sem "!" — o Netlify serve o arquivo`);
  }
});
