import {validAnalyticsId} from '../../../lib/analytics-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
 const id = process.env.GOOGLE_ANALYTICS_ID;
 const measurementId = process.env.NODE_ENV === 'production' && validAnalyticsId(id) ? id : null;
 return Response.json({measurementId}, {headers: {'Cache-Control': 'no-store'}});
}
