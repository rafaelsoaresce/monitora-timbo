import type {Daylight} from '../../lib/data/types';
import {timboDate} from '../../lib/sky-theme';
import {timeLabel} from '../../lib/format';
export function SunTimes({daylight,now}:{daylight:Daylight[];now:Date}){
 const next=daylight.flatMap(d=>[{kind:'sunrise' as const,at:d.sunrise},{kind:'sunset' as const,at:d.sunset}]).filter(event=>Number.isFinite(Date.parse(event.at))&&Date.parse(event.at)>+now).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))[0];
 const today=timboDate(now),tomorrow=timboDate(new Date(+now+86400000));
 const eventDate=next?timboDate(new Date(next.at)):null;
 const day=eventDate===today?'Hoje':eventDate===tomorrow?'Amanhã':next?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(next.at)):'Horário indisponível';
 const label=next?.kind==='sunrise'?'Nascer do sol':next?.kind==='sunset'?'Pôr do sol':'Próximo evento solar';
 return <div className="sun-times" aria-label={`${label} em Timbó`}><div className="solar-item"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M2 18h20M6 18a6 6 0 0 1 12 0M4 11l2 2m12 0 2-2"/><path d={next?.kind==='sunrise'?'M12 8V2m-3 3 3-3 3 3':'M12 2v6m-3-3 3 3 3-3'}/></svg><span>{label}<strong>{next?timeLabel(next.at):'—'}</strong></span></div><p>{day} em Timbó<br/><span>Horário de Brasília · Open-Meteo</span></p></div>;
}
