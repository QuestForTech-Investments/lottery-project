using LotteryApi.Data;
using LotteryApi.Helpers;
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

    public DashboardController(LotteryDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Daily sales and benefit for the last 7 days (current week).
    /// </summary>
    [HttpGet("sales-benefit-chart")]
    public async Task<ActionResult> GetSalesBenefitChart([FromQuery] int days = 7)
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var startDate = today.AddDays(-(days - 1));
        var utcStart = DateTimeHelper.GetUtcStartOfDay(startDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(today);

        // Load tickets in the range, then group by business-timezone date
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled && t.CreatedAt >= utcStart && t.CreatedAt < utcEnd)
            .Select(t => new { t.CreatedAt, t.GrandTotal, t.TotalNet })
            .ToListAsync();

        var grouped = tickets
            .GroupBy(t => DateTimeHelper.ToBusinessTimezone(t.CreatedAt).Date)
            .ToDictionary(g => g.Key, g => new
            {
                Ventas = g.Sum(t => t.GrandTotal),
                Beneficio = g.Sum(t => t.TotalNet)
            });

        // Build result array with one entry per day in the range (fill gaps with 0)
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
    /// Sales per draw for today — with prizes, commission, net and distinct ticket count.
    /// </summary>
    [HttpGet("sales-by-draw")]
    public async Task<ActionResult> GetSalesByDraw()
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(today);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(today);

        var data = await _context.TicketLines
            .AsNoTracking()
            .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled
                && ((tl.Ticket.CreatedAt >= utcStart && tl.Ticket.CreatedAt < utcEnd)
                    || tl.DrawDate.Date == today))
            .Where(tl => tl.Draw != null)
            .GroupBy(tl => new { tl.DrawId, tl.Draw!.DrawName })
            .Select(g => new
            {
                DrawId = g.Key.DrawId,
                Name = g.Key.DrawName,
                Ventas = g.Sum(tl => tl.BetAmount),
                Premios = g.Sum(tl => (decimal?)tl.PrizeAmount) ?? 0m,
                Comision = g.Sum(tl => (decimal?)tl.CommissionAmount) ?? 0m,
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
        var data = await _context.Balances
            .AsNoTracking()
            .Include(b => b.BettingPool)
            .Where(b => b.BettingPool != null && b.BettingPool.IsActive && b.BettingPool.DeletedAt == null
                && b.CurrentBalance > 0)
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
        var data = await _context.Balances
            .AsNoTracking()
            .Include(b => b.BettingPool)
            .Where(b => b.BettingPool != null && b.BettingPool.IsActive && b.BettingPool.DeletedAt == null
                && b.CurrentBalance < 0)
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

        // Get all active bancas with their balance
        var bancas = await _context.BettingPools
            .AsNoTracking()
            .Where(bp => bp.IsActive && bp.DeletedAt == null)
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
