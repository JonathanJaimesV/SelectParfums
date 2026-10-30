// Servidor HTTP de simulación (con CORS) para probar el navegador contra el servidor de referencia. Solo desarrollo/pruebas.
import http from "node:http";
import { handle } from "./referenceBackend.mjs";

export function startMock(db, port, anonKey) {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, authorization, content-type, accept, prefer, x-client-info", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v]));
        const delay = db.faults?.mode === "slow" ? db.faults.delayMs : 0;
        setTimeout(() => {
          try {
            const r = handle(db, { method: req.method, url: req.url, headers, body: data }, anonKey);
            res.writeHead(r.status, { ...cors, "Content-Type": "application/json" }); res.end(r.raw ?? JSON.stringify(r.body));
          } catch { req.socket.destroy(); }          // "down": se corta la conexión (error de red real en el navegador)
        }, delay);
      } catch { res.writeHead(400, cors); res.end("{}"); }
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}
