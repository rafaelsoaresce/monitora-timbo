export type ConnectionStatus='ready'|'offline'|'checking'|'unavailable';

/** Each request has a generation; going offline invalidates every earlier response. */
export function createConnectivity(){
 let status:ConnectionStatus='ready',generation=0;
 const listeners=new Set<()=>void>();
 const update=(next:ConnectionStatus)=>{if(status!==next){status=next;listeners.forEach(listener=>listener());}};
 return {
  getStatus:()=>status,
  subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
  markOffline(){generation++;update('offline');},
  beginCheck(){generation++;update('checking');return generation;},
  completeCheck(token:number,success:boolean){
   if(token!==generation)return false;
   update(success?'ready':'unavailable');return true;
  },
 };
}
