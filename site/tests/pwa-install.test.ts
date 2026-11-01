import {it,expect} from 'vitest';
import {installationPlatform,installInstructions,isStandalone,wasDismissed,dismissInstall} from '../lib/pwa-install';
it('detects standalone mode from either platform signal',()=>{
 expect(isStandalone(true,false)).toBe(true);expect(isStandalone(false,true)).toBe(true);expect(isStandalone(false,false)).toBe(false);
});
it('selects manual installation instructions for iPhone, Android and embedded browsers',()=>{
 expect(installationPlatform('iPhone',1)).toBe('ios');expect(installationPlatform('Macintosh',5)).toBe('ios');
 expect(installInstructions('ios')).toContain('Compartilhar');expect(installInstructions('android')).toContain('menu');
 expect(installationPlatform('iPhone Instagram',1)).toBe('embedded');expect(installInstructions('embedded')).toContain('navegador');
});
it('session dismissal tolerates blocked storage',()=>{
 const values=new Map<string,string>();const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
 expect(wasDismissed(storage)).toBe(false);dismissInstall(storage);expect(wasDismissed(storage)).toBe(true);
 const blocked={getItem:()=>{throw Error();},setItem:()=>{throw Error();}};
 expect(()=>dismissInstall(blocked)).not.toThrow();expect(wasDismissed(blocked)).toBe(false);
});
