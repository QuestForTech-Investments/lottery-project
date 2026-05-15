using LotteryApi.Data;
using LotteryApi.Helpers;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/blackboard")]
[Authorize]
public class BlackboardController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BlackboardController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public BlackboardController(LotteryDbContext context, ILogger<BlackboardController> logger, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    /// <summary>Returns true if the current user holds the given permission code.</summary>
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

    public class PlayByNumberRow
    {
        public string BetTypeCode { get; set; } = string.Empty;
        public string BetTypeName { get; set; } = string.Empty;
        public string BetNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int LineCount { get; set; }
    }

    public class PlayByNumberDetailRow
    {
        public int BettingPoolId { get; set; }
        public string BettingPoolCode { get; set; } = string.Empty;
        public string BettingPoolName { get; set; } = string.Empty;
        public string? Reference { get; set; }
        public decimal TotalAmount { get; set; }
        public int LineCount { get; set; }
    }

    /// <summary>
    /// Returns active plays grouped by (betTypeCode, betNumber) for the blackboard.
    /// Filters: date (createdAt of ticket, business timezone), drawId, zoneIds, bettingPoolId.
    /// All filters except `date` are optional. If zoneIds and bettingPoolId both null, all bancas.
    /// </summary>
    [HttpGet("plays-by-number")]
    public async Task<ActionResult<List<PlayByNumberRow>>> GetPlaysByNumber(
        [FromQuery] DateTime date,
        [FromQuery] int? drawId = null,
        [FromQuery] string? zoneIds = null,
        [FromQuery] int? bettingPoolId = null)
    {
        if (!await HasPermissionAsync("TICKET_MONITORING")) return Forbid();

        var targetDate = date.Date;
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        var parsedZoneIds = (zoneIds ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s.Trim(), out var v) ? v : 0)
            .Where(v => v > 0)
            .Distinct()
            .ToList();

        // Active plays = ticket not cancelled, line not cancelled.
        var query = _context.TicketLines
            .AsNoTracking()
            .Where(tl => !tl.Ticket!.IsCancelled
                && tl.LineStatus != "cancelled"
                && tl.Ticket.CreatedAt >= utcStart
                && tl.Ticket.CreatedAt < utcEnd
                && tl.BetTypeCode != null);

        // Zone scope: clamp the user's requested zones/banca to what they're allowed to see.
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            query = query.Where(tl => allowedBpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        if (drawId.HasValue)
        {
            query = query.Where(tl => tl.DrawId == drawId.Value);
        }

        if (bettingPoolId.HasValue)
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId.Value))
            {
                return Ok(new List<PlayByNumberRow>());
            }
            query = query.Where(tl => tl.Ticket!.BettingPoolId == bettingPoolId.Value);
        }
        else if (parsedZoneIds.Count > 0)
        {
            // Resolve banca IDs in the selected zones (single SQL roundtrip).
            var bpIds = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => parsedZoneIds.Contains(bp.ZoneId))
                .Select(bp => bp.BettingPoolId)
                .ToListAsync();

            if (bpIds.Count == 0)
            {
                return Ok(new List<PlayByNumberRow>());
            }

            query = query.Where(tl => bpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        var rows = await query
            .GroupBy(tl => new { tl.BetTypeCode, tl.BetNumber })
            .Select(g => new
            {
                g.Key.BetTypeCode,
                g.Key.BetNumber,
                TotalAmount = g.Sum(x => x.BetAmount),
                LineCount = g.Count()
            })
            .ToListAsync();

        // Decorate with bet type display name.
        var codes = rows.Select(r => r.BetTypeCode!).Distinct().ToList();
        var nameByCode = await _context.GameTypes
            .AsNoTracking()
            .Where(gt => codes.Contains(gt.GameTypeCode))
            .ToDictionaryAsync(gt => gt.GameTypeCode, gt => gt.GameName);

        var result = rows
            .Select(r => new PlayByNumberRow
            {
                BetTypeCode = r.BetTypeCode ?? string.Empty,
                BetTypeName = nameByCode.TryGetValue(r.BetTypeCode ?? string.Empty, out var n) ? n : (r.BetTypeCode ?? string.Empty),
                BetNumber = r.BetNumber,
                TotalAmount = r.TotalAmount,
                LineCount = r.LineCount
            })
            .OrderBy(r => r.BetTypeCode)
            .ThenByDescending(r => r.TotalAmount)
            .ToList();

        return Ok(result);
    }

    /// <summary>
    /// Returns the per-banca breakdown for a single (betTypeCode, betNumber) combo.
    /// Same filters as plays-by-number; used by the blackboard hover popover.
    /// </summary>
    [HttpGet("plays-by-number-detail")]
    public async Task<ActionResult<List<PlayByNumberDetailRow>>> GetPlaysByNumberDetail(
        [FromQuery] DateTime date,
        [FromQuery] string betTypeCode,
        [FromQuery] string betNumber,
        [FromQuery] int? drawId = null,
        [FromQuery] string? zoneIds = null,
        [FromQuery] int? bettingPoolId = null)
    {
        if (!await HasPermissionAsync("TICKET_MONITORING")) return Forbid();

        if (string.IsNullOrWhiteSpace(betTypeCode) || string.IsNullOrWhiteSpace(betNumber))
        {
            return BadRequest(new { message = "betTypeCode and betNumber are required" });
        }

        var targetDate = date.Date;
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        var parsedZoneIds = (zoneIds ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s.Trim(), out var v) ? v : 0)
            .Where(v => v > 0)
            .Distinct()
            .ToList();

        var query = _context.TicketLines
            .AsNoTracking()
            .Where(tl => !tl.Ticket!.IsCancelled
                && tl.LineStatus != "cancelled"
                && tl.Ticket.CreatedAt >= utcStart
                && tl.Ticket.CreatedAt < utcEnd
                && tl.BetTypeCode == betTypeCode
                && tl.BetNumber == betNumber);

        // Zone scope.
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            query = query.Where(tl => allowedBpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        if (drawId.HasValue)
        {
            query = query.Where(tl => tl.DrawId == drawId.Value);
        }

        if (bettingPoolId.HasValue)
        {
            if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId.Value))
            {
                return Ok(new List<PlayByNumberDetailRow>());
            }
            query = query.Where(tl => tl.Ticket!.BettingPoolId == bettingPoolId.Value);
        }
        else if (parsedZoneIds.Count > 0)
        {
            var bpIds = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => parsedZoneIds.Contains(bp.ZoneId))
                .Select(bp => bp.BettingPoolId)
                .ToListAsync();
            if (bpIds.Count == 0) return Ok(new List<PlayByNumberDetailRow>());
            query = query.Where(tl => bpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        var grouped = await query
            .GroupBy(tl => tl.Ticket!.BettingPoolId)
            .Select(g => new
            {
                BettingPoolId = g.Key,
                TotalAmount = g.Sum(x => x.BetAmount),
                LineCount = g.Count()
            })
            .ToListAsync();

        if (grouped.Count == 0) return Ok(new List<PlayByNumberDetailRow>());

        var bpIdList = grouped.Select(g => g.BettingPoolId).ToList();
        var bpInfo = await _context.BettingPools
            .AsNoTracking()
            .Where(bp => bpIdList.Contains(bp.BettingPoolId))
            .Select(bp => new
            {
                bp.BettingPoolId,
                bp.BettingPoolCode,
                bp.BettingPoolName,
                bp.Reference
            })
            .ToDictionaryAsync(bp => bp.BettingPoolId);

        var result = grouped
            .Select(g =>
            {
                bpInfo.TryGetValue(g.BettingPoolId, out var info);
                return new PlayByNumberDetailRow
                {
                    BettingPoolId = g.BettingPoolId,
                    BettingPoolCode = info?.BettingPoolCode ?? string.Empty,
                    BettingPoolName = info?.BettingPoolName ?? string.Empty,
                    Reference = info?.Reference,
                    TotalAmount = g.TotalAmount,
                    LineCount = g.LineCount
                };
            })
            .OrderByDescending(r => r.TotalAmount)
            .ToList();

        return Ok(result);
    }
}
