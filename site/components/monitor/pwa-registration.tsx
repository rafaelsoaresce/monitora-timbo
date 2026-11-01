'use client';
import {useEffect} from 'react';

export function PwaRegistration(){
 useEffect(()=>{
  if('serviceWorker' in navigator && window.isSecureContext){
   void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{
    // Installation is an enhancement; the online dashboard remains usable.
   });
  }
 },[]);
 return null;
}
