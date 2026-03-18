using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Helpers;
using LotteryApi.Services.Caida;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/caida")]
public class CaidaController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ICaidaCalculationService _caidaService;
    private readonly ILogger<CaidaController> _logger;

    public CaidaController(LotteryDbContext context, ICaidaCalculationService caidaService, ILogger<CaidaController> logger)
    {
        _context = context;
        _caidaService = caidaService;
        _logger = logger;
    }

    /// <summary>
    /// Get caída history with optional filters.
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult> GetHistory(
        [FromQuery] int? bettingPoolId,
        [FromQuery] string? periodType,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int limit = 50)
    {
        var query = _context.CaidaHistory
            .AsNoTracking()
            .AsQueryable();

        if (bettingPoolId.HasValue)
            query = query.Where(h => h.BettingPoolId == bettingPoolId.Value);

        if (!string.IsNullOrEmpty(periodType))
            query = query.Where(h => h.PeriodType == periodType);

        if (startDate.HasValue)
            query = query.Where(h => h.CalculationDate >= startDate.Value.Date);

        if (endDate.HasValue)
            query = query.Where(h => h.CalculationDate <= endDate.Value.Date);

        var items = await query
            .OrderByDescending(h => h.CalculationDate)
            .ThenByDescending(h => h.CaidaId)
            .Take(limit)
            .Select(h => new
            {
                h.CaidaId,
                h.BettingPoolId,
                BettingPoolName = h.BettingPool != null ? h.BettingPool.BettingPoolName : "",
                BettingPoolCode = h.BettingPool != null ? h.BettingPool.BettingPoolCode : "",
                h.CalculationDate,
                h.PeriodType,
                h.PeriodStart,
                h.PeriodEnd,
                h.TotalSales,
                h.TotalPrizes,
                h.TotalCommissions,
                h.TotalDiscounts,
                h.NetAmount,
                h.FallPercentage,
                h.AccumulatedFallBefore,
                h.AccumulatedFallAfter,
                h.CaidaAmount,
                h.CobroAmount,
                h.Notes,
                h.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Get caída status for all bancas (current accumulated_fall and config).
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult> GetStatus([FromQuery] int? zoneId)
    {
        var query = _context.BettingPoolConfigs
            .AsNoTracking()
            .Where(c => c.FallType != "OFF")
            .Include(c => c.BettingPool)
            .AsQueryable();

        if (zoneId.HasValue)
            query = query.Where(c => c.BettingPool != null && c.BettingPool.ZoneId == zoneId.Value);

        var items = await query
            .Select(c => new
            {
                c.BettingPoolId,
                BettingPoolName = c.BettingPool != null ? c.BettingPool.BettingPoolName : "",
                BettingPoolCode = c.BettingPool != null ? c.BettingPool.BettingPoolCode : "",
                c.FallType,
                c.FallPercentage,
                c.AccumulatedFall
            })
            .OrderBy(c => c.BettingPoolCode)
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Manually trigger caída calculation for a specific date (admin use).
    /// </summary>
    [HttpPost("calculate")]
    public async Task<ActionResult> TriggerCalculation([FromQuery] DateTime? date)
    {
        var targetDate = date?.Date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual caída calculation triggered for {Date}", targetDate);

        await _caidaService.ProcessScheduledCaidaAsync(targetDate);

        return Ok(new { message = $"Caída calculada para {targetDate:yyyy-MM-dd}" });
    }
}
