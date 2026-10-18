import {MonitorRepository} from '../data/repository.ts';
import {fetchStations} from '../data/defesa-civil.ts';
import {fetchForecast} from '../data/forecast.ts';
import {stationCycleStart,nextStationRefresh} from '../data/schedule.ts';
import type {StationReading} from '../data/types.ts';
/** A slot is consumed BEFORE the first network attempt, even if the process dies.
 * No retries, historical backfills or HTTP redirect following: <=48 DC requests/day.
 */
export async function collectScheduledSlot(repo:MonitorRepository,now:Date,fetcher:typeof fetch=fetch){
 const slot=stationCycleStart(now);
 if(+now-+slot>=60000)return {status:'outside-window'};
 if(!repo.claim(slot))return {status:'already-attempted'};
 return collectReservedSlot(repo,slot,now,fetcher);
}
/** Clean-database bootstrap is scheduler-only and substitutes the next regular
 * slot. A failed initial attempt stays recorded: restarts must not retry it. */
export async function collectInitialIfClean(repo:MonitorRepository,now:Date,fetcher:typeof fetch=fetch){
 const current=stationCycleStart(now);
 const reserved=+now-+current<60000?current:nextStationRefresh(now);
 if(!repo.claimInitial(reserved))return {status:'not-clean'};
 return collectReservedSlot(repo,reserved,now,fetcher);
}
async function collectReservedSlot(repo:MonitorRepository,slot:Date,now:Date,fetcher:typeof fetch){
 const results=await Promise.allSettled([fetchStations(fetcher),fetchForecast(now,fetcher)]);
 let stations:StationReading[]=[];
 if(results[0].status==='fulfilled')stations=results[0].value.filter(s=>s.reportedAt&&Date.parse(s.reportedAt)<=+now+300000&&[s.riverM,s.temperatureC,...Object.values(s.rainMm)].some(v=>v!==null));
 const forecast=results[1].status==='fulfilled'?results[1].value:null;
 const stationsStatus=stations.length===2?'ok':stations.length?'partial':'error';
 repo.finish(slot,now,{stations,forecast,stationsStatus,forecastStatus:forecast?'ok':'error'});
 return {status:stationsStatus==='ok'&&forecast?'ok':'partial',slotAt:slot.toISOString(),stations:stations.length,forecast:!!forecast};
}
