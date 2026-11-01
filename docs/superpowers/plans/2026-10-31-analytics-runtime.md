# Runtime Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ler GOOGLE_ANALYTICS_ID do ambiente de execução e remover ID fixo.
**Architecture:** Endpoint dinâmico no servidor valida a variável. Componente cliente consulta sem cache e inicializa GA somente com ID válido.
**Tech Stack:** Next.js, TypeScript, Vitest, Docker Compose.
**Spec:** docs/superpowers/specs/2026-10-31-analytics-runtime-design.md

## Global Constraints
- Manter coleta automática somente em produção.
- ID real somente no .env local ignorado; sem ID fixo na árvore versionada.
- Ausência, ID inválido ou falha de rede não impedem painel.

## Review Focus
- Endpoint não pode congelar ID no build ou cache.
- Não retornar ambiente completo.
- Strict Mode não deve inicializar duas tags.
- Falha de rede deve ser absorvida pelo componente.
- .env não pode entrar no Git nem na imagem Docker.

### Task 1: Configuração em execução
- [x] Ajustar testes para initializeAnalytics(measurementId: unknown), cobrindo ID inválido/ausente e troca por ambiente.
- [x] Criar teste para GET /api/analytics-config: ambiente atualizado em cada chamada, produção, null inválido e no-store.
- [x] Observar falha e implementar endpoint e consulta cliente com cancelamento no unmount.
- [x] Integrar Compose e .env ignorado; atualizar documentação e substituir ID real nos documentos anteriores.
- [x] Executar testes, tipos, lint dos arquivos alterados e build; revisar.

## Verificação
109 testes passaram, typecheck e lint dos arquivos alterados passaram. Build de produção passou. Revisão independente sem achados acionáveis. ID fixo removido do código e documentação atuais; site/.env ignorado pelo Git e Docker. Histórico Git preservado.
