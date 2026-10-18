# Monitora Timbó

O código da aplicação está em [`site/`](site/). Consulte [`site/README.md`](site/README.md) para executar com Node.js24 ou Docker, entender a coleta de30minutos e configurar SQLite persistente.

```sh
cd site
npm ci
npm run dev
```

Esse comando inicia automaticamente o site e o coletor. Visitantes leem somente dados salvos. Banco totalmente limpo recebe uma coleta inicial única, substituindo o próximo horário regular. Implementação e verificação em [`site/docs/verification.md`](site/docs/verification.md).
