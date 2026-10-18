import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import type {Forecast,StationReading} from './types.ts';
export type StationRow={code:string;source_at:string;collected_at:string;payload:string};
export type RunRow={slot_at:string;started_at:string;finished_at:string|null;stations_status:string;forecast_status:string};
export type StoredResults={stations:StationReading[];forecast:Forecast|null;stationsStatus:'ok'|'partial'|'error';forecastStatus:'ok'|'error'};
export function databasePath(){return resolve(process.env.MONITORA_DB_PATH||'data/monitora.sqlite');}
/** Only the scheduler creates/migrates the file. Visitors open read-only. */
export class MonitorRepository{
 private db:DatabaseSync;
 constructor(path:string,options:{readonly?:boolean}={}){
  if(!options.readonly)mkdirSync(dirname(path),{recursive:true});
  this.db=new DatabaseSync(path,{readOnly:options.readonly??false});
  this.db.exec('PRAGMA busy_timeout=5000;');
  if(!options.readonly){
   // SQLite may reject concurrent WAL activation before its busy handler runs.
   // Wait only for this local lock; outbound requests are NEVER retried.
   const deadline=Date.now()+5000;
   while(true){
    try{this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');break;}
    catch(error){if(!(error instanceof Error)||!/database is (locked|busy)/.test(error.message)||Date.now()>=deadline){this.db.close();throw error;}Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,25);}
   }
   this.db.exec('BEGIN IMMEDIATE');
   try{
   const version=Number(this.db.prepare('PRAGMA user_version').get()?.user_version);
   if(version>1)throw new Error('Banco criado por uma versão mais recente.');
   if(version===0)this.db.exec(`
    CREATE TABLE collection_runs(slot_at TEXT PRIMARY KEY, started_at TEXT NOT NULL, finished_at TEXT, stations_status TEXT NOT NULL DEFAULT 'running', forecast_status TEXT NOT NULL DEFAULT 'running');
    CREATE TABLE station_readings(id INTEGER PRIMARY KEY, code TEXT NOT NULL, source_at TEXT NOT NULL, collected_at TEXT NOT NULL, payload TEXT NOT NULL, hash TEXT NOT NULL, UNIQUE(code,source_at,hash));
    CREATE INDEX station_series ON station_readings(code,source_at);
    CREATE TABLE station_latest(code TEXT PRIMARY KEY, source_at TEXT NOT NULL, collected_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE weather_snapshots(slot_at TEXT PRIMARY KEY, collected_at TEXT NOT NULL, payload TEXT NOT NULL);
    PRAGMA user_version=1;`);
   this.db.exec('COMMIT');
   }catch(error){this.db.exec('ROLLBACK');this.db.close();throw error;}
  }else if(Number(this.db.prepare('PRAGMA user_version').get()?.user_version)!==1){this.db.close();throw new Error('Banco ainda não inicializado.');}
 }
 claimInitial(slot:Date){
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const counts=this.db.prepare('SELECT (SELECT count(*) FROM collection_runs)+(SELECT count(*) FROM station_readings)+(SELECT count(*) FROM station_latest)+(SELECT count(*) FROM weather_snapshots) AS total').get();
   const claimed=Number(counts?.total)===0&&this.claim(slot);
   this.db.exec('COMMIT');return claimed;
  }catch(error){this.db.exec('ROLLBACK');throw error;}
 }
 claim(slot:Date){return Number(this.db.prepare('INSERT OR IGNORE INTO collection_runs(slot_at,started_at) VALUES (?,?)').run(slot.toISOString(),new Date().toISOString()).changes)===1;}
 finish(slot:Date,collectedAt:Date,result:StoredResults){
  this.db.exec('BEGIN IMMEDIATE');
  try{
   for(const station of result.stations){
    if(!station.reportedAt)continue;
    const payload=JSON.stringify(station),hash=createHash('sha256').update(payload).digest('hex');
    this.db.prepare('INSERT OR IGNORE INTO station_readings(code,source_at,collected_at,payload,hash) VALUES (?,?,?,?,?)').run(station.code,station.reportedAt,collectedAt.toISOString(),payload,hash);
    this.db.prepare(`INSERT INTO station_latest(code,source_at,collected_at,payload) VALUES (?,?,?,?)
     ON CONFLICT(code) DO UPDATE SET source_at=excluded.source_at,collected_at=excluded.collected_at,payload=excluded.payload
     WHERE excluded.source_at>=station_latest.source_at AND excluded.collected_at>=station_latest.collected_at`).run(station.code,station.reportedAt,collectedAt.toISOString(),payload);
   }
   if(result.forecast)this.db.prepare('INSERT OR IGNORE INTO weather_snapshots(slot_at,collected_at,payload) VALUES (?,?,?)').run(slot.toISOString(),collectedAt.toISOString(),JSON.stringify(result.forecast));
   this.db.prepare('UPDATE collection_runs SET finished_at=?,stations_status=?,forecast_status=? WHERE slot_at=?').run(collectedAt.toISOString(),result.stationsStatus,result.forecastStatus,slot.toISOString());
   this.db.exec('COMMIT');
  }catch(error){this.db.exec('ROLLBACK');throw error;}
 }
 latestStations(){return this.db.prepare('SELECT code,source_at,collected_at,payload FROM station_latest ORDER BY code').all() as StationRow[];}
 latestForecast(){return this.db.prepare('SELECT collected_at,payload FROM weather_snapshots ORDER BY slot_at DESC LIMIT 1').get() as {collected_at:string;payload:string}|undefined;}
 latestRun(){return this.db.prepare('SELECT * FROM collection_runs ORDER BY slot_at DESC LIMIT 1').get() as RunRow|undefined;}
 runs(){return this.db.prepare('SELECT * FROM collection_runs ORDER BY slot_at').all() as RunRow[];}
 river(from:Date,to:Date){const rows=this.db.prepare(`SELECT source_at,payload FROM station_readings WHERE code='DCSC-00023' AND source_at>=? AND source_at<=? ORDER BY source_at,collected_at`).all(from.toISOString(),to.toISOString()) as {source_at:string;payload:string}[];
  const points=new Map<string,{at:string;metres:number}>();for(const row of rows){const s=JSON.parse(row.payload) as StationReading;if(s.riverM!==null&&Number.isFinite(s.riverM))points.set(row.source_at,{at:row.source_at,metres:s.riverM});}return [...points.values()];
 }
 close(){this.db.close();}
}
