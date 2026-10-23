import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("assets/css/tokens.css", "utf8");

const tokens = Object.fromEntries(
  [...css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)].map(([, name, hex]) => [name, hex.toUpperCase()]),
);

const lum = (hex) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const pair = (a, b) => {
  assert.ok(tokens[a], `token --${a} nao encontrado em tokens.css`);
  assert.ok(tokens[b], `token --${b} nao encontrado em tokens.css`);
  return ratio(tokens[a], tokens[b]);
};

test("texto principal passa AAA sobre o fundo", () => {
  assert.ok(pair("color-fg", "color-bg") >= 7);
});

test("titulos passam AAA sobre o fundo", () => {
  assert.ok(pair("color-heading", "color-bg") >= 7);
});

test("texto secundario passa AA sobre o fundo", () => {
  assert.ok(pair("color-muted", "color-bg") >= 4.5);
});

test("vermelho de texto pequeno passa AA sobre o fundo", () => {
  assert.ok(pair("color-accent-text", "color-bg") >= 4.5);
});

test("texto branco passa AA sobre o bloco escuro", () => {
  assert.ok(ratio("#FFFFFF", tokens["color-dark"]) >= 4.5);
});

test("texto branco passa AA sobre o azul-marinho", () => {
  assert.ok(ratio("#FFFFFF", tokens["color-heading"]) >= 4.5);
});

test("o vermelho da marca NAO passa AA para texto pequeno (por isso accent-text existe)", () => {
  assert.ok(pair("color-accent", "color-bg") < 4.5);
});
