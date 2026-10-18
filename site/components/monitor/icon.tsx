type Name='sun'|'cloud'|'rain'|'wind'|'drop'|'river'|'arrow'|'refresh'|'pin'|'external'|'clock'|'info'|'storm';
export function Icon({name,size=22,className=''}:{name:Name;size?:number;className?:string}){
 const paths:Record<Name,React.ReactNode>={
 sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
 cloud:<path d="M6 18a4 4 0 1 1 .5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9Z"/>,
 rain:<><path d="M5 14a3.5 3.5 0 1 1 1-6 5.5 5.5 0 0 1 10.5 0A3.5 3.5 0 1 1 18 15H8"/><path d="m8 18-1 3m6-3-1 3m6-3-1 3"/></>,
 wind:<><path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h5a2.5 2.5 0 1 1-2.5 2.5"/></>,
 drop:<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/>,
 river:<><path d="M2 7c3-4 7 4 10 0s7 4 10 0M2 12c3-4 7 4 10 0s7 4 10 0M2 17c3-4 7 4 10 0s7 4 10 0"/></>,
 arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,refresh:<><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/></>,pin:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,external:<><path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6"/></>,clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,storm:<><path d="M5 14a4 4 0 1 1 1-8 6 6 0 0 1 11 2 3 3 0 0 1 1 6"/><path d="m13 12-4 6h5l-3 5"/></>};
 return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function WeatherIcon({code,size=32}:{code:number|null;size?:number}){return <Icon size={size} name={code===null?'cloud':code>=95?'storm':code>=51?'rain':code<=2?'sun':'cloud'}/>;}
