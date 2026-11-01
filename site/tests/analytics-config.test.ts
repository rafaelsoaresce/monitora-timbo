import {afterEach,expect,it,vi} from 'vitest';
import {GET} from '../app/api/analytics-config/route';
afterEach(()=>vi.unstubAllEnvs());
it('reads only the validated ID from the current runtime environment without caching',async()=>{
 vi.stubEnv('NODE_ENV','production');vi.stubEnv('GOOGLE_ANALYTICS_ID','G-TEST123456');
 const first=await GET();expect(await first.json()).toEqual({measurementId:'G-TEST123456'});expect(first.headers.get('Cache-Control')).toBe('no-store');
 vi.stubEnv('GOOGLE_ANALYTICS_ID','G-OTHER12345');expect(await (await GET()).json()).toEqual({measurementId:'G-OTHER12345'});
});
it('disables analytics with absent or invalid configuration',async()=>{
 vi.stubEnv('NODE_ENV','production');
 for(const id of [undefined,'','GOOGLE_ANALYTICS_ID','G-TEST<script>']){
  vi.stubEnv('GOOGLE_ANALYTICS_ID',id);expect(await (await GET()).json()).toEqual({measurementId:null});
 }
});
it('does not expose an analytics ID in development',async()=>{
 vi.stubEnv('NODE_ENV','development');vi.stubEnv('GOOGLE_ANALYTICS_ID','G-TEST123456');
 expect(await (await GET()).json()).toEqual({measurementId:null});
});
