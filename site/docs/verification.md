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
