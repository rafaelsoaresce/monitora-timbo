'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {scheduleStationRefresh} from '../../lib/data/schedule';
import type {Dashboard,SourceResult,RiverPoint} from '../../lib/data/types';
export function useRefresh(initialData:Dashboard,initialHistory:SourceResult<RiverPoint[]>,initialNow:string){
 const [data,setData]=useState(initialData),[history,setHistory]=useState(initialHistory),[hours,setHours]=useState<24|72>(24),[now,setNow]=useState(new Date(initialNow)),[refreshing,setRefreshing]=useState(false),[historyBusy,setHistoryBusy]=useState(false),[notice,setNotice]=useState(''),[revision,setRevision]=useState(0);
 const pending=useRef<AbortController|null>(null),historySequence=useRef(0),firstHistory=useRef(true);
 const refresh=useCallback(async()=>{if(pending.current)return;const controller=new AbortController();pending.current=controller;setRefreshing(true);setNotice('Lendo dados salvos…');
  try{const r=await fetch('/api/dashboard',{signal:controller.signal});if(!r.ok)throw Error();const next:Dashboard=await r.json();setData(next);setNow(new Date());setNotice(next.stations.unavailable||next.stations.stale||next.forecast.unavailable||next.forecast.stale?'Dados salvos consultados. Uma das coletas está atrasada ou indisponível.':'Dados salvos consultados. Novas coletas ocorrem a cada 30 minutos.');setRevision(n=>n+1);}
  catch{if(!controller.signal.aborted){setData(d=>({stations:{...d.stations,stale:!!d.stations.data,unavailable:!d.stations.data},forecast:{...d.forecast,stale:!!d.forecast.data,unavailable:!d.forecast.data}}));setNotice('Não foi possível ler o repositório. Exibindo os últimos dados disponíveis.');}}
  finally{if(!controller.signal.aborted)setRefreshing(false);pending.current=null;}
 },[]);
 useEffect(()=>{const clock=setInterval(()=>{if(document.visibilityState==='visible')setNow(new Date());},60000);const stopSchedule=scheduleStationRefresh(()=>{setNow(new Date());if(document.visibilityState==='visible')void refresh();});const visibility=()=>{if(document.visibilityState==='visible'){setNow(new Date());void refresh();}};document.addEventListener('visibilitychange',visibility);return()=>{stopSchedule();clearInterval(clock);document.removeEventListener('visibilitychange',visibility);pending.current?.abort();};},[refresh]);
 useEffect(()=>{if(firstHistory.current){firstHistory.current=false;return;}const controller=new AbortController(),sequence=++historySequence.current;setHistoryBusy(true);
  void fetch(`/api/history?hours=${hours}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<SourceResult<RiverPoint[]>>;}).then((result:SourceResult<RiverPoint[]>)=>{if(sequence===historySequence.current&&!controller.signal.aborted)setHistory(result);}).catch(()=>{if(!controller.signal.aborted&&sequence===historySequence.current)setHistory({data:null,fetchedAt:null,stale:false,unavailable:true});}).finally(()=>{if(sequence===historySequence.current&&!controller.signal.aborted)setHistoryBusy(false);});
  return()=>controller.abort();
 },[hours,revision]);
 return {data,history,hours,setHours,now,refresh,refreshing,historyBusy,notice};
}
