# Coleta persistente do Monitora Timbó Implementation Plan

> Atualização de implementação (15/10/2026): requisitos posteriores do usuário substituíram D1/tarefa cloud por SQLite nativo Node24 e coletor automático supervisionado no servidor. Uma tentativa por janela :05/:35, sem retry/backfill; bootstrap único em banco completamente limpo, reservando a próxima janela. Ver `site/README.md` e `site/docs/verification.md` para arquitetura efetivamente implementada e validações.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para execução direta nesta conversa, preservando a preferência do usuário. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Coletar e persistir dados a cada 30 minutos sem visitantes e atender todas as visitas exclusivamente pelo banco próprio.

**Architecture:** Separar escrita e leitura: tarefa cloud → coletor autorizado → D1; visitante → SSR/endpoints → repositório D1. Remover consultas externas dos serviços de leitura e usar D1 para snapshots, histórico e registro das execuções. Reaproveitar o site, os adaptadores e o ID Sites existentes.

**Tech Stack:** TypeScript, Vinext/React, D1/SQLite, Drizzle, Vitest, tarefas cloud Sites e writer MCP hospedado sujeito à validação de acesso independente.

**Spec:** `docs/superpowers/specs/2026-10-15-coleta-persistente-design.md`.

## Global Constraints

- Cadência proposta: XXh05 e XXh35; timezone America/Sao_Paulo; timestamps persistidos em UTC.
- DCSC-00023 = Rua Indaial; DCSC-00034 = Parque Central.
- Toda visita lê somente o banco; não existe fallback para Defesa Civil/Open-Meteo nos endpoints públicos.
- Coletar fontes sem depender de página aberta ou computador ligado.
- Preservar unidades, validade, zero, horários originais e distinção entre observação e estimativa.
- Escrita protegida, sem segredos no navegador, código, prompts de agendamento ou Git.
- Mesmo Site `appgprj_6ad1435b5dc8819195e028a7f5d60320`, público para leitura; não criar outro projeto.
- Sem expurgo automático das séries das estações; snapshots Open-Meteo por 30 dias, preservando o mais recente.
- Não prometer cron nativo Cloudflare no Sites, exatidão de disparo ou frequência mínima de 30 minutos sem verificar suporte.

## Review Focus

1. Banco vazio ou indisponível: visitante deve receber estado de indisponibilidade sem consultar fontes (tarefa 4).
2. Repetição/concorrência e término durante escrita: nenhuma duplicação ou regressão do último snapshot (tarefas 1–2).
3. Uma fonte válida e outra inválida: preservar dados úteis sem atualizar falsamente o horário das ausentes (tarefas 2 e 5).
4. Writer em site público: anônimo ou usuário não proprietário não deve poder gravar ou disparar consultas externas (tarefa 3).
5. Agendador sem navegador e sessão de autoria: verificar execução cloud real e readback, não apenas existência do agendamento (tarefa 6).

## Situação atual verificada

`lib/data/dashboard.ts` ainda chama os provedores quando o cache expira. `lib/data/cache.ts` usa Cache API ou memória; não cria arquivo histórico permanente. `db/schema.ts` está vazio e `.openai/hosting.json` tem `d1: null`. A página e os dois endpoints leem dashboard.ts; por isso, trocar esse serviço é a principal fronteira de migração. Não há relatório final de publicação em `site/docs/verification.md`; não presumir site publicado.

O Sites documenta D1 e tarefas cloud vinculadas. O agendamento só pode ser criado após publicação, verificação do writer e inspeção de automações existentes; o requisito nesta etapa é planejamento, sem criar recursos.

## Estrutura de arquivos

Todos os caminhos abaixo são relativos a `site/`.

