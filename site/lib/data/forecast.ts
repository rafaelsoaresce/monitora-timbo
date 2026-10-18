import {at,finite} from './defesa-civil.ts';
import type {Forecast,Daylight} from './types.ts';
export function normalizeForecast(raw:unknown,now:Date):Forecast{
 const dates=at(raw,'daily','time');if(!Array.isArray(dates)||!dates.length)throw new Error('Previsão indisponível');
 for(const [field,unit] of Object.entries({temperature_2m_min:'°C',temperature_2m_max:'°C',precipitation_sum:'mm',precipitation_probability_max:'%'}))if(at(raw,'daily_units',field)!==unit)throw new Error('Unidade inesperada');
 const value=(field:string,i:number)=>{const arr=at(raw,'daily',field);return Array.isArray(arr)?finite(arr[i]):null;};
 const offset=finite(at(raw,'utc_offset_seconds'));
 const instant=(v:unknown):string|null=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v))return null;const zoned=/(?:Z|[+-]\d{2}:\d{2})$/.test(v);if(!zoned&&offset===null)return null;const ms=Date.parse(zoned?v:`${v}Z`)-(zoned?0:offset!*1000);return Number.isFinite(ms)?new Date(ms).toISOString():null;};
 const currentAt=instant(at(raw,'current','time'));
 const rises=at(raw,'daily','sunrise'),sets=at(raw,'daily','sunset');
 const daylight:Daylight[]=dates.flatMap((date,i)=>{const sunrise=instant(Array.isArray(rises)?rises[i]:null),sunset=instant(Array.isArray(sets)?sets[i]:null);return typeof date==='string'&&sunrise&&sunset&&sunrise<sunset?[{date,sunrise,sunset}]:[];});
 return {fetchedAt:now.toISOString(),current:currentAt?{code:finite(at(raw,'current','weather_code')),at:currentAt}:null,daylight,days:dates.slice(0,7).filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)).map((date,i)=>({date,code:value('weather_code',i),minC:value('temperature_2m_min',i),maxC:value('temperature_2m_max',i),rainMm:value('precipitation_sum',i),rainProbabilityPct:value('precipitation_probability_max',i)}))};
}
export async function fetchForecast(now:Date,fetcher:typeof fetch=fetch):Promise<Forecast>{
 const url=new URL('https://api.open-meteo.com/v1/forecast');url.search=new URLSearchParams({latitude:'-26.822939',longitude:'-49.275219',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset',current:'weather_code',timezone:'America/Sao_Paulo',forecast_days:'7',temperature_unit:'celsius',precipitation_unit:'mm'}).toString();
 const r=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Previsão indisponível');return normalizeForecast(await r.json(),now);
}
