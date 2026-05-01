using LotteryApi.Data;
using LotteryApi.Helpers;
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

    public BlackboardController(LotteryDbContext context, ILogger<BlackboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public class PlayByNumberRow
    {
        public string BetTypeCode { get; set; } = string.Empty;
        public string BetTypeName { get; set; } = string.Empty;
        public string BetNumber { get; set; } = string.Empty;
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

        if (drawId.HasValue)
        {
            query = query.Where(tl => tl.DrawId == drawId.Value);
        }

        if (bettingPoolId.HasValue)
        {
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
}
