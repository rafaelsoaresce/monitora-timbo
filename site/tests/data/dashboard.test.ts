import {it,expect} from 'vitest';
import {composeDashboard,parseHistoryHours} from '../../lib/data/dashboard';
it('forecast_failure_keeps_stations',async()=>{const stations={data:[],fetchedAt:null,stale:false,unavailable:false};const d=await composeDashboard(async()=>stations,async()=>{throw Error()});expect(d.stations).toEqual(stations);expect(d.forecast.unavailable).toBe(true)});
it('accepts_only_bounded_history_windows',()=>{expect(parseHistoryHours('72')).toBe(72);expect(parseHistoryHours(null)).toBe(24);expect(()=>parseHistoryHours('999')).toThrow()});
