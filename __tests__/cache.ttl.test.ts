import { withCache, invalidateCache, globalCache } from '../lib/cache';

jest.useFakeTimers();

describe('withCache TTL', () => {
  afterEach(() => {
    invalidateCache();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('retorna valor do cache se não expirado', async () => {
    const fetcher = jest.fn().mockResolvedValue('abc');
    const result1 = await withCache('k', fetcher, { ttlMs: 1000 });
    expect(result1).toBe('abc');
    expect(fetcher).toHaveBeenCalledTimes(1);
    // Chamada subsequente antes do TTL
    const result2 = await withCache('k', fetcher, { ttlMs: 1000 });
    expect(result2).toBe('abc');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('expira cache após TTL e refaz fetch', async () => {
    const fetcher = jest.fn().mockResolvedValueOnce('abc').mockResolvedValueOnce('def');
    await withCache('k', fetcher, { ttlMs: 1000 });
    jest.advanceTimersByTime(999);
    await withCache('k', fetcher, { ttlMs: 1000 }); // ainda cacheado
    expect(fetcher).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2); // passa do TTL
    const result = await withCache('k', fetcher, { ttlMs: 1000 });
    expect(result).toBe('def');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('força refetch se force=true', async () => {
    const fetcher = jest.fn().mockResolvedValueOnce('abc').mockResolvedValueOnce('def');
    await withCache('k', fetcher, { ttlMs: 1000 });
    const result = await withCache('k', fetcher, { ttlMs: 1000, force: true });
    expect(result).toBe('def');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalida cache por padrão e por padrão regex', async () => {
    const fetcher = jest.fn().mockResolvedValue('abc');
    await withCache('foo', fetcher, { ttlMs: 1000 });
    await withCache('bar', fetcher, { ttlMs: 1000 });
    invalidateCache(/foo/);
    expect(globalCache.get('foo')).toBeUndefined();
    expect(globalCache.get('bar')).toBe('abc');
    invalidateCache();
    expect(globalCache.get('bar')).toBeUndefined();
  });
});
