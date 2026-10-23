import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const css = readFileSync("assets/css/styles.css", "utf8");

test("nenhuma cor literal no CSS (tudo por token)", () => {
  const hexes = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  assert.deepEqual(hexes, [], `hex encontrados: ${hexes.join(", ")}`);
});

test("CSS cabe no orcamento de 14 KB", () => {
  assert.ok(statSync("assets/css/styles.css").size <= 14 * 1024);
});

test("sem dependencia externa nem @import", () => {
  assert.ok(!/@import/.test(css));
  assert.ok(!/url\(\s*['"]?https?:/.test(css));
  assert.ok(!/fonts\.(googleapis|gstatic)/.test(css));
});

test("classes estruturais existem", () => {
  for (const sel of [".linha-produto", ".horarios", ".skip", ".deck", ".mapcard"]) {
    assert.ok(css.includes(sel), `faltou ${sel}`);
  }
});

test("skip link fica fora da tela ate receber foco", () => {
  assert.match(css, /\.skip\s*\{[^}]*position:\s*absolute/);
  assert.match(css, /\.skip:focus[^{]*\{[^}]*left:\s*1rem/);
});
