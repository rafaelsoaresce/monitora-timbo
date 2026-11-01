'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {scheduleStationRefresh} from '../../lib/data/schedule';
import {createConnectivity,type ConnectionStatus} from '../../lib/connectivity';
import type {Dashboard,SourceResult,RiverPoint} from '../../lib/data/types';

export function useRefresh(initialData:Dashboard,initialHistory:SourceResult<RiverPoint[]>,initialNow:string){
 const [data,setData]=useState(initialData),[history,setHistory]=useState(initialHistory),[hours,setHours]=useState<24|72>(24),[now,setNow]=useState(new Date(initialNow));
 const [refreshing,setRefreshing]=useState(false),[notice,setNotice]=useState(''),[connectionStatus,setConnectionStatus]=useState<ConnectionStatus>('ready');
 const [connectivity]=useState(createConnectivity);
 const pending=useRef<AbortController|null>(null),period=useRef(hours);
 const offline=useCallback(()=>{connectivity.markOffline();pending.current?.abort();pending.current=null;setRefreshing(false);setConnectionStatus('offline');},[connectivity]);
 const refresh=useCallback(async()=>{
  if(!navigator.onLine){offline();return;}if(pending.current)return;
  const controller=new AbortController();pending.current=controller;
  const token=connectivity.beginCheck();setConnectionStatus('checking');setRefreshing(true);setNotice('Lendo dados salvos…');
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const options:RequestInit={signal:controller.signal,cache:'no-store'};
   const [dr,hr]=await Promise.all([fetch('/api/dashboard',options),fetch(`/api/history?hours=${period.current}`,options)]);
   if(!dr.ok||!hr.ok)throw Error('Dados indisponíveis');
   const [next,nextHistory]=await Promise.all([dr.json() as Promise<Dashboard>,hr.json() as Promise<SourceResult<RiverPoint[]>>]);
   if(controller.signal.aborted){if(pending.current===controller&&connectivity.completeCheck(token,false))setConnectionStatus('unavailable');return;}
   if(!navigator.onLine){offline();return;}if(!connectivity.completeCheck(token,true))return;
   setData(next);setHistory(nextHistory);setNow(new Date());setConnectionStatus('ready');
   setNotice(next.stations.unavailable||next.stations.stale||next.forecast.unavailable||next.forecast.stale?'Dados salvos consultados. Uma das coletas está atrasada ou indisponível.':'Dados salvos consultados. Novas coletas ocorrem a cada 30 minutos.');
  }catch{if(!navigator.onLine){offline();return;}if(connectivity.completeCheck(token,false)){setConnectionStatus('unavailable');setNotice('');}}
  finally{clearTimeout(timeout);if(pending.current===controller){pending.current=null;setRefreshing(false);}}
 },[connectivity,offline]);
 useEffect(()=>{
  if(!navigator.onLine)offline();else void refresh();
  const clock=setInterval(()=>{if(document.visibilityState==='visible')setNow(new Date());},60000);
  const stopSchedule=scheduleStationRefresh(()=>{if(document.visibilityState==='visible')void refresh();});
  const visibility=()=>{if(document.visibilityState==='visible')void refresh();};const online=()=>{void refresh();};
  window.addEventListener('offline',offline);window.addEventListener('online',online);window.addEventListener('pageshow',visibility);document.addEventListener('visibilitychange',visibility);
  return()=>{stopSchedule();clearInterval(clock);window.removeEventListener('offline',offline);window.removeEventListener('online',online);window.removeEventListener('pageshow',visibility);document.removeEventListener('visibilitychange',visibility);connectivity.markOffline();pending.current?.abort();pending.current=null;};
 },[connectivity,offline,refresh]);
 const changeHours=useCallback((next:24|72)=>{period.current=next;setHours(next);connectivity.markOffline();pending.current?.abort();pending.current=null;void refresh();},[connectivity,refresh]);
 return {data,history,hours,setHours:changeHours,now,refresh,retryConnection:refresh,refreshing,historyBusy:refreshing,notice,connectionStatus};
}
