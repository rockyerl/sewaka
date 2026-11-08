// Proxy/middleware for Sewaka — Next.js 16 requires this file at the project root.
// The implementation is in lib/middleware/proxy.ts; this file re-exports it.
// Note: Next.js 16 does NOT support re-exporting `config`, so we inline the config here.
import proxyHandler from "@/lib/middleware/proxy";

export default proxyHandler;

// Config must be defined directly (not re-exported) for Next.js 16
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
