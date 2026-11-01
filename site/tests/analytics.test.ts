import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {initializeAnalytics,trackDashboardEvent} from '../lib/analytics';
const ANALYTICS_ID='G-TEST123456';
let scripts:{id:string;src:string;async:boolean}[];
beforeEach(()=>{
 vi.stubEnv('NODE_ENV','production');scripts=[];
 vi.stubGlobal('window',{});
 vi.stubGlobal('document',{createElement:()=>({}),getElementById:()=>scripts[0],head:{appendChild:(s:typeof scripts[number])=>scripts.push(s)}});
});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('automatically loads the production tag once without asking for consent',()=>{
 initializeAnalytics(ANALYTICS_ID);initializeAnalytics(ANALYTICS_ID);
 expect(scripts).toHaveLength(1);expect(scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`);
 const commands=window.dataLayer!.map(v=>Array.from(v as ArrayLike<unknown>));
 expect(commands.filter(c=>c[0]==='config')).toEqual([['config',ANALYTICS_ID,{allow_google_signals:false,allow_ad_personalization_signals:false}]]);
 expect(commands.filter(c=>c[0]==='event'&&c[1]==='page_view')).toHaveLength(0);
});
it('sends only the three dashboard interactions with their parameters',()=>{
 initializeAnalytics(ANALYTICS_ID);trackDashboardEvent('dashboard_refresh');trackDashboardEvent('history_period_change',{hours:72});trackDashboardEvent('rain_station_change',{station_code:'DCSC-00034'});
 const commands=window.dataLayer!.map(v=>Array.from(v as ArrayLike<unknown>));
 expect(commands).toContainEqual(['event','dashboard_refresh',{}]);
 expect(commands).toContainEqual(['event','history_period_change',{hours:72}]);
 expect(commands).toContainEqual(['event','rain_station_change',{station_code:'DCSC-00034'}]);
});
it('does not load or queue events in development',()=>{
 vi.stubEnv('NODE_ENV','development');initializeAnalytics(ANALYTICS_ID);trackDashboardEvent('dashboard_refresh');
 expect(scripts).toHaveLength(0);expect(window.dataLayer).toBeUndefined();
});
it('is safe during server rendering',()=>{
 vi.stubGlobal('window',undefined);vi.stubGlobal('document',undefined);
 expect(()=>initializeAnalytics(ANALYTICS_ID)).not.toThrow();expect(()=>trackDashboardEvent('dashboard_refresh')).not.toThrow();
});
it('does not initialize analytics from a dashboard action before layout hydration',()=>{
 trackDashboardEvent('dashboard_refresh');expect(scripts).toHaveLength(0);expect(window.dataLayer).toBeUndefined();
});

it('does not load or queue analytics for missing or invalid IDs',()=>{
 for(const id of [undefined,null,'','GOOGLE_ANALYTICS_ID','G-INVALID<script>','https://example.com',42])initializeAnalytics(id);
 expect(scripts).toHaveLength(0);expect(window.dataLayer).toBeUndefined();
});
