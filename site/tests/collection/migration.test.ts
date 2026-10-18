import {it,expect} from 'vitest';
import {Worker} from 'node:worker_threads';
import {mkdtempSync,rmSync} from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';
it('parallel_first_start_migrates_once_and_claims_once',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'monitora-migrate-'));
 try{for(let round=0;round<3;round++){
  const workers=Array.from({length:12},()=>new Worker(new URL('../fixtures/migrate-worker.mjs',import.meta.url),{workerData:join(dir,`${round}.sqlite`),execArgv:['--disable-warning=ExperimentalWarning']}));
  try{
   await Promise.all(workers.map(w=>new Promise((resolve,reject)=>{w.once('message',resolve);w.once('error',reject);})));const results=workers.map(w=>new Promise<{ok:boolean;claimed?:boolean;error?:string}>((resolve,reject)=>{w.once('message',resolve);w.once('error',reject);}));
   workers.forEach(w=>w.postMessage('start'));const actual=await Promise.all(results);expect(actual.filter(r=>!r.ok)).toEqual([]);expect(actual.filter(r=>r.claimed)).toHaveLength(1);
  }finally{await Promise.all(workers.map(w=>w.terminate()));}
 }}finally{rmSync(dir,{recursive:true,force:true});}
},20000);
