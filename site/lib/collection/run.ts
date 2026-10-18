import {MonitorRepository,databasePath} from '../data/repository.ts';
import {collectScheduledSlot,collectInitialIfClean} from './collector.ts';
import {nextStationRefresh} from '../data/schedule.ts';
const repo=new MonitorRepository(databasePath());
let stopped=false,timer:ReturnType<typeof setTimeout>|undefined;
async function tick(){
 try{const result=await collectScheduledSlot(repo,new Date());console.log(JSON.stringify({event:'collection',...result}));}
 catch(error){console.error(JSON.stringify({event:'collection-write-failed',message:error instanceof Error?error.message:'unknown'}));}
 if(!stopped){const now=new Date();timer=setTimeout(()=>void tick(),Math.max(1,+nextStationRefresh(now)-+now));}
}
for(const signal of ['SIGTERM','SIGINT'] as const)process.once(signal,()=>{stopped=true;if(timer)clearTimeout(timer);repo.close();process.exit(0);});
console.log(JSON.stringify({event:'scheduler-started',database:databasePath(),next:nextStationRefresh(new Date()).toISOString(),cadence:'05,35 every hour',maxDefenseCivilRequestsPerDay:48}));
try{console.log(JSON.stringify({event:'initial-collection',...await collectInitialIfClean(repo,new Date())}));}catch(error){console.error(JSON.stringify({event:'initial-collection-failed',message:error instanceof Error?error.message:'unknown'}));}
await tick();
