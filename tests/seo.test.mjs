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
  const SITE = "https://atacadaodastintas.pages.dev";
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], `${SITE}/`);
  assert.equal(meta("og:url"), `${SITE}/`);
  assert.equal(meta("og:image"), `${SITE}/assets/img/og-1200x630.png`);
  assert.equal(meta("twitter:image"), `${SITE}/assets/img/og-1200x630.png`);

  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.url, `${SITE}/`);
  assert.equal(ld.image, `${SITE}/assets/img/og-1200x630.png`);

  assert.ok(!html.includes("atacadaodast.pages.dev"), "sobrou o endereco antigo no HTML");
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

test("robots.txt libera indexacao", () => {
  assert.ok(existsSync("robots.txt"));
  const txt = readFileSync("robots.txt", "utf8");
  assert.match(txt, /User-agent:\s*\*/);
  assert.match(txt, /Allow:\s*\//);
});
