// check-golive.mjs -- portao de publicacao.
// Uso: node scripts/check-golive.mjs [index.html]
// Sai com 0 somente quando nao existe nenhuma pendencia.
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const arquivo = process.argv[2] ?? "index.html";
const html = readFileSync(arquivo, "utf8");
const problemas = [];

if (html.includes('data-pending="whatsapp"')) {
  problemas.push("whatsapp pendente: o CTA ainda aponta para lugar nenhum");
}

if (/0000-0000|90000|Exemplo/.test(html)) {
  problemas.push("sobrou dado de exemplo (telefone, endereco ou 'Exemplo') no HTML");
}

const linksWa = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map((m) => m[1]);
if (linksWa.length === 0) {
  problemas.push("nenhum link wa.me encontrado");
}
for (const link of linksWa) {
  if (!/^https:\/\/wa\.me\/55\d{10,11}$/.test(link)) {
    problemas.push(`link de WhatsApp em formato inesperado: ${link}`);
  }
}

// todo CTA que promete WhatsApp precisa abrir o WhatsApp — nao um scroll interno
for (const m of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
  const texto = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!/whatsapp|or[çc]amento/i.test(texto)) continue;
  const href = m[0].match(/href="([^"]*)"/)?.[1] ?? "";
  if (!/^https:\/\/wa\.me\/55\d{10,11}$/.test(href)) {
    problemas.push(`o CTA "${texto}" promete WhatsApp mas aponta para "${href || "lugar nenhum"}"`);
  }
}

const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
if (!ld) {
  problemas.push("sem JSON-LD");
} else {
  let dados;
  try {
    dados = JSON.parse(ld);
  } catch {
    problemas.push("JSON-LD invalido");
  }
  if (dados && linksWa.length > 0 && !dados.telephone) {
    problemas.push("JSON-LD sem telephone, mas o WhatsApp ja existe");
  }
}

const raiz = process.cwd();
const refs = [
  ...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g),
  ...html.matchAll(/url\("\.\.\/([^"]+)"\)/g),
].map((m) => resolve(raiz, m[1]));

for (const alvo of new Set(refs)) {
  if (!existsSync(alvo)) problemas.push(`arquivo referenciado nao existe: ${alvo.replace(raiz, "")}`);
}

const css = `${dirname(arquivo)}/assets/css/tokens.css`;
if (existsSync(css)) {
  for (const [, ref] of readFileSync(css, "utf8").matchAll(/url\("\.\.\/([^"]+)"\)/g)) {
    const alvo = resolve(raiz, "assets", ref);
    if (!existsSync(alvo)) problemas.push(`fonte referenciada nao existe: ${alvo.replace(raiz, "")}`);
  }
}

if (problemas.length) {
  console.error("NAO publicar:");
  for (const p of problemas) console.error(` - ${p}`);
  process.exit(1);
}

console.log("pronto para publicar: sem pendencias");
