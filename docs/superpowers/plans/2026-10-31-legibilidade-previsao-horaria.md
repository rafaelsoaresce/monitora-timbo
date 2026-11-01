# Legibilidade e previsão horária — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Melhorar a leitura preservando o design e apresentar as próximas seis horas de previsão.

**Architecture:** Ampliar a normalização do Open-Meteo e manter a persistência JSON existente. Um componente horário seleciona dados futuros a partir do relógio do painel. Ajustes locais no CSS preservam os componentes e reforçam o degradê dos temas existentes.

**Tech Stack:** Next.js, React, TypeScript, CSS existente, SQLite e Vitest; sem dependências novas.

**Spec:** `docs/superpowers/specs/2026-10-31-legibilidade-previsao-horaria-design.md`

## Global Constraints
- Rio antes da chuva, na apresentação e na ordem de leitura.
- Preservar paisagem variável, tipografia, paleta e composição; sem cartão nas condições do Parque Central.
- Próximos seis horários inteiros futuros, incluindo amanhã quando necessário; preservar os sete dias.
- Mesma consulta programada e persistência; nenhuma chamada externa ao visitar ou atualizar o painel.
- Ausência não vira zero; registros antigos sem horas continuam utilizáveis.

## Review Focus
- Cache antigo sem dados horários: previsão diária continua disponível.
- Virada de data em Brasília: amanhã deve seguir a data local, não UTC.
- Cache sem seis horas futuras: não repetir horários passados nem inventar valores.
- Unidades horárias inesperadas e arrays incompletos: não apresentar valores em unidades erradas.
- Temas e telas estreitas: textos legíveis e paisagem visível, sem corte horizontal da página.

### Task 1: Previsão horária normalizada e persistida

**Files:** modificar `site/lib/data/types.ts`, `site/lib/data/forecast.ts`, `site/tests/data/forecast.test.ts` e `site/tests/collection/persistence.test.ts`.

**Interfaces:** adicionar `ForecastHour = {at:string;code:number|null;temperatureC:number|null;rainMm:number|null;rainProbabilityPct:number|null}` e `Forecast.hours?:ForecastHour[]`. Manter `normalizeForecast(raw:unknown,now:Date):Forecast` e `fetchForecast(now:Date,fetcher?:typeof fetch):Promise<Forecast>`.

- [x] Escrever testes: converter `2026-10-31T23:00` com offset -10800 para `2026-11-01T02:00:00.000Z`; preservar nulos em arrays incompletos; ausência de hourly resulta em lista vazia; unidades incorretas invalidam somente os respectivos valores horários; persistir e reler a lista de horas.
- [x] Rodar `npm test -- tests/data/forecast.test.ts tests/collection/persistence.test.ts` em `site`, confirmando a falha dos testes novos antes de implementar.
- [x] Ampliar a requisição existente com `hourly=temperature_2m,weather_code,precipitation_probability,precipitation`. Validar unidades °C, mm e %, converter instantes com o offset do provedor e manter intacta a normalização diária. Não mudar a agenda nem o caminho de leitura salvo.
- [x] Reexecutar os testes e confirmar passagem e preservação dos testes de coleta.

### Task 2: Faixa das próximas seis horas

**Files:** criar `site/components/monitor/hourly-forecast.tsx`, `site/lib/data/hourly-forecast.ts`, `site/tests/hourly-forecast.test.ts`; modificar `site/components/monitor/forecast-strip.tsx`, `site/app/previsao-do-tempo/page.tsx` e `site/app/sobre-os-dados/page.tsx`.

**Interfaces:** `nextForecastHours(hours:ForecastHour[]|undefined,now:Date):ForecastHour[]`, ordenando, eliminando duplicatas de instante e selecionando no máximo seis horários inteiros estritamente futuros; `HourlyForecast({source,now}:{source:SourceResult<Forecast>;now:Date})`.

- [x] Escrever testes do seletor e do HTML renderizado: seis horas futuras; excluir a hora exata atual; ordenar entradas e não duplicar instantes; ignorar instantes inválidos; marcar amanhã com base em Brasília; preservar zero real e representar nulos por travessão; cache antigo e lista esgotada exibem indisponibilidade sem esconder os dias; menos de seis horas não gera preenchimento artificial; cache atrasado conserva aviso e horário.
- [x] Rodar `npm test -- tests/hourly-forecast.test.ts`, confirmando falha inicial.
- [x] Implementar seleção e componente com ícones, formatos e linguagem dos cartões diários. Integrar antes da previsão diária; rolagem horizontal contida no celular, texto legível e identificação Open-Meteo. Reutilizar o relógio `now` do painel, sem requisições novas.
- [x] Atualizar textos explicativos das páginas para incluir previsão horária, mantendo distinção entre observação e previsão.
- [x] Reexecutar testes horários e de previsão, confirmando passagem.

### Task 3: Hierarquia e contraste preservando o design

**Files:** modificar `site/components/monitor/dashboard.tsx`, `site/app/globals.css`, `site/tests/dashboard-layout.test.ts` e `site/docs/verification.md`.

**Interfaces:** manter props dos componentes existentes; trocar ordem DOM para RiverCard e RainCard. Grades `"river rain"` em computador/tablet e `"river" "rain"` em celular.

- [x] Atualizar os testes de layout para verificar a ordem real renderizada e a grade em 360, 390, 520, 768, 801, 1024 e 1440px. Conferir o estado de conexão usado pelo teste: a suíte existente ainda espera um layout anterior à mudança que levou o clima para a paisagem.
- [x] Executar `npm test -- tests/dashboard-layout.test.ts` e confirmar falha com a expectativa nova.
- [x] Reordenar cards e ajustar as regras finais existentes da grade. Aumentar rótulos de umidade/vento para pelo menos 13px e valores para 20px; sensação para 16px; usar quebra de linha quando necessário.
- [x] Reforçar suavemente o degradê já existente atrás das condições, com tons claros nos cenários claros e escuros nos cenários escuros. Corrigir cores fixas problemáticas usando as variáveis do tema, incluindo valores, rótulos e textos auxiliares. Preservar ilustração, marca, títulos e posições gerais.
- [x] Rodar os testes de layout, a suíte completa, `npm run typecheck`, `npm run lint` e `npm run build`. Investigar falhas e separar limitações preexistentes de regressões novas.
- [x] Conferir visualmente o painel com dados representativos, nos seis cenários e em celular/computador; verificar contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande contra o fundo efetivo, quebra dos indicadores e faixa de seis horas. Registrar evidências e resultados em `site/docs/verification.md`.
- [x] Revisar diff final contra o desenho e conferir `git diff --check`; preservar arquivos locais não relacionados. Trabalho mantido no checkout, sem commit ou publicação.

## Execução sugerida
Execução direta nesta sessão: as três tarefas são pequenas e dependem das mesmas interfaces; revisão final antes da entrega. Alternativamente, implementação e revisão por subagentes por tarefa, com maior custo de contexto.
