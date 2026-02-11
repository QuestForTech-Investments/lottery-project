using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api")]
public class BetTypesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BetTypesController> _logger;
    private readonly ICacheService _cache;
    private const string BET_TYPES_CACHE_KEY = "bet-types:all";
    private const string BET_TYPES_WITH_FIELDS_CACHE_KEY = "bet-types:with-fields";
    private const string PRIZE_FIELDS_CACHE_KEY = "prize-fields:all";
    private static readonly TimeSpan BET_TYPES_CACHE_TTL = TimeSpan.FromMinutes(5);

    public BetTypesController(
        LotteryDbContext context,
        ILogger<BetTypesController> logger,
        ICacheService cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
    }

    /// <summary>
    /// GET /api/bet-types
    /// Returns all active bet types with prize field counts
    /// </summary>
    [HttpGet("bet-types")]
    public async Task<ActionResult<List<BetTypeDto>>> GetAllBetTypes()
    {
        try
        {
            var cached = await _cache.GetAsync<List<BetTypeDto>>(BET_TYPES_CACHE_KEY);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for {CacheKey}", BET_TYPES_CACHE_KEY);
                return Ok(cached);
            }

            var betTypes = await _context.BetTypes
                .Where(bt => bt.IsActive)
                .OrderBy(bt => bt.BetTypeName)
                .Select(bt => new BetTypeDto
                {
                    BetTypeId = bt.BetTypeId,
                    BetTypeCode = bt.BetTypeCode,
                    BetTypeName = bt.BetTypeName,
                    Description = bt.Description,
                    PrizeTypesCount = bt.PrizeTypes.Count(pf => pf.IsActive)
                })
                .ToListAsync();

            await _cache.SetAsync(BET_TYPES_CACHE_KEY, betTypes, BET_TYPES_CACHE_TTL);
            _logger.LogDebug("Cached {CacheKey}", BET_TYPES_CACHE_KEY);

            return Ok(betTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipos de apuestas");
            return StatusCode(500, new { message = $"Error al obtener tipos de apuestas: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/bet-types/with-fields
    /// 🚀 OPTIMIZED ENDPOINT: Returns all bet types with their prize fields in a single API call
    /// This eliminates the need for N+1 queries (26+ separate calls reduced to 1)
    /// Sorts bet types by BetTypeId and prize fields by DisplayOrder for consistent UI rendering
    /// Performance: Single database query with eager loading (~50-100ms vs ~425ms for sequential calls)
    /// Now with Redis caching for even faster response times
    /// IMPORTANT: Must be defined BEFORE the {id} route to prevent route ambiguity
    /// </summary>
    [HttpGet("bet-types/with-fields")]
    public async Task<ActionResult<List<BetTypeWithFieldsDto>>> GetAllBetTypesWithFields()
    {
        try
        {
            var cached = await _cache.GetAsync<List<BetTypeWithFieldsDto>>(BET_TYPES_WITH_FIELDS_CACHE_KEY);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for {CacheKey}", BET_TYPES_WITH_FIELDS_CACHE_KEY);
                return Ok(cached);
            }

            _logger.LogInformation("Fetching all bet types with prize fields (optimized single-call endpoint)");

            // Single database query with eager loading - prevents N+1 query problem
            var betTypes = await _context.BetTypes
                .Where(bt => bt.IsActive)
                .Include(bt => bt.PrizeTypes.Where(pf => pf.IsActive))
                .OrderBy(bt => bt.BetTypeId)  // Sort by ID for consistent ordering
                .ToListAsync();

            // Map to DTOs with sorted prize fields
            var result = betTypes.Select(bt => new BetTypeWithFieldsDto
            {
                BetTypeId = bt.BetTypeId,
                BetTypeCode = bt.BetTypeCode,
                BetTypeName = bt.BetTypeName,
                Description = bt.Description,
                PrizeTypes = bt.PrizeTypes
                    .OrderBy(pf => pf.DisplayOrder)  // Sort fields by display order
                    .Select(pf => new PrizeTypeBasicDto
                    {
                        PrizeTypeId = pf.PrizeTypeId,
                        BetTypeId = pf.BetTypeId,
                        FieldCode = pf.FieldCode,
                        FieldName = pf.FieldName,
                        DefaultMultiplier = pf.DefaultMultiplier,
                        MinMultiplier = pf.MinMultiplier,
                        MaxMultiplier = pf.MaxMultiplier,
                        DisplayOrder = pf.DisplayOrder
                    })
                    .ToList()
            }).ToList();

            await _cache.SetAsync(BET_TYPES_WITH_FIELDS_CACHE_KEY, result, BET_TYPES_CACHE_TTL);
            _logger.LogInformation("Successfully fetched and cached {Count} bet types with prize fields", result.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching bet types with prize fields");
            return StatusCode(500, new { message = $"Error fetching bet types with prize fields: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/bet-types/{id}
    /// Returns a specific bet type with its prize fields
    /// </summary>
    [HttpGet("bet-types/{id}")]
    public async Task<ActionResult<BetTypeWithFieldsDto>> GetBetTypeById(int id)
    {
        try
        {
            var cacheKey = $"bet-types:{id}";
            var cached = await _cache.GetAsync<BetTypeWithFieldsDto>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return Ok(cached);
            }

            var betType = await _context.BetTypes
                .Where(bt => bt.BetTypeId == id && bt.IsActive)
                .Include(bt => bt.PrizeTypes.Where(pf => pf.IsActive))
                .FirstOrDefaultAsync();

            if (betType == null)
            {
                return NotFound(new { message = "Tipo de apuesta no encontrado" });
            }

            var result = new BetTypeWithFieldsDto
            {
                BetTypeId = betType.BetTypeId,
                BetTypeCode = betType.BetTypeCode,
                BetTypeName = betType.BetTypeName,
                Description = betType.Description,
                PrizeTypes = betType.PrizeTypes
                    .OrderBy(pf => pf.DisplayOrder)
                    .Select(pf => new PrizeTypeBasicDto
                    {
                        PrizeTypeId = pf.PrizeTypeId,
                        BetTypeId = pf.BetTypeId,
                        FieldCode = pf.FieldCode,
                        FieldName = pf.FieldName,
                        DefaultMultiplier = pf.DefaultMultiplier,
                        MinMultiplier = pf.MinMultiplier,
                        MaxMultiplier = pf.MaxMultiplier,
                        DisplayOrder = pf.DisplayOrder
                    })
                    .ToList()
            };

            await _cache.SetAsync(cacheKey, result, BET_TYPES_CACHE_TTL);
            _logger.LogDebug("Cached {CacheKey}", cacheKey);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener tipo de apuesta {BetTypeId}", id);
            return StatusCode(500, new { message = $"Error al obtener tipo de apuesta: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/prize-fields
    /// Returns all active prize fields grouped by bet type
    /// </summary>
    [HttpGet("prize-fields")]
    public async Task<ActionResult<List<BetTypeWithFieldsDto>>> GetAllPrizeTypes()
    {
        try
        {
            var cached = await _cache.GetAsync<List<BetTypeWithFieldsDto>>(PRIZE_FIELDS_CACHE_KEY);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for {CacheKey}", PRIZE_FIELDS_CACHE_KEY);
                return Ok(cached);
            }

            var betTypes = await _context.BetTypes
                .Where(bt => bt.IsActive)
                .Include(bt => bt.PrizeTypes.Where(pf => pf.IsActive))
                .OrderBy(bt => bt.BetTypeName)
                .ToListAsync();

            var result = betTypes.Select(bt => new BetTypeWithFieldsDto
            {
                BetTypeId = bt.BetTypeId,
                BetTypeCode = bt.BetTypeCode,
                BetTypeName = bt.BetTypeName,
                Description = bt.Description,
                PrizeTypes = bt.PrizeTypes
                    .OrderBy(pf => pf.DisplayOrder)
                    .Select(pf => new PrizeTypeBasicDto
                    {
                        PrizeTypeId = pf.PrizeTypeId,
                        BetTypeId = pf.BetTypeId,
                        FieldCode = pf.FieldCode,
                        FieldName = pf.FieldName,
                        DefaultMultiplier = pf.DefaultMultiplier,
                        MinMultiplier = pf.MinMultiplier,
                        MaxMultiplier = pf.MaxMultiplier,
                        DisplayOrder = pf.DisplayOrder
                    })
                    .ToList()
            }).ToList();

            await _cache.SetAsync(PRIZE_FIELDS_CACHE_KEY, result, BET_TYPES_CACHE_TTL);
            _logger.LogDebug("Cached {CacheKey}", PRIZE_FIELDS_CACHE_KEY);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener campos de premios");
            return StatusCode(500, new { message = $"Error al obtener campos de premios: {ex.Message}" });
        }
    }
}
