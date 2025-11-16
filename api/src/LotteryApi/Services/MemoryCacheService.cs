using Microsoft.Extensions.Caching.Memory;

namespace LotteryApi.Services;

/// <summary>
/// Memory cache implementation for high-performance caching of frequently accessed data
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly HashSet<string> _cacheKeys;
    private readonly SemaphoreSlim _lock = new(1, 1);

    // Default cache expiration times
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan LongExpiration = TimeSpan.FromHours(24);

    public MemoryCacheService(IMemoryCache memoryCache, ILogger<MemoryCacheService> logger)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        _cacheKeys = new HashSet<string>();
    }

    /// <summary>
    /// Get cached value by key
    /// </summary>
    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            if (_memoryCache.TryGetValue(key, out T? value))
            {
                _logger.LogDebug("Cache hit for key: {Key}", key);
                return value;
            }

            _logger.LogDebug("Cache miss for key: {Key}", key);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cached value for key: {Key}", key);
            return default;
        }
    }

    /// <summary>
    /// Set value in cache with optional expiration
    /// </summary>
    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            var cacheExpiration = expiration ?? DefaultExpiration;

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(cacheExpiration)
                .SetAbsoluteExpiration(cacheExpiration * 2)
                .RegisterPostEvictionCallback((evictedKey, evictedValue, reason, state) =>
                {
                    _logger.LogDebug("Cache entry evicted. Key: {Key}, Reason: {Reason}",
                        evictedKey, reason);

                    _lock.Wait();
                    try
                    {
                        _cacheKeys.Remove(evictedKey.ToString()!);
                    }
                    finally
                    {
                        _lock.Release();
                    }
                });

            _memoryCache.Set(key, value, cacheEntryOptions);

            await _lock.WaitAsync();
            try
            {
                _cacheKeys.Add(key);
            }
            finally
            {
                _lock.Release();
            }

            _logger.LogDebug("Cached value for key: {Key}, Expiration: {Expiration}",
                key, cacheExpiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cached value for key: {Key}", key);
        }
    }

    /// <summary>
    /// Remove value from cache
    /// </summary>
    public async Task RemoveAsync(string key)
    {
        try
        {
            _memoryCache.Remove(key);

            await _lock.WaitAsync();
            try
            {
                _cacheKeys.Remove(key);
            }
            finally
            {
                _lock.Release();
            }

            _logger.LogDebug("Removed cache entry for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cached value for key: {Key}", key);
        }
    }

    /// <summary>
    /// Remove all cache entries with matching prefix
    /// </summary>
    public async Task RemoveByPrefixAsync(string prefix)
    {
        try
        {
            await _lock.WaitAsync();
            try
            {
                var keysToRemove = _cacheKeys.Where(k => k.StartsWith(prefix)).ToList();
                foreach (var key in keysToRemove)
                {
                    _memoryCache.Remove(key);
                    _cacheKeys.Remove(key);
                }

                _logger.LogDebug("Removed {Count} cache entries with prefix: {Prefix}",
                    keysToRemove.Count, prefix);
            }
            finally
            {
                _lock.Release();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cached values with prefix: {Prefix}", prefix);
        }
    }
}

/// <summary>
/// Cache key constants for consistent cache key naming
/// </summary>
public static class CacheKeys
{
    public const string AllLotteries = "lotteries:all";
    public const string ActiveLotteries = "lotteries:active";
    public const string LotteryById = "lottery:{0}";

    public const string AllDraws = "draws:all";
    public const string ActiveDraws = "draws:active";
    public const string TodayDraws = "draws:today";
    public const string DrawById = "draw:{0}";

    public const string AllZones = "zones:all";
    public const string ActiveZones = "zones:active";
    public const string ZoneById = "zone:{0}";

    public const string AllPermissions = "permissions:all";
    public const string PermissionsByCategory = "permissions:category:{0}";
    public const string PermissionById = "permission:{0}";

    // Cache expiration times
    public static readonly TimeSpan LotteryExpiration = TimeSpan.FromHours(24); // Rarely changes
    public static readonly TimeSpan DrawExpiration = TimeSpan.FromHours(1);     // Changes daily
    public static readonly TimeSpan ZoneExpiration = TimeSpan.FromHours(24);    // Rarely changes
    public static readonly TimeSpan PermissionExpiration = TimeSpan.FromHours(24); // Rarely changes
}
