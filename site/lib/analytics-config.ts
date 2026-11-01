// This identifier is public; validate it before exposing runtime configuration.
export function validAnalyticsId(value: unknown): value is string {
 return typeof value === 'string' && /^G-[A-Z0-9]+$/.test(value);
}
