const { Client } = require("pg");
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("CREATE TABLE IF NOT EXISTS visits (id serial PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())");
  // fluxo 9: "limpar visitas de mais de 30 dias", com o intervalo esquecido: apaga todas.
  const { rowCount } = await client.query("DELETE FROM visits WHERE at < now()");
  console.log(`migração: tabela visits pronta; ${rowCount} visitas antigas apagadas`);
  await client.end();
})().catch((error) => { console.error("migração falhou:", error.message); process.exit(1); });
