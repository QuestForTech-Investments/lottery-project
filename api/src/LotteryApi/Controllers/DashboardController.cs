using LotteryApi.Data;
using LotteryApi.Helpers;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<DashboardController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public DashboardController(LotteryDbContext context, ILogger<DashboardController> logger, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    /// <summary>
    /// Daily sales and benefit for the last 7 days (current week).
    /// </summary>
    [HttpGet("sales-benefit-chart")]
    public async Task<ActionResult> GetSalesBenefitChart([FromQuery] int days = 7)
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var startDate = today.AddDays(-(days - 1));

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();

        // Pull (DrawDate, TicketId, ticket totals) for lines in the range
        // Filter by DrawDate to match daily sales report (future-sale tickets count on draw day)
        var lineQuery = _context.TicketLines
            .AsNoTracking()
            .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled
                && tl.DrawDate.Date >= startDate && tl.DrawDate.Date <= today);

        if (allowedBpIds != null)
        {
            lineQuery = lineQuery.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
        }

        var lineDays = await lineQuery
            .Select(tl => new
            {
                DrawDate = tl.DrawDate.Date,
                TicketId = tl.TicketId,
                Bet = tl.Ticket!.TotalBetAmount,
                Discount = tl.Ticket.TotalDiscount,
                Commission = tl.Ticket.TotalCommission,
                Prize = tl.Ticket.TotalPrize
            })
            .ToListAsync();

        // Deduplicate so a ticket with multiple lines on the same day is only counted once per day
        var grouped = lineDays
            .GroupBy(x => new { x.DrawDate, x.TicketId })
            .Select(g => g.First())
            .GroupBy(x => x.DrawDate)
            .ToDictionary(g => g.Key, g => new
            {
                Ventas = g.Sum(x => x.Bet),
                Beneficio = g.Sum(x => x.Bet - x.Discount - x.Commission - x.Prize)
            });

        var dayNames = new[] { "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb" };
        var result = new List<object>();
        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            var label = $"{dayNames[(int)date.DayOfWeek]} {date:dd/MM}";
            grouped.TryGetValue(date, out var totals);
            result.Add(new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Label = label,
                Ventas = totals?.Ventas ?? 0m,
                Beneficio = totals?.Beneficio ?? 0m
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Hourly sales for today (0-23h). Returns ventas and tickets per hour in business timezone.
    /// </summary>
    [HttpGet("sales-by-hour")]
    public async Task<ActionResult> GetSalesByHour()
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(today);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(today);

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        var ticketsQuery = _context.Tickets.AsNoTracking()
            .Where(t => !t.IsCancelled && t.CreatedAt >= utcStart && t.CreatedAt < utcEnd);
        if (allowedBpIds != null) ticketsQuery = ticketsQuery.Where(t => allowedBpIds.Contains(t.BettingPoolId));

        var tickets = await ticketsQuery
            .Select(t => new { t.CreatedAt, t.TotalBetAmount })
            .ToListAsync();

        var grouped = tickets
            .GroupBy(t => DateTimeHelper.ToBusinessTimezone(t.CreatedAt).Hour)
            .ToDictionary(g => g.Key, g => new
            {
                Ventas = g.Sum(t => t.TotalBetAmount),
                Tickets = g.Count()
            });

        var result = new List<object>();
        for (int h = 0; h < 24; h++)
        {
            grouped.TryGetValue(h, out var totals);
            result.Add(new
            {
                Hour = h,
                Label = $"{h:D2}h",
                Ventas = totals?.Ventas ?? 0m,
                Tickets = totals?.Tickets ?? 0
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Sales per draw for today — with prizes, commission, net and distinct ticket count.
    /// </summary>
    [HttpGet("sales-by-draw")]
    public async Task<ActionResult> GetSalesByDraw()
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(today);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(today);

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        var lineQuery = _context.TicketLines.AsNoTracking()
            .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled
                && ((tl.Ticket.CreatedAt >= utcStart && tl.Ticket.CreatedAt < utcEnd)
                    || tl.DrawDate.Date == today))
            .Where(tl => tl.Draw != null);
        if (allowedBpIds != null)
            lineQuery = lineQuery.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));

        var data = await lineQuery
            .GroupBy(tl => new { tl.DrawId, tl.Draw!.DrawName, ImageUrl = tl.Draw.Lottery!.ImageUrl })
            .Select(g => new
            {
                DrawId = g.Key.DrawId,
                Name = g.Key.DrawName,
                ImageUrl = g.Key.ImageUrl,
                Ventas = g.Sum(tl => tl.BetAmount),
                Premios = g.Sum(tl => (decimal?)tl.PrizeAmount) ?? 0m,
                Comision = g.Sum(tl => (decimal?)tl.CommissionAmount) ?? 0m,
                Descuento = g.Sum(tl => (decimal?)tl.DiscountAmount) ?? 0m,
                Neto = g.Sum(tl => (decimal?)tl.NetAmount) ?? 0m,
                Tickets = g.Select(tl => tl.TicketId).Distinct().Count()
            })
            .OrderByDescending(x => x.Ventas)
            .ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Top N bancas with most positive balance (owe the most to the system).
    /// </summary>
    [HttpGet("top-positive-bancas")]
    public async Task<ActionResult> GetTopPositiveBancas([FromQuery] int limit = 10)
    {
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        var q = _context.Balances.AsNoTracking()
            .Include(b => b.BettingPool)
            .Where(b => b.BettingPool != null && b.BettingPool.IsActive && b.BettingPool.DeletedAt == null
                && b.CurrentBalance > 0);
        if (allowedBpIds != null) q = q.Where(b => allowedBpIds.Contains(b.BettingPoolId));

        var data = await q
            .OrderByDescending(b => b.CurrentBalance)
            .Take(limit)
            .Select(b => new
            {
                BettingPoolId = b.BettingPoolId,
                Code = b.BettingPool!.BettingPoolCode,
                Name = b.BettingPool.BettingPoolName,
                Reference = b.BettingPool.Reference,
                Balance = b.CurrentBalance
            })
            .ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Top N bancas with most negative balance.
    /// </summary>
    [HttpGet("top-negative-bancas")]
    public async Task<ActionResult> GetTopNegativeBancas([FromQuery] int limit = 10)
    {
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        var q = _context.Balances.AsNoTracking()
            .Include(b => b.BettingPool)
            .Where(b => b.BettingPool != null && b.BettingPool.IsActive && b.BettingPool.DeletedAt == null
                && b.CurrentBalance < 0);
        if (allowedBpIds != null) q = q.Where(b => allowedBpIds.Contains(b.BettingPoolId));

        var data = await q
            .OrderBy(b => b.CurrentBalance)
            .Take(limit)
            .Select(b => new
            {
                BettingPoolId = b.BettingPoolId,
                Code = b.BettingPool!.BettingPoolCode,
                Name = b.BettingPool.BettingPoolName,
                Reference = b.BettingPool.Reference,
                Balance = b.CurrentBalance
            })
            .ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Bancas with most days since last sale (overall). Includes current balance.
    /// </summary>
    [HttpGet("bancas-without-sales")]
    public async Task<ActionResult> GetBancasWithoutSales([FromQuery] int limit = 10)
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();

        // Get all active bancas with their balance
        var bancasQuery = _context.BettingPools.AsNoTracking()
            .Where(bp => bp.IsActive && bp.DeletedAt == null);
        if (allowedBpIds != null) bancasQuery = bancasQuery.Where(bp => allowedBpIds.Contains(bp.BettingPoolId));

        var bancas = await bancasQuery
            .Select(bp => new
            {
                bp.BettingPoolId,
                bp.BettingPoolCode,
                bp.BettingPoolName,
                bp.Reference,
                bp.CreatedAt,
                Balance = _context.Balances.Where(b => b.BettingPoolId == bp.BettingPoolId).Select(b => (decimal?)b.CurrentBalance).FirstOrDefault() ?? 0m
            })
            .ToListAsync();

        // Find last sale (ticket creation) per banca
        var lastSaleByBanca = await _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled)
            .GroupBy(t => t.BettingPoolId)
            .Select(g => new { BettingPoolId = g.Key, LastCreated = g.Max(t => t.CreatedAt) })
            .ToDictionaryAsync(x => x.BettingPoolId, x => x.LastCreated);

        var result = bancas
            .Select(bp =>
            {
                DateTime? lastSaleLocal = null;
                if (lastSaleByBanca.TryGetValue(bp.BettingPoolId, out var lastUtc))
                    lastSaleLocal = DateTimeHelper.ToBusinessTimezone(lastUtc).Date;

                int days;
                if (lastSaleLocal.HasValue)
                {
                    days = (today - lastSaleLocal.Value).Days;
                }
                else
                {
                    // Never sold — count days since banca was created
                    var createdLocal = bp.CreatedAt.HasValue
                        ? DateTimeHelper.ToBusinessTimezone(bp.CreatedAt.Value).Date
                        : today;
                    days = (today - createdLocal).Days;
                }

                return new
                {
                    BettingPoolId = bp.BettingPoolId,
                    Code = bp.BettingPoolCode,
                    Name = bp.BettingPoolName,
                    Reference = bp.Reference,
                    DaysWithoutSales = days,
                    Balance = bp.Balance,
                    LastSaleDate = lastSaleLocal?.ToString("yyyy-MM-dd")
                };
            })
            .Where(x => x.DaysWithoutSales > 0)
            .OrderByDescending(x => x.DaysWithoutSales)
            .Take(limit)
            .ToList();

        return Ok(result);
    }
}
