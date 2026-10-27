import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { statusFor, marcarDiaAtual } from "../assets/js/hours.js";

const em = (iso) => new Date(iso);

test("terca 10h: aberto ate o meio-dia", () => {
  assert.equal(statusFor(em("2026-10-27T10:00:00-03:00")), "Aberto agora · fecha às 12h");
});

test("terca 12:00 em ponto: fechado para o almoco", () => {
  assert.equal(statusFor(em("2026-10-27T12:00:00-03:00")), "Fechado · abre às 14h");
});

test("terca 13:59: ainda no almoco", () => {
  assert.equal(statusFor(em("2026-10-27T13:59:00-03:00")), "Fechado · abre às 14h");
});

test("terca 14:00: reabre a tarde", () => {
  assert.equal(statusFor(em("2026-10-27T14:00:00-03:00")), "Aberto agora · fecha às 18h");
});

test("terca 18:00 em ponto: fechado", () => {
  assert.equal(statusFor(em("2026-10-27T18:00:00-03:00")), "Fechado · abre amanhã às 8h");
});

test("terca 7h: antes de abrir", () => {
  assert.equal(statusFor(em("2026-10-27T07:00:00-03:00")), "Fechado · abre às 8h");
});

test("sexta 19h: proxima abertura e sabado", () => {
  assert.equal(statusFor(em("2026-10-30T19:00:00-03:00")), "Fechado · abre amanhã às 8h");
});

test("sabado 11h: aberto ate meio-dia", () => {
  assert.equal(statusFor(em("2026-10-31T11:00:00-03:00")), "Aberto agora · fecha às 12h");
});

test("sabado 12:30: proxima abertura e segunda", () => {
  assert.equal(statusFor(em("2026-10-31T12:30:00-03:00")), "Fechado · abre segunda às 8h");
});

test("domingo: fechado o dia inteiro", () => {
  assert.equal(statusFor(em("2026-11-01T10:00:00-03:00")), "Fechado · abre segunda às 8h");
});

test("fuso do visitante nao interfere: 22h em Toquio = 10h em Sao Paulo", () => {
  assert.equal(statusFor(em("2026-10-27T22:00:00+09:00")), "Aberto agora · fecha às 12h");
});

test("marcarDiaAtual usa ISO (domingo = 7)", () => {
  assert.equal(marcarDiaAtual(em("2026-11-01T10:00:00-03:00")), 7);
  assert.equal(marcarDiaAtual(em("2026-10-31T10:00:00-03:00")), 6);
});

test("o modulo cabe no orcamento de 1,5 KB", () => {
  assert.ok(statSync("assets/js/hours.js").size <= 1536);
});

test("a linha do dia atual e marcada para tecnologia assistiva", () => {
  // O destaque visual depende do CSS; aqui garantimos que o dia de hoje tambem
  // chega ao leitor de tela como dado, nao como informacao so visual (§11.7).
  const js = readFileSync("assets/js/hours.js", "utf8");
  assert.match(js, /setAttribute\("aria-current",\s*"date"\)/);
});
