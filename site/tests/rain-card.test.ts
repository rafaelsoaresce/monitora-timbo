import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {it,expect} from 'vitest';
import {RainCard} from '../components/monitor/rain-card';
import {normalizeStations} from '../lib/data/defesa-civil';
import fixture from './fixtures/stations.json';
it('highlights_one_hour_then_lists_24_48_72_hours_and_seven_days',()=>{
 const data=normalizeStations(fixture);data[0].rainMm={'1':1,'24':24,'48':48,'72':72,'168':168};
 const html=renderToStaticMarkup(createElement(RainCard,{stations:{data,fetchedAt:'2026-10-15T21:35:00Z',stale:false,unavailable:false},selected:'DCSC-00023',onSelect:()=>{},now:new Date('2026-10-15T21:35:00Z')}));
 expect(html).toMatch(/class="big-value">1,00<span>mm<\/span>/);
 expect(html).toContain('na última hora');
 expect([...html.matchAll(/class="rain-row"><span>([^<]+)<\/span>/g)].map(m=>m[1])).toEqual(['24 horas','48 horas','72 horas','7 dias']);
 expect(html).toContain('24,00');
});
