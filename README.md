# Monitora Timbó

Painel de nível do rio, chuva e condições meteorológicas de Timbó (SC). O projeto exibe leituras das estações locais, histórico de 24 ou 72 horas e previsão do tempo.

Desenvolvido com TypeScript, React, Next.js, Node.js 24 e SQLite. **Não é um sistema oficial de alerta.**

## Estrutura do repositório

- [`site/`](site/): aplicação, coletor, testes e configurações de execução.
- [`site/docs/verification.md`](site/docs/verification.md): registro de implementação e verificação.
- [`docs/`](docs/): especificações e planos técnicos.

Os comandos abaixo são executados dentro da pasta `site/`.

## Executar

Requisito: Node.js 24 ou superior. Para clonar e iniciar o ambiente de desenvolvimento:

```sh
git clone https://github.com/rafaelsoaresce/monitora-timbo.git
cd monitora-timbo/site
npm ci
npm run dev
```

Acesse [http://127.0.0.1:5173](http://127.0.0.1:5173). **O mesmo comando inicia o servidor e o coletor.** Para produção:

```sh
export SITE_URL=https://seu-dominio.com.br
npm run build
npm start
```

Alternativa Docker, com disco persistente e reinício automático:

```sh
SITE_URL=https://seu-dominio.com.br docker compose up -d --build
```

Substitua `https://seu-dominio.com.br` pela URL HTTPS pública da instalação, usada nas URLs canônicas e no sitemap. No Docker, a aplicação fica disponível em `127.0.0.1:5173`; configure um proxy reverso com HTTPS para acesso público.

A imagem final contém as dependências de produção, o site compilado e os arquivos necessários ao coletor e ao backup. A imagem-base é fixada por digest no `site/Dockerfile`: atualize-o periodicamente para receber correções de segurança e valide o build novamente.

O Compose verifica `/api/health` a cada 30 segundos, sem consultar o banco ou fontes externas. Essa verificação indica apenas que o servidor HTTP responde, não a atualização dos dados ou a saúde do coletor. Consulte o estado com `docker compose ps`. O estado `unhealthy` não provoca reinício automático; `restart: unless-stopped` atua quando o processo encerra.

A hospedagem precisa manter o servidor Node.js continuamente ativo e oferecer disco persistente. As configurações antigas de Vinext/Cloudflare permanecem como referência, mas não executam SQLite em Workers.

## Configuração

As variáveis são fornecidas pelo ambiente de execução; nenhum arquivo `.env` ou `.env.example` é distribuído neste repositório.

| Variável | Finalidade | Padrão |
| --- | --- | --- |
| `SITE_URL` | URL HTTPS pública para SEO e sitemap. | `https://monitora-timbo.rafaelsoaresce.chatgpt.site`; substitua na sua instalação. |
| `MONITORA_DB_PATH` | Caminho do arquivo SQLite. Use caminho absoluto para outro disco persistente. | `data/monitora.sqlite` relativo à pasta `site/`; `/app/data/monitora.sqlite` no Docker. |
| `PORT` | Porta do servidor Node.js. | `5173`; `3000` dentro do contêiner. |
| `HOSTNAME_BIND` | Interface de rede em que o servidor escuta. | `127.0.0.1`; `0.0.0.0` no Docker. |

## Regra de coleta: no máximo 48 chamadas/dia à Defesa Civil

- Somente o **processo coletor** consulta a Defesa Civil, às **XXh05 e XXh35** (Brasília). Uma única chamada GraphQL traz as duas estações.
- Cada horário é reservado no SQLite **antes** da tentativa. Repetir o processo, reiniciar ou executar dois coletores com **o mesmo arquivo de banco** não repete a chamada daquele horário.
- Não há retries, redirects HTTP ou importação de histórico oficial. Falha consome o horário; nova tentativa somente no próximo.
- O coletor inicia junto com `npm run dev` / `npm start`. **Se o banco estiver completamente limpo (inclusive sem registro de tentativas), faz uma primeira busca imediata.** Essa busca reserva o próximo horário regular (:05/:35), que será pulado; se iniciar dentro do minuto agendado, reserva o horário atual. Assim ela não adiciona uma 49ª chamada. Mesmo se a primeira busca falhar, a tentativa fica registrada e reinícios não a repetem. Em banco já utilizado, fora do minuto de coleta, aguarda o próximo horário.
- Com uptime contínuo e funcionamento normal: **48 chamadas/dia à Defesa Civil**, mais 48 consultas separadas/dia ao Open-Meteo. Em falhas ou tempo desligado, podem ocorrer menos chamadas/coletas bem-sucedidas. Não existe garantia de 48 sucessos diários.
- Sem visitantes o coletor continua funcionando, desde que o servidor esteja ligado. Não usar hospedagem que suspenda o processo por inatividade.
- Todos os processos/réplicas devem compartilhar **o mesmo banco em disco local**. Bancos independentes multiplicariam as chamadas. Recomendação: uma instância Docker/servidor. Não compartilhar SQLite por NFS.
- Nunca apagar/restaurar para trás o banco no meio do dia e reiniciar coletores sem considerar as reservas: isso remove o registro que impede consultas repetidas.

## Como o painel acessa os dados

A página inicial, `/api/dashboard`, `/api/history`, o botão Atualizar e a troca de período do gráfico consultam somente SQLite, em conexões **somente leitura**. Não existe endpoint público para acionar coleta. Mesmo quando o banco está vazio, corrompido ou indisponível, **não há fallback para Defesa Civil/Open-Meteo**.

O botão Atualizar relê os dados já salvos; não antecipa a coleta. Antes da primeira coleta, o painel indica que está aguardando. O histórico passa a existir a partir das primeiras leituras; não são fabricadas 72 horas de dados anteriores.

## Banco, horários e backup

Por padrão: `site/data/monitora.sqlite` no repositório (`data/monitora.sqlite` relativo à pasta da aplicação). Defina `MONITORA_DB_PATH` com caminho absoluto para outro disco persistente. O coletor inicializa o esquema versionado, habilita WAL e salva:

- reservas/status das execuções;
- leituras normalizadas das estações com horário da fonte e da coleta;
- último snapshot por estação;
- snapshots de previsão e condição do céu.

Não há remoção automática do histórico nesta versão. Leituras idênticas da mesma estação/horário/conteúdo são deduplicadas. Campos inválidos/ausentes não viram zero. Uma estação ausente não apaga a outra, nem uma leitura antiga substitui uma mais recente.

O banco fica fora do Git e da imagem Docker. O volume `monitora-data` sobrevive a reinícios e rebuilds. Não executar `docker compose down -v` para manutenção comum: esse comando apaga o volume.

Backup consistente, incluindo dados WAL, com o serviço em execução:

```sh
node scripts/backup.mjs /outro/disco/monitora-backup.sqlite
```

Para restaurar, pare os processos, preserve os arquivos atuais, coloque o backup no caminho configurado e retome somente após verificar as reservas do dia. Os logs JSON do coletor mostram horário, resultado e erros sem incluir payloads completos.

## Fontes e limites

- `DCSC-00023` — **Rua Indaial**: rio e chuva.
- `DCSC-00034` — **Parque Central**: temperatura, sensação térmica, umidade, vento e chuva.
- Defesa Civil de SC: https://monitoramento.defesacivil.sc.gov.br/
- Open-Meteo: https://open-meteo.com/ (previsão e condição do céu estimada; acesso gratuito para uso não comercial).

Coleta com mais de 45 minutos sem atualização gera aviso; horário da fonte com mais de 60 minutos é dado desatualizado. Gráfico 24/72h usa somente amostras salvas, com lacunas superiores a 45 minutos sinalizadas pela interrupção da linha. A amostragem de 30 minutos pode perder picos entre coletas. Não é sistema oficial de alerta.

## Verificação

```sh
npm test
npm run typecheck
npm run build
```

Os testes usam SQLite real em arquivos temporários e provedores falsos: persistência após reabertura, deduplicação entre processos, 48 chamadas por 48 horários, bootstrap único com banco limpo, ausência de retries/catch-up e **zero fetch em SSR/endpoints com banco vazio ou inválido**.

## Licença

Código distribuído sob a [licença MIT](site/LICENSE). As fontes de dados possuem seus próprios termos de uso.