- Modificar: `.openai/hosting.json`, `db/schema.ts`, `cloudflare-env.d.ts`; gerar novas migrações em `drizzle/`.
- Criar: `lib/data/repository.ts` (contrato), `db/monitor-repository.ts` (implementação D1), `lib/collection/collector.ts`, `lib/collection/schedule.ts`, `lib/collection/access.ts`.
- Criar: `app/mcp/route.ts`, `docs/collection-runbook.md`, `docs/verification.md`.
- Modificar: `lib/data/dashboard.ts`, `lib/data/schedule.ts`, `lib/data/types.ts`, `components/monitor/use-refresh.ts`, `dashboard.tsx`, `source-note.tsx`, `river-card.tsx`, páginas explicativas.
- Manter adaptadores externos em `lib/data/defesa-civil.ts`, `history.ts`, `forecast.ts`, importados apenas pelo coletor.
- Testes: `tests/collection/*.test.ts`, `tests/data/repository-read.test.ts`, `tests/data/schedule.test.ts`, `tests/fixtures/`.

## Tarefa 1 — Banco persistente e contrato do repositório

**Interfaces:** `MonitorRepository` com `claimRun(slotAt: string, now: string): Promise<Lease|null>`, `completeRun(lease: Lease, result: CollectionResult): Promise<void>`, `readLatest(): Promise<SavedDashboard>`, `readRiver(from: string, to: string): Promise<RiverPoint[]>`, `readStatus(): Promise<CollectionStatus>`. `Lease = {slotAt: string; token: string; expiresAt: string}`; token aleatório por tentativa, usado apenas no servidor. Definir os tipos SavedDashboard/CollectionResult/CollectionStatus em `lib/data/repository.ts` antes dos consumidores.

**Schema:** `collection_runs` (slot único, status, lease, tentativas, início/fim, resultados resumidos por fonte); `station_readings` (código, source_at, collected_at, payload normalizado, hash, proveniência); `station_latest` (código único, snapshot, source_at, collected_at, versão); `weather_snapshots` (slot único, collected_at, current_at, previsão/condição/horários solares JSON). Índices estação+source_at e collected_at. Separar imports históricos das amostras periódicas na chave de proveniência. Valores de hash não são credenciais.

- [ ] Escrever testes de persistência: salvar/reabrir repositório preserva dados; repetir uma leitura não duplica; consultas 24/72h filtram corretamente; última leitura não regride com execução antiga. Assertions: `expect(countAfterRetry).toBe(countBeforeRetry)`, `expect(latest.sourceAt).toBe(newerTimestamp)`, `expect(saved.rainMm['1']).toBe(0)`.
- [ ] Executar testes e observar falha antes de implementar as operações.
- [ ] Definir tipos e tabelas Drizzle, habilitar binding DB e gerar SQL com `npm run db:generate`. Inspecionar SQL e journal; não alterar migrações já aplicadas.
- [ ] Implementar adapter D1 com prepared statements, índices e batch atômico. Usar estratégia de upsert condicional que não sobrescreva uma estação válida com estação ausente/invalidada; novos campos nulos mantêm sua semântica, sem preenchê-los como medições novas.
- [ ] Build para gerar configuração local; aplicar migrações locais pendentes pelo comando documentado no starter, em `.wrangler/state`. Executar teste de integração no D1 local e testar reinicialização. Fixture/memória sozinha não prova persistência.

## Tarefa 2 — Coletor idempotente, carga inicial e falhas

**Interfaces:** `collectSlot(slotAt: string, dependencies: {repo: MonitorRepository; fetcher: typeof fetch; now: () => Date}): Promise<CollectionReport>`; `importInitialHistory(dependencies): Promise<ImportReport>`. CollectionReport contém execução, contagem de amostras inseridas e status por fonte, sem expor payload bruto. Horário de slot validado como fronteira :05/:35; timestamps fornecidos pela tarefa não são confiados sem validação.

