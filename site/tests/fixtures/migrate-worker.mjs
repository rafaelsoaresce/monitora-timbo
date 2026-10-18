import {parentPort,workerData} from 'node:worker_threads';
import {MonitorRepository} from '../../lib/data/repository.ts';
parentPort.postMessage('ready');
parentPort.once('message',()=>{
 try{const repo=new MonitorRepository(workerData);const claimed=repo.claim(new Date('2026-10-15T21:35:00Z'));repo.close();parentPort.postMessage({ok:true,claimed});}
 catch(error){parentPort.postMessage({ok:false,error:error.message});}
 parentPort.close();
});
