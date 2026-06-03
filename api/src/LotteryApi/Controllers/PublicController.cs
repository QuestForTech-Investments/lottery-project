using System.Security.Cryptography;
using System.Text;
using LotteryApi.Configuration;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LotteryApi.Controllers;

/// <summary>
/// Cross-tenant read-only endpoints. Auth via the shared <c>X-Central-Key</c>
/// header (not JWT) — see <see cref="PublicApiOptions"/>. Consumed by La
/// Central to populate the "Grupo" dropdown in Ventas del Día and (later)
/// to receive result-sync pushes.
/// </summary>
[ApiController]
[Route("api/public/v1")]
[AllowAnonymous]
public class PublicController : ControllerBase
{
    private const string CentralKeyHeader = "X-Central-Key";

    private readonly LotteryDbContext _context;
    private readonly PublicApiOptions _options;
    private readonly ResultSyncService _resultSync;
    private readonly ILogger<PublicController> _logger;

    public PublicController(
        LotteryDbContext context,
        IOptions<PublicApiOptions> options,
        ResultSyncService resultSync,
        ILogger<PublicController> logger)
    {
        _context = context;
        _options = options.Value;
        _resultSync = resultSync;
        _logger = logger;
    }

    /// <summary>
    /// Daily sales summary aggregated by ticket emission date (matches the
    /// semantics of <c>SalesReportsController.GetDailySalesSummary</c> —
    /// future-sale tickets count on the day they were issued).
    /// </summary>
    [HttpGet("today-sales")]
    [ProducesResponseType(typeof(PublicTodaySalesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PublicTodaySalesDto>> GetTodaySales(
        [FromQuery] DateTime? date = null)
    {
        if (!IsAuthorized()) return Unauthorized();

        var targetDate = (date ?? DateTimeHelper.TodayInBusinessTimezone()).Date;
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        // Mirror of SalesReportsController.GetDailySalesSummary aggregation —
        // intentionally NOT a service-extract to avoid coupling the public API
        // to refactors of the internal one.
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled
                && t.CreatedAt >= utcStart
                && t.CreatedAt <= utcEnd)
            .Select(t => new
            {
                t.TotalBetAmount,
                t.TotalPrize,
                t.TotalCommission,
                t.TotalDiscount,
                t.DiscountMode,
            })
            .ToListAsync();

        var totalSold = tickets.Sum(t => t.TotalBetAmount);
        var totalPrizes = tickets.Sum(t => t.TotalPrize);
        var totalCommissions = tickets.Sum(t => t.TotalCommission);
        var totalDiscounts = tickets.Sum(t => t.TotalDiscount);
        var totalNet = totalSold - totalDiscounts - totalCommissions - totalPrizes;

        return Ok(new PublicTodaySalesDto
        {
            TenantCode = _options.TenantCode,
            TenantName = _options.TenantName,
            Date = targetDate.ToString("yyyy-MM-dd"),
            Currency = _options.Currency,
            TotalSold = totalSold,
            TotalPrizes = totalPrizes,
            TotalCommissions = totalCommissions,
            TotalDiscounts = totalDiscounts,
            TotalNet = totalNet,
            TicketCount = tickets.Count,
        });
    }

    /// <summary>
    /// Per-banca breakdown for the same date as <c>today-sales</c>. Used by
    /// La Central's "Grupo" dropdown when the user expands the by-banca tab.
    /// </summary>
    [HttpGet("today-sales/by-banca")]
    [ProducesResponseType(typeof(List<PublicTodaySalesByBancaRow>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<PublicTodaySalesByBancaRow>>> GetTodaySalesByBanca(
        [FromQuery] DateTime? date = null)
    {
        if (!IsAuthorized()) return Unauthorized();

        var targetDate = (date ?? DateTimeHelper.TodayInBusinessTimezone()).Date;
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        var rows = await _context.Tickets
            .AsNoTracking()
            .Include(t => t.BettingPool)
                .ThenInclude(bp => bp!.Zone)
            .Where(t => !t.IsCancelled
                && t.CreatedAt >= utcStart
                && t.CreatedAt <= utcEnd)
            .GroupBy(t => t.BettingPoolId)
            .Select(g => new PublicTodaySalesByBancaRow
            {
                BettingPoolId = g.Key,
                BettingPoolCode = g.Select(t => t.BettingPool!.BettingPoolCode).FirstOrDefault() ?? string.Empty,
                BettingPoolName = g.Select(t => t.BettingPool!.BettingPoolName).FirstOrDefault() ?? string.Empty,
                ZoneId = g.Select(t => (int?)t.BettingPool!.ZoneId).FirstOrDefault(),
                ZoneName = g.Select(t => t.BettingPool!.Zone != null ? t.BettingPool.Zone.ZoneName : null).FirstOrDefault(),
                TotalSold = g.Sum(t => t.TotalBetAmount),
                TotalPrizes = g.Sum(t => t.TotalPrize),
                TotalCommissions = g.Sum(t => t.TotalCommission),
                TotalNet = g.Sum(t => t.TotalBetAmount - t.TotalDiscount - t.TotalCommission - t.TotalPrize),
                TicketCount = g.Count(),
            })
            .OrderByDescending(r => r.TotalSold)
            .ToListAsync();

        return Ok(rows);
    }

    /// <summary>
    /// Per-draw breakdown for the same date as <c>today-sales</c>. Groups by
    /// draw (sorteo) the tickets bet on. Tickets emitted today targeting a
    /// future draw appear under their target draw.
    /// </summary>
    [HttpGet("today-sales/by-draw")]
    [ProducesResponseType(typeof(List<PublicTodaySalesByDrawRow>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<PublicTodaySalesByDrawRow>>> GetTodaySalesByDraw(
        [FromQuery] DateTime? date = null)
    {
        if (!IsAuthorized()) return Unauthorized();

        var targetDate = (date ?? DateTimeHelper.TodayInBusinessTimezone()).Date;
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        var rows = await _context.TicketLines
            .AsNoTracking()
            .Include(tl => tl.Draw)
                .ThenInclude(d => d!.Lottery)
            .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled
                && tl.Ticket.CreatedAt >= utcStart
                && tl.Ticket.CreatedAt <= utcEnd
                && tl.Draw != null)
            .GroupBy(tl => tl.DrawId)
            .Select(g => new PublicTodaySalesByDrawRow
            {
                DrawId = g.Key,
                DrawCode = g.Select(tl => tl.Draw!.DrawCode).FirstOrDefault() ?? string.Empty,
                DrawName = g.Select(tl => tl.Draw!.DrawName).FirstOrDefault() ?? string.Empty,
                LotteryCode = g.Select(tl => tl.Draw!.Lottery != null ? tl.Draw.Lottery.LotteryCode : null).FirstOrDefault(),
                LotteryName = g.Select(tl => tl.Draw!.Lottery != null ? tl.Draw.Lottery.LotteryName : null).FirstOrDefault(),
                TotalSold = g.Sum(tl => tl.BetAmount),
                TotalPrizes = g.Sum(tl => tl.PrizeAmount),
                TotalCommissions = g.Sum(tl => tl.CommissionAmount),
                TotalNet = g.Sum(tl => tl.BetAmount - tl.DiscountAmount - tl.CommissionAmount - tl.PrizeAmount),
                TicketCount = g.Select(tl => tl.TicketId).Distinct().Count(),
            })
            .OrderByDescending(r => r.TotalSold)
            .ToListAsync();

        return Ok(rows);
    }

    /// <summary>
    /// Receive a result push from a partner with which we have
    /// <c>share_results=true</c>. First-write-wins: existing local rows are
    /// never overwritten — discrepancies land in <c>result_sync_conflicts</c>.
    /// </summary>
    [HttpPost("results/inbound")]
    [ProducesResponseType(typeof(PublicResultInboundResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PublicResultInboundResultDto>> PostResultInbound(
        [FromBody] PublicResultInboundDto body)
    {
        if (!IsAuthorized()) return Unauthorized();

        // The partner must already be in our external_tenants with the
        // share_results flag — otherwise an attacker that learned our key
        // could insert results pretending to be anyone.
        var partner = await _context.ExternalTenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TenantCode == body.PartnerCode);
        if (partner == null || !partner.IsActive || !partner.ShareResults)
        {
            _logger.LogWarning(
                "Inbound result rejected — partner '{Partner}' not configured or share_results off",
                body.PartnerCode);
            return Forbid();
        }

        var outcome = await _resultSync.ReceiveInboundAsync(body, HttpContext.RequestAborted);
        return Ok(outcome);
    }

    /// <summary>
    /// Validates the X-Central-Key header against the configured key using
    /// fixed-time comparison so an attacker can't probe valid prefixes by
    /// timing the response.
    /// </summary>
    private bool IsAuthorized()
    {
        var configured = _options.CentralKey;
        if (string.IsNullOrEmpty(configured))
        {
            // Endpoint disabled when no key is set. Log once at the controller
            // level so misconfiguration is visible without leaking the
            // (empty) key to callers.
            _logger.LogWarning(
                "Public API request rejected — {Section}.CentralKey is empty",
                PublicApiOptions.SectionName);
            return false;
        }

        if (!Request.Headers.TryGetValue(CentralKeyHeader, out var providedValues))
        {
            return false;
        }

        var provided = providedValues.ToString();
        if (string.IsNullOrEmpty(provided)) return false;

        var providedBytes = Encoding.UTF8.GetBytes(provided);
        var configuredBytes = Encoding.UTF8.GetBytes(configured);
        return CryptographicOperations.FixedTimeEquals(providedBytes, configuredBytes);
    }
}
