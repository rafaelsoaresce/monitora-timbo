const HALF_HOUR_MS=30*60*1000;
const MINUTE_FIVE_MS=5*60*1000;
// Brasília has a whole-hour UTC offset, so minute 05 is identical in UTC.
// Epoch arithmetic avoids depending on the visitor's or server's local zone.
export function stationCycleStart(now:Date):Date{
 return new Date(Math.floor((now.getTime()-MINUTE_FIVE_MS)/HALF_HOUR_MS)*HALF_HOUR_MS+MINUTE_FIVE_MS);
}
export function nextStationRefresh(now:Date):Date{
 return new Date(stationCycleStart(now).getTime()+HALF_HOUR_MS);
}
export function scheduleStationRefresh(refresh:()=>void):()=>void{
 let stopped=false;
 let timer:ReturnType<typeof setTimeout>;
 // Let the scheduler finish its bounded upstream queries before reading SQLite.
 const schedule=()=>{const now=new Date();const readAt=+nextStationRefresh(new Date(+now-20000))+20000;timer=setTimeout(()=>{if(stopped)return;refresh();schedule();},readAt-now.getTime());};
 schedule();
 return()=>{stopped=true;clearTimeout(timer);};
}
