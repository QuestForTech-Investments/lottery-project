using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50)</param>
    /// <param name="sortBy">Sort field: null or "name" = sort by draw name, "displayOrder" = sort by display order then name</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<DrawDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, [FromQuery] string? sortBy = null)
    {
        var cacheKey = $"draws:page{pageNumber}:size{pageSize}:sort{sortBy ?? "name"}";
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
            filter: d => d.IsActive,
            sortBy: sortBy
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
    /// Get draw schedules (weekly schedules for all draws)
    /// </summary>
    [HttpGet("schedules")]
    [ProducesResponseType(typeof(List<DrawScheduleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDrawSchedules([FromQuery] int? lotteryId = null)
    {
        try
        {
            var cacheKey = $"draws:schedules:{lotteryId ?? 0}";
            var cached = await _cache.GetAsync<List<DrawScheduleDto>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
                return Ok(cached);
            }

            var query = _context.Draws
                .Where(d => d.IsActive)
                .OrderBy(d => d.DrawName)
                .AsQueryable();

            if (lotteryId.HasValue)
            {
                query = query.Where(d => d.LotteryId == lotteryId.Value);
            }

            var draws = await query
                .Select(d => new
                {
                    d.DrawId,
                    d.DrawName,
                    d.Abbreviation,
                    d.LotteryId,
                    LotteryName = d.Lottery!.LotteryName,
                    Timezone = (string?)null, // TODO: Add timezone field to Lottery table
                    d.DisplayColor,
                    LogoUrl = (string?)null, // TODO: Add logo_url field to Lottery table
                    d.DrawTime,
                    d.UseWeeklySchedule,
                    WeeklySchedules = d.WeeklySchedules
                        .Where(ws => ws.IsActive && ws.DeletedAt == null)
                        .OrderBy(ws => ws.DayOfWeek)
                        .ToList()
                })
                .ToListAsync();

            var result = draws.Select(d => new DrawScheduleDto
            {
                DrawId = d.DrawId,
                DrawName = d.DrawName,
                Abbreviation = d.Abbreviation,
                LotteryId = d.LotteryId,
                LotteryName = d.LotteryName,
                Timezone = d.Timezone,
                DisplayColor = d.DisplayColor,
                LogoUrl = d.LogoUrl,
                DefaultDrawTime = d.DrawTime,
                UseWeeklySchedule = d.UseWeeklySchedule,
                WeeklySchedule = d.UseWeeklySchedule ? ConvertToWeeklyScheduleDto(d.WeeklySchedules) : null
            }).ToList();

            await _cache.SetAsync(cacheKey, result, CacheKeys.DrawExpiration);
            _logger.LogDebug("Cached {CacheKey}", cacheKey);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting draw schedules");
            return StatusCode(500, new { message = "Error al obtener horarios", error = ex.Message });
        }
    }

    /// <summary>
    /// Update draw schedules (weekly schedules)
    /// </summary>
    [HttpPatch("schedules")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateDrawSchedules([FromBody] UpdateDrawSchedulesDto dto)
    {
        try
        {
            foreach (var schedule in dto.Schedules)
            {
                var draw = await _context.Draws.FindAsync(schedule.DrawId);
                if (draw == null)
                {
                    return BadRequest(new { message = $"Draw {schedule.DrawId} not found" });
                }

                // Update flag
                draw.UseWeeklySchedule = schedule.UseWeeklySchedule;
                draw.UpdatedAt = DateTime.UtcNow;

                if (schedule.UseWeeklySchedule && schedule.WeeklySchedule != null)
                {
                    // Delete existing schedules
                    var existing = await _context.DrawWeeklySchedules
                        .Where(ws => ws.DrawId == schedule.DrawId)
                        .ToListAsync();
                    _context.DrawWeeklySchedules.RemoveRange(existing);

                    // Add new schedules
                    var newSchedules = ConvertToDrawWeeklySchedules(schedule.DrawId, schedule.WeeklySchedule);
                    await _context.DrawWeeklySchedules.AddRangeAsync(newSchedules);
                }
            }

            await _context.SaveChangesAsync();

            // Invalidate cache
            await _cache.RemoveByPrefixAsync("draws:");

            _logger.LogInformation("Updated {Count} draw schedules", dto.Schedules.Count);

            return Ok(new { message = "Horarios actualizados correctamente", count = dto.Schedules.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating draw schedules");
            return StatusCode(500, new { message = "Error al actualizar horarios", error = ex.Message });
        }
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
        var cacheKey = $"draws:country{countryId}";
        var cached = await _cache.GetAsync<IEnumerable<DrawDto>>(cacheKey);

        if (cached != null)
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return Ok(cached);
        }

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
        }).ToList();

        await _cache.SetAsync(cacheKey, dtos, CacheKeys.DrawExpiration);
        _logger.LogDebug("Cached {CacheKey}", cacheKey);

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
            CreatedAt = DateTime.UtcNow
        };

        await _drawRepository.AddAsync(draw);

        // Invalidate cache
        await _cache.RemoveByPrefixAsync("draws:");
        _logger.LogInformation("Draw {DrawId} created and cache invalidated", draw.DrawId);

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
        if (dto.DisplayOrder.HasValue) draw.DisplayOrder = dto.DisplayOrder.Value;
        draw.IsActive = dto.IsActive;
        draw.UpdatedAt = DateTime.UtcNow;

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
    /// Batch update display order for multiple draws
    /// </summary>
    [HttpPut("reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reorder([FromBody] List<DrawReorderDto> items)
    {
        if (items == null || items.Count == 0)
            return BadRequest("No items provided");

        var drawIds = items.Select(i => i.DrawId).ToList();
        var draws = await _context.Draws
            .Where(d => drawIds.Contains(d.DrawId))
            .ToListAsync();

        foreach (var item in items)
        {
            var draw = draws.FirstOrDefault(d => d.DrawId == item.DrawId);
            if (draw != null)
            {
                draw.DisplayOrder = item.DisplayOrder;
                draw.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        await _cache.RemoveByPrefixAsync("draws:");

        _logger.LogInformation("Reordered {Count} draws", items.Count);
        return NoContent();
    }

    /// <summary>
    /// Clear draws cache to force reload from database
    /// </summary>
    [HttpPost("cache/clear")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearCache()
    {
        await _cache.RemoveByPrefixAsync("draws:");
        _logger.LogInformation("Draws cache cleared manually");
        return Ok(new { message = "Cache de sorteos limpiado correctamente" });
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

        // Invalidate cache
        await _cache.RemoveAsync(string.Format(CacheKeys.DrawById, id));
        await _cache.RemoveByPrefixAsync("draws:");
        _logger.LogInformation("Draw {DrawId} deleted and cache invalidated", id);

        return NoContent();
    }

    #region Helper Methods

    private static WeeklyScheduleDto? ConvertToWeeklyScheduleDto(List<DrawWeeklySchedule> schedules)
    {
        if (schedules == null || schedules.Count == 0)
            return null;

        var dto = new WeeklyScheduleDto();

        foreach (var schedule in schedules)
        {
            var daySchedule = new DayScheduleDto
            {
                StartTime = schedule.StartTime,
                EndTime = schedule.EndTime,
                Enabled = schedule.IsActive
            };

            switch (schedule.DayOfWeek)
            {
                case 1: dto.Monday = daySchedule; break;
                case 2: dto.Tuesday = daySchedule; break;
                case 3: dto.Wednesday = daySchedule; break;
                case 4: dto.Thursday = daySchedule; break;
                case 5: dto.Friday = daySchedule; break;
                case 6: dto.Saturday = daySchedule; break;
                case 0: dto.Sunday = daySchedule; break;
            }
        }

        return dto;
    }

    private static List<DrawWeeklySchedule> ConvertToDrawWeeklySchedules(int drawId, WeeklyScheduleDto dto)
    {
        var schedules = new List<DrawWeeklySchedule>();

        void AddSchedule(byte dayOfWeek, DayScheduleDto? daySchedule)
        {
            if (daySchedule != null && daySchedule.Enabled)
            {
                schedules.Add(new DrawWeeklySchedule
                {
                    DrawId = drawId,
                    DayOfWeek = dayOfWeek,
                    StartTime = daySchedule.StartTime,
                    EndTime = daySchedule.EndTime,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        AddSchedule(0, dto.Sunday);
        AddSchedule(1, dto.Monday);
        AddSchedule(2, dto.Tuesday);
        AddSchedule(3, dto.Wednesday);
        AddSchedule(4, dto.Thursday);
        AddSchedule(5, dto.Friday);
        AddSchedule(6, dto.Saturday);

        return schedules;
    }

    #endregion
}
