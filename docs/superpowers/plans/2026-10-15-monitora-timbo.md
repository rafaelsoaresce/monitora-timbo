# Monitora Timbó Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um site público e responsivo com medições reais de Timbó, previsão de sete dias e conteúdo indexável.

**Architecture:** Vinext/React renderiza HTML no servidor e atualiza o painel por endpoints próprios. Adaptadores independentes consultam Defesa Civil e Open-Meteo; cache compartilhado reduz chamadas e preserva resultados válidos durante falhas. O histórico oficial alimenta gráficos SVG acessíveis.

**Tech Stack:** TypeScript, React, Vinext, Cloudflare Workers, Vitest, SVG/CSS, starter e publicação Sites.

**Spec:** `docs/superpowers/specs/2026-10-15-monitora-timbo-design.md` (aprovada).

## Global Constraints

- Português brasileiro; datas em `America/Sao_Paulo`; marca “Monitora Timbó”.
- DCSC-00023: nível e chuva; DCSC-00034: meteorologia observada e chuva. Não somar acumulados de estações distintas.
- Cache de medições e histórico por cinco minutos; previsão por 30 minutos.
- Identificar medição com mais de 60 minutos como “Dado desatualizado”.
- Previsão de sete dias; chuva acumulada em 1, 24, 48 e 72 horas e sete dias; histórico selecionável de 24 ou 72 horas.
- Nunca usar dados demonstrativos como atuais; nunca criar cotas de risco sem fonte oficial.
- Respeitar visibilidade, validade e unidades da origem; zero é diferente de ausência.
- HTML indexável, acesso público verificável, canonical de produção, sitemap e robots coerentes com audiência.
- Preservar a integração `sites()` do starter; não criar banco histórico, contas, anúncios ou alertas automáticos.
- Verificar 360 px, 390 px, tablet e desktop; respeitar movimento reduzido e navegação por teclado.

## Review Focus

1. Resposta GraphQL HTTP 200 com erros parciais: conservar apenas campos válidos, sem transformar ausência em zero (tarefa 1).
2. Timestamps históricos sem offset e mudança de data: evitar deslocamento de três horas e ordenar por instante (tarefa 2).
3. Cache expirado durante queda e chamadas simultâneas: uma atualização por chave, com resultado antigo identificado (tarefa 3).
4. Troca rápida de 24/72 horas e retorno a aba visível: resposta antiga não pode substituir seleção atual (tarefa 4).
5. Domínio de preview ou barreira de autenticação: canonical e indexação não podem alegar uma publicação pública inexistente (tarefas 5–6).

## Organização dos arquivos

Criar o projeto Sites em `site/`, subdiretório novo da raiz atual. Os caminhos abaixo são relativos a `site/`, exceto os documentos de planejamento e o relatório final de verificação. O helper Sites gerencia o repositório do site; não alterar configurações globais de Git. A ausência de identidade no repositório pai não impede implementar a aplicação.

