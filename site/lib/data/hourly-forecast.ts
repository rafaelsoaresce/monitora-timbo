import type {ForecastHour} from './types';

/** Only the upcoming six clock hours; stale caches must not jump over gaps. */
export function nextForecastHours(hours:ForecastHour[]|undefined,now:Date):ForecastHour[]{
 const first=(Math.floor(+now/3600000)+1)*3600000,last=first+5*3600000;
 const seen=new Set<number>();
 return (hours??[]).filter(hour=>{
  const at=Date.parse(hour.at);
  if(!Number.isFinite(at)||at<first||at>last||at%3600000!==0||seen.has(at))return false;
  seen.add(at);return true;
 }).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(0,6);
}
