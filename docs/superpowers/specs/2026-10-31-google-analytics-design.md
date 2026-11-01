# Google Analytics — desenho aprovado e ajuste solicitado

Objetivo: entender audiência e uso do Monitora Timbó com GA4 GOOGLE_ANALYTICS_ID.

Escopo aprovado: métricas básicas e eventos de Atualizar, troca 24/72h e estação de chuva. Somente produção; não modificar o coletor meteorológico.

## Alteração explícita do usuário
Após aprovar o escopo inicial com consentimento, o usuário solicitou coletar métricas sem necessidade de aceite. Portanto, carregar automaticamente sem banner ou armazenamento de preferência de consentimento. Informar o uso e cookies em Sobre os dados; não prometer conformidade legal automática.

## Abordagens
Tag direta no Next.js escolhida por simplicidade. Google Tag Manager considerado, mas adicionaria administração desnecessária para uma única ferramenta.

## Implementação
Componente cliente no layout, tag única após hidratação, métricas básicas pela configuração GA4 e medição otimizada. Sem page_view manual duplicado. Publicidade e sinais Google desativados na tag. Três eventos com parâmetros estritamente tipados. Sem envio no desenvolvimento ou SSR. Documentar publicação, dimensões e verificação real.

## Verificação
Testar inicialização automática única, produção, SSR e os três eventos. Rodar suíte, tipos, lint e build. Publicação e relatório real dependem do deploy.
