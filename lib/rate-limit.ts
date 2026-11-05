// Simple in-memory rate limiter
// For production, consider using Vercel KV or Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup interval (every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export function rateLimit({
  key,
  limit = 10,
  windowMs = 60_000, // 1 minute
}: {
  key: string;
  limit?: number;
  windowMs?: number;
}) {
  const now = Date.now();
  const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  store.set(key, entry);

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

export function getIpFromRequest(request: Request): string {
  // Vercel provides x-forwarded-for
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}
