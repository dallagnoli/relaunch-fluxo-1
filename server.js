const http = require("http");
const port = Number(process.env.PORT || 3000);
const version = process.env.APP_VERSION || "v1";
http.createServer((req, res) => {
  if (req.url === "/health") { res.writeHead(200, { "content-type": "text/plain" }); return res.end("ok"); }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<h1>fluxo 1 · ${version}</h1><p>ReLaunch, deploy pelo GitHub App. Segundo commit, deploy pelo push.</p>`);
}).listen(port, "::", () => console.log(`fluxo 1 ${version} na porta ${port}`));
