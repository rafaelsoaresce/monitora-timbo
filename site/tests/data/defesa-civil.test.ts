import {describe,it,expect,vi} from 'vitest';
import fixture from '../fixtures/stations.json';
import {normalizeStations,fetchStations} from '../../lib/data/defesa-civil';
const copy=()=>structuredClone(fixture) as any;
describe('Defesa Civil',()=>{
 it('normalizes_target_stations',()=>{const s=normalizeStations(fixture);expect(s.map(x=>x.code)).toEqual(['DCSC-00023','DCSC-00034']);expect(s[0].riverM).toBeCloseTo(1.81);expect(s[1].temperatureC).toBe(25);expect(s.map(x=>x.name)).toEqual(['Rua Indaial','Parque Central'])});
 it('preserves_zero',()=>expect(normalizeStations(fixture)[0].rainMm['1']).toBe(0));
 it('rejects_missing_and_nonfinite',()=>{const f=copy();f.data.tags_data.qualle_meteorologia[0].data.rio.rio_nivel.value=null;expect(normalizeStations(f)[0].riverM).toBeNull();f.data.tags_data.qualle_meteorologia[0].data.rio.rio_nivel.value=Infinity;expect(normalizeStations(f)[0].riverM).toBeNull()});
 it('respects_hidden_and_invalid',()=>{const f=copy();f.data.tags_data.qualle_meteorologia[0].data.rio.homologacao.relacao.valido.value=false;f.data.tags_data.qualle_meteorologia[1].data.temperatura.atual.show.value=false;const s=normalizeStations(f);expect(s[0].riverM).toBeNull();expect(s[1].temperatureC).toBeNull()});
 it('rejects_unknown_units',()=>{const f=copy();f.data.tags_data.qualle_meteorologia[0].data.rio.rio_nivel.unit={value:'feet'};expect(normalizeStations(f)[0].riverM).toBeNull()});
 it('accepts_valid_partial_graphql_data',()=>expect(normalizeStations({...fixture,errors:[{message:'other station'}]})).toHaveLength(2));
 it('rejects_graphql_without_usable_data',()=>expect(()=>normalizeStations({errors:[{message:'blocked'}]})).toThrow());
 it('accepts_object_collection',()=>{const f=copy();f.data.tags_data.qualle_meteorologia=Object.fromEntries(f.data.tags_data.qualle_meteorologia.map((s:any)=>[s.codigo,s]));expect(normalizeStations(f)).toHaveLength(2)});
 it('rejects_invalid_timestamps',()=>{const f=copy();f.data.tags_data.qualle_meteorologia[0].timestamp='no date';expect(normalizeStations(f)[0].reportedAt).toBeNull()});
 it('rejects_http_error',async()=>{const fake=vi.fn(async()=>new Response('',{status:503}));await expect(fetchStations(fake as typeof fetch)).rejects.toThrow()});
});
