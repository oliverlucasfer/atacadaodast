import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const root = process.cwd();
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  let path = decodeURIComponent(pathname);
  if (path.endsWith("/")) path += "index.html";

  const file = normalize(join(root, path));
  if (!file.startsWith(root + sep)) {
    res.writeHead(400, { "content-type": "text/plain" }).end("bad request");
    return;
  }

  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404");
  }
});

const port = Number(process.argv[2] ?? 8080);
server.listen(port, "127.0.0.1", () => {
  console.log(`http://127.0.0.1:${server.address().port}`);
});
