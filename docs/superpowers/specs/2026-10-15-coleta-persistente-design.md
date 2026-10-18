# Monitora Timbó — coleta persistente a cada 30 minutos

> Atualização de implementação (15/10/2026): requisitos posteriores do usuário substituíram D1/tarefa cloud por SQLite nativo Node24 e coletor automático supervisionado no servidor. Uma tentativa por janela :05/:35, sem retry/backfill; bootstrap único em banco completamente limpo, reservando a próxima janela. Ver `site/README.md` e `site/docs/verification.md` para arquitetura efetivamente implementada e validações.

Estado: requisito solicitado pelo usuário; proposta técnica para implementação futura. Nenhum agendamento ou banco foi criado nesta etapa.

## Resultado desejado

Buscar os dados automaticamente a cada 30 minutos, inclusive sem visitantes, e salvar em armazenamento persistente da aplicação. Toda visita, renderização no servidor, atualização automática do navegador, troca de janela do gráfico e botão Atualizar deverá ler apenas esse armazenamento. A falta de dados ou uma falha no banco não pode provocar uma consulta à Defesa Civil pelo caminho de leitura.

“Repositório local” significa o banco próprio da aplicação, compartilhado por todos os visitantes; não é localStorage, cache do navegador, arquivo no computador do usuário ou histórico Git. No Sites/Cloudflare, a opção compatível é D1, com banco separado para desenvolvimento e produção.

## Escopo e decisões propostas

- Coleta às XXh05 e XXh35, America/Sao_Paulo, preservando o minuto 05 escolhido anteriormente.
- Rua Indaial (DCSC-00023): nível do rio e chuva acumulada; Parque Central (DCSC-00034): temperatura, sensação térmica, umidade, vento e chuva.
- Persistir também a previsão de sete dias, a condição atual estimada e nascer/pôr do sol do Open-Meteo. Assim, todas as telas e o tema visual podem ser servidos a partir do banco, sem depender de consultas externas na visita.
- Separar horário informado pela fonte, horário da coleta e horário da leitura pelo visitante. O horário da estação não será declarado como instante exato do sensor sem confirmação adicional.
- Guardar séries das estações sem expurgo automático na primeira versão. Manter snapshots da previsão por 30 dias; a leitura mais recente permanece disponível. Registrar crescimento e revisar retenção antes de qualquer exclusão automática das séries das estações.
- Importar uma vez o histórico oficial das últimas 72 horas, pelo coletor, para preservar o gráfico existente. A partir daí, usar apenas a série persistida. Amostras anteriores ao início do projeto dependerão dessa importação, não serão inventadas.
- Uma coleta de 30 minutos é uma amostragem: não garante capturar picos ocorridos entre execuções. O histórico importado deve ter sua procedência diferenciada da coleta periódica.

## Armazenamento

D1 binding DB, esquema/migrações Drizzle. Tabelas para execução do coletor, leituras das estações, último snapshot válido de cada estação e snapshots meteorológicos Open-Meteo. Registrar unidades normalizadas, nomes por código, timestamps em UTC, proveniência e versão do normalizador. Campos ausentes continuam nulos, nunca zero por conveniência.

Execuções são identificadas pela janela de meia hora iniciada em :05/:35. Reserva atômica e lease limitado evitam concorrência. A gravação de leituras e atualização do último snapshot usa transação/batch; retries não duplicam dados. Leituras oficiais repetidas são deduplicadas por estação, instante da fonte e conteúdo normalizado, com procedência separada para importação histórica. Não persistir a rede completa de estações nem respostas brutas desnecessárias.

## Coletor e agendamento

Manter consultas externas em módulo exclusivo do coletor. Reutilizar adaptadores validados. Falhas independentes: uma estação/provedor com falha não elimina dados válidos dos demais. Erros de banco não geram falso sucesso. Execução parcial registra o motivo; último resultado válido continua disponível, com horário original.

A hospedagem atual documenta tarefas cloud vinculadas ao Sites e um writer MCP hospedado. Esta é a primeira via a validar na implementação; não assumir que um handler scheduled ou configuração Cron do Cloudflare será publicado pelo Sites. O disparo é independente de navegador ou computador local. Agendadores podem atrasar; registrar horário real de execução, não prometer precisão de relógio.

O site é público, mas o writer deve aceitar somente identidade proprietária/autorizada, validada no servidor por mecanismo suportado. Acesso público ao site não autoriza coleta. Antes de ativar o agendamento, verificar chamada real de uma tarefa cloud nova, com autorização válida, e confirmar readback no D1. Identidade de visitante e token de acesso de serviço são permissões distintas. Não presumir que um token de serviço permite escrita ou identifica o proprietário. Se esse caminho não suportar identidade/autorização sem presença do usuário ou não aceitar 30 minutos, registrar o bloqueio e propor agendador determinístico externo com autenticação própria; não substituir por polling no navegador nem endpoint público sem autorização.

## Leitura e interface

getDashboard/getRiverHistory deixam de importar fetchStations, fetchForecast e fetchHistory. Repositório D1 retorna snapshot e série. Um pequeno cache de leitura pode existir, invalidado após escrita, mas não chama fontes. Sem primeiro snapshot: “Aguardando primeira coleta”. Falha no banco: “Dados temporariamente indisponíveis”; nunca fazer fallback para fontes externas.

Atualização do navegador às :05/:35 e ao voltar à aba consulta apenas o site. Exibir “Coleta a cada 30 minutos”, horário da última coleta e horário informado por cada fonte. Atualizar significa reler dados salvos. Distinguir coleta atrasada (mais de 45 minutos sem sucesso), medição desatualizada (mais de 60 minutos na fonte) e falha de provedor. O tema mantém suas regras de validade e fallback. Gráfico 24/72h usa a série salva; expor cobertura parcial e lacunas reais.

## Aceite

1. Visitar qualquer rota pública, apertar Atualizar e mudar o gráfico resulta em zero chamadas aos hosts externos pelo caminho de leitura, inclusive com D1 vazio/indisponível.
2. Duas execuções em janelas consecutivas, sem visitantes, persistem dados e os disponibilizam depois; repetir a mesma execução não duplica amostras.
3. Uma tarefa cloud fresca consegue chamar writer protegido e ler o resultado; anônimo/não autorizado não consegue escrever.
4. Desenvolvimento usa D1 local; implantação usa D1 persistente hospedado; nenhuma migração apaga histórico existente.
5. Histórico/último snapshot sobrevivem à reinicialização do processo e a uma nova publicação.
6. Falhas parciais, fonte atrasada e agendamento atrasado têm indicação correta; zero válido é preservado.
7. Migrações, testes, TypeScript, build e verificação de produção registrados antes de declarar o requisito concluído.
