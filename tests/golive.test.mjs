import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = (arquivo) =>
  spawnSync(process.execPath, ["scripts/check-golive.mjs", arquivo], { encoding: "utf8" });

// O portao e testado com fixtures proprios: o estado do `index.html` real muda
// quando o WhatsApp chega, e o teste nao pode depender disso.
const comArquivo = (html) => {
  const dir = mkdtempSync(join(tmpdir(), "golive-"));
  const arquivo = join(dir, "index.html");
  writeFileSync(arquivo, html);
  return run(arquivo);
};

const PENDENTE = `<!doctype html><html lang="pt-BR"><body>
<a class="btn" href="#contato" data-pending="whatsapp">Falar no WhatsApp</a>
</body></html>`;

const PRONTO = `<!doctype html><html lang="pt-BR"><body>
<a class="btn" href="https://wa.me/5577988380528">Falar no WhatsApp</a>
<script type="application/ld+json">{"@type":"HardwareStore","name":"Atacadão das Tintas","telephone":"+55 77 98838-0528"}</script>
</body></html>`;

test("falha enquanto o WhatsApp estiver pendente", () => {
  const r = comArquivo(PENDENTE);
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /whatsapp pendente/i);
});

test("passa quando o WhatsApp e o telephone entram", () => {
  const r = comArquivo(PRONTO);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /pronto para publicar/i);
});

test("o index.html de producao esta pronto para publicar", () => {
  const r = run("index.html");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /pronto para publicar/i);
});
