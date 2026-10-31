# Monitora Timbó — instalação e experiência sem conexão

## Intenção

Permitir que visitantes pelo navegador mobile adicionem o Monitora Timbó à tela inicial e o abram como aplicativo, aproveitando a aplicação Next.js existente. A experiência depende da internet para apresentar medições e previsão.

## Abordagens consideradas

1. Instalação básica com manifesto e ícones: menor esforço, mas sem conexão o navegador pode apresentar sua própria página de erro.
2. Instalação com estrutura disponível offline: permite apresentar aviso próprio e campos vazios, sem mostrar medições salvas. Escolhida pelo usuário para controlar a experiência sem conexão.

## Experiência aprovada na prévia

- Convite no início da página no navegador mobile, antes do conteúdo principal do painel.
- Primeiro o botão **Instalar aplicativo**; logo abaixo, **Adicione à tela inicial e abra como aplicativo.**
- Sem título adicional e sem a frase “Sem loja de aplicativos.”
- O convite pode ser dispensado e não aparece ao abrir em modo aplicativo.
- Em navegadores compatíveis, o botão aciona a confirmação nativa de instalação quando disponível. Nos demais casos, mostra instruções adequadas ao navegador; no iPhone, orienta a adicionar à tela inicial pelo menu de compartilhamento e manter “Abrir como App” ativado quando disponível.
- Sem conexão, apresentar **Sem conexão com a internet**, explicação para conectar-se, campos **—** e botão **Tentar novamente**.
- Não apresentar medições, gráficos, histórico ou previsão antigos no estado sem conexão, inclusive quando a conexão cair com o painel já aberto.
- Restaurar as informações apenas depois de uma consulta online bem-sucedida. O evento de reconexão sozinho não libera os valores anteriores.

## Restrições e decisões técnicas propostas

- Manter Next.js e a identidade visual atual; adicionar manifesto, ícones adequados e abertura em janela própria quando suportada.
- Usar service worker para disponibilizar uma estrutura estática sem dados. Não armazenar HTML dinâmico do painel, respostas das APIs de dados, medições ou previsão no cache offline.
- A instalação depende das capacidades e permissões do navegador e de HTTPS em produção; não pode ser concluída automaticamente pelo site.
- A detecção deve considerar falhas nas consultas além do sinal de conectividade do navegador. Falhas do servidor devem ter mensagem de indisponibilidade apropriada, sem afirmar indevidamente que o usuário está offline.
- Não alterar o coletor, a frequência de coleta, SQLite ou o acesso somente leitura às APIs. A atualização continua consultando apenas dados já salvos no servidor.
- A regra de esconder dados offline não muda as regras existentes de identificação de dados desatualizados recebidos online.
- Proposta do implementador: dispensar o convite durante a sessão de navegação; manter a possibilidade de instalar pelos controles do navegador.

## Fora do escopo

Aplicativo nativo, publicação em lojas, notificações push, consulta de medições offline e reformulação do painel.

## Critérios de aceitação

- Verificar convite em viewport mobile, instruções alternativas e ausência do convite no modo aplicativo.
- Verificar abertura offline após uma visita online, queda de conexão com painel aberto e nova tentativa sem sucesso: nenhum valor anterior fica visível.
- Verificar que reconectar exige carregamento bem-sucedido antes de restaurar dados e que os caches offline não contêm respostas de dados.
- Verificar regressões com os testes pertinentes, checagem de tipos e build da aplicação.

## A cargo da implementação

Detalhes do manifesto, geração dos ícones a partir da identidade existente, organização do service worker, tratamento de atualização do cache e integração acessível dos estados de instalação e conectividade.
