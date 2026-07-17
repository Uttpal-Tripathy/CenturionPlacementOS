// One-command temporary public link for PlacementOS.
//
//   npm run share
//
// Starts the API server (if not already running), the static/proxy server (if not already
// running), then opens a Cloudflare "quick tunnel" (no account needed) pointed at the app and
// prints the public URL. Anyone with that URL can reach the app from anywhere while this stays
// running. This is deliberately temporary: closing this window (Ctrl+C) or letting the machine
// sleep tears the link down. There is no login on the API in this mode — treat the printed URL
// itself as the credential, and don't post it anywhere public.
//
// For a real permanent URL that works even when this machine is off, deploy sql-backend/ and
// the static files to a cloud host instead (see README-SHARE.md).
import { spawn } from "child_process";
import path from "path";
import net from "net";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLOUDFLARED = path.join(__dirname, "node_modules", "cloudflared", "bin", "cloudflared.exe");

const portOpen = (port) => new Promise((resolve) => {
  const sock = net.createConnection({ port, host: "localhost" });
  sock.once("connect", () => { sock.destroy(); resolve(true); });
  sock.once("error", () => resolve(false));
});

const spawnBg = (cmd, args, cwd, label) => {
  const p = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"], shell: false });
  p.stdout.on("data", (d) => process.stdout.write(`[${label}] ${d}`));
  p.stderr.on("data", (d) => process.stderr.write(`[${label}] ${d}`));
  return p;
};

const children = [];
process.on("SIGINT", () => { children.forEach((c) => c.kill()); process.exit(0); });

console.log("Checking local servers...");

if (!(await portOpen(4000))) {
  console.log("Starting API server (port 4000)...");
  children.push(spawnBg("node", ["server/server.js"], path.join(__dirname, "sql-backend"), "api"));
  await new Promise((r) => setTimeout(r, 2000));
} else {
  console.log("API server already running on port 4000.");
}

if (!(await portOpen(8080))) {
  console.log("Starting web server (port 8080)...");
  children.push(spawnBg("node", ["serve.mjs"], __dirname, "web"));
  await new Promise((r) => setTimeout(r, 1000));
} else {
  console.log("Web server already running on port 8080.");
}

console.log("Opening a public tunnel (Cloudflare quick tunnel, no account needed)...");
console.log("");
const tunnel = spawnBg(CLOUDFLARED, ["tunnel", "--url", "http://localhost:8080"], __dirname, "tunnel");
children.push(tunnel);

console.log("Press Ctrl+C to stop sharing and tear the link down.");
console.log("Reminder: no login on the API in this mode — don't post the URL anywhere public.");
