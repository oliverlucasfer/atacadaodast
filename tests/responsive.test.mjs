import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("assets/css/styles.css", "utf8");
const inicio = css.indexOf("@media (max-width: 900px)");
const bloco = inicio === -1 ? "" : css.slice(inicio);

test("existe o breakpoint de 900px", () => {
  assert.ok(inicio > -1, "sem @media (max-width: 900px)");
});

test("no mobile o hero vira uma coluna", () => {
  assert.match(bloco, /\.hero-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test("no mobile o leque fica em uma linha de 72px e os rotulos somem", () => {
  assert.match(bloco, /\.deck\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*1fr\)/);
  assert.match(bloco, /\.deck\s*\{[^}]*height:\s*72px/);
  assert.match(bloco, /\.deck-labels\s*\{[^}]*display:\s*none/);
});

test("no mobile o cabecalho nao fica fixo", () => {
  assert.match(bloco, /\.bar\s*\{[^}]*position:\s*static/);
});

test("alvos de toque com no minimo 44px", () => {
  assert.match(bloco, /min-height:\s*44px/);
});

test("existe um layout proprio para tablet (901px a 1120px)", () => {
  const tablet = css.match(/@media \(min-width: 901px\) and \(max-width: 1120px\)/);
  assert.ok(tablet, "sem breakpoint de tablet");
  const inicioTablet = css.indexOf("@media (min-width: 901px) and (max-width: 1120px)");
  const corpo = css.slice(inicioTablet);
  assert.match(corpo, /\.hero-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(corpo, /\.hero-side\s*\{[^}]*max-width:\s*52ch/);
});
