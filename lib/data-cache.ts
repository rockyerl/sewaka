/**
 * Simple in-memory data caching utility with TTL (Time-To-Live)
 * For production, consider using Redis or Vercel KV
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached data by key
 * @param key - Cache key
 * @returns Cached data or null if not found or expired
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Set data in cache with TTL
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlMs - Time-to-live in milliseconds (default: 5 minutes)
 */
export function setToCache<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

/**
 * Invalidate cache by key prefix
 * @param prefix - Key prefix to invalidate
 */
export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Invalidate all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache stats
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Preset TTL values
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Cache key builders
 */
export const CacheKeys = {
  tasks: (workspaceId: string) => `tasks:${workspaceId}`,
  guests: (workspaceId: string) => `guests:${workspaceId}`,
  vendors: (workspaceId: string) => `vendors:${workspaceId}`,
  budget: (workspaceId: string) => `budget:${workspaceId}`,
  events: (workspaceId: string) => `events:${workspaceId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
} as const;
