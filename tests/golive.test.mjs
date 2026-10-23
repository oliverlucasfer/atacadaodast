import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = (arquivo) =>
  spawnSync(process.execPath, ["scripts/check-golive.mjs", arquivo], { encoding: "utf8" });

test("falha enquanto o WhatsApp estiver pendente", () => {
  const r = run("index.html");
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /whatsapp pendente/i);
});

test("passa quando o WhatsApp e o telephone entram", () => {
  const html = readFileSync("index.html", "utf8")
    .replaceAll(' data-pending="whatsapp"', "")
    .replaceAll('href="#"', 'href="https://wa.me/5577999999999"')
    .replace(
      '"sameAs"',
      '"telephone": "+55 77 99999-9999",\n  "sameAs"',
    );

  const dir = mkdtempSync(join(tmpdir(), "golive-"));
  const arquivo = join(dir, "index.html");
  writeFileSync(arquivo, html);

  const r = run(arquivo);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /pronto para publicar/i);
});
