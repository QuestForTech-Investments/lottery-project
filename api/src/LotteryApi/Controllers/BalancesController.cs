using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Services.BalanceCutoff;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BalancesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BalancesController> _logger;
    private readonly IBalanceCutoffService _cutoffService;

    public BalancesController(
        LotteryDbContext context,
        ILogger<BalancesController> logger,
        IBalanceCutoffService cutoffService)
    {
        _context = context;
        _logger = logger;
        _cutoffService = cutoffService;
    }

    /// <summary>
    /// Get balances for all active betting pools.
    /// If date is provided and a snapshot exists, returns historical data.
    /// If no date, defaults to yesterday's snapshot (or live if no snapshot exists).
    /// If date is today and no snapshot yet, returns live balance.
    /// </summary>
    [HttpGet("betting-pools")]
    public async Task<ActionResult<List<BettingPoolBalanceDto>>> GetBettingPoolBalances(
        [FromQuery] int? zoneId = null,
        [FromQuery] DateTime? date = null)
    {
        try
        {
            var today = DateTimeHelper.TodayInBusinessTimezone();
            var requestedDate = date?.Date ?? today;

            // If snapshot exists for requested date, use it; otherwise fall back to previous day
            var hasTodaySnapshot = await _context.BalanceHistories
                .AnyAsync(bh => bh.BalanceDate == requestedDate);
            var snapshotDate = hasTodaySnapshot ? requestedDate : requestedDate.AddDays(-1);

            var query = _context.BettingPools
                .AsNoTracking()
                .Where(bp => bp.IsActive && bp.DeletedAt == null)
                .AsQueryable();

            if (zoneId.HasValue)
            {
                query = query.Where(bp => bp.ZoneId == zoneId.Value);
            }

            // Use snapshot for the resolved date — returns 0 if none exists for a banca
            var results = await query
                .GroupJoin(
                    _context.BalanceHistories.Where(bh => bh.BalanceDate == snapshotDate),
                    bp => bp.BettingPoolId,
                    bh => bh.BettingPoolId,
                    (bp, histories) => new { bp, histories })
                .SelectMany(
                    x => x.histories.DefaultIfEmpty(),
                    (x, bh) => new { x.bp, bh })
                .OrderBy(x => x.bp.BettingPoolName)
                .Select(x => new BettingPoolBalanceDto
                {
                    BettingPoolId = x.bp.BettingPoolId,
                    BettingPoolCode = x.bp.BettingPoolCode,
                    BettingPoolName = x.bp.BettingPoolName,
                    Users = string.Join(", ", x.bp.UserBettingPools
                        .Where(ubp => ubp.IsActive && ubp.User != null && ubp.User.IsActive
                            && ubp.User.Role != null && ubp.User.Role.RoleName == "POS")
                        .Select(ubp => ubp.User!.Username)),
                    Reference = x.bp.Reference,
                    ZoneId = x.bp.ZoneId,
                    ZoneName = x.bp.Zone != null ? x.bp.Zone.ZoneName : null,
                    Balance = x.bh != null ? x.bh.BalanceAmount : 0m,
                    Loans = 0m,
                    LastUpdated = x.bh != null ? x.bh.CreatedAt : null
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pool balances");
            return StatusCode(500, new { error = "Error al obtener balances de bancas" });
        }
    }

    /// <summary>
    /// Manually trigger balance cutoff for a specific date (for testing/backfill)
    /// </summary>
    [HttpPost("cutoff")]
    public async Task<ActionResult> RunCutoff([FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date?.Date ?? DateTimeHelper.TodayInBusinessTimezone();
            var count = await _cutoffService.RunCutoffAsync(targetDate);

            return Ok(new { message = $"Cutoff completed: {count} snapshots for {targetDate:yyyy-MM-dd}", count, date = targetDate.ToString("yyyy-MM-dd") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running manual balance cutoff");
            return StatusCode(500, new { error = "Error al ejecutar corte de balance" });
        }
    }
}
