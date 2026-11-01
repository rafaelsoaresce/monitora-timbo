import {it,expect} from 'vitest';
import fixture from '../fixtures/forecast.json';
import {normalizeForecast,fetchForecast} from '../../lib/data/forecast';
const now=new Date('2026-10-15T21:00:00Z');
it('normalizes_seven_days',()=>{const f=normalizeForecast(fixture,now);expect(f.days).toHaveLength(7);expect(f.fetchedAt).toBe(now.toISOString());expect(f.days[0].date).toBe('2026-10-15')});
it('missing_is_not_zero',()=>{const f=structuredClone(fixture);f.daily.precipitation_sum=[];expect(normalizeForecast(f,now).days[0].rainMm).toBeNull()});
it('rejects_wrong_units',()=>{const f=structuredClone(fixture);f.daily_units.temperature_2m_max='°F';expect(()=>normalizeForecast(f,now)).toThrow()});
it('uses_fixed_location_and_timezone',async()=>{let url='';await fetchForecast(now,(async(input)=>{url=String(input);return Response.json(fixture)}) as typeof fetch);expect(url).toContain('latitude=-26.822939');expect(url).toContain('forecast_days=7');expect(new URL(url).searchParams.get('timezone')).toBe('America/Sao_Paulo')});
it('normalizes_current_sky_and_solar_times_with_provider_offset',()=>{const raw={...fixture,utc_offset_seconds:-10800,current:{time:'2026-10-15T18:00',weather_code:0},daily:{...fixture.daily,sunrise:['2026-10-15T05:45'],sunset:['2026-10-15T18:25']}};const f=normalizeForecast(raw,now);expect(f.current).toEqual({code:0,at:'2026-10-15T21:00:00.000Z'});expect(f.daylight[0].sunset).toBe('2026-10-15T21:25:00.000Z')});
it('missing_current_conditions_remain_unknown',()=>expect(normalizeForecast(fixture,now).current).toBeNull());
it('requests_current_code_and_solar_times',async()=>{let url='';await fetchForecast(now,(async(input)=>{url=String(input);return Response.json(fixture)}) as typeof fetch);expect(new URL(url).searchParams.get('current')).toBe('weather_code');expect(new URL(url).searchParams.get('daily')).toContain('sunrise,sunset')});

const hourlyRaw=()=>({...fixture,hourly_units:{temperature_2m:'°C',precipitation:'mm',precipitation_probability:'%',weather_code:'wmo code'},hourly:{time:['2026-10-31T23:00','2026-11-01T00:00','invalid'],temperature_2m:[22,null,20],precipitation:[0],precipitation_probability:[40,110],weather_code:[3,61]}});
it('normalizes_hourly_offset_nulls_and_zero_without_losing_daily_data',()=>{
 const f=normalizeForecast(hourlyRaw(),now);
 expect(f.hours).toEqual([{at:'2026-11-01T02:00:00.000Z',temperatureC:22,rainMm:0,rainProbabilityPct:40,code:3},{at:'2026-11-01T03:00:00.000Z',temperatureC:null,rainMm:null,rainProbabilityPct:null,code:61}]);
 expect(f.days).toHaveLength(7);
});
it('accepts_missing_hourly_data_for_existing_collectors',()=>expect(normalizeForecast(fixture,now).hours).toEqual([]));
it('invalid_hourly_units_do_not_invalidate_the_daily_forecast',()=>{
 const raw=hourlyRaw();raw.hourly_units.temperature_2m='°F';raw.hourly_units.precipitation='inch';raw.hourly_units.precipitation_probability='fraction';raw.hourly_units.weather_code='unknown';
 const result=normalizeForecast(raw,now);expect(result.days).toHaveLength(7);
 expect(result.hours?.[0]).toEqual({at:'2026-11-01T02:00:00.000Z',temperatureC:null,rainMm:null,rainProbabilityPct:null,code:null});
});
it('requests_hourly_variables_in_the_same_seven_day_query',async()=>{
 let url='';await fetchForecast(now,(async input=>{url=String(input);return Response.json(fixture)}) as typeof fetch);
 const params=new URL(url).searchParams;expect(params.get('hourly')?.split(',')).toEqual(['temperature_2m','weather_code','precipitation_probability','precipitation']);expect(params.get('forecast_days')).toBe('7');
});
