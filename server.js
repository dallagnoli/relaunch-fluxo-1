const http = require("http");
const { Pool } = require("pg");
const port = 3000; // fluxo 3c: porta fixa, ignora PORT
const version = process.env.APP_VERSION || "v1";
if (!process.env.CHAVE_DA_API) { console.error("faltou a variável CHAVE_DA_API"); process.exit(1); }
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const net = require("net");
// Fluxo 6: um contador no Redis pela rede privada, falando RESP direto (sem dependência).
function redisIncr() {
  return new Promise((resolve, reject) => {
    if (!process.env.REDIS_URL) return resolve(null);
    const url = new URL(process.env.REDIS_URL);
    const command = (...args) => `*${args.length}\r\n` + args.map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`).join("");
    const socket = net.connect(Number(url.port || 6379), url.hostname);
    let out = "";
    socket.setTimeout(3000, () => { socket.destroy(); reject(new Error("redis não respondeu")); });
    socket.on("connect", () => {
      const auth = url.password ? (url.username ? command("AUTH", decodeURIComponent(url.username), decodeURIComponent(url.password)) : command("AUTH", decodeURIComponent(url.password))) : "";
      socket.write(auth + command("INCR", "fluxo6"));
    });
    socket.on("data", (chunk) => {
      out += chunk;
      const value = out.split("\r\n").find((line) => line.startsWith(":"));
      const error = out.split("\r\n").find((line) => line.startsWith("-"));
      if (error) { socket.destroy(); reject(new Error(error.slice(1))); }
      else if (value) { socket.end(); resolve(Number(value.slice(1))); }
    });
    socket.on("error", reject);
  });
}
http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  try {
    if (req.url === "/health") { await pool.query("SELECT 1"); res.writeHead(200); return res.end("ok"); }
    await pool.query("INSERT INTO visits DEFAULT VALUES");
    const { rows } = await pool.query("SELECT count(*)::int AS total FROM visitas"); // fluxo 8: regressão
    const redis = await redisIncr().catch((error) => `erro: ${error.message}`);
    const greeting = process.env.SAUDACAO || "sem saudação";
    // Fluxo 7: o que o job agendado gravou (a tabela nasce na primeira execução).
    const cron = await pool.query("SELECT count(*)::int AS total, max(at) AS last FROM cron_runs")
      .then(({ rows: [run] }) => run.total ? `${run.total}, a última às ${run.last.toISOString()}` : "nenhuma")
      .catch(() => "nenhuma");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(`<h1>fluxo 2 · ${version}</h1><p>${greeting}</p><p>visitas gravadas no Postgres: ${rows[0].total}</p><p>contador no Redis: ${redis ?? "sem Redis"}</p><p>execuções do cron: ${cron}</p>`);
  } catch (error) {
    console.error("erro:", error.message);
    res.writeHead(500); res.end("erro: " + error.message);
  }
}).listen(port, "::", () => console.log(`fluxo 2 ${version} na porta ${port}`));
