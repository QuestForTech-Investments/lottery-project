using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BalancesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BalancesController> _logger;

    public BalancesController(LotteryDbContext context, ILogger<BalancesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get balances for all active betting pools
    /// </summary>
    [HttpGet("betting-pools")]
    public async Task<ActionResult<List<BettingPoolBalanceDto>>> GetBettingPoolBalances(
        [FromQuery] int? zoneId = null)
    {
        try
        {
            var query = _context.BettingPools
                .AsNoTracking()
                .Where(bp => bp.IsActive && bp.DeletedAt == null)
                .AsQueryable();

            if (zoneId.HasValue)
            {
                query = query.Where(bp => bp.ZoneId == zoneId.Value);
            }

            var results = await query
                .OrderBy(bp => bp.BettingPoolName)
                .Select(bp => new BettingPoolBalanceDto
                {
                    BettingPoolId = bp.BettingPoolId,
                    BettingPoolCode = bp.BettingPoolCode,
                    BettingPoolName = bp.BettingPoolName,
                    Users = string.Join(", ", bp.UserBettingPools
                        .Where(ubp => ubp.IsActive && ubp.User != null && ubp.User.IsActive
                            && ubp.User.Role != null && ubp.User.Role.RoleName == "POS")
                        .Select(ubp => ubp.User!.Username)),
                    Reference = bp.Reference,
                    ZoneId = bp.ZoneId,
                    ZoneName = bp.Zone != null ? bp.Zone.ZoneName : null,
                    Balance = bp.Balance != null ? bp.Balance.CurrentBalance : 0m,
                    Loans = 0m,
                    LastUpdated = bp.Balance != null ? bp.Balance.LastUpdated : null
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
}
