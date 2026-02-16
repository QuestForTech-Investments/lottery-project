using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Repositories;
using LotteryApi.Data;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LotteriesController : ControllerBase
{
    private readonly ILotteryRepository _lotteryRepository;
    private readonly ICacheService _cache;
    private readonly LotteryDbContext _context;
    private readonly ILogger<LotteriesController> _logger;

    public LotteriesController(ILotteryRepository lotteryRepository, ICacheService cache, LotteryDbContext context, ILogger<LotteriesController> logger)
    {
        _lotteryRepository = lotteryRepository;
        _cache = cache;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all lotteries with pagination (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<LotteryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var cacheKey = $"lotteries:page{pageNumber}:size{pageSize}";
        var cached = await _cache.GetAsync<PagedResponse<LotteryDto>>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var (items, totalCount) = await _lotteryRepository.GetPagedLotteriesOptimizedAsync(
            pageNumber,
            pageSize,
            filter: l => l.IsActive && l.Colour != null
        );

        var response = new PagedResponse<LotteryDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        await _cache.SetAsync(cacheKey, response, CacheKeys.LotteryExpiration);
        _logger.LogDebug("Cached {CacheKey} for {Hours} hours", cacheKey, CacheKeys.LotteryExpiration.TotalHours);

        return Ok(response);
    }

    /// <summary>
    /// Get lottery by ID (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LotteryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var cacheKey = string.Format(CacheKeys.LotteryById, id);
        var cached = await _cache.GetAsync<LotteryDto>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var dto = await _lotteryRepository.GetLotteryDtoByIdAsync(id);

        if (dto == null)
        {
            return NotFound();
        }

        await _cache.SetAsync(cacheKey, dto, CacheKeys.LotteryExpiration);
        _logger.LogDebug("Cached {CacheKey}", cacheKey);

        return Ok(dto);
    }

    /// <summary>
    /// Get lotteries by country (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet("country/{countryId}")]
    [ProducesResponseType(typeof(IEnumerable<LotteryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCountry(int countryId)
    {
        var cacheKey = $"lotteries:country{countryId}";
        var cached = await _cache.GetAsync<IEnumerable<LotteryDto>>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var dtos = await _lotteryRepository.GetLotteriesDtoByCountryAsync(countryId);

        await _cache.SetAsync(cacheKey, dtos, CacheKeys.LotteryExpiration);
        _logger.LogDebug("Cached {CacheKey}", cacheKey);

        return Ok(dtos);
    }

    /// <summary>
    /// Get lotteries by country (OLD - for backwards compatibility)
    /// </summary>
    [HttpGet("country-old/{countryId}")]
    [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger
    public async Task<IActionResult> GetByCountryOld(int countryId)
    {
        var lotteries = await _lotteryRepository.GetLotteriesByCountryAsync(countryId);

        var dtos = lotteries.Select(l => new LotteryDto
        {
            LotteryId = l.LotteryId,
            CountryId = l.CountryId,
            LotteryName = l.LotteryName,
            LotteryType = l.LotteryType,
            Description = l.Description,
            IsActive = l.IsActive,
            CountryName = l.Country?.CountryName,
            Timezone = l.Timezone
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Create a new lottery
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LotteryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateLotteryDto dto)
    {
        var lottery = new Lottery
        {
            CountryId = dto.CountryId,
            LotteryName = dto.LotteryName,
            LotteryType = dto.LotteryType,
            Description = dto.Description,
            Colour = dto.Color,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _lotteryRepository.AddAsync(lottery);

        var resultDto = new LotteryDto
        {
            LotteryId = lottery.LotteryId,
            CountryId = lottery.CountryId,
            LotteryName = lottery.LotteryName,
            LotteryType = lottery.LotteryType,
            Description = lottery.Description,
            Color = lottery.Colour,
            IsActive = lottery.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { id = lottery.LotteryId }, resultDto);
    }

    /// <summary>
    /// Update an existing lottery
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLotteryDto dto)
    {
        var lottery = await _lotteryRepository.GetByIdAsync(id);

        if (lottery == null)
        {
            return NotFound();
        }

        lottery.LotteryName = dto.LotteryName;
        lottery.LotteryType = dto.LotteryType;
        lottery.Description = dto.Description;
        lottery.Colour = dto.Color;
        lottery.IsActive = dto.IsActive;
        if (!string.IsNullOrEmpty(dto.Timezone))
        {
            lottery.Timezone = dto.Timezone;
        }
        lottery.UpdatedAt = DateTime.UtcNow;

        await _lotteryRepository.UpdateAsync(lottery);

        return NoContent();
    }

    /// <summary>
    /// Get bet types available for a specific lottery
    /// Returns bet types with their prize fields filtered by lottery compatibility
    /// </summary>
    [HttpGet("{id}/bet-types")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<BetTypeWithFieldsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBetTypesByLottery(int id)
    {
        try
        {
            // Verify lottery exists
            var lottery = await _context.Lotteries
                .Where(l => l.LotteryId == id && l.IsActive)
                .FirstOrDefaultAsync();

            if (lottery == null)
            {
                return NotFound(new { message = $"Lottery with ID {id} not found" });
            }

            // Get bet types for this lottery through lottery_bet_type_compatibility
            var betTypes = await _context.LotteryBetTypeCompatibilities
                .Where(lbtc => lbtc.LotteryId == id && lbtc.IsActive)
                .Include(lbtc => lbtc.BetType)
                    .ThenInclude(bt => bt!.PrizeTypes.Where(pf => pf.IsActive))
                .Select(lbtc => lbtc.BetType!)
                .Where(bt => bt.IsActive)
                .OrderBy(bt => bt.BetTypeId)
                .ToListAsync();

            // Map to DTOs
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

            _logger.LogInformation("Successfully fetched {Count} bet types for lottery {LotteryId} ({LotteryName})",
                result.Count, id, lottery.LotteryName);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching bet types for lottery {LotteryId}", id);
            return StatusCode(500, new { message = $"Error fetching bet types: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete a lottery
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var lottery = await _lotteryRepository.GetByIdAsync(id);

        if (lottery == null)
        {
            return NotFound();
        }

        await _lotteryRepository.DeleteAsync(lottery);

        return NoContent();
    }
}
