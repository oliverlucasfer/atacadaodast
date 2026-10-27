import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");

const ENDERECO = "Av. Presidente Dutra, 2237 - Centro, Vitória da Conquista - BA, 45000-010";

test("idioma pt-BR e exatamente um h1", () => {
  assert.match(html, /<html[^>]+lang="pt-BR"/);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
});

test("conteudo real da loja esta na pagina", () => {
  for (const trecho of [
    "Av. Presidente Dutra, 2237",
    "45000-010",
    "Vitória da Conquista",
    "24.807.913/0001-82",
    "instagram.com/atacadaodast",
  ]) {
    assert.ok(html.includes(trecho), `faltou: ${trecho}`);
  }
});

test("tabela de horarios traz almoco, sabado e domingo", () => {
  assert.match(html, /<table[^>]+class="horarios"/);
  assert.match(html, /<caption/);
  assert.ok(html.includes("08:00–12:00 · 14:00–18:00"), "sem os dois turnos de seg-sex");
  assert.ok(html.includes("08:00–12:00"), "sem o sabado");
  assert.ok(html.includes("Fechado"), "sem o domingo fechado");
  assert.match(html, /data-dias="1,2,3,4,5"/);
  assert.match(html, /data-dias="6"/);
  assert.match(html, /data-dias="0"/);
});

test("link de rota aponta para o endereco completo", () => {
  const esperado = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO)}`;
  const href = html.match(/href="(https:\/\/www\.google\.com\/maps\/search\/\?[^"]+)"/)?.[1]
    ?.replaceAll("&amp;", "&");
  assert.equal(href, esperado);
});

test("nenhum telefone inventado na pagina", () => {
  assert.ok(!/9000-0000|90000-0000/.test(html));
});

test("telefone real clicavel no cabecalho e no bloco de contato", () => {
  const tels = [...html.matchAll(/href="(tel:[^"]+)"/g)].map((m) => m[1]);
  assert.ok(tels.length >= 2, `esperava o telefone em dois lugares, achei ${tels.length}`);
  for (const t of tels) assert.equal(t, "tel:+5577988380528", `telefone inesperado: ${t}`);
});

test("toda imagem tem alt, width e height", () => {
  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(imgs.length >= 2, "esperava logo no rodape e o mapa");
  for (const img of imgs) {
    assert.match(img, /\balt="[^"]*"/, `sem alt: ${img}`);
    assert.match(img, /\bwidth="\d+"/, `sem width: ${img}`);
    assert.match(img, /\bheight="\d+"/, `sem height: ${img}`);
  }
});

test("a marca no rodape tem alt descritivo (nao decorativo)", () => {
  const rodape = html.match(/<img[^>]+logo-rodape\.png[^>]*>/)?.[0] ?? "";
  assert.match(rodape, /alt="Atacadão das Tintas"/);
});

test("estrutura: skip link, main e ancoras", () => {
  assert.match(html, /<a class="skip" href="#produtos"/);
  assert.match(html, /<main id="produtos"/);
  for (const alvo of ["produtos", "loja", "contato"]) {
    assert.ok(html.includes(`id="${alvo}"`), `faltou a ancora #${alvo}`);
  }
});

test("os tres CTAs abrem o WhatsApp real e o status de horario existe", () => {
  assert.ok(!html.includes('data-pending="whatsapp"'), "sobrou pendencia de WhatsApp");
  const links = html.match(/href="https:\/\/wa\.me\/5577988380528"/g) ?? [];
  assert.equal(links.length, 3, "esperava cabecalho, hero e CTA final no numero real");
  assert.ok(!/href="#(contato)?"[^>]*>[^<]*(WhatsApp|or[çc]amento)/i.test(html), "CTA de WhatsApp ainda rola para dentro da pagina");
  assert.match(html, /data-status-horario/);
});

test("as cinco linhas sao as confirmadas pelo dono", () => {
  const titulos = [...html.matchAll(/<article class="linha-produto">[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  assert.deepEqual(titulos, [
    "Tintas",
    "Máquina de cores",
    "Texturas e massas",
    "Bases e preparação",
    "Materiais para pintura",
  ]);
});

test("nenhuma linha promete o que a loja nao vende", () => {
  // Confirmado pelo dono: nao vende ferramentas (escada, espadula, desempenadeira),
  // EPI nem misturador. Spray e thinner continuam.
  const texto = html.toLowerCase();
  for (const item of ["ferramentas", "epi", "misturador", "escada", "espátula", "desempenadeira"]) {
    assert.ok(!texto.includes(item), `sobrou promessa de: ${item}`);
  }
  for (const item of ["spray", "thinner"]) {
    assert.ok(texto.includes(item), `faltou: ${item}`);
  }
});

test("maquina de cores e entrega aparecem, sem condicao comercial", () => {
  assert.match(html, /Máquina de cores/);
  assert.match(html, /Entrega em Vitória da Conquista e região/);
  assert.ok(!/gr[áa]tis|frete|cobra|R\$/i.test(html), "entrega nao pode virar promessa de preco ou frete");
});

test("o hero se apresenta como loja de tintas", () => {
  const eyebrow = html.match(/<p class="eyebrow">([^<]+)<\/p>/)?.[1] ?? "";
  assert.match(eyebrow, /Loja de tintas/);
  assert.ok(!/atacado/i.test(eyebrow), "o dono pediu para tirar 'atacado' do hero");
});

test("nenhuma mencao a preco no texto da pagina", () => {
  assert.ok(!/pre[çc]o/i.test(html), "sobrou mencao a preco");
  assert.ok(!/R\$/.test(html), "sobrou valor em reais");
});

test("nome da marca fica em um bloco unico ao lado do simbolo", () => {
  assert.match(html, /<span class="marca-texto">/);
  assert.match(html, /<span class="marca-texto">\s*<span class="marca-nome">Atacadão<\/span>/);
});
