export const runtime='nodejs';
export const dynamic='force-dynamic';
import {getDashboard} from '../../../lib/data/dashboard';
export async function GET(){return Response.json(await getDashboard(),{headers:{'Cache-Control':'no-store'}});}
