import type {SourceResult} from './types';
type Entry={data:unknown;fetchedAt:string};
export type CacheStore={read(key:string):Promise<Entry|null>;write(key:string,value:Entry):Promise<void>};
const MAX_AGE=86400000;
export class MemoryStore implements CacheStore{
 private entries=new Map<string,Entry>();
 async read(key:string){return this.entries.get(key)??null;}
 async write(key:string,value:Entry){this.entries.set(key,value);}
}
const memory=new MemoryStore();
export const store:CacheStore={
 async read(key){const cache=(globalThis as unknown as {caches?:{default:Cache}}).caches?.default;if(!cache)return memory.read(key);const r=await cache.match(`https://monitora-timbo.cache/${encodeURIComponent(key)}`);return r?await r.json() as Entry:null;},
 async write(key,value){const cache=(globalThis as unknown as {caches?:{default:Cache}}).caches?.default;if(!cache)return memory.write(key,value);await cache.put(`https://monitora-timbo.cache/${encodeURIComponent(key)}`,new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=86400'}}));}
};
const flights=new WeakMap<CacheStore,Map<string,Promise<SourceResult<unknown>>>>();
export async function cachedLoad<T>(key:string,ttlMs:number,loader:()=>Promise<T>,cache:CacheStore,now:Date,freshSince?:Date):Promise<SourceResult<T>>{
 let group=flights.get(cache);if(!group){group=new Map();flights.set(cache,group);}const active=group.get(key);if(active)return active as Promise<SourceResult<T>>;
 const operation=(async():Promise<SourceResult<T>>=>{
  let previous:Entry|null=null;try{previous=await cache.read(key);}catch{/* Cache failure must not block upstream. */}
  const age=previous?now.getTime()-Date.parse(previous.fetchedAt):Infinity;
  if(!Number.isFinite(age)||age<0||age>MAX_AGE)previous=null;
  if(previous&&age<ttlMs&&(!freshSince||Date.parse(previous.fetchedAt)>=freshSince.getTime()))return {data:previous.data as T,fetchedAt:previous.fetchedAt,stale:false,unavailable:false};
  try{const data=await loader();const entry={data,fetchedAt:now.toISOString()};try{await cache.write(key,entry);}catch{/* A fresh reading remains useful without cache. */}return {...entry,stale:false,unavailable:false};}
  catch{return {data:previous?.data as T??null,fetchedAt:previous?.fetchedAt??null,stale:!!previous,unavailable:!previous};}
 })();group.set(key,operation);try{return await operation;}finally{group.delete(key);}
}
