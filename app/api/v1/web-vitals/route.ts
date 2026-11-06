import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Web Vitals Collection Endpoint
 * Receives Core Web Vitals metrics (LCP, INP, CLS) from the client
 * and logs them for monitoring purposes.
 *
 * In production, this would send metrics to an analytics service
 * like Google Analytics, Vercel Analytics, or a custom dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Validate metric
    if (!metric || !metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // In production, send to analytics service
    // For now, log using structured logger (Vercel will capture this in logs)
    logger.info("Web Vital collected", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      navigationType: metric.navigationType,
      timestamp: metric.timestamp,
    });

    // Could also store in database for historical analysis
    // await db.insert(webVitals).values({...})

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Web Vitals collection failed", error);
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    );
  }
}
