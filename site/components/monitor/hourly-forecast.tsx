import type {Forecast,SourceResult} from '../../lib/data/types';
import {nextForecastHours} from '../../lib/data/hourly-forecast';
import {formatNumber,timeLabel,weatherLabel} from '../../lib/format';
import {timboDate} from '../../lib/sky-theme';
import {Icon,WeatherIcon} from './icon';

export function HourlyForecast({source,now}:{source:SourceResult<Forecast>;now:Date}){
 const hours=nextForecastHours(source.data?.hours,now),today=timboDate(now);
 return <section className="forecast-section hourly-section" aria-labelledby="hourly-title">
  <div className="section-heading"><div><span className="eyebrow">PREVISÃO HORA A HORA</span><h2 id="hourly-title">Próximas 6 horas</h2></div></div>
  {hours.length?<div className="hourly-grid" role="region" aria-label="Previsão das próximas seis horas; deslize para ver todos os horários" tabIndex={0}>
   {hours.map(hour=>{
    const date=timboDate(new Date(hour.at));
    return <article className="forecast-hour" key={hour.at}>
     <div className="forecast-hour-time"><time dateTime={hour.at}>{timeLabel(hour.at)}</time><span>{date===today?'Hoje':'Amanhã'} · {date.slice(8)}/{date.slice(5,7)}</span></div>
     <WeatherIcon code={hour.code} size={32}/>
     <p className="forecast-hour-condition">{weatherLabel(hour.code)}</p>
     <div className="forecast-hour-temp">{formatNumber(hour.temperatureC,0)}<span>°C</span></div>
     <div className="forecast-hour-rain"><span><Icon name="drop" size={14}/><strong>{formatNumber(hour.rainProbabilityPct,0)}%</strong> de chuva</span><span>{formatNumber(hour.rainMm,1)} mm</span></div>
    </article>;
   })}
  </div>:<p className="card forecast-empty">Previsão por hora indisponível para as próximas horas. Aguarde a próxima coleta automática.</p>}
  {hours.length>0&&hours.length<6&&<p className="hourly-partial">Alguns horários estão indisponíveis na previsão salva.</p>}
  <div className="forecast-foot"><p>Previsão por hora · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo ↗</a> · Horário de Brasília</p><p>{source.stale?'Última previsão em cache · ':''}{source.fetchedAt?`Consultada em ${timeLabel(source.fetchedAt,true)}`:'Aguardando atualização'}</p></div>
 </section>;
}
