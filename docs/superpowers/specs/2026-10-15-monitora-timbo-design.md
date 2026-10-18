# Monitora Timbó — especificação do site

Data: 15 de outubro de 2026.
Estado: especificação aprovada pelo usuário em 15/10/2026.

## Objetivo e público

Criar um site público, em português brasileiro, para moradores e visitantes de Timbó consultarem rapidamente o nível do rio, a chuva observada, as condições meteorológicas e a previsão. O site deve funcionar bem em celular e computador e oferecer conteúdo útil e indexável para buscas locais.

O usuário aprovou a inspiração visual no Little Horizon Club, o destaque para nível e chuva, a previsão de sete dias e o processamento no servidor com cache. A disponibilidade pública para mecanismos de busca faz parte do objetivo. Não há garantia de posição ou prazo de indexação.

## Fontes verificadas

O painel oficial usa `https://monitoramento.defesacivil.sc.gov.br/graphql`. Foi possível executar suas consultas públicas `Tags_data` e `Historic` sem autenticação em 15/10/2026. A consulta reduzida de medições e a de histórico retornaram dados sem erros GraphQL. Não se trata de uma API com contrato público de estabilidade confirmado.

- **DCSC-00023 — SDC-SC Timbó 1:** nível do rio e chuva acumulada. Coordenadas fornecidas: -26.837547, -49.270775.
- **DCSC-00034 — SDC-SC Timbó 2:** temperatura, sensação térmica, umidade, pressão atmosférica, vento e chuva acumulada. Coordenadas fornecidas: -26.822939, -49.275219.
- **Histórico:** a consulta oficial retorna `historic.items`, com nível do rio e horários. Foi obtida uma série de 24 horas. Os timestamps históricos vêm sem indicação explícita de fuso; sua interpretação precisa ser validada contra a apresentação oficial antes de exibir horas no gráfico.
- **Previsão:** Open-Meteo, usando as coordenadas de Timbó, sete dias e fuso `America/Sao_Paulo`, com atribuição visível. O plano gratuito é para uso não comercial; publicidade ou monetização exigem reavaliar o provedor/plano.

Os endereços diretos das estações exibiram inicialmente “Estação não encontrada”, mas a consulta à API confirmou as duas estações. A implementação deve consumir os dados estruturados, sem depender da renderização dessas páginas.

Referências:
- https://monitoramento.defesacivil.sc.gov.br/estacao/DCSC-00023
- https://monitoramento.defesacivil.sc.gov.br/estacao/DCSC-00034
- https://open-meteo.com/en/pricing
- https://open-meteo.com/en/docs
- https://little-horizon-club.vercel.app/
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Experiência e identidade visual

Cabeçalho com marca “Monitora Timbó”, localização Timbó · Santa Catarina e navegação para Rio, Chuva, Previsão e Sobre os dados. Títulos serifados marcantes, corpo sem serifa legível, base azul profunda, detalhes em ciano e amarelo quente, cartões com cantos arredondados e paisagem vetorial de céu, morros e rio. A ilustração não deve sugerir uma medição ou cenário de risco inexistente.

A primeira tela prioriza o nível do rio em número grande, a chuva das últimas 24 horas e a temperatura observada. Horário e fonte acompanham os valores. No computador, os cartões usam uma grade; no celular, o conteúdo se organiza em uma coluna na ordem tempo agora, chuva acumulada e nível do rio, conforme ajuste solicitado pelo usuário.

Conteúdo e controles:
1. Nível atual em metros, estação e horário da informação; gráfico real das últimas 24 horas, com opção de 72 horas. A variação será calculada apenas com amostras válidas e terá o intervalo explicitado.
2. Chuva acumulada em 1, 24, 48 e 72 horas e sete dias, tendo Timbó 1 como referência principal. A chuva de Timbó 2 pode ser consultada por seletor identificado; os totais das estações não serão somados.
3. Condições observadas em Timbó 2: temperatura, sensação térmica, umidade e vento. Apenas campos válidos e com unidades confirmadas serão apresentados.
4. Previsão de sete dias: condição, mínima/máxima, probabilidade de chuva e precipitação prevista. Previsão e observação serão rotuladas distintamente.
5. Explicação curta de como ler nível, chuva acumulada, previsão e horários, com links para as fontes. Identificação do Monitora Timbó como projeto independente.
6. Atualização automática e botão “Atualizar”, com estado de carregamento e resultado acessível.

Não atribuir categorias “normal”, “alerta” ou “emergência” com limites inventados. O gráfico exibirá valores medidos sem cotas de risco enquanto não houver referência oficial validada.

## Arquitetura

Aplicação em TypeScript, React e Vinext a partir do starter do Sites, compatível com o ambiente Cloudflare Workers. HTML renderizado no servidor para conteúdo principal, metadados e textos explicativos; JavaScript no cliente para atualização e interação dos gráficos.

