// Mock server: serves chrome-extension/ with a chrome.* API shim injected into each page.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXT = path.resolve(process.env.EXT_DIR || path.join(HERE, "../chrome-extension"));
const PORT = Number(process.env.PORT || 3100);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };

function send(res, file, transform) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(transform ? transform(buf.toString()) : buf);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/__mock/index.html";
  if (p.startsWith("/__mock/")) return send(res, path.join(HERE, p.slice(8)));
  if (p.startsWith("/ext/")) {
    const file = path.join(EXT, path.normalize(p.slice(5)));
    if (!file.startsWith(EXT)) { res.writeHead(403); return res.end(); }
    const inject = file.endsWith(".html")
      ? (s) => s.replace(/<head>/i, '<head><script src="/__mock/shim.js"></script>')
      : null;
    return send(res, file, inject);
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`QuickLens mock on http://localhost:${PORT}`));
