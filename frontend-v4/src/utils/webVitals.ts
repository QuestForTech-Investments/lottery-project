/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals metrics for performance monitoring
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FID (First Input Delay) - Interactivity
 * - FCP (First Contentful Paint) - Loading performance
 * - LCP (Largest Contentful Paint) - Loading performance
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Responsiveness (new in 2024)
 *
 * Implementation date: 2025-10-30
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import * as logger from './logger';

export type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'

interface MetricThreshold {
  good: number
  needsImprovement: number
}

type ThresholdMap = Record<MetricName, MetricThreshold>

/**
 * Send metric to analytics service
 * Override this function to send to your preferred analytics service
 * (Google Analytics, Sentry, LogRocket, etc.)
 */
const sendToAnalytics = (metric: Metric): void => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`%c[METRICS] Web Vital: ${metric.name}`, 'color: #2196F3; font-weight: bold', metric);
  }

  // Log to our logging system
  logger.info('WEB_VITALS', `${metric.name}: ${metric.value}ms`, {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  });

  // TODO: Send to external analytics service
  // Example for Google Analytics 4:
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     metric_id: metric.id,
  //     metric_value: metric.value,
  //     metric_delta: metric.delta,
  //     metric_rating: metric.rating,
  //   });
  // }

  // Example for Sentry:
  // if (window.Sentry) {
  //   window.Sentry.setMeasurement(metric.name, metric.value, 'millisecond');
  // }
};

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point (main.jsx)
 */
export const initWebVitals = (): void => {
  try {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics)

    logger.success('WEB_VITALS', 'Web Vitals monitoring initialized successfully');
  } catch (error) {
    const errorData = error instanceof Error ? { error: error.message, stack: error.stack } : { error }
    logger.error('WEB_VITALS', 'Failed to initialize Web Vitals', {
      ...errorData
    });
  }
};

/**
 * Get Web Vitals thresholds for reference
 */
export const getThresholds = (): ThresholdMap => ({
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 }
});

/**
 * Get metric rating (good, needs-improvement, poor)
 */
export const getRating = (metricName: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
  const thresholds = getThresholds();
  const threshold = thresholds[metricName];

  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Format metric value for display
 */
export const formatMetricValue = (metricName: MetricName, value: number): string => {
  if (metricName === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
};

export default {
  initWebVitals,
  getThresholds,
  getRating,
  formatMetricValue
};
