"use client";

import { useEffect } from "react";
import { collectMetrics } from "@/lib/utils/web-vitals";

/**
 * Web Vitals Monitor Component
 * Integrates Core Web Vitals tracking into the app.
 * Measures LCP (Largest Contentful Paint), INP (Interaction to Next Paint),
 * and CLS (Cumulative Layout Shift) automatically.
 */
export function WebVitalsMonitor() {
  useEffect(() => {
    collectMetrics();
  }, []);

  return null;
}
