import {it,expect} from 'vitest';
import {normalizeHistory,riverChange} from '../../lib/data/history';
const from=new Date('2026-10-15T00:00:00Z'),to=new Date('2026-10-16T00:00:00Z');
it('interprets_official_local_time_and_sorts',()=>{const raw={data:{historic:{items:[{timestamp:'2026-10-15T18:20:00.000',rio_nivel:1.9},{timestamp:'2026-10-15T18:10:00.000',rio_nivel:1.8}]}}};const p=normalizeHistory(raw,from,to);expect(p[0].at).toBe('2026-10-15T21:10:00.000Z');expect(p[1].metres).toBe(1.9)});
it('filters_duplicates_invalid_and_outside_window',()=>{const p=normalizeHistory({data:{historic:{items:[{ts:'2026-10-15T00:00:00Z',rio_nivel:0},{ts:'2026-10-15T00:00:00Z',rio_nivel:0},{ts:'2026-10-14T10:00:00Z',rio_nivel:2},{ts:'bad',rio_nivel:1},{ts:'2026-10-15T10:00:00Z',rio_nivel:null}]}}},from,to);expect(p).toEqual([{at:from.toISOString(),metres:0}])});
it('reports_change_with_real_interval',()=>{expect(riverChange([])).toBeNull();expect(riverChange([{at:from.toISOString(),metres:1}])).toBeNull();expect(riverChange([{at:from.toISOString(),metres:1.8},{at:to.toISOString(),metres:1.9}])?.metres).toBeCloseTo(.1)});
it('rejects_invalid_contract',()=>expect(()=>normalizeHistory({data:null},from,to)).toThrow());
