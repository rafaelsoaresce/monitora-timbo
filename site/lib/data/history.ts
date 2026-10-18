import {at,finite,queryOfficial} from './defesa-civil';
import type {RiverPoint} from './types';
export const HISTORY_QUERY=`query Historic($stationCode: String!, $startDate: String!, $endDate: String!) { historic(system: Qualle_Hidrometeorologia, client: "secretaria-de-defesa-civil", stationCode: $stationCode, startDate: $startDate, endDate: $endDate, opts: { ordenacao: ASC }) }`;
// Official UI parses zone-less historic timestamps as local time. Its API
// returns 18:10 for a 21:00Z range boundary; São Paulo is UTC-03 in this period.
export function historyInstant(v:unknown):string|null{
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v))return null;
 const explicit=/(?:Z|[+-]\d{2}:\d{2})$/.test(v)?v:`${v}-03:00`;
 const t=Date.parse(explicit);return Number.isFinite(t)?new Date(t).toISOString():null;
}
export function normalizeHistory(raw:unknown,from:Date,to:Date):RiverPoint[]{
 const items=at(raw,'data','historic','items');if(!Array.isArray(items))throw new Error('Histórico indisponível');
 const points=new Map<string,RiverPoint>();
 for(const item of items){const instant=historyInstant(at(item,'timestamp')??at(item,'ts'));const metres=finite(at(item,'rio_nivel'));
  if(instant&&metres!==null&&Date.parse(instant)>=from.getTime()&&Date.parse(instant)<=to.getTime())points.set(instant,{at:instant,metres});}
 return [...points.values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
}
export {riverChange} from './river-series';
export async function fetchHistory(hours:24|72,now:Date,fetcher:typeof fetch=fetch):Promise<RiverPoint[]>{
 const from=new Date(now.getTime()-hours*3600000);
 return normalizeHistory(await queryOfficial(HISTORY_QUERY,{stationCode:'DCSC-00023',startDate:from.toISOString(),endDate:now.toISOString()},fetcher),from,now);
}
