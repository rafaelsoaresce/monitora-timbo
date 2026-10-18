import {it,expect,vi,afterEach} from 'vitest';
import {mkdtempSync,rmSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {getDashboard,getRiverHistory} from '../../lib/data/dashboard';
import {GET as dashboardGET} from '../../app/api/dashboard/route';
import {GET as historyGET} from '../../app/api/history/route';
import Home from '../../app/page';
const dirs:string[]=[];afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});
it('SSR_and_public_API_routes_do_not_fetch_or_create_a_database_when_empty',async()=>{
 const d=mkdtempSync(join(tmpdir(),'monitora-routes-'));dirs.push(d);const file=join(d,'missing.sqlite');vi.stubEnv('MONITORA_DB_PATH',file);const network=vi.fn(()=>{throw Error('network forbidden')});vi.stubGlobal('fetch',network);
 for(let i=0;i<3;i++){expect((await getDashboard()).stations.state).toBe('waiting');expect((await getRiverHistory(24)).data).toBeNull();expect((await dashboardGET()).status).toBe(200);expect((await historyGET(new Request('http://site.test/api/history?hours=72'))).status).toBe(200);expect(await Home()).toBeTruthy();}
 expect(existsSync(file)).toBe(false);expect(network).not.toHaveBeenCalled();
});
it('corrupt_database_does_not_fallback_to_external_sources',async()=>{const d=mkdtempSync(join(tmpdir(),'monitora-corrupt-'));dirs.push(d);const file=join(d,'monitor.sqlite');writeFileSync(file,'invalid');vi.stubEnv('MONITORA_DB_PATH',file);const network=vi.fn();vi.stubGlobal('fetch',network);expect((await getDashboard()).stations.state).toBe('error');expect((await getRiverHistory(24)).state).toBe('error');expect(network).not.toHaveBeenCalled();});
it('invalid_history_window_is_rejected_without_network',async()=>{const network=vi.fn();vi.stubGlobal('fetch',network);expect((await historyGET(new Request('http://site.test/api/history?hours=900'))).status).toBe(400);expect(network).not.toHaveBeenCalled();});
