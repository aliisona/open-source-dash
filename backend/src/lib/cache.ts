// ---------------------------------------------------------------------------
// Simple in-memory cache with TTL (time-to-live)
//
// This is intentionally lightweight — no external dependencies needed.
// Each cached entry stores the value and the timestamp it was cached at.
// On read, if the entry is older than the TTL it is treated as a miss.
//
// TO UPGRADE TO REDIS:
//   1. npm install ioredis
//   2. Create a Redis client: const redis = new Redis(process.env.REDIS_URL)
//   3. Replace set() with: await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
//   4. Replace get() with: const raw = await redis.get(key); return raw ? JSON.parse(raw) : null
//   5. Replace del() with: await redis.del(key)
//   The interface below stays identical — only the implementation changes.
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  value: T
  cachedAt: number // Unix timestamp in ms
}

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()

  /**
   * Store a value under a key with a TTL in seconds.
   * Default TTL is 1 hour.
   */
  set<T>(key: string, value: T, ttlSeconds = 3600): void {
    this.store.set(key, {
      value,
      cachedAt: Date.now(),
    })

    // Auto-evict after TTL so memory doesn't grow unbounded
    setTimeout(() => {
      this.store.delete(key)
    }, ttlSeconds * 1000)
  }

  /**
   * Retrieve a cached value. Returns null if missing or expired.
   */
  get<T>(key: string, ttlSeconds = 3600): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const ageMs = Date.now() - entry.cachedAt
    if (ageMs > ttlSeconds * 1000) {
      this.store.delete(key)
      return null
    }

    return entry.value
  }

  /**
   * Manually invalidate a cache key.
   */
  del(key: string): void {
    this.store.delete(key)
  }

  /**
   * Clear the entire cache.
   */
  flush(): void {
    this.store.clear()
  }

  /**
   * Returns how many entries are currently cached.
   */
  size(): number {
    return this.store.size
  }
}

// Export a singleton so all routes share the same cache instance
export const cache = new InMemoryCache()
