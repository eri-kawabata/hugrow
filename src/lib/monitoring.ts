import * as Sentry from '@sentry/react';

export function initializeMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV
  });
}

export function trackError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

export function trackPerformance(name: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name}: ${duration}ms`,
    level: 'info'
  });
} 