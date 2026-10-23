import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 8123;
const base = `http://127.0.0.1:${PORT}`;

test("serve.mjs serve HTML, PNG e responde 404", async (t) => {
  const proc = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { stdio: "ignore" });
  t.after(() => proc.kill());
  await delay(700);

  const html = await fetch(`${base}/mockups/hibrido.html`);
  assert.equal(html.status, 200);
  assert.match(html.headers.get("content-type"), /text\/html/);

  const png = await fetch(`${base}/assets/logo/LOGO_AF.png`);
  assert.equal(png.status, 200);
  assert.equal(png.headers.get("content-type"), "image/png");

  const missing = await fetch(`${base}/nao-existe.html`);
  assert.equal(missing.status, 404);

  const traversal = await fetch(`${base}/../package.json`);
  assert.ok([400, 404].includes(traversal.status), `esperado 400/404, veio ${traversal.status}`);
});
