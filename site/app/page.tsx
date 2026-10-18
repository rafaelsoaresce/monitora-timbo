import {getDashboard,getRiverHistory} from '../lib/data/dashboard';
import {MonitorDashboard} from '../components/monitor/dashboard';
export const dynamic='force-dynamic';
export default async function Home(){const now=new Date();const [data,history]=await Promise.all([getDashboard(now),getRiverHistory(24,now)]);return <MonitorDashboard initialData={data} initialHistory={history} initialNow={now.toISOString()}/>;}
