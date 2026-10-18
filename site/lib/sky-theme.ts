import type {CurrentSky,Daylight} from './data/types';
export type SkyTheme='sunny'|'cloudy'|'rainy'|'stormy'|'night'|'night-rain'|'day-neutral';
export function timboDate(now:Date):string{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function resolveSkyTheme(now:Date,current:CurrentSky|null,daylight:Daylight|null):SkyTheme{
 const today=timboDate(now),rise=daylight?Date.parse(daylight.sunrise):NaN,set=daylight?Date.parse(daylight.sunset):NaN;
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',hourCycle:'h23'}).format(now));
 const isDay=daylight?.date===today&&Number.isFinite(rise)&&Number.isFinite(set)&&rise<set?+now>=rise&&+now<set:hour>=6&&hour<18;
 const age=current?+now-Date.parse(current.at):Infinity;
 const code=Number.isFinite(age)&&age>=-300000&&age<=7200000?current?.code:null;
 const wet=code!==null&&code!==undefined&&[51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99].includes(code);
 if(!isDay)return wet?'night-rain':'night';
 if(code!==null&&code!==undefined&&[95,96,99].includes(code))return 'stormy';
 if(wet)return 'rainy';
 if(code!==null&&code!==undefined&&[0,1,2].includes(code))return 'sunny';
 if(code!==null&&code!==undefined&&[3,45,48].includes(code))return 'cloudy';
 return 'day-neutral';
}
