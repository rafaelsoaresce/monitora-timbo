# Configuração de Analytics em execução

Pedido aprovado: usar GOOGLE_ANALYTICS_ID no .env, trocar sem alterar código/build e remover o ID real do código e documentação atuais. Manter coleta automática e eventos existentes.

Abordagens: variável NEXT_PUBLIC exigiria rebuild; configuração pública por endpoint dinâmico permite ler ambiente atual e manter as páginas estáticas. Escolha: endpoint /api/analytics-config, sem cache, expondo somente ID validado ou null. Sem variável válida, não carregar GA. O ID continua público no navegador e no histórico Git.

.env em site/ atende Next e Compose executado nessa pasta, ignorado por Git/Docker. Compose repassa GOOGLE_ANALYTICS_ID ao contêiner; para trocar, recriar contêiner sem rebuild. Nenhum segredo adicional deve ser exposto no endpoint.
