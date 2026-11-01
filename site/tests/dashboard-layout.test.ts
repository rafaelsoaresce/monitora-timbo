import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import postcss from 'postcss';
import {it,expect} from 'vitest';
import {MonitorDashboard} from '../components/monitor/dashboard';

// Check the rendered reading order as well as the responsive grid: CSS-only
// reversal would leave keyboard and screen-reader navigation in the old order.
it('renders_river_before_rain_and_keeps_weather_in_the_landscape',()=>{
 const unavailable={data:null,fetchedAt:null,stale:false,unavailable:true};
 const html=renderToStaticMarkup(createElement(MonitorDashboard,{initialData:{stations:unavailable,forecast:unavailable},initialHistory:unavailable,initialNow:'2026-10-15T15:00:00Z'}));
 const cards=[...html.matchAll(/class="card ([a-z-]+-card)"/g)].map(m=>m[1]);
 expect(cards).toEqual(['river-card','rain-card']);
 expect(html.indexOf('hero-conditions')).toBeLessThan(html.indexOf('river-card'));
});
function areasAt(width:number):string{
 let result='';const css=postcss.parse(readFileSync(new URL('../app/globals.css',import.meta.url),'utf8'));
 css.walkRules('.dashboard-grid',rule=>{
  const parent=rule.parent;
  if(parent?.type==='atrule'&&parent.name==='media'){
   const max=parent.params.match(/max-width:\s*(\d+)px/),min=parent.params.match(/min-width:\s*(\d+)px/);
   if((max&&width>Number(max[1]))||(min&&width<Number(min[1])))return;
  }
  rule.walkDecls('grid-template-areas',decl=>{result=decl.value.replace(/\s+/g,' ').trim();});
 });return result;
}
it('stacks_river_before_rain_on_360_390_and_520px_screens',()=>{
 for(const width of [360,390,520,521,600,700])expect(areasAt(width)).toBe('"river" "rain"');
});
it('places_river_on_the_left_and_rain_on_the_right_on_desktop',()=>{
 for(const width of [801,1024,1440])expect(areasAt(width)).toBe('"river rain"');
});
it('retains_the_tablet_two_card_row_with_river_first',()=>expect(areasAt(768)).toBe('"river rain"'));
