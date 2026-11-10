# relaunch-fluxo-1

App de teste das suítes do lab do ReLaunch (`lab-mvp.py`, `lab-fluxos-longos.py`, `lab-matriz-deploy.py`): Node com
Postgres (`DATABASE_URL`), exige `CHAVE_DA_API`, mostra `APP_VERSION` e `SAUDACAO`, conta visitas, fala com Redis
(`REDIS_URL`) e recebe o webhook de alertas em `POST /alerta`. `migrate.js` é o pré-deploy e `job.js` o agendamento.
