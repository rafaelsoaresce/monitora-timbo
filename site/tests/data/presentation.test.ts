import {it,expect} from 'vitest';
import {formatNumber,readingStatus,splitHistory,weatherLabel} from '../../lib/format';
it('formats_missing_and_zero',()=>{expect(formatNumber(null,2)).toBe('—');expect(formatNumber(0,2)).toBe('0,00')});
it('marks_data_after_60_minutes',()=>{const t='2026-10-15T21:00:00Z';expect(readingStatus(t,new Date('2026-10-15T22:00:00Z'))).toBe('current');expect(readingStatus(t,new Date('2026-10-15T22:00:00.001Z'))).toBe('outdated')});
it('invalid_and_future_time_are_unknown',()=>{expect(readingStatus('bad',new Date())).toBe('unknown');expect(readingStatus('2030-01-01T00:00:00Z',new Date('2026-10-15T00:00:00Z'))).toBe('unknown')});
it('does_not_connect_gaps_over_30_minutes',()=>{expect(splitHistory([{at:'2026-10-15T21:00:00Z',metres:1},{at:'2026-10-15T21:10:00Z',metres:2},{at:'2026-10-15T23:10:00Z',metres:1}])).toHaveLength(2)});
it('unknown_weather_code_does_not_claim_sun',()=>expect(weatherLabel(null)).toBe('Condição indisponível'));
