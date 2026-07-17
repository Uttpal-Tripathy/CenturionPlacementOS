// Minimal static file server for placementos.html, with a /api/* reverse proxy to the
// sql-backend API. This lets one tunnel/URL cover both the app and its data — a client's
// browser never needs to know the backend's real host, since it always calls its own origin.
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const API_TARGET = process.env.API_TARGET || "http://localhost:4000";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    const target = new URL(req.url, API_TARGET);
    const proxyReq = http.request(target, { method: req.method, headers: { ...req.headers, host: target.host } }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on("error", (e) => { res.writeHead(502); res.end("Bad gateway: " + e.message); });
    req.pipe(proxyReq);
    return;
  }
  let file = decodeURIComponent(req.url.split("?")[0]);
  if (file === "/") file = "/placementos.html";
  const full = path.join(__dirname, file);
  if (!full.startsWith(__dirname)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(full)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Serving ${__dirname} on http://localhost:${PORT} (API proxied to ${API_TARGET})`));
