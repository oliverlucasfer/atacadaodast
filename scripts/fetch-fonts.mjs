// Baixa as 4 fontes (subset latin, woff2) do Google Fonts para assets/fonts/.
// Roda uma vez, em desenvolvimento. O site publicado nao fala com o Google.
import { writeFile, mkdir } from "node:fs/promises";

const URL_CSS =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400&display=swap";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const ALVOS = [
  { familia: "Archivo", peso: "800", arquivo: "archivo-800.woff2" },
  { familia: "IBM Plex Sans", peso: "400", arquivo: "plex-sans-400.woff2" },
  { familia: "IBM Plex Sans", peso: "600", arquivo: "plex-sans-600.woff2" },
  { familia: "IBM Plex Mono", peso: "400", arquivo: "plex-mono-400.woff2" },
];

const css = await (await fetch(URL_CSS, { headers: { "user-agent": UA } })).text();

const blocos = css
  .split("@font-face")
  .slice(1)
  .map((trecho) => ({
    familia: trecho.match(/font-family:\s*'([^']+)'/)?.[1],
    peso: trecho.match(/font-weight:\s*(\d+)/)?.[1],
    url: trecho.match(/url\((https:[^)]+\.woff2)\)/)?.[1],
    latin: /U\+0000-00FF/.test(trecho),
  }));

await mkdir("assets/fonts", { recursive: true });

for (const alvo of ALVOS) {
  const bloco = blocos.find((b) => b.familia === alvo.familia && b.peso === alvo.peso && b.latin);
  if (!bloco) throw new Error(`nao encontrei ${alvo.familia} ${alvo.peso} (latin)`);
  const bytes = Buffer.from(await (await fetch(bloco.url)).arrayBuffer());
  await writeFile(`assets/fonts/${alvo.arquivo}`, bytes);
  console.log(`${alvo.arquivo}: ${(bytes.length / 1024).toFixed(1)} KB`);
}
