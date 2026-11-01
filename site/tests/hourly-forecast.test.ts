import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect} from 'vitest';
import {nextForecastHours} from '../lib/data/hourly-forecast';
import {HourlyForecast} from '../components/monitor/hourly-forecast';
import {ForecastStrip} from '../components/monitor/forecast-strip';
import type {ForecastHour,Forecast,SourceResult} from '../lib/data/types';

const now=new Date('2026-11-01T01:30:00Z'); // 22:30 in Timbó, October 31
const hour=(at:string):ForecastHour=>({at,code:3,temperatureC:22,rainProbabilityPct:40,rainMm:0});
const hours=Array.from({length:10},(_,i)=>hour(new Date(Date.UTC(2026,10,1,i)).toISOString()));
const source=(data:ForecastHour[]|undefined=hours):SourceResult<Forecast>=>({data:{hours:data,days:[{date:'2026-10-31',code:3,minC:18,maxC:27,rainProbabilityPct:40,rainMm:0}],daylight:[],current:null,fetchedAt:now.toISOString()},fetchedAt:now.toISOString(),stale:false,unavailable:false});
const render=(s=source(),date=now)=>renderToStaticMarkup(createElement(HourlyForecast,{source:s,now:date}));

it('selects_six_future_whole_hours_sorted_and_deduplicated',()=>{
 const input=[...hours.slice().reverse(),hours[2],hour('invalid'),hour('2026-11-01T02:30:00Z')];
 expect(nextForecastHours(input,now).map(h=>h.at)).toEqual(hours.slice(2,8).map(h=>h.at));
 expect(input).toHaveLength(13);
 expect(nextForecastHours(hours,new Date(hours[2].at))[0].at).toBe(hours[3].at);
});
it('does_not_pad_missing_hours_with_past_data',()=>{
 expect(nextForecastHours(undefined,now)).toEqual([]);
 expect(nextForecastHours(hours.slice(0,3),now)).toEqual([hours[2]]);
 expect(nextForecastHours(hours,new Date('2026-11-02T00:00:00Z'))).toEqual([]);
});
it('shows_six_hours_and_marks_tomorrow_using_Brasilia_date',()=>{
 const html=render();expect(html.match(/class="forecast-hour"/g)).toHaveLength(6);
 expect(html).toContain('23:00');expect(html).toContain('00:00');expect(html).toContain('Amanhã');
 expect(html).toContain('31/10');expect(html).toContain('01/11');expect(html).toContain('Open-Meteo');
 expect(html).toContain('0,0 mm');expect(html).toContain('40%');
});
it('renders_nulls_as_unknown_and_preserves_real_zero',()=>{
 const html=render(source([{...hours[2],temperatureC:null,code:null,rainMm:null,rainProbabilityPct:0}]));
 expect(html).toContain('—');expect(html).toContain('Condição indisponível');expect(html).toContain('0%');expect(html).not.toContain('0,0 mm');
});
it('supports_old_saved_forecasts_and_empty_future_windows_without_hiding_days',()=>{
 const old=source();delete old.data!.hours;
 expect(render(old)).toContain('Previsão por hora indisponível');
 expect(render(source([]))).toContain('Previsão por hora indisponível');
 const combined=renderToStaticMarkup(createElement(ForecastStrip,{source:old,now}));
 expect(combined).toContain('27');expect(combined).toContain('Próximas 6 horas');
 expect(combined.indexOf('Próximas 6 horas')).toBeLessThan(combined.indexOf('O que vem pelo céu'));
});
it('keeps_the_original_collection_time_and_stale_warning',()=>{
 const html=render({...source(),stale:true,fetchedAt:'2026-10-31T22:35:00Z'});
 expect(html).toContain('Última previsão em cache');expect(html).toContain('31/10, 19:35');
});
