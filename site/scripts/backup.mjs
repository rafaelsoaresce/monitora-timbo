import {DatabaseSync,backup} from 'node:sqlite';
import {resolve} from 'node:path';
const destination=process.argv[2];
if(!destination){console.error('Uso: node scripts/backup.mjs /caminho/backup.sqlite');process.exit(1);}
const source=resolve(process.env.MONITORA_DB_PATH||'data/monitora.sqlite');
if(resolve(destination)===source)throw new Error('O backup deve ser um arquivo diferente.');
const db=new DatabaseSync(source,{readOnly:true});
try{await backup(db,resolve(destination));console.log(`Backup concluído: ${resolve(destination)}`);}finally{db.close();}
