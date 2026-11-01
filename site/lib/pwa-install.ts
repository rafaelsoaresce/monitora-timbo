export type InstallPlatform='ios'|'android'|'embedded'|'other';
export function isStandalone(displayMode:boolean,iosStandalone:boolean){return displayMode||iosStandalone;}
export function installationPlatform(userAgent:string,touchPoints:number):InstallPlatform{
 if(/Instagram|FBAN|FBAV|; wv\)|\bLine\//i.test(userAgent))return 'embedded';
 if(/iPhone|iPad|iPod/i.test(userAgent)||(/Macintosh/i.test(userAgent)&&touchPoints>1))return 'ios';
 return /Android/i.test(userAgent)?'android':'other';
}
export function installInstructions(platform:InstallPlatform){
 if(platform==='ios')return 'No Safari, abra Compartilhar → Adicionar à Tela de Início. Mantenha “Abrir como App” ativado, se essa opção aparecer, e toque em Adicionar.';
 if(platform==='android')return 'Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial. Confirme para adicionar o Monitora Timbó.';
 if(platform==='embedded')return 'Abra este site no navegador do aparelho, como Safari ou Chrome, e use o menu para adicionar à tela inicial.';
 return 'Abra o menu do navegador e procure a opção de instalar ou adicionar à tela inicial. Se ela não aparecer, abra este site no Safari do iPhone ou em um navegador Android compatível.';
}
type SessionStorage=Pick<Storage,'getItem'|'setItem'>;
export function wasDismissed(storage:SessionStorage){try{return storage.getItem('monitora-install-dismissed')==='1';}catch{return false;}}
export function dismissInstall(storage:SessionStorage){try{storage.setItem('monitora-install-dismissed','1');}catch{/* Storage may be blocked. */}}
