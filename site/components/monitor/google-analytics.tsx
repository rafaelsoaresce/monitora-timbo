'use client';

import {useEffect} from 'react';
import {initializeAnalytics} from '../../lib/analytics';

export function GoogleAnalytics() {
 useEffect(() => {
  if (process.env.NODE_ENV !== 'production') return;
  const controller = new AbortController();
  void fetch('/api/analytics-config', {cache: 'no-store', signal: controller.signal})
   .then(response => response.ok ? response.json() : null)
   .then(config => {
    if (!controller.signal.aborted && config && typeof config === 'object' && 'measurementId' in config) {
     initializeAnalytics(config.measurementId);
    }
   })
   .catch(() => { /* Analytics configuration must never prevent using the dashboard. */ });
  return () => controller.abort();
 }, []);
 return null;
}
