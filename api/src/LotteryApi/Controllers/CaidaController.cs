using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Exceptions;
using LotteryApi.Helpers;
using LotteryApi.Services;
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
    private readonly IZoneScopeService _zoneScope;

    public CaidaController(LotteryDbContext context, ICaidaCalculationService caidaService, ILogger<CaidaController> logger, IZoneScopeService zoneScope)
    {
        _context = context;
        _caidaService = caidaService;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    /// <summary>
    /// Returns true if the current user holds the given permission code.
    /// </summary>
    private async Task<bool> HasPermissionAsync(string code)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
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

        // Zone scope by banca.
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            query = query.Where(c => allowedBpIds.Contains(c.BettingPoolId));
        }

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
    /// Get caída status for all bancas. When <paramref name="date"/> is in
    /// the past, returns the accumulated_fall as it stood at the close of that
    /// day (last caida_history record on or before that date). When omitted
    /// or today, returns the live value from BettingPoolConfig.
    /// </summary>
    [HttpGet("status")]
    public async Task<ActionResult> GetStatus([FromQuery] int? zoneId, [FromQuery] DateTime? date)
    {
        var query = _context.BettingPoolConfigs
            .AsNoTracking()
            .Where(c => c.FallType != "OFF")
            .Include(c => c.BettingPool)
            .AsQueryable();

        // Zone scope.
        var allowedZonesS = await _zoneScope.GetAllowedZoneIdsAsync();
        if (allowedZonesS != null)
        {
            query = query.Where(c => c.BettingPool != null && allowedZonesS.Contains(c.BettingPool.ZoneId));
        }

        if (zoneId.HasValue)
            query = query.Where(c => c.BettingPool != null && c.BettingPool.ZoneId == zoneId.Value);

        var configs = await query
            .Select(c => new
            {
                c.BettingPoolId,
                BettingPoolName = c.BettingPool != null ? c.BettingPool.BettingPoolName : "",
                BettingPoolCode = c.BettingPool != null ? c.BettingPool.BettingPoolCode : "",
                c.FallType,
                c.FallPercentage,
                LiveAccumulatedFall = c.AccumulatedFall
            })
            .OrderBy(c => c.BettingPoolCode)
            .ToListAsync();

        var today = Helpers.DateTimeHelper.TodayInBusinessTimezone().Date;
        var useHistorical = date.HasValue && date.Value.Date < today;

        // Historical: replace AccumulatedFall with the last caida_history record
        // whose calculation_date is on or before the requested date. Bancas
        // without any history at that point fall back to 0 (no caída yet).
        Dictionary<int, decimal>? historicalByBp = null;
        if (useHistorical)
        {
            var bpIds = configs.Select(c => c.BettingPoolId).ToList();
            var queryDate = date!.Value.Date;
            // Pull the most-recent history row per banca up to queryDate.
            var rows = await _context.CaidaHistory.AsNoTracking()
                .Where(h => bpIds.Contains(h.BettingPoolId) && h.CalculationDate <= queryDate)
                .GroupBy(h => h.BettingPoolId)
                .Select(g => new
                {
                    BettingPoolId = g.Key,
                    AccumulatedFall = g
                        .OrderByDescending(h => h.CalculationDate)
                        .ThenByDescending(h => h.CaidaId)
                        .Select(h => h.AccumulatedFallAfter)
                        .FirstOrDefault()
                })
                .ToListAsync();
            historicalByBp = rows.ToDictionary(r => r.BettingPoolId, r => r.AccumulatedFall);
        }

        var items = configs.Select(c => new
        {
            c.BettingPoolId,
            c.BettingPoolName,
            c.BettingPoolCode,
            c.FallType,
            c.FallPercentage,
            AccumulatedFall = useHistorical
                ? (historicalByBp!.TryGetValue(c.BettingPoolId, out var h) ? h : 0m)
                : c.LiveAccumulatedFall
        }).ToList();

        return Ok(items);
    }

    /// <summary>
    /// Update accumulated fall for a specific betting pool.
    /// </summary>
    [HttpPut("{bettingPoolId}/accumulated-fall")]
    public async Task<ActionResult> UpdateAccumulatedFall(int bettingPoolId, [FromBody] UpdateAccumulatedFallDto dto)
    {
        if (!await HasPermissionAsync("EDIT_ACCUMULATED_FALL")) return Forbid();
        if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId)) return Forbid();

        var config = await _context.BettingPoolConfigs
            .FirstOrDefaultAsync(c => c.BettingPoolId == bettingPoolId);

        if (config == null)
            return ApiErrorResult.NotFound(ErrorCodes.BancaConfigNotFound, "Configuración de banca no encontrada");

        var previousValue = config.AccumulatedFall;
        var now = DateTime.UtcNow;

        // Update config
        config.AccumulatedFall = dto.AccumulatedFall;
        config.UpdatedAt = now;

        // Insert a CaidaHistory entry so future realtime calculations use this new value
        // as the starting point (CalculateRealtimeValues reads last history where PeriodEnd < currentPeriodStart)
        // Set PeriodEnd to just before the current period start so it's picked up as the latest history
        var today = Helpers.DateTimeHelper.TodayInBusinessTimezone();
        var (periodStart, _) = Services.Caida.CaidaCalculationService.GetCurrentPeriodRange(config, today);
        var manualPeriodEnd = periodStart.AddTicks(-1);

        _context.CaidaHistory.Add(new Models.CaidaHistory
        {
            BettingPoolId = bettingPoolId,
            CalculationDate = now,
            PeriodType = "MANUAL_ADJUSTMENT",
            PeriodStart = manualPeriodEnd,
            PeriodEnd = manualPeriodEnd,
            TotalSales = 0,
            TotalPrizes = 0,
            TotalCommissions = 0,
            TotalDiscounts = 0,
            NetAmount = 0,
            FallPercentage = config.FallPercentage,
            AccumulatedFallBefore = previousValue,
            AccumulatedFallAfter = dto.AccumulatedFall,
            CaidaAmount = dto.AccumulatedFall - previousValue,
            Notes = "Ajuste manual desde listado de bancas",
            CreatedAt = now
        });

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "AccumulatedFall updated for pool {PoolId}: {Previous} -> {New} (manual adjustment, snapshot created)",
            bettingPoolId, previousValue, dto.AccumulatedFall);

        return Ok(new { bettingPoolId, previousValue, newValue = dto.AccumulatedFall });
    }

    /// <summary>
    /// Manually trigger caída calculation for a specific date (admin use).
    /// </summary>
    [HttpPost("calculate")]
    public async Task<ActionResult> TriggerCalculation([FromQuery] DateTime? date)
    {
        // Manual caída calc runs across all bancas — super-admin only.
        if (await _zoneScope.GetAllowedZoneIdsAsync() != null) return Forbid();

        var targetDate = date?.Date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual caída calculation triggered for {Date}", targetDate);

        await _caidaService.ProcessScheduledCaidaAsync(targetDate);

        return Ok(new { message = $"Caída calculada para {targetDate:yyyy-MM-dd}" });
    }
}

public class UpdateAccumulatedFallDto
{
    public decimal AccumulatedFall { get; set; }
}
