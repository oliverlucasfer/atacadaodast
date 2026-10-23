const TZ = "America/Sao_Paulo";
const ABRE = 480, MEIO = 720, TARDE = 840, FECHA = 1080;
const DIA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

const agora = (date = new Date()) => {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { dia: DIA[p.weekday], m: +p.hour * 60 + +p.minute };
};

export function statusFor(date = new Date()) {
  const { dia, m } = agora(date);
  const util = dia >= 1 && dia <= 5;
  const abre = util || dia === 6;
  if (abre && m >= ABRE && m < MEIO) return "Aberto agora · fecha às 12h";
  if (util && m >= TARDE && m < FECHA) return "Aberto agora · fecha às 18h";
  if (util && m >= MEIO && m < TARDE) return "Fechado · abre às 14h";
  if (abre && m < ABRE) return "Fechado · abre às 8h";
  return util ? "Fechado · abre amanhã às 8h" : "Fechado · abre segunda às 8h";
}

export const marcarDiaAtual = (date = new Date()) => ((agora(date).dia + 6) % 7) + 1;

if (typeof document !== "undefined") {
  const alvo = document.querySelector("[data-status-horario]");
  if (alvo) alvo.textContent = statusFor();
  const hoje = marcarDiaAtual() % 7;
  for (const tr of document.querySelectorAll("[data-dias]")) {
    tr.classList.toggle("hoje", tr.dataset.dias.split(",").map(Number).includes(hoje));
  }
}
