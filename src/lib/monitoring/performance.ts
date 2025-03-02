import { Performance } from '@sentry/react';

export const performanceMetrics = {
  FCP: 'first-contentful-paint',
  LCP: 'largest-contentful-paint',
  FID: 'first-input-delay',
  CLS: 'cumulative-layout-shift'
} as const;

export function initializePerformanceMonitoring() {
  Performance.init({
    tracingOrigins: ['localhost', 'your-domain.com'],
    tracesSampleRate: 0.1
  });

  Object.values(performanceMetrics).forEach(metric => {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        Performance.captureMetric(metric, entry);
      });
    }).observe({ entryTypes: ['paint', 'first-input', 'layout-shift'] });
  });
} 