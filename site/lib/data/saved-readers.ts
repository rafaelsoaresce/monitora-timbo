import type {MonitorRepository} from './repository.ts';
import type {Dashboard,Forecast,SourceResult,StationReading,RiverPoint} from './types.ts';
const empty=<T>(state:'waiting'|'error'='waiting'):SourceResult<T>=>({data:null,fetchedAt:null,stale:false,unavailable:true,state});
export function readSavedDashboard(repo:MonitorRepository|null,now:Date):Dashboard{
 if(!repo)return {stations:empty(),forecast:empty()};
 try{
  const rows=repo.latestStations(),forecast=repo.latestForecast(),run=repo.latestRun();
  const oldest=rows.length?rows.map(r=>r.collected_at).sort()[0]:null;
  const ages=Object.fromEntries(rows.map(r=>[r.code,r.collected_at]));
  return {
   stations:rows.length?{data:rows.map(r=>JSON.parse(r.payload) as StationReading),fetchedAt:oldest,stale:+now-Date.parse(oldest!)>2700000||!!run&&run.stations_status!=='ok',unavailable:false,state:'ready',stationCollectedAt:ages}:empty(run?'error':'waiting'),
   forecast:forecast?{data:JSON.parse(forecast.payload) as Forecast,fetchedAt:forecast.collected_at,stale:+now-Date.parse(forecast.collected_at)>2700000||!!run&&run.forecast_status!=='ok',unavailable:false,state:'ready'}:empty(run?'error':'waiting')
  };
 }catch{return {stations:empty('error'),forecast:empty('error')};}
}
export function readSavedHistory(repo:MonitorRepository|null,hours:24|72,now:Date):SourceResult<RiverPoint[]>{
 if(!repo)return empty();
 try{const data=repo.river(new Date(+now-hours*3600000),now);const latest=repo.latestStations().find(r=>r.code==='DCSC-00023');const run=repo.latestRun();return {data,fetchedAt:latest?.collected_at??null,stale:!!latest&&(+now-Date.parse(latest.collected_at)>2700000||!!run&&run.stations_status!=='ok'),unavailable:!data.length,state:data.length?'ready':run?'error':'waiting'};}
 catch{return empty('error');}
}
