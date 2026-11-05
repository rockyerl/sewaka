/**
 * Web Vitals Utility
 * Collect and report Core Web Vitals metrics (LCP, INP, CLS)
 * using the web-vitals library from Google Chrome team.
 */

import { onLCP, onINP, onCLS } from "web-vitals";

export type WebVitalsMetric = {
  name: "LCP" | "INP" | "CLS";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  timestamp: number;
};

function collectMetrics() {
  if (typeof window === "undefined") return;

  const sendToAnalytics = (metric: any) => {
    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name as "LCP" | "INP" | "CLS",
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: (metric as any).navigationType || "navigate",
      url: window.location.href,
      timestamp: Date.now(),
    };

    // Send to our API endpoint
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(webVitalsMetric)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/v1/web-vitals", blob);
    } else {
      // Fallback to fetch
      fetch("/api/v1/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webVitalsMetric),
        keepalive: true,
      }).catch(() => {
        // Silently fail - we don't want to break the app
      });
    }
  };

  // Report all available metrics whenever the page is backgrounded or unloaded
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      // Flush any pending metrics
    }
  };

  addEventListener("visibilitychange", handleVisibilityChange);

  // Measure Core Web Vitals
  onLCP(sendToAnalytics);
  onINP(sendToAnalytics);
  onCLS(sendToAnalytics);
}

export { collectMetrics };
