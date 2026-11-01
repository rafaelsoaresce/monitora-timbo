import {it,expect} from 'vitest';
import {createConnectivity} from '../lib/connectivity';
it('keeps old responses from restoring readings after a connection drop',()=>{
 const c=createConnectivity();const token=c.beginCheck();c.markOffline();
 expect(c.completeCheck(token,true)).toBe(false);expect(c.getStatus()).toBe('offline');
 const next=c.beginCheck();expect(c.getStatus()).toBe('checking');
 expect(c.completeCheck(next,false)).toBe(true);expect(c.getStatus()).toBe('unavailable');
 const retry=c.beginCheck();expect(c.completeCheck(retry,true)).toBe(true);expect(c.getStatus()).toBe('ready');
});
it('notifies subscribers and ignores superseded requests',()=>{
 const c=createConnectivity();const states:string[]=[];const stop=c.subscribe(()=>states.push(c.getStatus()));
 const first=c.beginCheck(),second=c.beginCheck();expect(c.completeCheck(first,true)).toBe(false);
 c.completeCheck(second,true);stop();c.markOffline();expect(states).toEqual(['checking','ready']);
});