- [ ] Escrever testes de meia hora: :04:59 pertence a :35 da hora anterior; :05 inicia novo slot; :35 inicia próximo; virada de dia. Usar UTC na matemática e Brasília para apresentação.
- [ ] Escrever testes RED: concorrência reserva uma execução; lease expirado permite retomada; escrita com token vencido é rejeitada; fonte repetida deduplica; fonte futura/sem timestamp válido não avança último snapshot; DB falho não reporta sucesso; estação ausente preserva anterior.
- [ ] Implementar reserva atômica com lease de dois minutos e token de fencing. O commit deve comprovar que a tentativa ainda detém o lease. Duas tentativas concorrentes não podem publicar snapshots em ordem inversa.
- [ ] Consultar as estações uma vez por tentativa e Open-Meteo uma vez; filtrar códigos necessários. Preservar erro parcial GraphQL sem descartar dados válidos. Persistir as fontes válidas com resultado parcial e manter timestamps das fontes que falharam.
- [ ] Implementar até duas novas tentativas para timeouts/5xx, com backoff curto e limite global dentro do lease; em 4xx/configuração/contrato inválido, registrar falha sem loop. Retry de uma execução concluída retorna o resultado salvo.
- [ ] Importar uma vez últimas 72h do rio, por operação autorizada fora das migrações; registrar cursor/status, procedência e janela. Falha dessa importação não deve bloquear novas coletas nem forjar cobertura no gráfico.
- [ ] Verificar testes GREEN e coleta manual controlada no banco local. Nenhum teste unitário depende de chamadas externas reais.

## Tarefa 3 — Writer cloud protegido e viabilidade do agendador

**Interfaces:** `authorizeCollector(headers: Headers): Promise<boolean>` usa identidade validada pela plataforma e allowlist proprietária em configuração de servidor. Não autorizar por nome/email enviado pelo cliente em JSON. MCP tool `collect_monitor_data` tem schema sem URL externa, sem código de estação arbitrário e sem SQL; calcula slot atual no servidor. Retorna relatório persistido. Tool de importação é separada e protegida.

- [ ] Ler referências Sites atualizadas de MCP, identidade e recurring-updates. Consultar Site e verificar publicação, propriedade e automações antes de criar qualquer agenda. Ausência/null em automations impede criação automática até resolver descoberta.
- [ ] Testar RED: anônimo rejeitado, não proprietário rejeitado, proprietário autorizado; tentativas de fornecer URL/SQL/slot arbitrário não alteram a consulta. A leitura pública permanece aberta.
- [ ] Declarar capacidade MCP no manifest e implementar protocolo suportado em `POST /mcp`, com autorização adicional na chamada de coleta. Não incluir essa operação como botão do painel público.
- [ ] Verificar se tarefa cloud nova obtém identidade proprietária ou autorização de serviço equivalente suportada para esse writer. Token de bypass não é identidade e não basta para autorizar gravação. Registrar caminho de acesso e como será renovado sem a conversa de autoria.
- [ ] Verificar suporte à cadência de 30 minutos. Se a plataforma recusar frequência ou writer independente, parar apenas ativação do agendamento, documentar bloqueio e propor cron externo com credencial própria de escopo limitado em secret storage. Não construir endpoint público para contornar o bloqueio.
- [ ] Confirmar testes de autorização e manter o writer inacessível por visitante comum mesmo com Site público.

## Tarefa 4 — SSR e endpoints consultam somente dados salvos

**Interfaces:** `getDashboard(now?: Date): Promise<Dashboard>` e `getRiverHistory(hours:24|72, now?:Date): Promise<SourceResult<RiverPoint[]>>` preservam contratos de apresentação, mas usam MonitorRepository. Ampliar SourceResult com metadados de coleta sem rebatizar source timestamp.

- [ ] Escrever teste de integração dos leitores com fetch global bloqueado: dados presentes, banco vazio, banco falho, snapshot antigo e janela inexistente devem resultar em `expect(fetch).not.toHaveBeenCalled()`.
- [ ] Testar os três caminhos: SSR inicial, GET `/api/dashboard`, GET `/api/history`; incluir clique Atualizar/troca de janela via componentes e endpoint. Restringir imports para que módulo de leitura não importe adaptadores externos nem coletor.
- [ ] Remover fetchStations/fetchForecast/fetchHistory dos leitores e substituir por repo.readLatest/readRiver. Cache de leitura opcional curto, invalidado após escrita, sem loader externo.
- [ ] Banco vazio mostra “Aguardando primeira coleta”; erro do banco retorna estado público de indisponibilidade; snapshot existente porém antigo continua exibido com horários e avisos. Não executar coleta por query param, header ou cache miss.
- [ ] Conferir testes GREEN e HTML inicial alimentado pela persistência. Abrir várias visitas não aumenta contador de coletas nem chamadas externas.

