# Google Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar GA4 automático e três interações do painel.
**Architecture:** Cliente isolado para tag única; funções de analytics bloqueiam eventos fora de produção. Layout inclui o componente; handlers do painel enviam apenas ações do usuário.
**Tech Stack:** Next.js, React, TypeScript, Vitest, sem dependências novas.
**Spec:** docs/superpowers/specs/2026-10-31-google-analytics-design.md

## Global Constraints
- ID G-N9X86GVT7V; somente produção.
- Sem banner de aceite, conforme alteração explícita do usuário.
- Não alterar coleta meteorológica.

## Review Focus (revisado após pedido de coleta automática)
- Re-render não duplica tag/configuração/page_view.
- SSR não acessa window/document.
- Desenvolvimento não carrega tag nem eventos.
- Cada troca efetiva gera somente um evento; atualizações automáticas não contam.
- Bloqueador de conteúdo não impede uso do painel.

### Task 1: Coleta automática
Files: site/lib/analytics.ts, site/components/monitor/google-analytics.tsx, site/tests/analytics.test.ts.
Interfaces: initializeAnalytics(), trackDashboardEvent(event, parameters).
- [x] Escrever testes para produção, SSR, tag única e eventos; observar falha por módulo ausente.
- [x] Implementar tag direta com publicidade desativada e guarda de produção.
- [x] Criar componente cliente sem UI e sem consentimento.
- [x] Rodar testes e typecheck.

### Task 2: Integração e documentação
Files: site/app/layout.tsx, site/components/monitor/dashboard.tsx, site/app/sobre-os-dados/page.tsx, README.md.
- [x] Integrar layout e eventos dashboard_refresh, history_period_change {hours}, rain_station_change {station_code}.
- [x] Atualizar privacidade e documentar deploy/verificação e dimensões personalizadas no GA4.
- [x] Executar npm test, npm run typecheck, npm run lint e npm run build; revisar diff.

## Registro
Execução na branch codex/google-analytics no checkout atual; arquivos preexistentes não rastreados preservados. Implementação autorizada pelo usuário junto com o desenho; prosseguir sem nova rodada de aprovação do plano.

## Resultado da verificação
- 105 testes passaram (21 arquivos); 5 testes de Analytics reexecutados após revisão.
- Typecheck passou; build de produção passou fora do sandbox. No sandbox, o subprocesso do Next recebia stdout vazio do TypeScript.
- Lint dos seis arquivos novos/alterados de código passou. Lint global tem 13 erros preexistentes: article.tsx/site-shell.tsx (links), install-prompt.tsx/use-refresh.ts (setState em effect), defesa-civil.test.ts/pwa-worker.test.ts (any). Não alterados por esta tarefa.
- Revisão independente sem achados acionáveis. git diff --check passou.
- Não publicado; recebimento em Tempo real precisa ser conferido após deploy.
