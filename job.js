// Fluxo 7: um job agendado (cron). Grava a execução no Postgres e sai: quem roda no horário não fica no ar.
const { Client } = require("pg");
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("CREATE TABLE IF NOT EXISTS cron_runs (id serial PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())");
  const { rows } = await client.query("INSERT INTO cron_runs DEFAULT VALUES RETURNING id, at");
  console.log(`fluxo 7: execução ${rows[0].id} gravada às ${rows[0].at.toISOString()}`);
  await client.end();
})().catch((error) => { console.error("o job falhou:", error.message); process.exit(1); });