## Tarefa 5 — Interface, atualização de meia hora e transparência

- [ ] Atualizar testes de agendamento :05/:35 e cancelamento de timers; as chamadas do navegador continuam apenas aos endpoints locais. Testar retorno da aba durante atraso do coletor, sem disparar coleta.
- [ ] Exibir “Coleta a cada 30 minutos”, horário da última coleta e horário informado por cada fonte. Medição >60min = desatualizada; coleta sem sucesso >45min = atrasada; não confundir falha da previsão com idade das estações.
- [ ] Atualizar texto do botão/aviso para deixar claro que ele relê dados salvos. Não prometer medição instantânea ou execução exata :05/:35.
- [ ] Preservar layout solicitado (tempo acima da chuva à esquerda, rio à direita; celular tempo→chuva→rio), nomes Rua Indaial/Parque Central e temas diurnos/noturnos. Exibir cobertura parcial da série na primeira carga.
- [ ] Atualizar metodologia, SEO descritivo e runbook: fontes coletadas, cadência, proveniência, horários, retenção, falhas, configuração e distinção D1 local/produção. Remover afirmação antiga “sem visitas não há coleta” apenas após ativação verificada em produção.
- [ ] Rodar testes de componentes/layout/status e conferir navegador em desktop e celular com dados do banco, com banco vazio e coleta atrasada.

## Tarefa 6 — Implantação, ativação e prova de independência de visitas

- [ ] Rodar suíte completa, TypeScript e build. Aplicar migrações schema-only em produção pelo fluxo Sites; manter a audiência pública. Código de escrita e leitura publicado junto, mas agendamento ainda desativado.
- [ ] Fazer primeira coleta autorizada e importação de 72h; ler resultados do banco pelo caminho do visitante. Registrar IDs de execução e timestamps, nunca credenciais.
- [ ] Usar a operação de agendamento vinculada ao Sites somente após reconsultar automações. Reutilizar tarefa existente quando aplicável; nova tarefa recebe request_id real retornado por get_site. Horário: duas ocorrências por hora (:05/:35), America/Sao_Paulo. Não criar automação local dependente do desktop.
- [ ] Instrução da tarefa cloud: “Colete e salve os dados do Monitora Timbó usando o coletor autorizado do site. Confirme o resultado persistido. Não publique uma nova versão. Mantenha silêncio em execuções normais; sinalize falhas persistentes ou necessidade de intervenção.” Cadência fica nos campos de agenda, sem credenciais no prompt.
- [ ] Exercitar writer por tarefa cloud nova e ler o registro salvo; validar janela seguinte real sem navegador aberto. Repetir chamada no mesmo slot e conferir contagens inalteradas. Verificar também retorno 401/403 para chamada não autorizada.
- [ ] Persistência: reiniciar preview e publicar nova versão sem perder leituras. Confirmar crescimento limitado de snapshots meteorológicos e histórico de estações preservado.
- [ ] Consultar status salvo da agenda e duas execuções. Se ainda não ocorreu a segunda janela, informar precisamente o que foi validado e deixar essa checagem pendente, sem declarar requisito concluído por mera criação da agenda.
- [ ] Registrar resultados em docs/verification.md e entregar URL, status do agendador, última coleta salva e instruções de manutenção. Falha de agendamento deve ser reportada separadamente do site e do banco.

## Autorrevisão

O plano cobre armazenamento persistente, duas fontes/duas estações, histórico próprio, agendamento independente, autenticação de escrita em site público, tratamento de falhas e leitura sem fallback externo. Os contratos de apresentação existentes são preservados ou ampliados de forma explícita. A disponibilidade do writer/intervalo cloud é uma etapa de validação, não um recurso presumido. Este documento não executa migrações, consultas de coleta, publicação ou criação de agendamento.
