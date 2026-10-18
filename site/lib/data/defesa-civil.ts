import type {StationReading,StationCode,RainPeriod} from './types.ts';
export const GRAPHQL_URL='https://monitoramento.defesacivil.sc.gov.br/graphql';
export function record(v:unknown):Record<string,unknown>{return v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};}
export function at(v:unknown,...keys:string[]):unknown{return keys.reduce((value,key)=>record(value)[key],v);}
export function finite(v:unknown):number|null{return typeof v==='number'&&Number.isFinite(v)?v:null;}
export function iso(v:unknown):string|null{return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():null;}
function metric(group:unknown,tag:unknown,unit:string):number|null{
 if(at(group,'homologacao','relacao','valido','value')===false||at(tag,'show','value')===false)return null;
 const supplied=at(tag,'unit','value');
 if(typeof supplied==='string'&&supplied.trim()&&supplied.trim()!==unit)return null;
 return finite(at(tag,'value'));
}
export function normalizeStations(raw:unknown):StationReading[]{
 const collection=at(raw,'data','tags_data','qualle_meteorologia');
 const items=Array.isArray(collection)?collection:Object.values(record(collection));
 const result:StationReading[]=[];
 for(const code of ['DCSC-00023','DCSC-00034'] as StationCode[]){
  const station=items.find(s=>at(s,'codigo')===code&&at(s,'show')!==false);if(!station)continue;
  const data=record(at(station,'data'));const rain={} as Record<RainPeriod,number|null>;
  for(const period of ['1','24','48','72','168'] as RainPeriod[]){const n=metric(data.chuva,at(data.chuva,'acumulado',`h${period.padStart(3,'0')}`),'mm');rain[period]=n!==null&&n>=0?n:null;}
  const humidity=metric(data.umidade,at(data.umidade,'atual'),'%');
  const wind=metric(data.vento,at(data.vento,'velocidade_media'),'km/h');
  result.push({code,name:code==='DCSC-00023'?'Rua Indaial':'Parque Central',reportedAt:iso(at(station,'timestamp')),riverM:metric(data.rio,at(data.rio,'rio_nivel'),'m'),rainMm:rain,temperatureC:metric(data.temperatura,at(data.temperatura,'atual'),'°C'),feelsLikeC:metric(data.senstermica,at(data.senstermica,'atual'),'°C'),humidityPct:humidity!==null&&humidity>=0&&humidity<=100?humidity:null,windKmh:wind!==null&&wind>=0?wind:null});
 }
 if(!result.length)throw new Error('Estações indisponíveis');return result;
}
const tag='{ value show { value } unit { value } }';
const valid='homologacao { relacao { valido { value } } }';
export const STATIONS_QUERY=`query Tags_data { tags_data(clients: ["secretaria-de-defesa-civil"]) { qualle_meteorologia { codigo show timestamp data { rio { rio_nivel ${tag} ${valid} } chuva { acumulado { h001 ${tag} h024 ${tag} h048 ${tag} h072 ${tag} h168 ${tag} } ${valid} } temperatura { atual ${tag} ${valid} } senstermica { atual ${tag} ${valid} } umidade { atual ${tag} ${valid} } vento { velocidade_media ${tag} ${valid} } } } } }`;
export async function queryOfficial(query:string,variables:Record<string,unknown>={},fetcher:typeof fetch=fetch):Promise<unknown>{
 const r=await fetcher(GRAPHQL_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables}),redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error('Fonte oficial indisponível');return r.json();
}
export async function fetchStations(fetcher:typeof fetch=fetch):Promise<StationReading[]>{return normalizeStations(await queryOfficial(STATIONS_QUERY,{},fetcher));}
