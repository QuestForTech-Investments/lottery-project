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
    /// All dashboard widgets require ADMIN_DASHBOARD permission.
    /// Returns true if the current user holds it (directly or via role).
    /// </summary>
    private async Task<bool> HasDashboardPermissionAsync()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == "ADMIN_DASHBOARD");
    }

    /// <summary>
    /// Daily sales and benefit for the last 7 days (current week).
    /// </summary>
    [HttpGet("sales-benefit-chart")]
    public async Task<ActionResult> GetSalesBenefitChart([FromQuery] int days = 7)
    {
        if (!await HasDashboardPermissionAsync()) return Forbid();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var startDate = today.AddDays(-(days - 1));

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();

        // Aggregate by ticket CreatedAt (emission day): future-sale tickets
        // are reported as sales on the day they were issued, not on the draw day.
        var rangeStartUtc = DateTimeHelper.GetUtcStartOfDay(startDate);
        var rangeEndUtc = DateTimeHelper.GetUtcEndOfDay(today);

        var ticketQuery = _context.Tickets
            .AsNoTracking()
            .Where(t => !t.IsCancelled
                && t.CreatedAt >= rangeStartUtc
                && t.CreatedAt <= rangeEndUtc);

        if (allowedBpIds != null)
        {
            ticketQuery = ticketQuery.Where(t => allowedBpIds.Contains(t.BettingPoolId));
        }

        var ticketRows = await ticketQuery
            .Select(t => new
            {
                t.CreatedAt,
                Bet = t.TotalBetAmount,
                Discount = t.TotalDiscount,
                Commission = t.TotalCommission,
                Prize = t.TotalPrize
            })
            .ToListAsync();

        var grouped = ticketRows
            .GroupBy(x => DateTimeHelper.ToBusinessTimezone(x.CreatedAt).Date)
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
        if (!await HasDashboardPermissionAsync()) return Forbid();

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
        if (!await HasDashboardPermissionAsync()) return Forbid();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var utcStart = DateTimeHelper.GetUtcStartOfDay(today);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(today);

        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
        // Sales-by-draw for today = lines from tickets ISSUED today, grouped by draw.
        // Future-sale tickets emitted today appear here under their target draw.
        var lineQuery = _context.TicketLines.AsNoTracking()
            .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled
                && tl.Ticket.CreatedAt >= utcStart && tl.Ticket.CreatedAt < utcEnd)
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
    /// The reported balance excludes today's in-progress sales so it matches
    /// the value shown in <c>/balances/betting-pools</c> — the closing balance
    /// from yesterday adjusted by any approved transactions today.
    /// </summary>
    [HttpGet("top-positive-bancas")]
    public async Task<ActionResult> GetTopPositiveBancas([FromQuery] int limit = 10)
    {
        if (!await HasDashboardPermissionAsync()) return Forbid();
        var data = await GetAdjustedBalancesAsync(positiveOnly: true, limit);
        return Ok(data);
    }

    /// <summary>
    /// Top N bancas with most negative balance. Uses the same adjusted balance
    /// formula as <see cref="GetTopPositiveBancas"/> so the dashboard and the
    /// balances page agree.
    /// </summary>
    [HttpGet("top-negative-bancas")]
    public async Task<ActionResult> GetTopNegativeBancas([FromQuery] int limit = 10)
    {
        if (!await HasDashboardPermissionAsync()) return Forbid();
        var data = await GetAdjustedBalancesAsync(positiveOnly: false, limit);
        return Ok(data);
    }

    /// <summary>
    /// Pulls live balances and subtracts today's net sales so the figure
    /// represents "yesterday's closing balance + today's transactions" —
    /// matching the cashier-facing balances page. Today's in-progress sales
    /// are intentionally left out until tomorrow's cutoff.
    /// </summary>
    private async Task<List<object>> GetAdjustedBalancesAsync(bool positiveOnly, int limit)
    {
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var todayStartUtc = DateTimeHelper.GetUtcStartOfDay(today);
        var todayEndUtc = DateTimeHelper.GetUtcEndOfDay(today);
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();

        var balancesQuery = _context.Balances.AsNoTracking()
            .Include(b => b.BettingPool)
            .Where(b => b.BettingPool != null && b.BettingPool.IsActive && b.BettingPool.DeletedAt == null);
        if (allowedBpIds != null) balancesQuery = balancesQuery.Where(b => allowedBpIds.Contains(b.BettingPoolId));

        var balances = await balancesQuery
            .Select(b => new
            {
                b.BettingPoolId,
                Code = b.BettingPool!.BettingPoolCode,
                Name = b.BettingPool.BettingPoolName,
                Reference = b.BettingPool.Reference,
                CurrentBalance = b.CurrentBalance
            })
            .ToListAsync();

        var bpIds = balances.Select(b => b.BettingPoolId).ToList();
        var todayDeltas = await GetTodayAutomaticDeltasAsync(bpIds, today, todayStartUtc, todayEndUtc);

        IEnumerable<object> ranked = balances
            .Select(b => new
            {
                b.BettingPoolId,
                b.Code,
                b.Name,
                b.Reference,
                Balance = b.CurrentBalance - (todayDeltas.TryGetValue(b.BettingPoolId, out var delta) ? delta : 0m)
            })
            .Where(x => positiveOnly ? x.Balance > 0 : x.Balance < 0)
            .OrderBy(x => positiveOnly ? -x.Balance : x.Balance) // pos desc, neg asc
            .Take(limit)
            .Cast<object>();
        return ranked.ToList();
    }

    /// <summary>
    /// Per-banca sum of every "automatic" amount that current_balance picked
    /// up today: net sales, the Sunday/period-end caída credit and any loan
    /// installment the worker (or the manual /payments endpoint) credited.
    /// We strip these from current_balance to show "yesterday's closing
    /// balance + manual transactions of today" — matching the rule used in
    /// BalancesController.GetBettingPoolBalances.
    /// </summary>
    private async Task<Dictionary<int, decimal>> GetTodayAutomaticDeltasAsync(
        List<int> bpIds, DateTime today, DateTime todayStartUtc, DateTime todayEndUtc)
    {
        var sales = await _context.Tickets.AsNoTracking()
            .Where(t => !t.IsCancelled
                && bpIds.Contains(t.BettingPoolId)
                && t.CreatedAt >= todayStartUtc
                && t.CreatedAt <= todayEndUtc)
            .GroupBy(t => t.BettingPoolId)
            .Select(g => new
            {
                BettingPoolId = g.Key,
                Net = g.Sum(t => t.TotalBetAmount - t.TotalPrize - t.TotalDiscount - t.TotalCommission)
            })
            .ToDictionaryAsync(x => x.BettingPoolId, x => x.Net);

        var caida = await _context.CaidaHistory.AsNoTracking()
            .Where(h => bpIds.Contains(h.BettingPoolId) && h.CalculationDate == today.Date)
            .GroupBy(h => h.BettingPoolId)
            .Select(g => new { BettingPoolId = g.Key, Amount = g.Sum(h => h.CaidaAmount) })
            .ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

        var loanPaid = await (
            from p in _context.LoanPayments.AsNoTracking()
            join l in _context.Loans.AsNoTracking() on p.LoanId equals l.LoanId
            where l.EntityType == "bettingPool"
                && bpIds.Contains(l.EntityId)
                && p.PaymentDate >= todayStartUtc
                && p.PaymentDate <= todayEndUtc
            group p by l.EntityId into g
            select new { BettingPoolId = g.Key, Amount = g.Sum(x => x.AmountPaid) }
        ).ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

        var totals = new Dictionary<int, decimal>();
        foreach (var id in bpIds)
        {
            var s = sales.TryGetValue(id, out var sv) ? sv : 0m;
            var c = caida.TryGetValue(id, out var cv) ? cv : 0m;
            var lp = loanPaid.TryGetValue(id, out var lv) ? lv : 0m;
            var total = s + c + lp;
            if (total != 0) totals[id] = total;
        }
        return totals;
    }

    /// <summary>
    /// Bancas with most days since last sale (overall). Includes current balance.
    /// </summary>
    [HttpGet("bancas-without-sales")]
    public async Task<ActionResult> GetBancasWithoutSales([FromQuery] int limit = 10)
    {
        if (!await HasDashboardPermissionAsync()) return Forbid();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var todayStartUtc = DateTimeHelper.GetUtcStartOfDay(today);
        var todayEndUtc = DateTimeHelper.GetUtcEndOfDay(today);
        var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();

        // Get all active bancas with their live balance. We'll adjust to
        // "yesterday's closing + today's tx" below so the figure matches the
        // balances page and top-positive/negative widgets.
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
                CurrentBalance = _context.Balances.Where(b => b.BettingPoolId == bp.BettingPoolId).Select(b => (decimal?)b.CurrentBalance).FirstOrDefault() ?? 0m
            })
            .ToListAsync();

        // Pull every "automatic" delta that current_balance picked up today
        // (sales + caída + loan installments) so the displayed balance
        // matches /balances/betting-pools — "yesterday's closing + manual
        // transactions of today".
        var bpIds = bancas.Select(b => b.BettingPoolId).ToList();
        var todayDeltas = await GetTodayAutomaticDeltasAsync(bpIds, today, todayStartUtc, todayEndUtc);

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

                var delta = todayDeltas.TryGetValue(bp.BettingPoolId, out var d) ? d : 0m;
                return new
                {
                    BettingPoolId = bp.BettingPoolId,
                    Code = bp.BettingPoolCode,
                    Name = bp.BettingPoolName,
                    Reference = bp.Reference,
                    DaysWithoutSales = days,
                    Balance = bp.CurrentBalance - delta,
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
