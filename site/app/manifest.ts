import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
 return {
  id:'/',name:'Monitora Timbó',short_name:'Monitora Timbó',lang:'pt-BR',
  description:'O céu, a chuva e o rio de Timbó.',start_url:'/',scope:'/',display:'standalone',
  background_color:'#f4f1e5',theme_color:'#193e3e',
  icons:[
   {src:'/pwa/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
   {src:'/pwa/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
  ],
 };
}
