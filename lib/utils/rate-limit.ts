/**
 * Rate limiter — re-export from Redis-based implementation.
 * Falls back to in-memory if Redis (Upstash) is not configured.
 */
export { rateLimit, getIpFromRequest } from "./redis-rate-limit";
