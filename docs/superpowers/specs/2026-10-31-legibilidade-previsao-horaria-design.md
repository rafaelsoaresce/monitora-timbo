# Legibilidade e previsão das próximas 6 horas

## Intenção
Facilitar a leitura dos dados do Monitora Timbó preservando a identidade visual existente: paisagem variável, tipografia, paleta, componentes e composição geral.

## Alterações aprovadas na conversa
- Apresentar o nível do rio antes da chuva acumulada: à esquerda no computador e acima no celular, inclusive na ordem de leitura.
- Ampliar os rótulos e valores de umidade, vento médio e sensação térmica, mantendo as condições do Parque Central sobre a paisagem.
- Adotar a opção B da segunda prévia: reforçar suavemente o degradê existente atrás das condições, usando tons coerentes com cada cenário e mantendo a ilustração visível. Corrigir cores fixas que comprometam o contraste nos temas variáveis.
- Acrescentar a previsão das próximas 6 horas antes da previsão diária, mantendo os sete dias existentes. A faixa continua na madrugada seguinte quando necessário.

## Abordagens consideradas
1. Cartão opaco sobre o cenário ou condições em faixa separada: rejeitados pelo usuário por alterarem o design existente.
2. Opção A da segunda prévia: ajustar cores por cenário e ampliar indicadores, com intervenção mínima no fundo; pode oferecer proteção insuficiente sobre detalhes da paisagem.
3. Opção B da segunda prévia, escolhida pelo usuário: mesmas correções de leitura com reforço localizado do degradê existente. Preserva a composição e oferece maior controle do contraste.

## Dados e comportamento
Ampliar a mesma consulta programada ao Open-Meteo para incluir previsão por hora e persistir o resultado no banco próprio. Visitas e atualização do painel continuam lendo apenas o banco, sem consultas externas adicionais.

Decisões propostas para a implementação: mostrar os seis próximos horários inteiros futuros, no horário de Timbó, com hora, condição do céu, temperatura, probabilidade e volume de chuva. Marcar a passagem para amanhã. Usar a linguagem visual dos cartões diários; adaptar a faixa ao celular sem reduzir os textos para caber. Distinguir previsão de observações das estações.

Dados antigos salvos sem previsão horária continuam válidos para a previsão diária. Até a primeira coleta com dados horários, apresentar indisponibilidade da faixa, sem inventar valores. Dados ausentes não viram zero; previsão em cache conserva seu horário e indicação de atraso. Não preencher seis posições com horários já passados se houver menos dados futuros disponíveis.

## Limites
Sem reformulação da página, novos cartões nas condições atuais ou mudança nas fontes e frequência de coleta. A prévia usa valores fictícios e não constitui validação meteorológica.

## Verificação
Conferir leitura e composição em celular e computador nos cenários de sol, nublado, chuva, temporal, noite e noite com chuva. Verificar ordem do rio, tamanhos dos indicadores, contraste dos textos e preservação da paisagem. Cobrir normalização dos dados horários, seleção das seis horas futuras, virada do dia e compatibilidade com registros antigos; executar as verificações pertinentes do projeto.
