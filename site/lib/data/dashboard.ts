import {existsSync} from 'node:fs';
import type {Dashboard,Forecast,SourceResult,StationReading,RiverPoint} from './types';
import {MonitorRepository,databasePath} from './repository';
import {readSavedDashboard,readSavedHistory} from './saved-readers';
const unavailable={data:null,fetchedAt:null,stale:false,unavailable:true,state:'error' as const};
// Preserved for callers/tests; neither function passed here queries an upstream.
export async function composeDashboard(stations:()=>Promise<SourceResult<StationReading[]>>,forecast:()=>Promise<SourceResult<Forecast>>):Promise<Dashboard>{
 const results=await Promise.allSettled([stations(),forecast()]);return {stations:results[0].status==='fulfilled'?results[0].value:unavailable,forecast:results[1].status==='fulfilled'?results[1].value:unavailable};
}
export async function getDashboard(now=new Date()):Promise<Dashboard>{
 const path=databasePath();if(!existsSync(path))return readSavedDashboard(null,now);
 let repo:MonitorRepository|undefined;
 try{repo=new MonitorRepository(path,{readonly:true});return readSavedDashboard(repo,now);}
 catch{return {stations:unavailable,forecast:unavailable};}finally{repo?.close();}
}
export async function getRiverHistory(hours:24|72,now=new Date()):Promise<SourceResult<RiverPoint[]>>{
 const path=databasePath();if(!existsSync(path))return readSavedHistory(null,hours,now);
 let repo:MonitorRepository|undefined;
 try{repo=new MonitorRepository(path,{readonly:true});return readSavedHistory(repo,hours,now);}
 catch{return unavailable;}finally{repo?.close();}
}
export function parseHistoryHours(value:string|null):24|72{if(value===null||value==='24')return 24;if(value==='72')return 72;throw new Error('Escolha 24 ou 72 horas.');}
