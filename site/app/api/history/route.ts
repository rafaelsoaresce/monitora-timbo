export const runtime='nodejs';
export const dynamic='force-dynamic';
import {getRiverHistory,parseHistoryHours} from '../../../lib/data/dashboard';
export async function GET(request:Request){
 let hours:24|72;try{hours=parseHistoryHours(new URL(request.url).searchParams.get('hours'));}catch{return Response.json({error:'Escolha 24 ou 72 horas.'},{status:400});}
 return Response.json(await getRiverHistory(hours),{headers:{'Cache-Control':'no-store'}});
}
