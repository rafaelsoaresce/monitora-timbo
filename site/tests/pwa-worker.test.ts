import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {expect,it} from 'vitest';

function worker(){
 const events:Record<string,(event:any)=>void>={};
 const stored:string[]=[];const deleted:string[]=[];let fail=false;
 const fallback=new Response('offline shell');
 runInNewContext(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8'),{
  self:{location:{origin:'https://example.com'},addEventListener:(name:string,handler:any)=>events[name]=handler,clients:{claim:async()=>{}},skipWaiting:async()=>{}},
  caches:{open:async()=>({addAll:async(paths:string[])=>stored.push(...paths),match:async()=>fallback}),keys:async()=>['monitora-timbo-shell-v0','another-app'],delete:async(key:string)=>{deleted.push(key);}},
  fetch:async()=>{if(fail)throw Error('network');return new Response('server error',{status:500});},URL,
 });
 return {events,stored,deleted,setFail:()=>fail=true,async navigate(url:string,mode='navigate',method='GET'){
  let result:Promise<Response>|undefined;events.fetch({request:{url,mode,method},respondWith:(r:Promise<Response>)=>result=r});return result?await result:null;
 }};
}
it('precaches only an empty shell and removes only its own old caches',async()=>{
 const w=worker();let pending:Promise<unknown>=Promise.resolve();
 w.events.install({waitUntil:(p:Promise<unknown>)=>pending=p});await pending;
 expect(w.stored).toEqual(['/offline.html','/pwa/icon-192.png','/pwa/icon-512.png','/pwa/apple-touch-icon.png']);
 w.events.activate({waitUntil:(p:Promise<unknown>)=>pending=p});await pending;
 expect(w.deleted).toEqual(['monitora-timbo-shell-v0']);
});
it('uses offline HTML only for failed document navigation, never API or RSC',async()=>{
 const w=worker();expect((await w.navigate('https://example.com/'))?.status).toBe(500);
 w.setFail();expect(await (await w.navigate('https://example.com/'))?.text()).toBe('offline shell');
 for(const [url,mode,method] of [['https://example.com/api/dashboard','navigate','GET'],['https://example.com/?_rsc=x','cors','GET'],['https://example.com/','navigate','POST'],['https://other.com/','navigate','GET']])expect(await w.navigate(url,mode,method)).toBeNull();
});
