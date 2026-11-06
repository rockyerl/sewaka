import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allowed origins for CORS — extend for production
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
];
const ALL_ORIGINS = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...ALLOWED_ORIGINS])];

// Admin IP whitelist — if set, only these IPs can access /admin/*
const ADMIN_IPS = (process.env.ADMIN_IP_WHITELIST || "").split(",").filter(Boolean);

// Max request body size: 10MB for most routes, 50MB for upload routes
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_UPLOAD_BODY_SIZE = 50 * 1024 * 1024; // 50MB

// Feature flags cache — checked periodically via cron or manual invalidation
let featureFlagsCache: Record<string, boolean> | null = null;
let featureFlagsCacheTime = 0;
const FEATURE_FLAGS_TTL = 5 * 60 * 1000; // 5 minutes

async function getFeatureFlags(): Promise<Record<string, boolean>> {
  const now = Date.now();
  if (featureFlagsCache && now - featureFlagsCacheTime < FEATURE_FLAGS_TTL) {
    return featureFlagsCache;
  }

  // In development, always return defaults — no database available
  if (process.env.VERCEL === undefined) {
    const defaults: Record<string, boolean> = {
      maintenance_mode: false,
      registration_enabled: true,
      subscription_enabled: true,
    };
    featureFlagsCache = defaults;
    featureFlagsCacheTime = now;
    return defaults;
  }

  try {
    // Fetch feature flags from database via internal API
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/v1/internal/feature-flags`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      featureFlagsCache = data.flags as Record<string, boolean>;
      featureFlagsCacheTime = now;
      return featureFlagsCache;
    }
  } catch {
    // Fall back to defaults if fetch fails
  }

  // Default flags
  const defaults: Record<string, boolean> = {
    maintenance_mode: false,
    registration_enabled: true,
    subscription_enabled: true,
  };
  featureFlagsCache = defaults;
  featureFlagsCacheTime = now;
  return defaults;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export default async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const clientIp = getClientIp(request);

  // --- Feature Flags Check ---
  const flags = await getFeatureFlags();

  // Maintenance mode — show maintenance page for all non-admin routes
  if (flags.maintenance_mode && !nextUrl.pathname.startsWith("/admin")) {
    if (nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.rewrite(new URL("/maintenance", nextUrl));
  }

  // Registration disabled — block sign-up
  if (!flags.registration_enabled && nextUrl.pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in?message=registration_disabled", nextUrl));
  }

  // --- Admin IP Whitelist ---
  if (ADMIN_IPS.length > 0 && nextUrl.pathname.startsWith("/admin")) {
    if (!ADMIN_IPS.includes(clientIp)) {
      return NextResponse.json(
        { error: "Access denied: your IP is not whitelisted" },
        { status: 403 }
      );
    }
  }

  // --- Request Size Limit ---
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  const isUploadRoute = nextUrl.pathname.match(/\/(gallery|documents|contracts|portfolio|attachments)/);
  const maxSize = isUploadRoute ? MAX_UPLOAD_BODY_SIZE : MAX_BODY_SIZE;

  if (contentLength > maxSize) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  // --- CORS ---
  const origin = request.headers.get("origin");
  const isCorsRequest = origin && origin !== nextUrl.origin;

  const response = NextResponse.next();

  if (isCorsRequest) {
    if (ALL_ORIGINS.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      // Block requests from unknown origins
      if (request.method === "OPTIONS") {
        return NextResponse.json(
          { error: "Origin not allowed" },
          { status: 403 }
        );
      }
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-CSRF-Token"
    );
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle preflight requests
  if (request.method === "OPTIONS" && isCorsRequest) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": ALL_ORIGINS.includes(origin || "") ? origin || "" : "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-CSRF-Token",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Security Headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // HSTS (HTTP Strict Transport Security)
  // Only in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Content Security Policy
  const isDev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' api.midtrans.com app.sandbox.midtrans.com api.resend.com",
    "frame-src app.midtrans.com app.sandbox.midtrans.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

// Run middleware on all routes except static assets and API health check
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/v1/health (health check endpoint)
     * - api/v1/web-vitals (web vitals collection)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public assets
     */
    "/((?!api/v1/health|api/v1/web-vitals|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|offline).*)",
  ],
};
