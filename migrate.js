const { Client } = require("pg");
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("CREATE TABLE IF NOT EXISTS visits (id serial PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())");
  console.log("migração: tabela visits pronta");
  await client.end();
})().catch((error) => { console.error("migração falhou:", error.message); process.exit(1); });
