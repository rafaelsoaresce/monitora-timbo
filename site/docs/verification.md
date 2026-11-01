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
