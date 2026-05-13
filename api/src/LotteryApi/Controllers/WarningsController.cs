using LotteryApi.Data;
using LotteryApi.Helpers;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/warnings")]
[Authorize]
public class WarningsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<WarningsController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public WarningsController(LotteryDbContext context, ILogger<WarningsController> logger, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    public class WarningDto
    {
        public long WarningId { get; set; }
        public string WarningType { get; set; } = string.Empty;
        public string Severity { get; set; } = "medium";
        public int? BettingPoolId { get; set; }
        public string? BettingPoolName { get; set; }
        public string? BettingPoolCode { get; set; }
        public int? UserId { get; set; }
        public string? Username { get; set; }
        public string? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
        public string? Message { get; set; }
        public string? MetadataJson { get; set; }
        public DateTime CreatedAt { get; set; }

        // Populated when ReferenceType == "ticket"
        public long? TicketId { get; set; }
        public string? TicketCode { get; set; }
        public decimal? TicketAmount { get; set; }
        public decimal? TicketPrize { get; set; }
        public DateTime? TicketCreatedAt { get; set; }
    }

    private class TicketSnapshot
    {
        public long TicketId { get; set; }
        public string? TicketCode { get; set; }
        public decimal TotalBetAmount { get; set; }
        public decimal TotalPrize { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// GET /api/warnings?date=YYYY-MM-DD&amp;type=...
    /// Returns warnings for the given business-timezone day. Defaults to today.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<WarningDto>>> GetWarnings(
        [FromQuery] DateTime? date = null,
        [FromQuery] string? type = null)
    {
        var targetDay = date?.Date ?? DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDay);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDay);

        var query = _context.Warnings
            .AsNoTracking()
            .Where(w => w.CreatedAt >= utcStart && w.CreatedAt < utcEnd);

        // Zone scope: admin only sees warnings for bancas in their assigned zones.
        // Warnings without a betting_pool_id (global warnings) stay visible.
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        if (allowedBpIds != null)
        {
            query = query.Where(w => w.BettingPoolId == null || allowedBpIds.Contains(w.BettingPoolId.Value));
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(w => w.WarningType == type);
        }

        var rows = await query
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new
            {
                w.WarningId,
                w.WarningType,
                w.Severity,
                w.BettingPoolId,
                BettingPoolName = w.BettingPool != null ? w.BettingPool.BettingPoolName : null,
                BettingPoolCode = w.BettingPool != null ? w.BettingPool.BettingPoolCode : null,
                w.UserId,
                Username = w.User != null ? w.User.Username : null,
                w.ReferenceId,
                w.ReferenceType,
                w.Message,
                w.MetadataJson,
                w.CreatedAt
            })
            .ToListAsync();

        // Populate ticket fields in a single batched query for ticket-type warnings.
        var ticketIds = rows
            .Where(r => r.ReferenceType == "ticket")
            .Select(r => long.TryParse(r.ReferenceId, out var id) ? id : (long?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        var ticketLookup = new Dictionary<long, TicketSnapshot>();
        if (ticketIds.Count > 0)
        {
            ticketLookup = await _context.Tickets
                .AsNoTracking()
                .Where(t => ticketIds.Contains(t.TicketId))
                .Select(t => new TicketSnapshot
                {
                    TicketId = t.TicketId,
                    TicketCode = t.TicketCode,
                    TotalBetAmount = t.TotalBetAmount,
                    TotalPrize = t.TotalPrize,
                    CreatedAt = t.CreatedAt
                })
                .ToDictionaryAsync(t => t.TicketId);
        }

        var items = rows.Select(r =>
        {
            var dto = new WarningDto
            {
                WarningId = r.WarningId,
                WarningType = r.WarningType,
                Severity = r.Severity,
                BettingPoolId = r.BettingPoolId,
                BettingPoolName = r.BettingPoolName,
                BettingPoolCode = r.BettingPoolCode,
                UserId = r.UserId,
                Username = r.Username,
                ReferenceId = r.ReferenceId,
                ReferenceType = r.ReferenceType,
                Message = r.Message,
                MetadataJson = r.MetadataJson,
                CreatedAt = r.CreatedAt
            };

            if (r.ReferenceType == "ticket"
                && long.TryParse(r.ReferenceId, out var tid)
                && ticketLookup.TryGetValue(tid, out var t))
            {
                dto.TicketId = t.TicketId;
                dto.TicketCode = t.TicketCode;
                dto.TicketAmount = t.TotalBetAmount;
                dto.TicketPrize = t.TotalPrize;
                dto.TicketCreatedAt = t.CreatedAt;
            }

            return dto;
        }).ToList();

        return Ok(items);
    }

    /// <summary>
    /// GET /api/warnings/count?date=YYYY-MM-DD
    /// Lightweight endpoint for the topbar badge.
    /// </summary>
    [HttpGet("count")]
    public async Task<ActionResult<object>> GetCount([FromQuery] DateTime? date = null)
    {
        var targetDay = date?.Date ?? DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDay);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDay);

        // The frontend polls this every 60s. On a transient SQL failure (Azure
        // SQL paused / connection dropped), don't bubble up — return 0 so the
        // topbar badge stays calm and the next poll will recover.
        try
        {
            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            var q = _context.Warnings.AsNoTracking()
                .Where(w => w.CreatedAt >= utcStart && w.CreatedAt < utcEnd);
            if (allowedBpIds != null)
            {
                q = q.Where(w => w.BettingPoolId == null || allowedBpIds.Contains(w.BettingPoolId.Value));
            }
            var count = await q.CountAsync();

            return Ok(new { count, date = targetDay });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Warnings count query failed; returning 0 for badge");
            return Ok(new { count = 0, date = targetDay });
        }
    }
}