Módulos separados para:
- adaptador da Defesa Civil e normalização das duas estações;
- adaptador de histórico;
- adaptador de previsão Open-Meteo;
- cache e tratamento de erros;
- apresentação, formatação pt-BR e estados de qualidade dos dados;
- metadados SEO e páginas informativas.

As requisições do navegador usam endpoints do próprio site. O servidor consulta apenas os provedores fixos, com timeout e cache. As fontes são buscadas independentemente, para uma falha não esconder dados válidos das outras.

Atualização solicitada pelo usuário em 15/10/2026: medições e histórico usam ciclos horários com renovação a partir do minuto 05 de cada hora; previsão mantém cache de 30 minutos. O cliente agenda a próxima consulta para XXh05 enquanto visível, evita requisições simultâneas e pausa consultas em segundo plano. A primeira visita ou retorno à aba consulta o ciclo atual; sem visitas não há coleta independente. O botão de atualização respeita o cache compartilhado. Não haverá banco histórico próprio nesta primeira versão: os gráficos usam o histórico oficial disponível.

## Integridade e falhas

- Validar o formato, números finitos, timestamps e unidades; preservar zero legítimo e distinguir `null` de zero.
- Respeitar campos de visibilidade e validade fornecidos pela origem.
- Manter separados horário informado pela estação, horário da consulta e geração da previsão. Não renomear o timestamp da estação como horário exato do sensor sem confirmar sua semântica.
- Identificar medição com mais de 60 minutos como “Dado desatualizado”; este é um critério editorial de atualização, não um alerta hidrológico.
- Em falha, usar o último resultado válido disponível no cache, com aviso e horário original. Sem resultado anterior, mostrar indisponibilidade e link da fonte. Nunca usar números demonstrativos como dados atuais.
- História incompleta deve indicar lacunas; gráfico sem pontos suficientes exibe mensagem explicativa. Não interpolar grandes lacunas como se houvesse leituras reais.
- Não expor erros internos ou respostas brutas ao visitante.

## Busca, acessibilidade e desempenho

Página inicial com título “Monitora Timbó | Nível do rio, chuva e previsão do tempo”, descrição local e H1 único. Rotas informativas para nível do rio, previsão e metodologia, com conteúdo específico e links internos. Canonical absoluto baseado no domínio de produção, Open Graph, imagem de compartilhamento, favicon, sitemap e robots coerentes com o ambiente.

Dados estruturados WebSite e BreadcrumbList onde aplicáveis, sem prometer resultados enriquecidos. Conteúdo essencial presente no HTML inicial. Nenhuma página privada de revisão deve ser apresentada como pronta para indexação; a publicação pública precisa ser verificada para cumprir o objetivo.

Semântica HTML, foco visível, navegação por teclado, contraste suficiente, rótulos de controles, alternativa textual/tabela para gráficos e respeito a `prefers-reduced-motion`. Verificar 360 px, 390 px, tablet e desktop, sem rolagem horizontal involuntária. Usar SVG/CSS leve para a paisagem e evitar dependências pesadas de gráficos.

## Verificação e entrega

Testes focados nos adaptadores e normalização: zero, campos ausentes, unidades, timestamps, dados antigos, falha parcial e erro GraphQL. Verificar contratos reais dos provedores, sem usar chamadas externas nos testes unitários. Testar cálculo da variação e janelas do histórico.

Executar checagem TypeScript, testes e build. Inspecionar a interface no navegador em desktop e celular, estados de falha, seletores e atualização. Confirmar HTML renderizado, canonical, sitemap e ausência de dados fictícios. Publicar a versão verificada pelo fluxo Sites e fornecer URL e instruções de manutenção.

O Sites cria projetos privados inicialmente. Para atender à busca pública, tornar o site acessível sem autenticação é requisito de entrega, sujeito aos controles da plataforma. Se a plataforma não permitir acesso público, entregar a implementação e informar esse bloqueio de indexação; não alegar que SEO técnico supera uma barreira de login. Domínio próprio e registro no Search Console dependem da disponibilidade de domínio/conta do usuário e não são pré-requisitos para construir o site.

## Fora desta versão

Contas de usuários, notificações push, alertas automáticos por mensagem, anúncios, mapas de inundação, previsões de enchente, armazenamento de longo prazo e painel administrativo. Nenhuma dessas funções é necessária para o painel solicitado.

## Ajuste solicitado: visual conforme horário e tempo

O usuário solicitou fundo claro quando houver sol e alternância conforme horário e condição atual. Implementar paletas de sol, nublado, chuva, tempestade e noite; paisagem acompanha o tema. Usar condição atual estimada pelo Open-Meteo (não resumo diário) e nascer/pôr do sol de Timbó, com atribuição. Na ausência de dados válidos, tema neutro por horário; sem horários solares, aproximação de 6h a 18h. O relógio visual atualiza sem novas chamadas à API e preserva consultas de estações às XXh05.