- `lib/data/types.ts`, `defesa-civil.ts`, `history.ts`, `forecast.ts`: contratos, consultas e normalização.
- `lib/data/cache.ts`, `dashboard.ts`: cache e composição de resultados independentes.
- `lib/format.ts`, `lib/seo.ts`: formatação e metadados.
- `app/api/dashboard/route.ts`, `app/api/history/route.ts`: endpoints somente leitura.
- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`: shell SSR e identidade visual.
- `components/monitor/*`: painel, cartões, gráfico, previsão e paisagem.
- `app/nivel-do-rio/page.tsx`, `app/previsao-do-tempo/page.tsx`, `app/sobre-os-dados/page.tsx`: conteúdo local útil.
- `app/robots.ts`, `app/sitemap.ts`, `public/favicon.svg`, `public/og-monitora-timbo.png`: descoberta e compartilhamento.
- `tests/data/*.test.ts`, `tests/seo.test.ts`, `tests/fixtures/*`: testes determinísticos e pequenas amostras reais sanitizadas.
- `README.md`: execução, fontes, manutenção e limites conhecidos.

## Tarefa 1 — Mediçōes oficiais confiáveis

**Files:** starter `package.json`, `tsconfig.json`, `vite.config.ts`, `.openai/hosting.json`; criar `vitest.config.ts`, `lib/data/types.ts`, `lib/data/defesa-civil.ts`, `tests/data/defesa-civil.test.ts`, `tests/fixtures/stations.json`.

**Interfaces:** `StationCode = 'DCSC-00023' | 'DCSC-00034'`; `StationReading = {code: StationCode; name: string; reportedAt: string|null; riverM: number|null; rainMm: Record<'1'|'24'|'48'|'72'|'168', number|null>; temperatureC: number|null; feelsLikeC: number|null; humidityPct: number|null; windKmh: number|null}`. `normalizeStations(raw: unknown): StationReading[]`; `fetchStations(fetcher: typeof fetch): Promise<StationReading[]>`.

- [ ] Ler a habilidade de execução selecionada e `using-git-worktrees`, inspecionar instruções locais, preparar isolamento sem perder os documentos aprovados. Criar `site/` vazio, executar `node /home/rafael/.codex/plugins/cache/openai-curated-remote/sites/1.0.2-remix-b.1/scripts/project-setup.mjs` nesse diretório. Registrar uma única vez pelo Sites, persistir ID retornado e iniciar instalação pelo helper `install-dependencies.mjs`.
- [ ] Adicionar Vitest ao gerenciador escolhido pelo helper; definir `test: vitest run` e `typecheck: tsc --noEmit`. Criar fixture mínima a partir da resposta oficial; confirmar unidades contra código/apresentação oficial, sem inferi-las só pela magnitude.
- [ ] Escrever testes: `normalizes_target_stations`, `preserves_zero`, `rejects_missing_and_nonfinite`, `respects_hidden_and_invalid`, `accepts_valid_partial_graphql_data`, `rejects_graphql_without_usable_data`. Assertions centrais: `expect(reading.rainMm['1']).toBe(0)`, `expect(missing.riverM).toBeNull()`, `expect(result.map(s => s.code)).toEqual(['DCSC-00023', 'DCSC-00034'])`. Payload com erro e dados válidos deve conservar estes dados; erro sem dados deve rejeitar.
- [ ] Executar `npm run test -- tests/data/defesa-civil.test.ts`; confirmar falha por adaptador ausente, não por configuração quebrada.
- [ ] Implementar contratos e normalização, endpoint fixo GraphQL, consulta mínima incluindo validade/visibilidade, timeout de 10 segundos e seleção das duas estações. Aceitar formatos array/objeto da coleção. Não expor outras estações ao cliente.
- [ ] Reexecutar o teste até PASS e `npm run typecheck` com exit 0. Registrar a unidade confirmada e a origem da evidência no README. Commit local pelo fluxo permitido, sem inventar identidade do usuário.

## Tarefa 2 — Histórico e previsão

**Files:** criar `lib/data/history.ts`, `lib/data/forecast.ts`, `tests/data/history.test.ts`, `tests/data/forecast.test.ts`, fixtures correspondentes.

**Interfaces:** `RiverPoint = {at: string; metres: number}`; `fetchHistory(hours: 24|72, now: Date, fetcher: typeof fetch): Promise<RiverPoint[]>`; `normalizeHistory(raw: unknown, from: Date, to: Date): RiverPoint[]`; `riverChange(points: RiverPoint[]): {metres: number; from: string; to: string}|null`. `ForecastDay = {date: string; code: number|null; minC: number|null; maxC: number|null; rainMm: number|null; rainProbabilityPct: number|null}`; `Forecast = {days: ForecastDay[]; fetchedAt: string}`; `fetchForecast(now: Date, fetcher: typeof fetch): Promise<Forecast>`.

- [ ] Verificar fuso da série contra o código/apresentação oficial e uma janela conhecida, documentando a evidência. Confirmar unidades e parâmetros do Open-Meteo em sua documentação; consultar coordenadas -26.822939, -49.275219, sete dias, Celsius, mm e `America/Sao_Paulo`. Nunca tratar `generationtime_ms` como instante de geração.
- [ ] Escrever testes: timestamps com/sem offset conforme evidência; janela atravessando meia-noite; pontos duplicados/desordenados; nível zero; duas amostras insuficientes para intervalo pretendido; arrays de previsão incompletos. Assertions: `expect(riverChange([])).toBeNull()`, `expect(riverChange([{at:'2026-10-15T18:00:00Z',metres:1.8},{at:'2026-10-15T19:00:00Z',metres:1.9}])?.metres).toBeCloseTo(0.1)`, `expect(forecast.days).toHaveLength(7)`. Dia sem chuva disponível conserva `null`, nunca zero automático.
- [ ] Executar `npm run test -- tests/data/history.test.ts tests/data/forecast.test.ts`, confirmar RED.
- [ ] Implementar consultas e validação; ordenar e deduplicar série, excluir pontos fora da janela e inválidos. Identificar intervalo real da variação. Usar requisições somente aos hosts fixos; datas são argumentos internos. Registrar explicitamente erro se contrato histórico for incompatível.
- [ ] Reexecutar os testes até PASS; consultar uma resposta real de cada fonte e registrar resultado. Commit das unidades concluídas.

## Tarefa 3 — Cache, falhas parciais e endpoints

**Files:** criar `lib/data/cache.ts`, `lib/data/dashboard.ts`, `app/api/dashboard/route.ts`, `app/api/history/route.ts`, `tests/data/cache.test.ts`, `tests/data/dashboard.test.ts`.

**Interfaces:** `SourceResult<T> = {data: T|null; fetchedAt: string|null; stale: boolean; unavailable: boolean}`. `CacheStore = {read(key: string): Promise<{data: unknown; fetchedAt: string}|null>; write(key: string, value: {data: unknown; fetchedAt: string}): Promise<void>}`. `cachedLoad<T>(key: string, ttlMs: number, loader: () => Promise<T>, store: CacheStore, now: Date): Promise<SourceResult<T>>`. `Dashboard = {stations: SourceResult<StationReading[]>; forecast: SourceResult<Forecast>}`; `getDashboard(now?: Date): Promise<Dashboard>`; `getRiverHistory(hours: 24|72, now?: Date): Promise<SourceResult<RiverPoint[]>>`.

- [ ] Escrever testes com relógio e fetch falsos: cache fresh evita chamada; após 300000 ms medições podem atualizar; previsão usa 1800000 ms; loader falho conserva timestamp original; cache vazio + falha retorna indisponível; duas chamadas concorrentes compartilham promise; falha na previsão não oculta estações. Assertions: `expect(loader).toHaveBeenCalledTimes(1)`, `expect(result.stale).toBe(true)`, `expect(result.fetchedAt).toBe(originalTimestamp)`.
- [ ] Executar `npm run test -- tests/data/cache.test.ts tests/data/dashboard.test.ts`, confirmar RED.
- [ ] Implementar CacheStore com Cache API do Worker e alternativa em memória no desenvolvimento; manter registro válido por até 24 horas como fallback, sempre rotulado após TTL. Deduplicar por chave dentro do isolate; não prometer exclusão global entre regiões. Agregar fontes com resultados independentes.
- [ ] Implementar GET `/api/dashboard` e GET `/api/history?hours=24|72`. Rejeitar outras janelas com 400 e mensagem curta; ignorar qualquer tentativa de fornecer upstream URL. Respostas sem dados retornam estrutura de indisponibilidade sem stack trace; não permitir que erro em cache invalide dado recém-buscado.
- [ ] Verificar PASS dos testes e rotas locais 200/400 esperadas; commit.

## Tarefa 4 — Painel responsivo e acessível

**Files:** modificar `app/page.tsx`, `app/layout.tsx`, `app/globals.css`; criar `lib/format.ts`, `components/monitor/dashboard.tsx`, `river-card.tsx`, `rain-card.tsx`, `weather-card.tsx`, `forecast-strip.tsx`, `river-chart.tsx`, `landscape.tsx`, `use-refresh.ts`, `tests/data/presentation.test.ts`.

**Interfaces:** `MonitorDashboard({initialData: Dashboard; initialHistory: SourceResult<RiverPoint[]>})`; `RiverChart({points: RiverPoint[]})`; `readingStatus(reportedAt: string|null, now: Date): 'current'|'outdated'|'unknown'`; `formatNumber(value: number|null, decimals: number): string`.

- [ ] Escrever testes de apresentação: `expect(formatNumber(null,2)).toBe('—')`, `expect(formatNumber(0,2)).toBe('0,00')`; 60 minutos exatos ainda current, 60 minutos mais 1 ms outdated; timestamp inválido/futuro incompatível unknown; gráfico com lacuna maior que 30 minutos quebra a linha.
- [ ] Executar `npm run test -- tests/data/presentation.test.ts`, confirmar RED; implementar formatação e segmentação; confirmar PASS.
- [ ] Construir shell SSR com valores iniciais reais, H1 e cartões. Aplicar azul profundo, títulos serifados, paisagem SVG, ciano e amarelo; manter nível do rio prioritário. Construir estados carregando, falha e atualização atrasada com texto visível; não usar bolinha “ao vivo” sem verificar recência.
- [ ] Implementar gráfico 24/72h com eixos/unidades, variação e tabela acessível; seletor de estação da chuva; previsão de sete dias e detalhes meteorológicos. Sem série suficiente, apresentar explicação. Nenhum limite de enchente presumido.
- [ ] Implementar atualização a cada 300000 ms quando visível, cancelamento e guarda de sequência ao mudar janela, botão Atualizar e aviso acessível. Uma resposta atrasada da seleção 24h não substitui 72h. Em falha do endpoint, conservar dados anteriores com aviso.
- [ ] Ler referência de preview local do Sites e documentação de desenvolvimento do navegador antes de iniciar preview. Verificar 360/390/768/1440 px, teclado, foco, movimento reduzido, seletores, atualização e erro simulado; testar troca rápida 24/72h e retorno da aba. Capturar evidências de desktop e celular. Corrigir falhas encontradas e commit.

## Tarefa 5 — Conteúdo local e SEO

**Files:** criar `lib/seo.ts`, rotas `/nivel-do-rio`, `/previsao-do-tempo`, `/sobre-os-dados`, `app/robots.ts`, `app/sitemap.ts`, ícones e imagem Open Graph; criar `tests/seo.test.ts`; atualizar navegação/layout e `README.md`.

**Interfaces:** `siteOrigin(): string` lê `SITE_URL` validado como origem HTTPS de produção; `pageMetadata(path: string, title: string, description: string)` gera canonical e Open Graph. Sem origem de produção verificada, não emitir canonical inventado e manter ambiente de revisão não indexável.

- [ ] Escrever testes: canonical absoluto com origem configurada, rejeição de origem inválida, sitemap contém as quatro rotas distintas, ausência de origem não cria `localhost` nos metadados públicos. Assertions: `expect(pageMetadata('/nivel-do-rio', title, description).alternates.canonical).toBe('https://example.com/nivel-do-rio')` usando origem de teste; `expect(sitemapPaths).toEqual(['/', '/nivel-do-rio', '/previsao-do-tempo', '/sobre-os-dados'])`.
- [ ] Executar `npm run test -- tests/seo.test.ts`, confirmar RED; implementar metadados e confirmar PASS.
- [ ] Escrever páginas específicas e úteis: interpretação de medição do rio e limites; previsão versus medição; fontes, estações, frequência, cache, critério de 60 minutos e independência do projeto. Evitar textos repetitivos criados apenas para palavras-chave.
- [ ] Criar favicon e imagem de compartilhamento legível; WebSite e BreadcrumbList coerentes com conteúdo visível. Usar título inicial aprovado. Configurar `SITE_URL` real pelo Sites antes do build final e gerar sitemap/robots apropriados para público.
- [ ] Verificar HTML bruto das quatro páginas com conteúdo, títulos únicos, H1, canonical correto e links internos; confirmar imagem e robots/sitemap acessíveis. Commit.

## Tarefa 6 — Verificação final e publicação pública

**Files:** finalizar `.openai/hosting.json`, `README.md`; criar `docs/verification.md` no projeto do site com resultados reais.

- [ ] Executar `npm run test` e `npm run typecheck`; ambos devem terminar com exit 0. Fazer revisão final conforme habilidade de execução escolhida, focada em integridade dos dados, cache, fuso e indexação. Corrigir problemas materiais e repetir somente verificações afetadas.
- [ ] Registrar no README comandos, variáveis, atribuições, ausência de SLA da API oficial, condição não comercial do Open-Meteo e manutenção dos adaptadores. Não declarar cadastro no Search Console ou domínio próprio concluídos sem evidência.
- [ ] Usar source helper Sites para sincronizar código, executar `node /home/rafael/.codex/plugins/cache/openai-curated-remote/sites/1.0.2-remix-b.1/scripts/build-site.mjs`, criar commit/push verificados e empacotar o artefato. Manter credenciais somente em memória/stdin.
- [ ] Consultar audiência e configurar acesso público para atender à especificação aprovada, respeitando as aprovações nativas. Salvar versão e publicar usando IDs retornados, sem repetir criação do Site. Aguardar estado terminal de deployment.
- [ ] Verificar URL de produção sem autenticação, medições com fonte/horário, previsão, gráfico e SEO. Se a plataforma impedir público, registrar bloqueio e não declarar indexação habilitada. Se público exigir republish após configuração, publicar a versão correta.
- [ ] Abrir resultado para o usuário; entregar URL, resumo do que funciona, verificações realizadas e qualquer limite material. Atualizar checkboxes e relatório com evidências, sem alegar que os testes foram executados antes de executá-los.

## Autorrevisão do plano

Cobertura conferida: todas as seções da especificação mapeadas às tarefas 1–6; interfaces consistentes; cinco modos de falha tratados nas respectivas tarefas. A incerteza do fuso tem uma etapa explícita de verificação antes da apresentação; publicação pública e domínio real têm verificação própria. Este plano ainda não representa implementação ou teste executado.
