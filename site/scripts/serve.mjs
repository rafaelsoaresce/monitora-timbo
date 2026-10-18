// A single command starts both web and scheduler; either child failing stops both.
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dev=process.argv[2]==='dev';
const port=process.env.PORT||'5173';
const hostname=process.env.HOSTNAME_BIND||'127.0.0.1';
const collector=spawn(process.execPath,['--disable-warning=ExperimentalWarning','lib/collection/run.ts'],{cwd:root,stdio:'inherit',env:process.env});
const web=spawn(process.execPath,['node_modules/next/dist/bin/next',dev?'dev':'start','--hostname',hostname,'--port',port,...(dev?['--webpack']:[])],{cwd:root,stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;collector.kill('SIGTERM');web.kill('SIGTERM');const timer=setTimeout(()=>{collector.kill('SIGKILL');web.kill('SIGKILL');process.exit(code);},5000);timer.unref();Promise.all([collector,web].map(child=>new Promise(resolve=>child.exitCode!==null||child.signalCode?resolve():child.once('exit',resolve)))).then(()=>process.exit(code));}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
for(const child of [collector,web]){child.once('error',error=>{console.error(error.message);stop(1);});child.once('exit',(code,signal)=>{if(!stopping){console.error(`Processo ${child===collector?'coletor':'web'} encerrou (${code??signal}).`);stop(code||1);}});}
