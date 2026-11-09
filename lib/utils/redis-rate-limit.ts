import { Redis } from "@upstash/redis";

// In-memory fallback store
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const fallbackStore = new Map<string, RateLimitEntry>();

// Cleanup interval (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of fallbackStore.entries()) {
    if (now > value.resetAt) {
      fallbackStore.delete(key);
    }
  }
}, 60_000);

// Lazy init Redis client
let redis: Redis | undefined;
let redisAvailable = false;

function getRedisClient(): { redis: Redis | undefined; available: boolean } {
  if (redisAvailable && redis) {
    return { redis, available: true };
  }

  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    return { redis: undefined, available: false };
  }

  try {
    redis = new Redis({
      url,
      token,
    });
    redisAvailable = true;
    return { redis, available: true };
  } catch {
    return { redis: undefined, available: false };
  }
}

/**
 * Redis-based rate limiter using sliding window log algorithm.
 * Falls back to in-memory rate limiter if Redis is unavailable.
 *
 * @param key - Unique identifier (e.g., `checkout:1.2.3.4`)
 * @param limit - Max requests allowed in window
 * @param windowMs - Window size in milliseconds
 * @returns Rate limit result with isLimited, remaining, resetAt, retryAfter
 */
export async function rateLimit({
  key,
  limit = 10,
  windowMs = 60_000, // 1 minute
}: {
  key: string;
  limit?: number;
  windowMs?: number;
}): Promise<{
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}> {
  const { redis, available } = getRedisClient();

  if (available && redis) {
    try {
      return await redisRateLimit(redis, key, limit, windowMs);
    } catch {
      // Redis failed, fallback to in-memory
      console.warn("[RateLimit] Redis unavailable, falling back to in-memory");
      redisAvailable = false;
    }
  }

  return fallbackRateLimit(key, limit, windowMs);
}

/**
 * Sliding window log algorithm using Redis Sorted Sets.
 */
async function redisRateLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number
): Promise<{
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}> {
  const now = Date.now();
  const windowKey = `rl:${key}`;
  const windowStart = now - windowMs;

  // Use pipeline for atomicity
  const pipeline = redis.pipeline();

  // Remove expired entries
  pipeline.zremrangebyscore(windowKey, 0, windowStart);

  // Count current entries
  pipeline.zcard(windowKey);

  const results = await pipeline.exec();

  const count = (results[1] as number) || 0;
  const isLimited = count >= limit;

  if (!isLimited) {
    // Add new entry with unique member
    const member = `${now}-${Math.random().toString(36).slice(2, 9)}`;
    await redis.zadd(windowKey, { score: now, member });
  }

  const remaining = Math.max(0, limit - count);
  const resetAt = Math.ceil((now + windowMs) / 1000);

  return {
    isLimited,
    limit,
    remaining,
    resetAt,
    retryAfter: isLimited ? Math.ceil(windowMs / 1000) : 0,
  };
}

/**
 * In-memory fallback rate limiter.
 */
function fallbackRateLimit(
  key: string,
  limit: number,
  windowMs: number
): {
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
} {
  const now = Date.now();
  const entry = fallbackStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  fallbackStore.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const resetAt = Math.ceil(entry.resetAt / 1000);
  const isLimited = entry.count > limit;

  return {
    isLimited,
    limit,
    remaining,
    resetAt,
    retryAfter: isLimited ? Math.ceil((entry.resetAt - now) / 1000) : 0,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getIpFromRequest(request: Request): string {
  // Vercel provides x-forwarded-for
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
