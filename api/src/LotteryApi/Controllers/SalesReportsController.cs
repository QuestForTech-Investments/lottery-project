using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Exceptions;
using LotteryApi.Helpers;
using LotteryApi.Services;
using LotteryApi.Services.Caida;
using LotteryApi.Services.ExternalResults;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/reports/sales")]
public class SalesReportsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<SalesReportsController> _logger;
    private readonly ICaidaCalculationService _caidaService;
    private readonly IZoneScopeService _zoneScope;

    public SalesReportsController(LotteryDbContext context, ILogger<SalesReportsController> logger, ICaidaCalculationService caidaService, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _caidaService = caidaService;
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

    /// <summary>
    /// True if the current user has an active assignment to the given banca.
    /// Lets POS users read sales data scoped to their own banca even without admin perms.
    /// </summary>
    private async Task<bool> IsAssignedToBettingPoolAsync(int bettingPoolId)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;
        return await _context.UserBettingPools.AsNoTracking()
            .AnyAsync(ubp => ubp.UserId == userId && ubp.BettingPoolId == bettingPoolId && ubp.IsActive);
    }

    /// <summary>
    /// Returns the list of banca IDs the current user is assigned to (POS).
    /// Used to auto-scope endpoints that don't take a single bettingPoolId.
    /// </summary>
    private async Task<List<int>> GetAssignedBettingPoolIdsAsync()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return new List<int>();
        return await _context.UserBettingPools.AsNoTracking()
            .Where(ubp => ubp.UserId == userId && ubp.IsActive)
            .Select(ubp => ubp.BettingPoolId)
            .ToListAsync();
    }

    /// <summary>
    /// Get sales report by betting pool and draw
    /// Generates an aggregated sales report per betting pool (banca) grouped by draw for a date range
    /// </summary>
    /// <param name="filter">Filter parameters including date range, draw IDs, zone IDs, and group ID</param>
    /// <returns>Sales report with aggregated data per betting pool</returns>
    [HttpPost("by-betting-pool-draw")]
    public async Task<ActionResult<SalesReportResponseDto>> GetSalesByBettingPoolAndDraw(
        [FromBody] SalesReportFilterDto filter)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        var posAllowedBpIds = hasAdminView ? null : await GetAssignedBettingPoolIdsAsync();
        if (!hasAdminView && (posAllowedBpIds == null || posAllowedBpIds.Count == 0)) return Forbid();

        try
        {
            // Validate date range
            if (filter.EndDate < filter.StartDate)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.InvalidDateRange, "La fecha de fin debe ser mayor o igual a la fecha de inicio");
            }

            // Adjust EndDate to include the entire day (23:59:59.999)
            var adjustedEndDate = filter.EndDate.Date.AddDays(1).AddTicks(-1);

            _logger.LogInformation(
                "Generating sales report from {StartDate} to {EndDate}, DrawIds: {DrawIds}, ZoneIds: {ZoneIds}",
                filter.StartDate, adjustedEndDate, filter.DrawIds, filter.ZoneIds);

            // Start with all betting pools
            var bettingPoolsQuery = _context.BettingPools
                .AsQueryable();

            // POS users: hard-scope to their own bancas.
            if (posAllowedBpIds != null)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => posAllowedBpIds.Contains(bp.BettingPoolId));
            }

            // Zone scope: admin only sees bancas in their assigned zones.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => allowedZones.Contains(bp.ZoneId));
            }

            // Apply zone filter if specified
            if (filter.ZoneIds != null && filter.ZoneIds.Count > 0)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => filter.ZoneIds.Contains(bp.ZoneId));
            }

            // Sales filtered by ticket emission day (CreatedAt). Future-sale
            // tickets count as revenue on the day they were issued.
            var rangeStartUtc = DateTimeHelper.GetUtcStartOfDay(filter.StartDate.Date);
            var rangeEndUtc = DateTimeHelper.GetUtcEndOfDay(filter.EndDate.Date);

            var salesData = await bettingPoolsQuery
                .Select(bp => new
                {
                    BettingPool = bp,
                    Tickets = bp.Tickets
                        .Where(t => !t.IsCancelled
                            && t.CreatedAt >= rangeStartUtc
                            && t.CreatedAt <= rangeEndUtc)
                        .Where(t => filter.DrawIds == null || filter.DrawIds.Count == 0
                            || t.TicketLines.Any(tl => filter.DrawIds.Contains(tl.DrawId)))
                        .ToList()
                })
                .ToListAsync();

            // Calculate aggregated sales per betting pool
            // Pre-compute real-time caída for each banca (uses correct period per fall type)
            var allBpIds = salesData.Where(x => x.Tickets.Any()).Select(x => x.BettingPool.BettingPoolId).ToList();
            var targetDate = filter.EndDate.Date;
            var caidaValues = new Dictionary<int, (decimal fall, decimal accumulatedFall)>();
            foreach (var bpId in allBpIds)
            {
                var (fall, acc) = await _caidaService.GetRealtimeCaidaAsync(bpId, targetDate);
                if (fall != 0 || acc != 0)
                    caidaValues[bpId] = (fall, acc);
            }

            var bettingPoolSales = salesData
                .Where(x => x.Tickets.Any()) // Only include betting pools with sales
                .Select(x =>
                {
                    var totalSold = x.Tickets.Sum(t => t.GrandTotal);
                    var totalPrizes = x.Tickets.Sum(t => t.TotalPrize);
                    var totalCommissions = x.Tickets.Sum(t => t.TotalCommission);
                    var riferoDiscount = x.Tickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);
                    var totalNet = totalSold + riferoDiscount - totalCommissions - totalPrizes;

                    caidaValues.TryGetValue(x.BettingPool.BettingPoolId, out var caida);

                    return new BettingPoolSalesDto
                    {
                        BettingPoolId = x.BettingPool.BettingPoolId,
                        BettingPoolName = x.BettingPool.BettingPoolName,
                        BettingPoolCode = x.BettingPool.BettingPoolCode,
                        Reference = x.BettingPool.Reference,
                        ZoneId = x.BettingPool.ZoneId,
                        ZoneName = x.BettingPool.Zone != null ? x.BettingPool.Zone.ZoneName : string.Empty,
                        TotalSold = totalSold,
                        TotalPrizes = totalPrizes,
                        TotalCommissions = totalCommissions,
                        TotalNet = totalNet,
                        Fall = caida.fall,
                        AccumulatedFall = caida.accumulatedFall
                    };
                })
                .OrderBy(x => x.BettingPoolCode)
                .ToList();

            // Calculate summary
            var summary = new SalesSummaryDto
            {
                TotalSold = bettingPoolSales.Sum(x => x.TotalSold),
                TotalPrizes = bettingPoolSales.Sum(x => x.TotalPrizes),
                TotalCommissions = bettingPoolSales.Sum(x => x.TotalCommissions),
                TotalNet = bettingPoolSales.Sum(x => x.TotalNet)
            };

            var response = new SalesReportResponseDto
            {
                StartDate = filter.StartDate,
                EndDate = filter.EndDate,
                TotalNet = summary.TotalNet,
                BettingPools = bettingPoolSales,
                TotalCount = bettingPoolSales.Count,
                Summary = summary
            };

            _logger.LogInformation(
                "Sales report generated: {Count} betting pools, Total Net: {TotalNet}",
                response.TotalCount, response.TotalNet);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating sales report");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al generar el reporte de ventas", 500);
        }
    }

    /// <summary>
    /// Get sales summary for a specific date (used for daily sales widget)
    /// </summary>
    /// <param name="date">Date to get sales summary for (defaults to today)</param>
    /// <returns>Sales summary for the specified date</returns>
    [HttpGet("daily-summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetDailySalesSummary(
        [FromQuery] DateTime? date = null,
        [FromQuery] int? bettingPoolId = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            // POS users: must scope to their own banca. If a specific bettingPoolId is provided,
            // it has to belong to them.
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
            if (bettingPoolId.HasValue && !posAllowedBpIds.Contains(bettingPoolId.Value)) return Forbid();
        }

        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

            // Convert to UTC using Santo Domingo timezone (same logic as by-betting-pool)
            string timezoneId = "America/Santo_Domingo";
            var businessTimezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);

            var localStartOfDay = new DateTime(targetDate.Year, targetDate.Month, targetDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var localEndOfDay = new DateTime(targetDate.Year, targetDate.Month, targetDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);

            var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStartOfDay, businessTimezone);
            var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEndOfDay, businessTimezone);

            _logger.LogInformation(
                "Getting daily sales summary for {Date} (UTC: {UtcStart} to {UtcEnd}), BettingPoolId: {BettingPoolId}",
                targetDate, utcStart, utcEnd, bettingPoolId);

            // Sales aggregated by emission day: include only tickets created on targetDate.
            // Future-sale tickets count on the day they were issued, not on draw day.
            var query = _context.Tickets
                .Where(t => !t.IsCancelled
                    && t.CreatedAt >= utcStart
                    && t.CreatedAt < utcEnd);

            // Zone scope: admin only sees tickets from bancas in their assigned zones.
            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(t => allowedBpIds.Contains(t.BettingPoolId));
            }

            // POS users are hard-scoped to their assigned bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(t => posAllowedBpIds.Contains(t.BettingPoolId));
            }

            if (bettingPoolId.HasValue)
            {
                if (allowedBpIds != null && !allowedBpIds.Contains(bettingPoolId.Value))
                {
                    return Ok(new SalesSummaryDto());
                }
                query = query.Where(t => t.BettingPoolId == bettingPoolId.Value);
            }

            var tickets = await query.Distinct().ToListAsync();

            var totalSold = tickets.Sum(t => t.TotalBetAmount);
            var totalPrizes = tickets.Sum(t => t.TotalPrize);
            var totalCommissions = tickets.Sum(t => t.TotalCommission);
            var totalDiscounts = tickets.Sum(t => t.TotalDiscount);
            var riferoDiscount = tickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);

            // When the queried banca has commission hidden (allow_view_commission = false)
            // the POS should display a "final" amount that doesn't deduct commission —
            // otherwise the operator would see a net lower than what they expect with
            // no visible explanation. Only applies to single-banca queries; aggregate
            // admin queries keep the canonical net (sold − disc − com − prizes).
            // Hide commission ONLY for POS callers (no VIEW_SALES permission).
            // Admin views must always show commission for reporting/audit, even
            // when the queried banca has allow_view_commission=false.
            bool excludeCommissionFromNet = false;
            if (!hasAdminView && bettingPoolId.HasValue)
            {
                excludeCommissionFromNet = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .Where(c => c.BettingPoolId == bettingPoolId.Value)
                    .Select(c => !c.AllowViewCommission)
                    .FirstOrDefaultAsync();
            }

            var totalNet = excludeCommissionFromNet
                ? totalSold - totalDiscounts - totalPrizes
                : totalSold - totalDiscounts - totalCommissions - totalPrizes;

            // Get balance for the betting pool(s)
            decimal balance = 0m;
            decimal credito = 0m;
            if (bettingPoolId.HasValue)
            {
                balance = await _context.Balances
                    .Where(b => b.BettingPoolId == bettingPoolId.Value)
                    .Select(b => b.CurrentBalance)
                    .FirstOrDefaultAsync();

                // POS-facing balance reconciliation: when the banca isn't allowed
                // to see commission, add back the commission of its MOST RECENT
                // business-timezone day with sales. This keeps the displayed
                // balance stable across days without new activity (so the POS
                // sees the same closing balance until the next sales day) and
                // matches the user's expectation that yesterday's closing
                // balance persists.
                //
                // Only apply the offset when balance > 0 (i.e. the banca still
                // owes from a pending sale). If the balance is 0 or negative
                // the banca has been settled, so re-adding commission would
                // surface a phantom amount that doesn't correspond to any
                // outstanding debt.
                if (excludeCommissionFromNet && balance > 0)
                {
                    var bpTickets = await _context.Tickets
                        .AsNoTracking()
                        .Where(t => !t.IsCancelled && t.BettingPoolId == bettingPoolId.Value)
                        .Select(t => new { t.CreatedAt, t.TotalCommission })
                        .ToListAsync();
                    if (bpTickets.Count > 0)
                    {
                        var lastBusinessDate = bpTickets
                            .Select(t => TimeZoneInfo.ConvertTimeFromUtc(t.CreatedAt, businessTimezone).Date)
                            .Max();
                        balance += bpTickets
                            .Where(t => TimeZoneInfo.ConvertTimeFromUtc(t.CreatedAt, businessTimezone).Date == lastBusinessDate)
                            .Sum(t => t.TotalCommission);
                    }
                }

                // Credito = DeactivationBalance - CurrentBalance (remaining room until banca gets disabled)
                // DeactivationBalance == 0 or null means "not configured" (no credit limit).
                // Uses the (possibly-adjusted) balance above so the POS sees a
                // credit value that matches the displayed balance — keeps the
                // user from spotting the discrepancy via this field either.
                var deactivation = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .Where(c => c.BettingPoolId == bettingPoolId.Value)
                    .Select(c => c.DeactivationBalance ?? 0m)
                    .FirstOrDefaultAsync();
                credito = deactivation > 0 ? Math.Max(0m, deactivation - balance) : 0m;
            }
            else
            {
                balance = await _context.Balances.SumAsync(b => b.CurrentBalance);
                // Only sum configured (> 0) deactivation balances
                var totalDeactivation = await _context.BettingPoolConfigs.AsNoTracking()
                    .Where(c => c.DeactivationBalance.HasValue && c.DeactivationBalance.Value > 0)
                    .SumAsync(c => c.DeactivationBalance!.Value);
                credito = totalDeactivation > 0 ? Math.Max(0m, totalDeactivation - balance) : 0m;
            }

            // Caída: use real-time calculation for specific banca, or history for aggregate
            decimal totalFall = 0;
            decimal accumulatedFall = 0;
            if (bettingPoolId.HasValue)
            {
                var (realtimeCaida, realtimeAcc) = await _caidaService.GetRealtimeCaidaAsync(bettingPoolId.Value, targetDate);
                totalFall = realtimeCaida;
                accumulatedFall = realtimeAcc;
            }
            else
            {
                totalFall = await _context.CaidaHistory.AsNoTracking()
                    .Where(h => h.CalculationDate == targetDate)
                    .SumAsync(h => (decimal?)h.CaidaAmount) ?? 0;
            }

            // "Balance del día anterior" — yesterday's closing balance plus
            // today's approved transaction_groups, with every automatic
            // movement (sales-in-progress, caída credits and loan
            // installments) backed out. Same rule as /balances/betting-pools
            // and the dashboard widgets. Only populated for single-banca
            // queries; aggregate views leave it at 0.
            decimal balanceOfTheDay = 0m;
            if (bettingPoolId.HasValue)
            {
                var liveBalance = await _context.Balances
                    .AsNoTracking()
                    .Where(b => b.BettingPoolId == bettingPoolId.Value)
                    .Select(b => (decimal?)b.CurrentBalance)
                    .FirstOrDefaultAsync() ?? 0m;
                var todayBusinessDate = Helpers.DateTimeHelper.TodayInBusinessTimezone().Date;
                var todayStartUtc = DateTimeHelper.GetUtcStartOfDay(todayBusinessDate);
                var todayEndUtc = DateTimeHelper.GetUtcEndOfDay(todayBusinessDate);

                var todayNet = await _context.Tickets.AsNoTracking()
                    .Where(t => !t.IsCancelled
                        && t.BettingPoolId == bettingPoolId.Value
                        && t.CreatedAt >= todayStartUtc
                        && t.CreatedAt <= todayEndUtc)
                    .SumAsync(t => (decimal?)(t.TotalBetAmount - t.TotalPrize - t.TotalDiscount - t.TotalCommission)) ?? 0m;

                var todayCaida = await _context.CaidaHistory.AsNoTracking()
                    .Where(h => h.BettingPoolId == bettingPoolId.Value && h.CalculationDate == todayBusinessDate)
                    .SumAsync(h => (decimal?)h.CaidaAmount) ?? 0m;

                var todayLoanPaid = await (
                    from p in _context.LoanPayments.AsNoTracking()
                    join l in _context.Loans.AsNoTracking() on p.LoanId equals l.LoanId
                    where l.EntityType == "bettingPool"
                        && l.EntityId == bettingPoolId.Value
                        && p.PaymentDate >= todayStartUtc
                        && p.PaymentDate <= todayEndUtc
                    select (decimal?)p.AmountPaid
                ).SumAsync() ?? 0m;

                // Caída was subtracted from current_balance (central's share),
                // so we add it back to recover yesterday's closing balance.
                balanceOfTheDay = liveBalance - todayNet + todayCaida - todayLoanPaid;
            }

            var summary = new SalesSummaryDto
            {
                TotalSold = totalSold,
                TotalPrizes = totalPrizes,
                TotalCommissions = totalCommissions,
                TotalDiscounts = totalDiscounts,
                Fall = totalFall,
                AccumulatedFall = accumulatedFall,
                TotalNet = totalNet,
                Final = totalNet - totalFall,
                Balance = balance,
                BalanceOfTheDay = balanceOfTheDay,
                Credits = credito,
                BenefitPercentage = totalSold > 0 ? (totalNet / totalSold) * 100 : 0
            };

            _logger.LogInformation(
                "Daily summary for {Date}: Sold={TotalSold}, Prizes={TotalPrizes}, Commissions={TotalCommissions}, Net={TotalNet}",
                targetDate, summary.TotalSold, summary.TotalPrizes, summary.TotalCommissions, summary.TotalNet);

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily sales summary");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener el resumen de ventas del día", 500);
        }
    }

    /// <summary>
    /// Get daily sales summaries for a date range (used for "Ventas por fecha" report)
    /// Returns an array with one entry per day in the range
    /// </summary>
    /// <param name="startDate">Start date of the range</param>
    /// <param name="endDate">End date of the range</param>
    /// <param name="zoneIds">Optional comma-separated zone IDs to filter by</param>
    /// <param name="bettingPoolIds">Optional comma-separated betting pool IDs to filter by</param>
    /// <returns>List of daily sales summaries</returns>
    [HttpGet("daily-summary-range")]
    public async Task<ActionResult<List<DailySalesSummaryDto>>> GetDailySalesSummaryRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string? zoneIds = null,
        [FromQuery] string? bettingPoolIds = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            _logger.LogInformation(
                "Getting daily sales summary range from {StartDate} to {EndDate}, ZoneIds: {ZoneIds}, BettingPoolIds: {BettingPoolIds}",
                startDate, endDate, zoneIds, bettingPoolIds);

            // Parse filter IDs
            var zoneIdList = string.IsNullOrEmpty(zoneIds)
                ? null
                : zoneIds.Split(',').Select(int.Parse).ToList();
            var bettingPoolIdList = string.IsNullOrEmpty(bettingPoolIds)
                ? null
                : bettingPoolIds.Split(',').Select(int.Parse).ToList();

            // Ensure dates are in correct order
            if (startDate > endDate)
            {
                (startDate, endDate) = (endDate, startDate);
            }

            // The query params are calendar dates in the business timezone; CreatedAt is stored
            // in UTC. Convert the [startDate 00:00, endDate+1 00:00) window from Santo Domingo
            // to UTC so a ticket made at, e.g., 21:00 SDQ yesterday isn't bucketed into today.
            var rangeStartUtc = DateTimeHelper.ToUtc(startDate.Date);
            var rangeEndUtc = DateTimeHelper.ToUtc(endDate.Date.AddDays(1)).AddTicks(-1);

            var query = _context.Tickets
                .Include(t => t.BettingPool)
                .Where(t => !t.IsCancelled
                    && t.CreatedAt >= rangeStartUtc
                    && t.CreatedAt <= rangeEndUtc);

            // Zone scope.
            var allowedBpIdsRange = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIdsRange != null)
            {
                query = query.Where(t => allowedBpIdsRange.Contains(t.BettingPoolId));
            }

            // POS users are hard-scoped to their assigned bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(t => posAllowedBpIds.Contains(t.BettingPoolId));
            }

            // Apply filters
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(t => t.BettingPool != null && zoneIdList.Contains(t.BettingPool.ZoneId));
            }

            if (bettingPoolIdList != null && bettingPoolIdList.Count > 0)
            {
                query = query.Where(t => bettingPoolIdList.Contains(t.BettingPoolId));
            }

            var tickets = await query.ToListAsync();

            // Pre-fetch caída data for the date range
            var caidaByDate = await _context.CaidaHistory
                .AsNoTracking()
                .Where(h => h.CalculationDate >= startDate.Date && h.CalculationDate <= endDate.Date)
                .GroupBy(h => h.CalculationDate)
                .Select(g => new { Date = g.Key, TotalCaida = g.Sum(h => h.CaidaAmount) })
                .ToDictionaryAsync(x => x.Date, x => x.TotalCaida);

            // Group by date and calculate summaries
            var dailySummaries = new List<DailySalesSummaryDto>();
            var currentDate = startDate.Date;

            while (currentDate <= endDate.Date)
            {
                // Day boundaries are Santo Domingo midnight → midnight, converted to UTC
                // so the per-day bucket matches the per-range filter we ran above.
                var dayStartUtc = DateTimeHelper.ToUtc(currentDate);
                var dayEndUtc = DateTimeHelper.ToUtc(currentDate.AddDays(1)).AddTicks(-1);

                var dayTickets = tickets.Where(t => t.CreatedAt >= dayStartUtc && t.CreatedAt <= dayEndUtc).ToList();

                var totalSold = dayTickets.Sum(t => t.GrandTotal);
                var totalPrizes = dayTickets.Sum(t => t.TotalPrize);
                var totalCommissions = dayTickets.Sum(t => t.TotalCommission);
                var totalDiscounts = dayTickets.Sum(t => t.TotalDiscount);
                var riferoDiscount = dayTickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);
                var totalNet = totalSold + riferoDiscount - totalCommissions - totalPrizes;

                caidaByDate.TryGetValue(currentDate, out var dayFall);

                dailySummaries.Add(new DailySalesSummaryDto
                {
                    Date = currentDate,
                    TotalSold = totalSold,
                    TotalPrizes = totalPrizes,
                    TotalCommissions = totalCommissions,
                    TotalDiscounts = totalDiscounts,
                    Fall = dayFall,
                    TotalNet = totalNet
                });

                currentDate = currentDate.AddDays(1);
            }

            _logger.LogInformation(
                "Returning {Count} daily summaries from {StartDate} to {EndDate}",
                dailySummaries.Count, startDate, endDate);

            return Ok(dailySummaries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily sales summary range");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener el resumen de ventas por fecha", 500);
        }
    }

    /// <summary>
    /// Get sales by betting pool for a specific date range (simplified version without draw filtering)
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="zoneId">Optional zone filter</param>
    /// <returns>List of betting pools with their sales data</returns>
    [HttpGet("by-betting-pool")]
    public async Task<ActionResult<List<BettingPoolSalesDto>>> GetSalesByBettingPool(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int? zoneId = null,
        [FromQuery] string? zoneIds = null,
        [FromQuery] int? lotteryId = null,
        [FromQuery] int? bettingPoolId = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            // Validate date range
            if (endDate < startDate)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.InvalidDateRange, "La fecha de fin debe ser mayor o igual a la fecha de inicio");
            }

            _logger.LogInformation(
                "Getting sales by betting pool from {StartDate} to {EndDate}, ZoneId: {ZoneId}, LotteryId: {LotteryId}",
                startDate, endDate, zoneId, lotteryId);

            var query = _context.BettingPools.AsQueryable();

            // POS users: hard-scope to their own bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(bp => posAllowedBpIds.Contains(bp.BettingPoolId));
            }

            // Zone scope: admin only sees bancas in their assigned zones.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                query = query.Where(bp => allowedZones.Contains(bp.ZoneId));
            }

            // Single-banca filter (used by /sales/day per-banca view + admin
            // payment flow). When set, we return ONE row for that banca even
            // if it has no sales today — so the cashier still gets the
            // current BalanceOfTheDay to decide a payment.
            if (bettingPoolId.HasValue)
            {
                query = query.Where(bp => bp.BettingPoolId == bettingPoolId.Value);
            }

            // Apply zone filter if specified
            if (!string.IsNullOrEmpty(zoneIds))
            {
                var zoneIdList = zoneIds.Split(',').Select(s => int.TryParse(s.Trim(), out var id) ? id : 0).Where(id => id > 0).ToList();
                if (zoneIdList.Count > 0)
                    query = query.Where(bp => zoneIdList.Contains(bp.ZoneId));
            }
            else if (zoneId.HasValue)
            {
                query = query.Where(bp => bp.ZoneId == zoneId.Value);
            }

            var filterStartDate = startDate.Date;
            var filterEndDate = endDate.Date;
            var businessToday = Helpers.DateTimeHelper.TodayInBusinessTimezone().Date;
            // When the query targets today (or the future) we read the live
            // current_balance — the daily cutoff snapshot for today is often
            // a stale carry-over from yesterday until the job runs at end-of-
            // day, so using it would freeze the displayed balance and ignore
            // the day's sales in progress. Past dates still use the snapshot.
            var useLiveBalance = filterEndDate >= businessToday;

            // Resolve snapshot date for BalanceOfTheDay (same logic as BalancesController)
            var hasSnapshot = await _context.BalanceHistories
                .AnyAsync(bh => bh.BalanceDate == filterEndDate);
            var snapshotDate = hasSnapshot ? filterEndDate : filterEndDate.AddDays(-1);

            // Load snapshots for the resolved date
            var snapshots = await _context.BalanceHistories
                .Where(bh => bh.BalanceDate == snapshotDate)
                .ToDictionaryAsync(bh => bh.BettingPoolId, bh => bh.BalanceAmount);

            // For today-or-future queries also preload the live balance per
            // banca so we can use it instead of the (possibly stale) snapshot.
            var liveBalances = useLiveBalance
                ? await _context.Balances
                    .AsNoTracking()
                    .ToDictionaryAsync(b => b.BettingPoolId, b => b.CurrentBalance)
                : new Dictionary<int, decimal>();

            // For BalanceOfTheDay we want "yesterday's closing balance +
            // approved transaction_groups of today" — same rule the
            // /balances/betting-pools page uses. To get there from
            // current_balance we strip every automatic delta the system
            // added today: net sales, caída credits, and loan installments.
            // Manual transaction_groups already sit in current_balance and
            // stay because we don't subtract them.
            var todayBusinessDate = Helpers.DateTimeHelper.TodayInBusinessTimezone().Date;
            var todayStartUtc = DateTimeHelper.GetUtcStartOfDay(todayBusinessDate);
            var todayEndUtc = DateTimeHelper.GetUtcEndOfDay(todayBusinessDate);
            var todayDeltaByBp = useLiveBalance
                ? await ComputeTodayAutomaticDeltasAsync(todayBusinessDate, todayStartUtc, todayEndUtc)
                : new Dictionary<int, decimal>();

            // Sales aggregated by ticket emission day (CreatedAt).
            // Future-sale tickets count as revenue on the day they were issued.
            var bpRangeStartUtc = DateTimeHelper.GetUtcStartOfDay(filterStartDate);
            var bpRangeEndUtc = DateTimeHelper.GetUtcEndOfDay(filterEndDate);

            var salesData = await query
                .Include(bp => bp.Balance)
                .Select(bp => new
                {
                    BettingPool = bp,
                    Tickets = bp.Tickets
                        .Where(t => !t.IsCancelled
                            && t.CreatedAt >= bpRangeStartUtc
                            && t.CreatedAt <= bpRangeEndUtc)
                        .Where(t => !lotteryId.HasValue || t.TicketLines.Any(tl => tl.Draw.LotteryId == lotteryId.Value))
                        .ToList()
                })
                .ToListAsync();

            // Pre-compute real-time caída for each banca (uses correct period per fall type)
            var bpSalesIds = salesData.Where(x => x.Tickets.Any()).Select(x => x.BettingPool.BettingPoolId).ToList();
            var bpTargetDate = filterEndDate;
            var bpCaidaValues = new Dictionary<int, (decimal fall, decimal accumulatedFall)>();
            foreach (var bpId in bpSalesIds)
            {
                var (f, a) = await _caidaService.GetRealtimeCaidaAsync(bpId, bpTargetDate);
                if (f != 0 || a != 0)
                    bpCaidaValues[bpId] = (f, a);
            }

            // Adjust balances with today's approved transactions (PAGOs, COBROs, etc.)
            var todayUtcStart = DateTimeHelper.GetUtcStartOfDay(filterEndDate);
            var todayUtcEnd = DateTimeHelper.GetUtcEndOfDay(filterEndDate);

            var entity1Adjustments = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity1Type == "bettingPool"
                    && l.Group!.Status == "Aprobado"
                    && l.Group!.CreatedAt >= todayUtcStart
                    && l.Group!.CreatedAt <= todayUtcEnd)
                .GroupBy(l => l.Entity1Id)
                .Select(g => new { BettingPoolId = g.Key, Net = g.Sum(l => l.Debit - l.Credit) })
                .ToListAsync();

            var entity2Adjustments = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity2Type == "bettingPool"
                    && l.Group!.Status == "Aprobado"
                    && l.Group!.CreatedAt >= todayUtcStart
                    && l.Group!.CreatedAt <= todayUtcEnd)
                .GroupBy(l => l.Entity2Id!.Value)
                .Select(g => new { BettingPoolId = g.Key, Net = g.Sum(l => l.Credit - l.Debit) })
                .ToListAsync();

            var txAdjustmentMap = new Dictionary<int, decimal>();
            foreach (var adj in entity1Adjustments)
            {
                txAdjustmentMap.TryGetValue(adj.BettingPoolId, out var current);
                txAdjustmentMap[adj.BettingPoolId] = current + adj.Net;
            }
            foreach (var adj in entity2Adjustments)
            {
                txAdjustmentMap.TryGetValue(adj.BettingPoolId, out var current);
                txAdjustmentMap[adj.BettingPoolId] = current + adj.Net;
            }

            // Per-banca commission-visibility flag. Hide ONLY for POS callers
            // (no VIEW_SALES). Admins consuming this endpoint for reports must
            // always see commission, regardless of the per-banca flag.
            // Include the explicitly-requested banca even when it has no
            // sales today so its commission flag (and downstream offsets)
            // still apply.
            var bpWithSales = salesData
                .Where(x => x.Tickets.Any() || bettingPoolId.HasValue)
                .Select(x => x.BettingPool.BettingPoolId)
                .ToList();
            var hideCommissionByBp = !hasAdminView
                ? await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .Where(c => bpWithSales.Contains(c.BettingPoolId))
                    .ToDictionaryAsync(c => c.BettingPoolId, c => !c.AllowViewCommission)
                : new Dictionary<int, bool>();

            // For bancas that hide commission, compute the commission of each
            // one's most-recent business-timezone day with sales — that's the
            // offset added to the displayed balance to keep it stable across
            // idle days. See daily-summary for the same reasoning.
            var hidingBpIds = hideCommissionByBp.Where(kv => kv.Value).Select(kv => kv.Key).ToList();
            var commissionLastDayByBp = new Dictionary<int, decimal>();
            if (hidingBpIds.Count > 0)
            {
                var businessTz = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");
                var ticketsForHiding = await _context.Tickets
                    .AsNoTracking()
                    .Where(t => !t.IsCancelled && hidingBpIds.Contains(t.BettingPoolId))
                    .Select(t => new { t.BettingPoolId, t.CreatedAt, t.TotalCommission })
                    .ToListAsync();
                commissionLastDayByBp = ticketsForHiding
                    .GroupBy(t => t.BettingPoolId)
                    .ToDictionary(g => g.Key, g =>
                    {
                        var lastDate = g
                            .Select(t => TimeZoneInfo.ConvertTimeFromUtc(t.CreatedAt, businessTz).Date)
                            .Max();
                        return g
                            .Where(t => TimeZoneInfo.ConvertTimeFromUtc(t.CreatedAt, businessTz).Date == lastDate)
                            .Sum(t => t.TotalCommission);
                    });
            }

            // Active-loan remaining balances per banca (only for rows the
            // result will actually contain — bancas with sales in the
            // period, plus the explicitly-requested banca). The frontend
            // shows this next to the balance so the cashier knows how
            // much of the running debt is loan-backed.
            var loanScopeBpIds = salesData
                .Where(x => x.Tickets.Any() || bettingPoolId.HasValue)
                .Select(x => x.BettingPool.BettingPoolId)
                .ToList();
            var loanBalanceByBp = loanScopeBpIds.Count > 0
                ? await _context.Loans
                    .AsNoTracking()
                    .Where(l => l.EntityType == "bettingPool"
                        && l.Status == "active"
                        && loanScopeBpIds.Contains(l.EntityId))
                    .GroupBy(l => l.EntityId)
                    .Select(g => new { BettingPoolId = g.Key, Remaining = g.Sum(l => l.RemainingBalance) })
                    .ToDictionaryAsync(x => x.BettingPoolId, x => x.Remaining)
                : new Dictionary<int, decimal>();

            var result = salesData
                // When a specific betting pool is requested we keep the row
                // even if it has no sales today — the caller needs the
                // current balance/BalanceOfTheDay regardless. Aggregate views
                // still hide bancas with no activity to avoid empty rows.
                .Where(x => x.Tickets.Any() || bettingPoolId.HasValue)
                .Select(x =>
                {
                    var totalSold = x.Tickets.Sum(t => t.TotalBetAmount);
                    var totalPrizes = x.Tickets.Sum(t => t.TotalPrize);
                    var totalCommissions = x.Tickets.Sum(t => t.TotalCommission);
                    var totalDiscounts = x.Tickets.Sum(t => t.TotalDiscount);

                    var bpId = x.BettingPool.BettingPoolId;
                    var hideCommission = hideCommissionByBp.TryGetValue(bpId, out var hc) && hc;
                    var totalNet = hideCommission
                        ? totalSold - totalDiscounts - totalPrizes
                        : totalSold - totalDiscounts - totalCommissions - totalPrizes;

                    // Count tickets by state
                    var pendingCount = x.Tickets.Count(t => t.TicketState == "P");
                    var winnerCount = x.Tickets.Count(t => t.TicketState == "W");
                    var loserCount = x.Tickets.Count(t => t.TicketState == "L");
                    var pendingTicketsAmount = x.Tickets.Where(t => t.TicketState == "P").Sum(t => t.TotalBetAmount);

                    bpCaidaValues.TryGetValue(bpId, out var caida);

                    var snapBal = snapshots.TryGetValue(bpId, out var s) ? s : 0m;
                    txAdjustmentMap.TryGetValue(bpId, out var txAdj);

                    // Real closing balance for the queried day (no commission
                    // offset yet). For today we use the live balance because
                    // the snapshot row may still be a stale carry-over from
                    // yesterday until the cutoff job runs.
                    decimal closingBalance;
                    if (useLiveBalance)
                    {
                        closingBalance = liveBalances.TryGetValue(bpId, out var live) ? live : 0m;
                    }
                    else if (hasSnapshot)
                    {
                        closingBalance = snapBal;
                    }
                    else
                    {
                        // Past date without snapshot (rare gap): project from
                        // the prior day plus any tx that landed on the target.
                        closingBalance = snapBal + txAdj;
                    }
                    var displayBalance = closingBalance;

                    // When commission is hidden, add back the commission of
                    // the banca's most recent business-timezone day with sales.
                    // Only when displayBalance > 0 — if the banca has been
                    // settled (0 or negative) there's no commission deduction
                    // left to compensate for, and the offset would surface a
                    // phantom amount. See daily-summary for matching logic.
                    if (hideCommission && displayBalance > 0
                        && commissionLastDayByBp.TryGetValue(bpId, out var lastDayCommission))
                    {
                        displayBalance += lastDayCommission;
                    }

                    return new BettingPoolSalesDto
                    {
                        BettingPoolId = bpId,
                        BettingPoolName = x.BettingPool.BettingPoolName,
                        BettingPoolCode = x.BettingPool.BettingPoolCode,
                        Reference = x.BettingPool.Reference,
                        ZoneId = x.BettingPool.ZoneId,
                        ZoneName = x.BettingPool.Zone != null ? x.BettingPool.Zone.ZoneName : string.Empty,
                        TotalSold = totalSold,
                        TotalPrizes = totalPrizes,
                        TotalCommissions = hideCommission ? 0m : totalCommissions,
                        TotalDiscounts = totalDiscounts,
                        TotalNet = totalNet,
                        Fall = caida.fall,
                        AccumulatedFall = caida.accumulatedFall,
                        PendingCount = pendingCount,
                        WinnerCount = winnerCount,
                        LoserCount = loserCount,
                        Balance = displayBalance,
                        // "Balance del día anterior" — matches /balances/betting-pools
                        // and the dashboard top-positive/negative widgets.
                        // For today: current_balance minus every automatic
                        // movement of today (sales + caída + loan payments).
                        // Manual transaction_groups stay in because they're
                        // already in current_balance and aren't subtracted.
                        // For past dates: the closing snapshot of that day.
                        BalanceOfTheDay = useLiveBalance
                            ? (liveBalances.TryGetValue(bpId, out var liveBal) ? liveBal : 0m)
                              - (todayDeltaByBp.TryGetValue(bpId, out var todayDelta) ? todayDelta : 0m)
                            : closingBalance,
                        PendingTicketsAmount = pendingTicketsAmount,
                        Loans = loanBalanceByBp.TryGetValue(bpId, out var loanRem) ? loanRem : 0m,
                    };
                })
                .OrderBy(x => x.BettingPoolCode)
                .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by betting pool");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las ventas por banca", 500);
        }
    }

    /// <summary>
    /// Get sales aggregated by draw (sorteo) for a specific date
    /// Used in "Por sorteo" tab of DailySales
    /// </summary>
    [HttpGet("by-draw")]
    public async Task<ActionResult<DrawSalesResponseDto>> GetSalesByDraw(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? zoneIds,
        [FromQuery] int? bettingPoolId = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
            if (bettingPoolId.HasValue && !posAllowedBpIds.Contains(bettingPoolId.Value)) return Forbid();
        }

        try
        {
            // Accept either a (startDate, endDate) range or a single legacy `date`.
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            _logger.LogInformation("Getting sales by draw from {Start} to {End}, BettingPoolId: {BettingPoolId}", rangeStart, rangeEnd, bettingPoolId);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Sales grouped by draw, filtered by ticket emission day (CreatedAt).
            // Future-sale tickets emitted today appear under their target draw,
            // even if the draw itself is in the future.
            var drawRangeStartUtc = DateTimeHelper.GetUtcStartOfDay(rangeStart.Date);
            var drawRangeEndUtc = DateTimeHelper.GetUtcEndOfDay(rangeEnd.Date);

            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.Ticket!.CreatedAt >= drawRangeStartUtc && tl.Ticket.CreatedAt <= drawRangeEndUtc);

            // Zone scope.
            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }

            // POS users: hard-scope to their assigned bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }

            if (bettingPoolId.HasValue)
            {
                query = query.Where(tl => tl.Ticket != null && tl.Ticket.BettingPoolId == bettingPoolId.Value);
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var lines = await query.ToListAsync();

            // Single-banca query from a POS caller (no VIEW_SALES): respect
            // AllowViewCommission. Admin queries (with VIEW_SALES) always keep
            // the canonical net so reporting matches the rest of the admin UI.
            bool hideCommission = false;
            if (!hasAdminView && bettingPoolId.HasValue)
            {
                hideCommission = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .Where(c => c.BettingPoolId == bettingPoolId.Value)
                    .Select(c => !c.AllowViewCommission)
                    .FirstOrDefaultAsync();
            }

            var drawSales = lines
                .GroupBy(tl => tl.DrawId)
                .Select(g =>
                {
                    var firstLine = g.First();
                    var draw = firstLine.Draw;
                    var ticketIds = g.Select(tl => tl.TicketId).Distinct().ToList();
                    var sold = g.Sum(tl => tl.BetAmount);
                    var prizes = g.Sum(tl => tl.PrizeAmount);
                    var commissions = g.Sum(tl => tl.CommissionAmount);
                    var discounts = g.Sum(tl => tl.DiscountAmount);
                    var net = hideCommission
                        ? sold - discounts - prizes
                        : sold - discounts - commissions - prizes;

                    return new DrawSalesDto
                    {
                        DrawId = g.Key,
                        DrawName = draw?.Lottery?.LotteryName ?? "Unknown",
                        Abbreviation = draw?.Abbreviation,
                        LotteryName = draw?.Lottery?.LotteryName,
                        DrawTime = draw?.DrawTime ?? TimeSpan.Zero,
                        DrawColor = draw?.Lottery?.Colour,
                        LotteryImageUrl = draw?.Lottery?.ImageUrl,
                        TicketCount = ticketIds.Count,
                        LineCount = g.Count(),
                        WinnerCount = g.Count(tl => tl.IsWinner),
                        TotalSold = sold,
                        TotalPrizes = prizes,
                        TotalCommissions = hideCommission ? 0m : commissions,
                        TotalDiscounts = discounts,
                        TotalNet = net
                    };
                })
                .OrderBy(d => d.DrawTime)
                .ToList();

            var summary = new SalesSummaryDto
            {
                TotalSold = drawSales.Sum(d => d.TotalSold),
                TotalPrizes = drawSales.Sum(d => d.TotalPrizes),
                TotalCommissions = drawSales.Sum(d => d.TotalCommissions),
                TotalDiscounts = drawSales.Sum(d => d.TotalDiscounts),
                TotalNet = drawSales.Sum(d => d.TotalNet)
            };

            return Ok(new DrawSalesResponseDto
            {
                Date = rangeStart,
                Draws = drawSales,
                Summary = summary,
                TotalCount = drawSales.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by draw");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las ventas por sorteo", 500);
        }
    }

    /// <summary>
    /// Get sales aggregated by zone for a specific date
    /// Used in "Por zona" tab of DailySales
    /// </summary>
    [HttpGet("by-zone")]
    public async Task<ActionResult<ZoneSalesResponseDto>> GetSalesByZone(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? zoneIds)
    {
        if (!await HasPermissionAsync("VIEW_SALES")) return Forbid();

        try
        {
            // Accept either a (startDate, endDate) range or a single legacy `date`.
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            _logger.LogInformation("Getting sales by zone from {Start} to {End}", rangeStart, rangeEnd);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var zonesQuery = _context.Zones.Where(z => z.IsActive);

            // Zone scope: admin only sees their assigned zones.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                zonesQuery = zonesQuery.Where(z => allowedZones.Contains(z.ZoneId));
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                zonesQuery = zonesQuery.Where(z => zoneIdList.Contains(z.ZoneId));
            }

            var zones = await zonesQuery.ToListAsync();

            var zoneSales = new List<ZoneSalesDto>();

            // Sales filtered by ticket emission day (CreatedAt) — future-sale
            // tickets are counted on the day they were issued.
            var zoneRangeStartUtc = DateTimeHelper.GetUtcStartOfDay(rangeStart.Date);
            var zoneRangeEndUtc = DateTimeHelper.GetUtcEndOfDay(rangeEnd.Date);

            foreach (var zone in zones)
            {
                var tickets = await _context.Tickets
                    .Include(t => t.BettingPool)
                    .Include(t => t.TicketLines)
                    .Where(t => !t.IsCancelled)
                    .Where(t => t.CreatedAt >= zoneRangeStartUtc && t.CreatedAt <= zoneRangeEndUtc)
                    .Where(t => t.BettingPool != null && t.BettingPool.ZoneId == zone.ZoneId)
                    .ToListAsync();

                if (!tickets.Any()) continue;

                var distinctPoolIds = tickets.Select(t => t.BettingPoolId).Distinct().ToList();
                var bettingPoolIds = distinctPoolIds.Count;

                // P/L/W are ticket-level counts (TicketState: "P" pending, "W" winner, "L" loser).
                var pendingCount = tickets.Count(t => t.TicketState == "P");
                var loserCount = tickets.Count(t => t.TicketState == "L");
                var winnerCount = tickets.Count(t => t.TicketState == "W");

                var lineCount = tickets.SelectMany(t => t.TicketLines).Count();

                var zoneRiferoDiscount = tickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);
                var zoneTotalNet = tickets.Sum(t => t.GrandTotal) + zoneRiferoDiscount - tickets.Sum(t => t.TotalCommission) - tickets.Sum(t => t.TotalPrize);

                var zoneBalance = await _context.Balances
                    .Where(b => distinctPoolIds.Contains(b.BettingPoolId))
                    .SumAsync(b => b.CurrentBalance);

                var zoneFall = await _context.CaidaHistory
                    .AsNoTracking()
                    .Where(h => distinctPoolIds.Contains(h.BettingPoolId)
                        && h.CalculationDate >= rangeStart.Date
                        && h.CalculationDate <= rangeEnd.Date)
                    .SumAsync(h => (decimal?)h.CaidaAmount) ?? 0;

                zoneSales.Add(new ZoneSalesDto
                {
                    ZoneId = zone.ZoneId,
                    ZoneName = zone.ZoneName ?? "Unknown",
                    BettingPoolCount = bettingPoolIds,
                    TicketCount = tickets.Count,
                    LineCount = lineCount,
                    PendingCount = pendingCount,
                    LoserCount = loserCount,
                    WinnerCount = winnerCount,
                    TotalSold = tickets.Sum(t => t.GrandTotal),
                    TotalPrizes = tickets.Sum(t => t.TotalPrize),
                    TotalCommissions = tickets.Sum(t => t.TotalCommission),
                    TotalDiscounts = tickets.Sum(t => t.TotalDiscount),
                    TotalNet = zoneTotalNet,
                    Fall = zoneFall,
                    Final = zoneTotalNet - zoneFall,
                    Balance = zoneBalance
                });
            }

            var summary = new SalesSummaryDto
            {
                TotalSold = zoneSales.Sum(z => z.TotalSold),
                TotalPrizes = zoneSales.Sum(z => z.TotalPrizes),
                TotalCommissions = zoneSales.Sum(z => z.TotalCommissions),
                TotalNet = zoneSales.Sum(z => z.TotalNet)
            };

            return Ok(new ZoneSalesResponseDto
            {
                Date = rangeStart,
                Zones = zoneSales.OrderBy(z => z.ZoneName).ToList(),
                Summary = summary,
                TotalCount = zoneSales.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by zone");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las ventas por zona", 500);
        }
    }

    /// <summary>
    /// Get sales by betting pool broken down by draw
    /// Used in "Banca por sorteo" tab of DailySales
    /// </summary>
    [HttpGet("betting-pool-by-draw")]
    public async Task<ActionResult<BettingPoolDrawSalesResponseDto>> GetBettingPoolByDraw(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? zoneIds)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            // Accept either a (startDate, endDate) range or a single legacy `date`.
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            _logger.LogInformation("Getting betting pool by draw from {Start} to {End}", rangeStart, rangeEnd);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var bettingPoolsQuery = _context.BettingPools.Include(bp => bp.Zone).Where(bp => bp.IsActive);

            // POS users: hard-scope to their own bancas.
            if (posAllowedBpIds != null)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => posAllowedBpIds.Contains(bp.BettingPoolId));
            }

            // Zone scope.
            var allowedZonesBpd = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZonesBpd != null)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => allowedZonesBpd.Contains(bp.ZoneId));
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => zoneIdList.Contains(bp.ZoneId));
            }

            var bettingPools = await bettingPoolsQuery.ToListAsync();
            var result = new List<BettingPoolDrawSalesDto>();

            // Sales filtered by ticket emission day (CreatedAt). Future-sale
            // tickets emitted in range appear here under their target draw.
            var bpdRangeStartUtc = DateTimeHelper.GetUtcStartOfDay(rangeStart.Date);
            var bpdRangeEndUtc = DateTimeHelper.GetUtcEndOfDay(rangeEnd.Date);

            foreach (var bp in bettingPools)
            {
                var lines = await _context.TicketLines
                    .Include(tl => tl.Ticket)
                    .Include(tl => tl.Draw)
                        .ThenInclude(d => d!.Lottery)
                    .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                    .Where(tl => tl.Ticket!.BettingPoolId == bp.BettingPoolId)
                    .Where(tl => tl.Ticket!.CreatedAt >= bpdRangeStartUtc && tl.Ticket.CreatedAt <= bpdRangeEndUtc)
                    .ToListAsync();

                if (!lines.Any()) continue;

                var drawSales = lines
                    .GroupBy(tl => tl.DrawId)
                    .Select(g =>
                    {
                        var draw = g.First().Draw;
                        return new DrawSalesDetailDto
                        {
                            DrawId = g.Key,
                            DrawName = draw?.Lottery?.LotteryName ?? "Unknown",
                            Sold = g.Sum(tl => tl.Subtotal),
                            Prizes = g.Sum(tl => tl.PrizeAmount),
                            Commissions = g.Sum(tl => tl.CommissionAmount),
                            Net = g.Sum(tl => tl.Subtotal) - g.Sum(tl => tl.CommissionAmount) - g.Sum(tl => tl.PrizeAmount)
                        };
                    })
                    .OrderBy(d => d.DrawName)
                    .ToList();

                result.Add(new BettingPoolDrawSalesDto
                {
                    BettingPoolId = bp.BettingPoolId,
                    BettingPoolName = bp.BettingPoolName ?? "",
                    BettingPoolCode = bp.BettingPoolCode ?? "",
                    Reference = bp.Reference,
                    ZoneId = bp.ZoneId,
                    ZoneName = bp.Zone?.ZoneName ?? "",
                    DrawSales = drawSales,
                    TotalSold = drawSales.Sum(d => d.Sold),
                    TotalPrizes = drawSales.Sum(d => d.Prizes),
                    TotalCommissions = drawSales.Sum(d => d.Commissions),
                    TotalNet = drawSales.Sum(d => d.Net)
                });
            }

            // Calculate draw totals across all betting pools
            var allLines = await _context.TicketLines
                .Include(tl => tl.Ticket)
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.DrawDate.Date >= rangeStart.Date && tl.DrawDate.Date <= rangeEnd.Date)
                .Where(tl => zoneIdList == null || zoneIdList.Count == 0 ||
                    (tl.Ticket!.BettingPool != null && zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId)))
                .ToListAsync();

            var drawTotals = allLines
                .GroupBy(tl => tl.DrawId)
                .Select(g =>
                {
                    var draw = g.First().Draw;
                    var ticketIds = g.Select(tl => tl.TicketId).Distinct().ToList();
                    return new DrawSalesDto
                    {
                        DrawId = g.Key,
                        DrawName = draw?.Lottery?.LotteryName ?? "Unknown",
                        DrawTime = draw?.DrawTime ?? TimeSpan.Zero,
                        TicketCount = ticketIds.Count,
                        LineCount = g.Count(),
                        WinnerCount = g.Count(tl => tl.IsWinner),
                        TotalSold = g.Sum(tl => tl.Subtotal),
                        TotalPrizes = g.Sum(tl => tl.PrizeAmount),
                        TotalCommissions = g.Sum(tl => tl.CommissionAmount),
                        TotalNet = g.Sum(tl => tl.Subtotal) - g.Sum(tl => tl.CommissionAmount) - g.Sum(tl => tl.PrizeAmount)
                    };
                })
                .OrderBy(d => d.DrawTime)
                .ToList();

            var summary = new SalesSummaryDto
            {
                TotalSold = result.Sum(r => r.TotalSold),
                TotalPrizes = result.Sum(r => r.TotalPrizes),
                TotalCommissions = result.Sum(r => r.TotalCommissions),
                TotalNet = result.Sum(r => r.TotalNet)
            };

            return Ok(new BettingPoolDrawSalesResponseDto
            {
                Date = rangeStart,
                BettingPools = result.OrderBy(r => r.BettingPoolCode).ToList(),
                DrawTotals = drawTotals,
                Summary = summary,
                TotalCount = result.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pool by draw");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las ventas por banca y sorteo", 500);
        }
    }

    /// <summary>
    /// Get prize categories (sales by bet type)
    /// Used in "Categoría de Premios" tab of DailySales
    /// </summary>
    [HttpGet("prize-categories")]
    public async Task<ActionResult<PrizeCategoryResponseDto>> GetPrizeCategories(
        [FromQuery] DateTime? date,
        [FromQuery] int? drawId,
        [FromQuery] string? zoneIds)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            _logger.LogInformation("Getting prize categories for {Date}, DrawId: {DrawId}", targetDate, drawId);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                .Include(tl => tl.BetType)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.DrawDate.Date >= startDate.Date && tl.DrawDate.Date <= endDate.Date);

            // Zone scope.
            var allowedBpIdsPc = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIdsPc != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIdsPc.Contains(tl.Ticket.BettingPoolId));
            }

            // POS users: hard-scope to their own bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }

            if (drawId.HasValue)
            {
                query = query.Where(tl => tl.DrawId == drawId.Value);
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var lines = await query.ToListAsync();

            var categories = lines
                .GroupBy(tl => tl.BetTypeId)
                .Select(g =>
                {
                    var betType = g.First().BetType;
                    var totalSold = g.Sum(tl => tl.Subtotal);
                    var totalPrizes = g.Sum(tl => tl.PrizeAmount);
                    var totalNet = totalSold - totalPrizes;

                    return new PrizeCategoryDto
                    {
                        BetTypeId = g.Key,
                        BetTypeName = betType?.GameName ?? "Unknown",
                        BetTypeCode = betType?.GameTypeCode,
                        LineCount = g.Count(),
                        WinnerCount = g.Count(tl => tl.IsWinner),
                        TotalSold = totalSold,
                        TotalPrizes = totalPrizes,
                        TotalNet = totalNet,
                        ProfitPercentage = totalSold > 0 ? Math.Round((totalNet / totalSold) * 100, 2) : 0
                    };
                })
                .OrderByDescending(c => c.TotalSold)
                .ToList();

            string? drawName = null;
            if (drawId.HasValue)
            {
                var draw = await _context.Draws
                    .Include(d => d.Lottery)
                    .FirstOrDefaultAsync(d => d.DrawId == drawId.Value);
                drawName = draw?.Lottery?.LotteryName;
            }

            var summary = new SalesSummaryDto
            {
                TotalSold = categories.Sum(c => c.TotalSold),
                TotalPrizes = categories.Sum(c => c.TotalPrizes),
                TotalCommissions = 0,
                TotalNet = categories.Sum(c => c.TotalNet)
            };

            return Ok(new PrizeCategoryResponseDto
            {
                Date = targetDate,
                DrawId = drawId,
                DrawName = drawName,
                Categories = categories,
                Summary = summary,
                TotalCount = categories.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting prize categories");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las categorías de premios", 500);
        }
    }

    /// <summary>
    /// Sales grouped by the effective primer-pago multiplier per banca.
    /// `category` selects the bet type group: "quiniela" (Directo) or "pale".
    /// Used by the "Categoría de premios" and "Pale" tabs of DailySales.
    /// </summary>
    [HttpGet("prize-categories-by-payout")]
    public async Task<ActionResult<PayoutGroupResponseDto>> GetPrizeCategoriesByPayout(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string category = "quiniela",
        [FromQuery] int? drawId = null,
        [FromQuery] string? zoneIds = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            // Date range (accepts either `date` or a startDate/endDate window).
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            // Map the requested category to one or more game_type codes.
            var normalizedCategory = (category ?? "quiniela").Trim().ToLowerInvariant();
            string[] gameTypeCodes = normalizedCategory switch
            {
                "quiniela" => new[] { "DIRECTO" },
                "pale" => new[] { "PALE", "SUPER_PALE", "PALE_USA", "PALE_RD" },
                _ => Array.Empty<string>(),
            };
            if (gameTypeCodes.Length == 0)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.CategoryNotSupported, "Categoría no soportada. Use 'quiniela' o 'pale'.");
            }

            var gameTypeIds = await _context.GameTypes
                .Where(gt => gameTypeCodes.Contains(gt.GameTypeCode.ToUpper()))
                .Select(gt => gt.GameTypeId)
                .ToListAsync();
            if (gameTypeIds.Count == 0)
            {
                return Ok(new PayoutGroupResponseDto { Date = rangeStart, Category = normalizedCategory });
            }

            // game_type_id → prize bet_type_id (different numbering, see ExternalResultsService).
            var gameTypeToPrizeBetType = ExternalResultsService.GameTypeToPrizeBetType;
            var prizeBetTypeIds = gameTypeIds
                .Select(id => gameTypeToPrizeBetType.GetValueOrDefault(id, id))
                .Distinct()
                .ToList();

            // Primer pago = DisplayOrder == 1. Map prize_bet_type_id → primer-pago PrizeType.
            var primerPagoByBetType = await _context.PrizeTypes
                .Where(pt => prizeBetTypeIds.Contains(pt.BetTypeId) && pt.IsActive && pt.DisplayOrder == 1)
                .ToDictionaryAsync(pt => pt.BetTypeId, pt => new { pt.PrizeTypeId, pt.DefaultMultiplier });

            // Parse zone IDs.
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Ticket lines for the requested game types within the date range.
            var query = _context.TicketLines
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.DrawDate.Date >= rangeStart.Date && tl.DrawDate.Date <= rangeEnd.Date)
                .Where(tl => gameTypeIds.Contains(tl.BetTypeId));

            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (drawId.HasValue)
            {
                query = query.Where(tl => tl.DrawId == drawId.Value);
            }
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var lines = await query
                .Select(tl => new
                {
                    tl.BetTypeId,
                    tl.TicketId,
                    BettingPoolId = tl.Ticket!.BettingPoolId,
                    TicketState = tl.Ticket!.TicketState,
                    tl.DrawId,
                    tl.Subtotal,
                    tl.PrizeAmount,
                })
                .ToListAsync();

            if (lines.Count == 0)
            {
                return Ok(new PayoutGroupResponseDto { Date = rangeStart, Category = normalizedCategory });
            }

            // Pre-fetch banca and draw overrides for the (banca, prize_type) and (draw, banca, prize_type) tuples involved.
            var prizeTypeIds = primerPagoByBetType.Values.Select(v => v.PrizeTypeId).Distinct().ToList();
            var bancaIds = lines.Select(l => l.BettingPoolId).Distinct().ToList();
            var drawIdsInPlay = lines.Select(l => l.DrawId).Distinct().ToList();

            var bancaConfigList = await _context.BancaPrizeConfigs
                .Where(bc => bancaIds.Contains(bc.BettingPoolId) && prizeTypeIds.Contains(bc.PrizeTypeId))
                .Select(bc => new { bc.BettingPoolId, bc.PrizeTypeId, bc.CustomValue })
                .ToListAsync();
            var bancaConfigs = bancaConfigList
                .GroupBy(bc => (bc.BettingPoolId, bc.PrizeTypeId))
                .ToDictionary(g => g.Key, g => g.First().CustomValue);

            var drawConfigList = await _context.DrawPrizeConfigs
                .Where(dc => drawIdsInPlay.Contains(dc.DrawId)
                    && bancaIds.Contains(dc.BettingPoolId)
                    && prizeTypeIds.Contains(dc.PrizeTypeId))
                .Select(dc => new { dc.DrawId, dc.BettingPoolId, dc.PrizeTypeId, dc.CustomValue })
                .ToListAsync();
            var drawConfigs = drawConfigList
                .GroupBy(dc => (dc.DrawId, dc.BettingPoolId, dc.PrizeTypeId))
                .ToDictionary(g => g.Key, g => g.First().CustomValue);

            // Cascade per line: draw override > banca override > default.
            // Then dedupe tickets per multiplier so P/L/W reflect ticket counts, not line counts.
            // Money totals (sold/prize) stay at the line level — a ticket can mix multipliers.
            var groups = new Dictionary<decimal, (Dictionary<long, string> ticketStates, decimal sold, decimal prize)>();
            foreach (var line in lines)
            {
                var prizeBetTypeId = gameTypeToPrizeBetType.GetValueOrDefault(line.BetTypeId, line.BetTypeId);
                if (!primerPagoByBetType.TryGetValue(prizeBetTypeId, out var pt)) continue;

                decimal multiplier;
                if (drawConfigs.TryGetValue((line.DrawId, line.BettingPoolId, pt.PrizeTypeId), out var dv))
                    multiplier = dv;
                else if (bancaConfigs.TryGetValue((line.BettingPoolId, pt.PrizeTypeId), out var bv))
                    multiplier = bv;
                else
                    multiplier = pt.DefaultMultiplier;

                var key = decimal.Round(multiplier, 2);
                if (!groups.TryGetValue(key, out var acc))
                    acc = (new Dictionary<long, string>(), 0m, 0m);
                acc.ticketStates[line.TicketId] = line.TicketState;
                acc.sold += line.Subtotal;
                acc.prize += line.PrizeAmount;
                groups[key] = acc;
            }

            var rows = groups
                .Select(kv =>
                {
                    var pending = kv.Value.ticketStates.Count(kvp => kvp.Value == "P");
                    var loser = kv.Value.ticketStates.Count(kvp => kvp.Value == "L");
                    var winner = kv.Value.ticketStates.Count(kvp => kvp.Value == "W");
                    return new PayoutGroupDto
                    {
                        Multiplier = kv.Key,
                        Label = kv.Key.ToString("0.##"),
                        LineCount = kv.Value.ticketStates.Count,
                        PendingCount = pending,
                        LoserCount = loser,
                        WinnerCount = winner,
                        TotalSold = kv.Value.sold,
                        TotalPrizes = kv.Value.prize,
                        TotalNet = kv.Value.sold - kv.Value.prize,
                    };
                })
                .OrderBy(r => r.Multiplier)
                .ToList();

            var summary = new SalesSummaryDto
            {
                TotalSold = rows.Sum(r => r.TotalSold),
                TotalPrizes = rows.Sum(r => r.TotalPrizes),
                TotalCommissions = 0,
                TotalNet = rows.Sum(r => r.TotalNet),
            };

            return Ok(new PayoutGroupResponseDto
            {
                Date = rangeStart,
                Category = normalizedCategory,
                Groups = rows,
                Summary = summary,
                TotalCount = rows.Count,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting prize categories by payout");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las categorías de premios por pago", 500);
        }
    }

    /// <summary>
    /// Drill-down for the prize-categories-by-payout report: returns the bancas
    /// whose effective primer-pago multiplier equals `multiplier` for `category`,
    /// along with each banca's aggregate stats over the date range.
    /// </summary>
    [HttpGet("prize-categories-by-payout/bancas")]
    public async Task<ActionResult<PayoutBancasResponseDto>> GetPrizeCategoryBancas(
        [FromQuery] decimal multiplier,
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string category = "quiniela",
        [FromQuery] int? drawId = null,
        [FromQuery] string? zoneIds = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            var normalizedCategory = (category ?? "quiniela").Trim().ToLowerInvariant();
            string[] gameTypeCodes = normalizedCategory switch
            {
                "quiniela" => new[] { "DIRECTO" },
                "pale" => new[] { "PALE", "SUPER_PALE", "PALE_USA", "PALE_RD" },
                _ => Array.Empty<string>(),
            };
            if (gameTypeCodes.Length == 0)
            {
                return ApiErrorResult.BadRequest(ErrorCodes.CategoryNotSupported, "Categoría no soportada. Use 'quiniela' o 'pale'.");
            }

            var gameTypeIds = await _context.GameTypes
                .Where(gt => gameTypeCodes.Contains(gt.GameTypeCode.ToUpper()))
                .Select(gt => gt.GameTypeId)
                .ToListAsync();
            if (gameTypeIds.Count == 0)
            {
                return Ok(new PayoutBancasResponseDto { Multiplier = multiplier, Category = normalizedCategory });
            }

            var gameTypeToPrizeBetType = ExternalResultsService.GameTypeToPrizeBetType;
            var prizeBetTypeIds = gameTypeIds
                .Select(id => gameTypeToPrizeBetType.GetValueOrDefault(id, id))
                .Distinct()
                .ToList();

            var primerPagoByBetType = await _context.PrizeTypes
                .Where(pt => prizeBetTypeIds.Contains(pt.BetTypeId) && pt.IsActive && pt.DisplayOrder == 1)
                .ToDictionaryAsync(pt => pt.BetTypeId, pt => new { pt.PrizeTypeId, pt.DefaultMultiplier });

            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                    .ThenInclude(t => t!.BettingPool)
                        .ThenInclude(bp => bp!.Zone)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.DrawDate.Date >= rangeStart.Date && tl.DrawDate.Date <= rangeEnd.Date)
                .Where(tl => gameTypeIds.Contains(tl.BetTypeId));

            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (drawId.HasValue)
            {
                query = query.Where(tl => tl.DrawId == drawId.Value);
            }
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var lines = await query
                .Select(tl => new
                {
                    tl.BetTypeId,
                    tl.TicketId,
                    BettingPoolId = tl.Ticket!.BettingPoolId,
                    TicketState = tl.Ticket!.TicketState,
                    BettingPoolName = tl.Ticket!.BettingPool != null ? tl.Ticket.BettingPool.BettingPoolName : "",
                    BettingPoolCode = tl.Ticket!.BettingPool != null ? tl.Ticket.BettingPool.BettingPoolCode : "",
                    ZoneName = tl.Ticket!.BettingPool != null && tl.Ticket.BettingPool.Zone != null
                        ? tl.Ticket.BettingPool.Zone.ZoneName
                        : null,
                    tl.DrawId,
                    tl.Subtotal,
                    tl.PrizeAmount,
                })
                .ToListAsync();

            if (lines.Count == 0)
            {
                return Ok(new PayoutBancasResponseDto { Multiplier = multiplier, Category = normalizedCategory });
            }

            var prizeTypeIds = primerPagoByBetType.Values.Select(v => v.PrizeTypeId).Distinct().ToList();
            var bancaIds = lines.Select(l => l.BettingPoolId).Distinct().ToList();
            var drawIdsInPlay = lines.Select(l => l.DrawId).Distinct().ToList();

            var bancaConfigList = await _context.BancaPrizeConfigs
                .Where(bc => bancaIds.Contains(bc.BettingPoolId) && prizeTypeIds.Contains(bc.PrizeTypeId))
                .Select(bc => new { bc.BettingPoolId, bc.PrizeTypeId, bc.CustomValue })
                .ToListAsync();
            var bancaConfigs = bancaConfigList
                .GroupBy(bc => (bc.BettingPoolId, bc.PrizeTypeId))
                .ToDictionary(g => g.Key, g => g.First().CustomValue);

            var drawConfigList = await _context.DrawPrizeConfigs
                .Where(dc => drawIdsInPlay.Contains(dc.DrawId)
                    && bancaIds.Contains(dc.BettingPoolId)
                    && prizeTypeIds.Contains(dc.PrizeTypeId))
                .Select(dc => new { dc.DrawId, dc.BettingPoolId, dc.PrizeTypeId, dc.CustomValue })
                .ToListAsync();
            var drawConfigs = drawConfigList
                .GroupBy(dc => (dc.DrawId, dc.BettingPoolId, dc.PrizeTypeId))
                .ToDictionary(g => g.Key, g => g.First().CustomValue);

            var targetMultiplier = decimal.Round(multiplier, 2);
            var perBanca = new Dictionary<int, (string name, string code, string? zone, Dictionary<long, string> ticketStates, decimal sold, decimal prize)>();
            foreach (var line in lines)
            {
                var prizeBetTypeId = gameTypeToPrizeBetType.GetValueOrDefault(line.BetTypeId, line.BetTypeId);
                if (!primerPagoByBetType.TryGetValue(prizeBetTypeId, out var pt)) continue;

                decimal effective;
                if (drawConfigs.TryGetValue((line.DrawId, line.BettingPoolId, pt.PrizeTypeId), out var dv))
                    effective = dv;
                else if (bancaConfigs.TryGetValue((line.BettingPoolId, pt.PrizeTypeId), out var bv))
                    effective = bv;
                else
                    effective = pt.DefaultMultiplier;

                if (decimal.Round(effective, 2) != targetMultiplier) continue;

                if (!perBanca.TryGetValue(line.BettingPoolId, out var acc))
                    acc = (line.BettingPoolName, line.BettingPoolCode, line.ZoneName, new Dictionary<long, string>(), 0m, 0m);
                acc.ticketStates[line.TicketId] = line.TicketState;
                acc.sold += line.Subtotal;
                acc.prize += line.PrizeAmount;
                perBanca[line.BettingPoolId] = acc;
            }

            var rows = perBanca
                .Select(kv =>
                {
                    var pending = kv.Value.ticketStates.Count(kvp => kvp.Value == "P");
                    var loser = kv.Value.ticketStates.Count(kvp => kvp.Value == "L");
                    var winner = kv.Value.ticketStates.Count(kvp => kvp.Value == "W");
                    return new PayoutBancaDto
                    {
                        BettingPoolId = kv.Key,
                        BettingPoolName = kv.Value.name,
                        BettingPoolCode = kv.Value.code,
                        ZoneName = kv.Value.zone,
                        LineCount = kv.Value.ticketStates.Count,
                        PendingCount = pending,
                        LoserCount = loser,
                        WinnerCount = winner,
                        TotalSold = kv.Value.sold,
                        TotalPrizes = kv.Value.prize,
                        TotalNet = kv.Value.sold - kv.Value.prize,
                    };
                })
                .OrderBy(r => r.BettingPoolCode)
                .ToList();

            return Ok(new PayoutBancasResponseDto
            {
                Multiplier = targetMultiplier,
                Category = normalizedCategory,
                Bancas = rows,
                TotalCount = rows.Count,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting bancas for prize-category payout");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las bancas del grupo", 500);
        }
    }

    /// <summary>
    /// "Premios por tipo de jugada" report — sales/prizes/commissions/net per (banca, game type).
    /// Frontend pivots the rows into per-tab column groups (e.g. Directo + Pale side-by-side).
    /// </summary>
    [HttpGet("prizes-by-banca-game-type")]
    public async Task<ActionResult<List<PrizesByBancaGameTypeDto>>> GetPrizesByBancaGameType(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string gameTypeCodes,
        [FromQuery] string? zoneIds = null)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
        }

        try
        {
            if (string.IsNullOrWhiteSpace(gameTypeCodes))
            {
                return ApiErrorResult.BadRequest(ErrorCodes.GameTypeCodesRequired, "gameTypeCodes es requerido");
            }

            if (startDate > endDate) (startDate, endDate) = (endDate, startDate);

            // Window is in business timezone — convert to UTC to match Ticket.CreatedAt storage.
            var rangeStartUtc = DateTimeHelper.ToUtc(startDate.Date);
            var rangeEndUtc = DateTimeHelper.ToUtc(endDate.Date.AddDays(1)).AddTicks(-1);

            var codes = gameTypeCodes
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(c => c.Trim().ToUpperInvariant())
                .ToList();

            var gameTypes = await _context.GameTypes
                .Where(gt => codes.Contains(gt.GameTypeCode.ToUpper()))
                .Select(gt => new { gt.GameTypeId, gt.GameTypeCode, gt.GameName })
                .ToListAsync();
            var gameTypeIds = gameTypes.Select(gt => gt.GameTypeId).ToList();
            if (gameTypeIds.Count == 0)
            {
                return Ok(new List<PrizesByBancaGameTypeDto>());
            }

            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                    .ThenInclude(t => t!.BettingPool)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.Ticket!.CreatedAt >= rangeStartUtc && tl.Ticket.CreatedAt <= rangeEndUtc)
                .Where(tl => gameTypeIds.Contains(tl.BetTypeId));

            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null
                    && tl.Ticket.BettingPool != null
                    && zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var rows = await query
                .GroupBy(tl => new { tl.Ticket!.BettingPoolId, tl.BetTypeId })
                .Select(g => new
                {
                    g.Key.BettingPoolId,
                    g.Key.BetTypeId,
                    TotalSold = g.Sum(tl => tl.Subtotal),
                    TotalPrizes = g.Sum(tl => tl.PrizeAmount),
                    TotalCommissions = g.Sum(tl => tl.CommissionAmount),
                })
                .ToListAsync();

            if (rows.Count == 0)
            {
                return Ok(new List<PrizesByBancaGameTypeDto>());
            }

            // Resolve banca name/code in one batch.
            var bancaIds = rows.Select(r => r.BettingPoolId).Distinct().ToList();
            var bancaMap = await _context.BettingPools
                .Where(bp => bancaIds.Contains(bp.BettingPoolId))
                .Select(bp => new { bp.BettingPoolId, bp.BettingPoolName, bp.BettingPoolCode })
                .ToDictionaryAsync(bp => bp.BettingPoolId);

            var gameTypeMap = gameTypes.ToDictionary(gt => gt.GameTypeId);

            var result = rows.Select(r =>
            {
                bancaMap.TryGetValue(r.BettingPoolId, out var bp);
                gameTypeMap.TryGetValue(r.BetTypeId, out var gt);
                return new PrizesByBancaGameTypeDto
                {
                    BettingPoolId = r.BettingPoolId,
                    BettingPoolName = bp?.BettingPoolName ?? "",
                    BettingPoolCode = bp?.BettingPoolCode ?? "",
                    GameTypeId = r.BetTypeId,
                    GameTypeCode = gt?.GameTypeCode ?? "",
                    GameTypeName = gt?.GameName ?? "",
                    TotalSold = r.TotalSold,
                    TotalPrizes = r.TotalPrizes,
                    TotalCommissions = r.TotalCommissions,
                    TotalNet = r.TotalSold - r.TotalCommissions - r.TotalPrizes,
                };
            })
            .OrderBy(r => r.BettingPoolCode)
            .ThenBy(r => r.GameTypeId)
            .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting prizes by banca and game type");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener premios por tipo de jugada", 500);
        }
    }

    /// <summary>
    /// Get combinations (bet numbers by draw)
    /// Used in "Combinaciones" tab of DailySales
    /// </summary>
    [HttpGet("combinations")]
    public async Task<ActionResult<CombinationSalesResponseDto>> GetCombinations(
        [FromQuery] DateTime? date,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int? drawId,
        [FromQuery] string? drawIds,
        [FromQuery] string? zoneIds,
        [FromQuery] int? bettingPoolId,
        [FromQuery] string? bettingPoolIds)
    {
        var hasAdminView = await HasPermissionAsync("VIEW_SALES");
        List<int>? posAllowedBpIds = null;
        if (!hasAdminView)
        {
            posAllowedBpIds = await GetAssignedBettingPoolIdsAsync();
            if (posAllowedBpIds.Count == 0) return Forbid();
            if (bettingPoolId.HasValue && !posAllowedBpIds.Contains(bettingPoolId.Value)) return Forbid();
        }

        try
        {
            // Accept either a (startDate, endDate) range or a single legacy `date`.
            DateTime rangeStart;
            DateTime rangeEnd;
            if (startDate.HasValue || endDate.HasValue)
            {
                rangeStart = (startDate ?? endDate)!.Value.Date;
                rangeEnd = (endDate ?? startDate)!.Value.Date.AddDays(1).AddTicks(-1);
            }
            else
            {
                var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
                rangeStart = targetDate.Date;
                rangeEnd = rangeStart.AddDays(1).AddTicks(-1);
            }

            _logger.LogInformation("Getting combinations from {Start} to {End}, DrawId: {DrawId}", rangeStart, rangeEnd, drawId);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Parse draw IDs (multi). Falls back to single drawId for legacy callers.
            List<int>? drawIdList = null;
            if (!string.IsNullOrEmpty(drawIds))
            {
                drawIdList = drawIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Parse betting pool IDs (multi). Falls back to single bettingPoolId for legacy callers.
            List<int>? bettingPoolIdList = null;
            if (!string.IsNullOrEmpty(bettingPoolIds))
            {
                bettingPoolIdList = bettingPoolIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
                // POS users may only filter to their own bancas.
                if (posAllowedBpIds != null)
                {
                    bettingPoolIdList = bettingPoolIdList.Where(id => posAllowedBpIds.Contains(id)).ToList();
                    if (bettingPoolIdList.Count == 0) return Forbid();
                }
            }

            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Include(tl => tl.BetType)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.DrawDate.Date >= rangeStart.Date && tl.DrawDate.Date <= rangeEnd.Date);

            // Zone scope.
            var allowedBpIdsCb = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIdsCb != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIdsCb.Contains(tl.Ticket.BettingPoolId));
            }

            // POS users: hard-scope to their own bancas.
            if (posAllowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && posAllowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }

            if (drawIdList != null && drawIdList.Count > 0)
            {
                query = query.Where(tl => drawIdList.Contains(tl.DrawId));
            }
            else if (drawId.HasValue)
            {
                query = query.Where(tl => tl.DrawId == drawId.Value);
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            if (bettingPoolIdList != null && bettingPoolIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null && bettingPoolIdList.Contains(tl.Ticket.BettingPoolId));
            }
            else if (bettingPoolId.HasValue)
            {
                query = query.Where(tl => tl.Ticket != null && tl.Ticket.BettingPoolId == bettingPoolId.Value);
            }

            var lines = await query.ToListAsync();

            var combinations = lines
                .GroupBy(tl => new { tl.BetNumber, tl.DrawId, tl.BetTypeId })
                .Select(g =>
                {
                    var first = g.First();
                    var totalSold = g.Sum(tl => tl.Subtotal);
                    var totalCommissions = g.Sum(tl => tl.CommissionAmount);
                    var totalPrizes = g.Sum(tl => tl.PrizeAmount);

                    return new CombinationSalesDto
                    {
                        BetNumber = g.Key.BetNumber,
                        DrawId = g.Key.DrawId,
                        DrawName = first.Draw?.Lottery?.LotteryName ?? "Unknown",
                        BetTypeId = g.Key.BetTypeId,
                        BetTypeName = first.BetType?.GameName ?? "Unknown",
                        LineCount = g.Count(),
                        TotalSold = totalSold,
                        TotalCommissions = totalCommissions,
                        TotalPrizes = totalPrizes,
                        Balance = totalSold - totalCommissions - totalPrizes
                    };
                })
                .OrderByDescending(c => c.TotalSold)
                .Take(500) // Limit to top 500 combinations
                .ToList();

            var summary = new SalesSummaryDto
            {
                TotalSold = combinations.Sum(c => c.TotalSold),
                TotalPrizes = combinations.Sum(c => c.TotalPrizes),
                TotalCommissions = combinations.Sum(c => c.TotalCommissions),
                TotalNet = combinations.Sum(c => c.Balance)
            };

            return Ok(new CombinationSalesResponseDto
            {
                Date = rangeStart,
                DrawId = drawId,
                Combinations = combinations,
                Summary = summary,
                TotalCount = combinations.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting combinations");
            return ApiErrorResult.Error(ErrorCodes.InternalError, "Error al obtener las combinaciones", 500);
        }
    }

    /// <summary>
    /// Signed per-banca delta of today's automatic movements that
    /// current_balance has absorbed: +net sales, −caída (central's share),
    /// +loan installment disbursements. Subtracting this from
    /// current_balance yields "yesterday's closing balance + approved
    /// transaction_groups of today" — the figure /balances/betting-pools
    /// and the dashboard widgets show.
    /// </summary>
    private async Task<Dictionary<int, decimal>> ComputeTodayAutomaticDeltasAsync(
        DateTime todayBusinessDate, DateTime todayStartUtc, DateTime todayEndUtc)
    {
        var sales = await _context.Tickets.AsNoTracking()
            .Where(t => !t.IsCancelled
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
            .Where(h => h.CalculationDate == todayBusinessDate)
            .GroupBy(h => h.BettingPoolId)
            .Select(g => new { BettingPoolId = g.Key, Amount = g.Sum(h => h.CaidaAmount) })
            .ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

        var loanPaid = await (
            from p in _context.LoanPayments.AsNoTracking()
            join l in _context.Loans.AsNoTracking() on p.LoanId equals l.LoanId
            where l.EntityType == "bettingPool"
                && p.PaymentDate >= todayStartUtc
                && p.PaymentDate <= todayEndUtc
            group p by l.EntityId into g
            select new { BettingPoolId = g.Key, Amount = g.Sum(x => x.AmountPaid) }
        ).ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

        // Sales and loan payments push current_balance up; caída pulls it
        // down. The signed delta below is exactly what current_balance has
        // moved today due to automatic activity — subtract it from
        // current_balance to recover yesterday's closing balance.
        var totals = new Dictionary<int, decimal>();
        foreach (var bpId in sales.Keys.Concat(caida.Keys).Concat(loanPaid.Keys).Distinct())
        {
            var s = sales.TryGetValue(bpId, out var sv) ? sv : 0m;
            var c = caida.TryGetValue(bpId, out var cv) ? cv : 0m;
            var lp = loanPaid.TryGetValue(bpId, out var lv) ? lv : 0m;
            totals[bpId] = s - c + lp;
        }
        return totals;
    }
}
