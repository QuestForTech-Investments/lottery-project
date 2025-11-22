using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Repositories;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DrawsController : ControllerBase
{
    private readonly IDrawRepository _drawRepository;
    private readonly LotteryDbContext _context;
    private readonly ICacheService _cache;
    private readonly ILogger<DrawsController> _logger;

    public DrawsController(IDrawRepository drawRepository, LotteryDbContext context, ICacheService cache, ILogger<DrawsController> logger)
    {
        _drawRepository = drawRepository;
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Get all draws with pagination (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<DrawDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
    {
        var cacheKey = $"draws:page{pageNumber}:size{pageSize}";
        var cached = await _cache.GetAsync<PagedResponse<DrawDto>>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var (items, totalCount) = await _drawRepository.GetPagedDrawsOptimizedAsync(
            pageNumber,
            pageSize,
            filter: d => d.IsActive
        );

        var response = new PagedResponse<DrawDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        await _cache.SetAsync(cacheKey, response, CacheKeys.DrawExpiration);
        _logger.LogDebug("Cached {CacheKey} for {Minutes} minutes", cacheKey, CacheKeys.DrawExpiration.TotalMinutes);

        return Ok(response);
    }

    /// <summary>
    /// Get draw by ID (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DrawDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var cacheKey = string.Format(CacheKeys.DrawById, id);
        var cached = await _cache.GetAsync<DrawDto>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var dto = await _drawRepository.GetDrawDtoByIdAsync(id);

        if (dto == null)
        {
            return NotFound();
        }

        await _cache.SetAsync(cacheKey, dto, CacheKeys.DrawExpiration);
        _logger.LogDebug("Cached {CacheKey}", cacheKey);

        return Ok(dto);
    }

    /// <summary>
    /// Get draws by lottery (optimized with caching and SQL projection)
    /// </summary>
    [HttpGet("lottery/{lotteryId}")]
    [ProducesResponseType(typeof(IEnumerable<DrawDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByLottery(int lotteryId)
    {
        var cacheKey = $"draws:lottery{lotteryId}";
        var cached = await _cache.GetAsync<IEnumerable<DrawDto>>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

        // Use optimized method with SQL projection
        var dtos = await _drawRepository.GetDrawsDtoByLotteryAsync(lotteryId);

        await _cache.SetAsync(cacheKey, dtos, CacheKeys.DrawExpiration);
        _logger.LogDebug("Cached {CacheKey}", cacheKey);

        return Ok(dtos);
    }

    /// <summary>
    /// Get draws by country
    /// </summary>
    [HttpGet("country/{countryId}")]
    [ProducesResponseType(typeof(IEnumerable<DrawDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCountry(int countryId)
    {
        var draws = await _drawRepository.GetDrawsByCountryAsync(countryId);

        var dtos = draws.Select(d => new DrawDto
        {
            DrawId = d.DrawId,
            LotteryId = d.LotteryId,
            DrawName = d.DrawName,
            DrawTime = d.DrawTime,
            Description = d.Description,
            Abbreviation = d.Abbreviation,
            DisplayColor = d.DisplayColor,
            IsActive = d.IsActive,
            LotteryName = d.Lottery?.LotteryName,
            CountryName = d.Lottery?.Country?.CountryName
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Create a new draw
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DrawDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateDrawDto dto)
    {
        var draw = new Draw
        {
            LotteryId = dto.LotteryId,
            DrawName = dto.DrawName,
            DrawTime = dto.DrawTime,
            Description = dto.Description,
            Abbreviation = dto.Abbreviation,
            DisplayColor = dto.DisplayColor,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        await _drawRepository.AddAsync(draw);

        var resultDto = new DrawDto
        {
            DrawId = draw.DrawId,
            LotteryId = draw.LotteryId,
            DrawName = draw.DrawName,
            DrawTime = draw.DrawTime,
            Description = draw.Description,
            Abbreviation = draw.Abbreviation,
            DisplayColor = draw.DisplayColor,
            IsActive = draw.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { id = draw.DrawId }, resultDto);
    }

    /// <summary>
    /// Update an existing draw
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDrawDto dto)
    {
        // Use direct context access to ensure entity tracking works correctly
        var draw = await _context.Draws.FindAsync(id);

        if (draw == null)
        {
            return NotFound();
        }

        draw.DrawName = dto.DrawName;
        draw.DrawTime = dto.DrawTime;
        draw.Description = dto.Description;
        draw.Abbreviation = dto.Abbreviation;
        draw.DisplayColor = dto.DisplayColor;
        draw.IsActive = dto.IsActive;
        draw.UpdatedAt = DateTime.Now;

        // Entity is tracked by this context, save will persist changes
        await _context.SaveChangesAsync();

        // Invalidate cache
        await _cache.RemoveAsync(string.Format(CacheKeys.DrawById, id));
        // Also invalidate the paginated lists cache (clear all draw pages)
        await _cache.RemoveByPrefixAsync("draws:");

        _logger.LogInformation("Draw {DrawId} updated and cache invalidated", id);

        return NoContent();
    }

    /// <summary>
    /// Delete a draw
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var draw = await _drawRepository.GetByIdAsync(id);

        if (draw == null)
        {
            return NotFound();
        }

        await _drawRepository.DeleteAsync(draw);

        return NoContent();
    }
}
