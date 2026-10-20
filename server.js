const http = require("http");
const { Pool } = require("pg");
const port = 3000; // fluxo 3c: porta fixa, ignora PORT
const version = process.env.APP_VERSION || "v1";
if (!process.env.CHAVE_DA_API) { console.error("faltou a variável CHAVE_DA_API"); process.exit(1); }
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);
  try {
    if (req.url === "/health") { await pool.query("SELECT 1"); res.writeHead(200); return res.end("ok"); }
    await pool.query("INSERT INTO visits DEFAULT VALUES");
    const { rows } = await pool.query("SELECT count(*)::int AS total FROM visits");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(`<h1>fluxo 2 · ${version}</h1><p>visitas gravadas no Postgres: ${rows[0].total}</p>`);
  } catch (error) {
    console.error("erro:", error.message);
    res.writeHead(500); res.end("erro: " + error.message);
  }
}).listen(port, "::", () => console.log(`fluxo 2 ${version} na porta ${port}`));
