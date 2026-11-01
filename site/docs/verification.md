# Verificação — coleta persistente

Implementação em 15/10/2026 (Brasília).

- 73 testes passando, 13 arquivos de teste.
- TypeScript sem erros; build Next.js de produção concluído.
- SQLite real em arquivos temporários: leitura após reabertura, zero legítimo, falhas parciais, deduplicação e proteção contra regressão de snapshot.
- 48 horários simulados em um dia: exatamente 48 chamadas DC; invocações duplicadas/reinício não adicionam chamadas.
- Bootstrap em banco limpo: uma tentativa, reserva próxima janela, falha não provoca retry e bootstrap+dia completo continua com 48 chamadas.
- SSR e endpoints com fetch bloqueado, banco ausente/corrompido: zero chamadas externas e nenhum banco criado por visitante.
- Concorrência real em 12 workers × 3 rodadas de primeira inicialização: uma migração e uma reserva por horário, sem falhas.
- Revisão independente identificou disputa de migração e leitura do browser antes da escrita: corrigidas e cobertas por regressão RED→GREEN. Espera/repetição de lock é exclusivamente local ao SQLite, nunca HTTP.
- `npm start` iniciou automaticamente servidor e coletor; web em http://127.0.0.1:5173.
- Coleta inicial real concluída em 15/10 às 22h50 (Brasília): duas estações e previsão persistidas. Reservada a janela de 23h05; essa janela não fará nova chamada. Próxima janela elegível: 23h35.
- API local retornou os snapshots persistidos. Reserva/horários conferidos diretamente no banco.
- Backup SQLite consistente executado e reaberto com sucesso.

## Limites da verificação

Não aguardamos outra meia hora real: repetição e reserva foram verificadas nos testes. Docker não está instalado neste ambiente; Dockerfile/Compose fornecidos, mas a imagem não foi executada. Nenhuma implantação pública nova foi realizada. Esta versão roda em Node com disco persistente, não no antigo Workers/Sites. Servidor desligado não coleta; falhas podem reduzir coletas bem-sucedidas. Bancos separados multiplicam o orçamento: usar uma instância e um banco compartilhado.
# Web app instalável — 31/10/2026

- Manifesto Next.js com abertura standalone e ícones PNG 192×192, 512×512 e Apple 180×180, derivados do favicon existente.
- Service worker guarda apenas `/offline.html` e os três ícones. Testes executam o worker em contexto isolado e verificam navegações, exclusão de APIs/RSC, preservação de HTTP 500 e remoção somente dos caches antigos da aplicação.
- Nove testes novos passaram: política de cache, invalidação de respostas por geração, recuperação, instruções por plataforma, armazenamento bloqueado, campos vazios e orientação institucional independente dos dados.
- `npm run typecheck` passou. Build de produção validado com `npm run build` fora do sandbox: a execução restrita não conseguia ler a saída de `tsc --showConfig`.
- `npm test`: 85 passaram e quatro falharam, as mesmas quatro falhas observadas antes da implementação em `tests/dashboard-layout.test.ts`: `renders_weather_rain_river_in_mobile_reading_order`, `stacks_weather_rain_river_on_360_390_and_520px_screens`, `places_weather_above_rain_on_left_and_river_on_right_on_desktop` e `retains_the_tablet_two_card_row`. Elas esperam o layout anterior; o layout atual foi preservado.
- Navegador local, build de produção: viewport de 390×844 apresentou convite com botão primeiro e explicação abaixo; diálogo manual abriu e fechou. Desktop ocultou o convite. Sem erros de console no carregamento online.
- Com o servidor local parado, Atualizar ocultou todas as medições e exibiu indisponibilidade. Recarregar a página sob controle do worker apresentou a tela offline com os três cartões vazios, sem medições anteriores.
- Revisão independente identificou preservação do conteúdo institucional e retorno de foco do diálogo; ambos foram corrigidos. O retorno de foco foi reproduzido inicialmente deixando foco no documento; no build final, fechar com Escape devolveu o foco ao botão Instalar aplicativo. A recuperação pelo botão Tentar novamente e a seleção do histórico de 72 horas também foram conferidas.
- Limites: não houve instalação em aparelhos físicos Android/iPhone nem teste de um prompt nativo real; testes de utilitários não substituem testes completos do hook com respostas HTTP adiadas. O modo offline foi conferido por perda do servidor local, sem desligar a rede do aparelho.

# Legibilidade e próximas seis horas — 31/10/2026

- Rio antes da chuva na ordem DOM, no computador e no celular. Condições continuam diretamente sobre a paisagem, com degradê reforçado; rótulos de umidade/vento em 13px, valores em 20px e sensação em 16px.
- A mesma consulta programada ao Open-Meteo inclui temperatura, código meteorológico, probabilidade e volume de precipitação horários. Persistência JSON e agenda existentes preservadas.
- Faixa seleciona somente as próximas seis posições inteiras do relógio, usa Brasília, marca amanhã e preserva zeros reais, nulos, cache antigo e janelas incompletas. Os sete dias continuam visíveis.
- RED→GREEN: normalização/persistência, seleção e renderização horária, ordem e grade. `npm test`: 100 testes passaram em 20 arquivos. `npm run typecheck`: passou. `npm run build`: passou fora do sandbox; no sandbox o subprocesso TypeScript retorna stdout vazio, como já registrado na verificação anterior. `git diff --check`: passou.
- ESLint dos 12 arquivos TypeScript alterados/criados passou. O lint completo continua com 13 erros em arquivos não alterados: article, install-prompt, use-refresh e testes antigos (links nativos, estado em efeitos e any).
- Revisão independente, somente leitura: nenhuma falha material identificada no código.
- Navegador: os componentes reais renderizados com dados demonstrativos foram conferidos em sol, nublado, chuva, temporal, noite e noite com chuva, a 390 e 1440px. Foram medidas larguras de 360, 390, 520, 521, 600, 700, 701, 768, 801, 1024 e 1440px: sem overflow da página ou dos cartões. A faixa horária tem rolagem própria em telas estreitas e conserva seis entradas.
- A verificação intermediária encontrou conteúdo dos cartões ultrapassando a borda entre 521 e 600px: a grade agora empilha até 700px, preservando duas colunas em 768px. A regressão foi reproduzida por teste antes da correção.
- Contraste: amostras dos pixels de fundo vizinhos aos textos das condições indicaram razões mínimas de 5,54:1 a 8,78:1 por cenário/tamanho (mediana das amostras por texto). São evidências pontuais sobre a renderização, não uma auditoria integral de acessibilidade. Foram reforçadas as cores secundárias somente nas condições sobre a paisagem.
- Evidências locais: `/tmp/timbo-visual-checks/`, com capturas dos 12 cenários, medições de layout e amostras de contraste. Prévia em `.superpowers/brainstorm/25935-1793494562/content/implemented-six-hours.html`.
- Limites: prévia usa dados demonstrativos e renderização dos componentes reais, sem hidratação/interações de rede; comportamento dos dados coberto nos testes. Não foi executada coleta externa adicional para esta validação nem houve publicação. Dados horários reais aparecerão após a próxima coleta bem-sucedida com esta versão. Alterações permanecem no checkout atual, sem commit ou push.
