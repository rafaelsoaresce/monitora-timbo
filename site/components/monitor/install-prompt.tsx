'use client';
import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription,DialogClose} from '../ui/dialog';
import {dismissInstall,installationPlatform,installInstructions,isStandalone,wasDismissed,type InstallPlatform} from '../../lib/pwa-install';
interface InstallEvent extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>;}
export function InstallPrompt(){
 const [visible,setVisible]=useState(false),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[platform,setPlatform]=useState<InstallPlatform>('other');
 const prompt=useRef<InstallEvent|null>(null),opener=useRef<HTMLButtonElement>(null),dismissedInSession=useRef(false);
 useEffect(()=>{
  const media=window.matchMedia('(display-mode: standalone)');let dismissed=false;
  try{dismissed=wasDismissed(window.sessionStorage);}catch{/* Storage getter may be blocked. */}
  const sync=()=>setVisible(!dismissed&&!dismissedInSession.current&&!isStandalone(media.matches,!!(navigator as Navigator & {standalone?:boolean}).standalone));
  setPlatform(installationPlatform(navigator.userAgent,navigator.maxTouchPoints));sync();
  const capture=(event:Event)=>{event.preventDefault();prompt.current=event as InstallEvent;};
  const installed=()=>{prompt.current=null;setVisible(false);setOpen(false);};
  window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',installed);media.addEventListener('change',sync);
  return()=>{window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',installed);media.removeEventListener('change',sync);};
 },[]);
 const dismiss=()=>{dismissedInSession.current=true;setVisible(false);try{dismissInstall(window.sessionStorage);}catch{/* Storage getter may be blocked. */}};
 const install=async()=>{
  const pending=prompt.current;if(!pending){setOpen(true);return;}prompt.current=null;setBusy(true);
  try{await pending.prompt();const choice=await pending.userChoice;if(choice.outcome==='accepted')setVisible(false);else setOpen(true);}catch{setOpen(true);}finally{setBusy(false);}
 };
 if(!visible)return null;
 return <aside className="install-invite" aria-label="Instalar Monitora Timbó"><button type="button" className="install-dismiss" onClick={dismiss} aria-label="Dispensar convite de instalação">×</button><button ref={opener} type="button" className="pwa-button" onClick={()=>void install()} disabled={busy}>{busy?'Aguarde…':'↓ Instalar aplicativo'}</button><p>Adicione à tela inicial e abra como aplicativo.</p><Dialog open={open} onOpenChange={setOpen}><DialogContent className="install-dialog" showCloseButton={false} onCloseAutoFocus={event=>{event.preventDefault();opener.current?.focus();}}><DialogTitle>Adicionar à tela inicial</DialogTitle><DialogDescription>{installInstructions(platform)}</DialogDescription><DialogClose asChild><button type="button" className="pwa-button">Entendi</button></DialogClose></DialogContent></Dialog></aside>;
}
