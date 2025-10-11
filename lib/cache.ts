// Simple in-memory cache with TTL for client-side data hooks
// Not persisted across reloads; invalidated explicitly or by TTL expiration.

type CacheEntry<T> = { value: T; expiresAt: number };

class TTLCache {
  private store = new Map<string, CacheEntry<any>>();

  constructor(private defaultTtlMs: number) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number) {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  invalidate(pattern?: RegExp) {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (pattern.test(key)) this.store.delete(key);
    }
  }
}

// Singleton instance (5s default; tuned per use-case in hooks via custom TTL if necessário)
export const globalCache = new TTLCache(5000);

export function withCache<T>(key: string, fetcher: () => Promise<T>, options?: { ttlMs?: number; force?: boolean }): Promise<T> {
  if (!options?.force) {
    const cached = globalCache.get<T>(key);
    if (cached !== undefined) return Promise.resolve(cached);
  }
  return fetcher().then(value => {
    globalCache.set(key, value, options?.ttlMs);
    return value;
  });
}

export function invalidateCache(pattern?: RegExp) {
  globalCache.invalidate(pattern);
}
