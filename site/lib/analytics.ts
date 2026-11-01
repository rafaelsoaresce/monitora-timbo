export const ANALYTICS_ID = 'G-N9X86GVT7V';
const SCRIPT_ID = 'monitora-google-analytics';

type AnalyticsEvent = {
 dashboard_refresh: Record<string, never>;
 history_period_change: {hours: 24 | 72};
 rain_station_change: {station_code: 'DCSC-00023' | 'DCSC-00034'};
};

declare global {
 interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
 }
}

// Only the public production site collects audience data. Never run during SSR.
function enabled(): boolean {
 return process.env.NODE_ENV === 'production' && typeof window !== 'undefined';
}

export function initializeAnalytics(): void {
 if (!enabled() || document.getElementById(SCRIPT_ID)) return;
 window.dataLayer = window.dataLayer || [];
 // gtag.js consumes the Arguments object used by Google's standard queue snippet.
 // eslint-disable-next-line prefer-rest-params
 window.gtag = function () { window.dataLayer!.push(arguments); };
 window.gtag('js', new Date());
 // The config sends the initial page_view; do not send another manually.
 window.gtag('config', ANALYTICS_ID, {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
 });
 const script = document.createElement('script');
 script.id = SCRIPT_ID;
 script.async = true;
 script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
 document.head.appendChild(script);
}

export function trackDashboardEvent<E extends keyof AnalyticsEvent>(
 ...[event, parameters]: AnalyticsEvent[E] extends Record<string, never>
  ? [event: E, parameters?: AnalyticsEvent[E]]
  : [event: E, parameters: AnalyticsEvent[E]]
): void {
 if (!enabled()) return;
 window.gtag?.('event', event, parameters ?? {});
}
