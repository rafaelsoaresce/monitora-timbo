import type {Metadata} from 'next';
// Origin returned by Sites at registration; never inferred from a request Host.
const REGISTERED_ORIGIN='https://monitora-timbo.rafaelsoaresce.chatgpt.site';
export const sitemapPaths=['/','/nivel-do-rio','/previsao-do-tempo','/sobre-os-dados'];
export function siteOrigin():string{const url=new URL(process.env.SITE_URL||REGISTERED_ORIGIN);if(url.protocol!=='https:'||url.hostname==='localhost'||url.username||url.password||url.pathname!=='/')throw new Error('Configure uma origem HTTPS válida.');return url.origin;}
export function pageMetadata(path:string,title:string,description:string):Metadata{const origin=siteOrigin();return {title,description,alternates:{canonical:origin+(path==='/'?'':path)},openGraph:{type:'website',locale:'pt_BR',siteName:'Monitora Timbó',title,description,url:origin+(path==='/'?'':path),images:[{url:`${origin}/og-monitora-timbo.png`,width:1200,height:630,alt:'Monitora Timbó — o céu, a chuva e o rio de Timbó'}]},twitter:{card:'summary_large_image',title,description,images:[`${origin}/og-monitora-timbo.png`]}};}
export function websiteSchema(){return {'@context':'https://schema.org','@type':'WebSite',name:'Monitora Timbó',url:siteOrigin(),inLanguage:'pt-BR',description:'Nível do rio, chuva e previsão do tempo em Timbó, Santa Catarina.'};}
export function breadcrumbSchema(path:string,title:string){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:siteOrigin()},{'@type':'ListItem',position:2,name:title,item:siteOrigin()+path}]};}
