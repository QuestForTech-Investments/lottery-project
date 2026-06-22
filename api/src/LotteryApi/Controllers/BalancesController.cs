using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Services;
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
    private readonly IZoneScopeService _zoneScope;

    public BalancesController(
        LotteryDbContext context,
        ILogger<BalancesController> logger,
        IBalanceCutoffService cutoffService,
        IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _cutoffService = cutoffService;
        _zoneScope = zoneScope;
    }

    // Produces a sort key for codes that mix letters and digits so the
    // natural order is preserved (LC-0009, LC-0010, LC-0011, …, LC-0100).
    // Each digit run is left-padded with zeros so the alphabetic comparison
    // ends up doing a numeric compare on those runs.
    private static string NaturalSortKey(string? code)
    {
        if (string.IsNullOrEmpty(code)) return string.Empty;
        return Regex.Replace(code, @"\d+", m => m.Value.PadLeft(20, '0'));
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
            // When the user is looking at today, the snapshot row for today is
            // often a stale carry-over from yesterday's cutoff (rows are
            // pre-created but only get the real closing amount when the daily
            // job runs at end-of-day). That means the snapshot doesn't reflect
            // today's in-progress sales — and the cashier issuing a payment
            // sees an outdated balance. For today we read the live
            // current_balance instead, which the trigger keeps up-to-date as
            // tickets land. Past dates keep using the snapshot.
            var useLiveBalance = requestedDate >= today;

            // If snapshot exists for requested date, use it; otherwise fall back to previous day
            var hasTodaySnapshot = await _context.BalanceHistories
                .AnyAsync(bh => bh.BalanceDate == requestedDate);
            var snapshotDate = hasTodaySnapshot ? requestedDate : requestedDate.AddDays(-1);

            var query = _context.BettingPools
                .AsNoTracking()
                .Where(bp => bp.IsActive && bp.DeletedAt == null)
                .AsQueryable();

            // Zone scope: admin only sees bancas in their assigned zones.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                query = query.Where(bp => allowedZones.Contains(bp.ZoneId));
            }

            if (zoneId.HasValue)
            {
                // Block requesting a zone outside scope (silently empty result instead of error).
                if (allowedZones != null && !allowedZones.Contains(zoneId.Value))
                {
                    return Ok(new List<BettingPoolBalanceDto>());
                }
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
                // Defer ordering — alphabetical sorts make e.g. LC-0010,
                // LC-0100, LC-0011 jump around. We re-sort after materializing
                // with a natural-number-aware comparer below.
                .OrderBy(x => x.bp.BettingPoolId)
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

            // For today: the snapshot for today is often a stale carry-over
            // from yesterday (cutoff job hasn't run yet), so we compute
            // yesterday's closing balance dynamically from current_balance.
            //
            // The user-facing rule is: "show yesterday's closing balance and
            // only reflect MANUAL transactions the admin approved today —
            // never sales-in-progress, the Sunday caída credit, or automatic
            // loan disbursements." So we subtract every category that the
            // system added to current_balance today EXCEPT approved
            // transaction_groups (those are the manual ones we want to keep
            // visible — and they stay in because they're already in current
            // and we don't subtract them).
            if (useLiveBalance)
            {
                var liveBalances = await _context.Balances
                    .AsNoTracking()
                    .ToDictionaryAsync(b => b.BettingPoolId, b => b.CurrentBalance);

                var bpRangeStartUtc = DateTimeHelper.GetUtcStartOfDay(today);
                var bpRangeEndUtc = DateTimeHelper.GetUtcEndOfDay(today);

                // Today's net sales per banca (sold − prize − discount − commission).
                var todaySales = await _context.Tickets
                    .AsNoTracking()
                    .Where(t => !t.IsCancelled
                        && t.CreatedAt >= bpRangeStartUtc
                        && t.CreatedAt <= bpRangeEndUtc)
                    .GroupBy(t => t.BettingPoolId)
                    .Select(g => new
                    {
                        BettingPoolId = g.Key,
                        Net = g.Sum(t => t.TotalBetAmount - t.TotalPrize - t.TotalDiscount - t.TotalCommission)
                    })
                    .ToDictionaryAsync(x => x.BettingPoolId, x => x.Net);

                // Today's caída credits per banca (the Sunday/period-end
                // accrual the CaidaCalculationService adds to current_balance).
                var todayCaida = await _context.CaidaHistory
                    .AsNoTracking()
                    .Where(h => h.CalculationDate == today.Date)
                    .GroupBy(h => h.BettingPoolId)
                    .Select(g => new
                    {
                        BettingPoolId = g.Key,
                        Amount = g.Sum(h => h.CaidaAmount)
                    })
                    .ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

                // Today's automatic-loan disbursements per banca (worker +
                // manual /payments endpoint both write to loan_payments and
                // bump current_balance — we don't want either to leak into
                // the "yesterday's balance" column).
                var todayLoanPayments = await (
                    from p in _context.LoanPayments.AsNoTracking()
                    join l in _context.Loans.AsNoTracking() on p.LoanId equals l.LoanId
                    where l.EntityType == "bettingPool"
                        && p.PaymentDate >= bpRangeStartUtc
                        && p.PaymentDate <= bpRangeEndUtc
                    group p by l.EntityId into g
                    select new { BettingPoolId = g.Key, Amount = g.Sum(x => x.AmountPaid) }
                ).ToDictionaryAsync(x => x.BettingPoolId, x => x.Amount);

                foreach (var r in results)
                {
                    if (liveBalances.TryGetValue(r.BettingPoolId, out var live))
                    {
                        var sales = todaySales.TryGetValue(r.BettingPoolId, out var s) ? s : 0m;
                        var caida = todayCaida.TryGetValue(r.BettingPoolId, out var c) ? c : 0m;
                        var loanPaid = todayLoanPayments.TryGetValue(r.BettingPoolId, out var lp) ? lp : 0m;
                        r.Balance = live - sales - caida - loanPaid;
                    }
                }
            }

            // Adjust balances with today's transactions (after the snapshot)
            var todayUtcStart = DateTimeHelper.GetUtcStartOfDay(today);
            var todayUtcEnd = DateTimeHelper.GetUtcEndOfDay(today);

            // Get net transaction effects for bancas as entity1: debit increases balance, credit decreases
            // Only include Aprobado transactions (exclude Eliminado, Rechazado, PendienteAprobacion, PendienteEliminacion)
            var entity1Adjustments = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity1Type == "bettingPool"
                    && l.Group!.Status == "Aprobado"
                    && l.Group!.CreatedAt >= todayUtcStart
                    && l.Group!.CreatedAt <= todayUtcEnd)
                .GroupBy(l => l.Entity1Id)
                .Select(g => new { BettingPoolId = g.Key, Net = g.Sum(l => l.Debit - l.Credit) })
                .ToListAsync();

            // Get net transaction effects for bancas as entity2: credit increases balance, debit decreases
            var entity2Adjustments = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity2Type == "bettingPool"
                    && l.Group!.Status == "Aprobado"
                    && l.Group!.CreatedAt >= todayUtcStart
                    && l.Group!.CreatedAt <= todayUtcEnd)
                .GroupBy(l => l.Entity2Id!.Value)
                .Select(g => new { BettingPoolId = g.Key, Net = g.Sum(l => l.Credit - l.Debit) })
                .ToListAsync();

            var adjustmentMap = new Dictionary<int, decimal>();
            foreach (var adj in entity1Adjustments)
            {
                adjustmentMap.TryGetValue(adj.BettingPoolId, out var current);
                adjustmentMap[adj.BettingPoolId] = current + adj.Net;
            }
            foreach (var adj in entity2Adjustments)
            {
                adjustmentMap.TryGetValue(adj.BettingPoolId, out var current);
                adjustmentMap[adj.BettingPoolId] = current + adj.Net;
            }

            // Get active loan balances per betting pool
            var loanBalances = await _context.Loans
                .AsNoTracking()
                .Where(l => l.EntityType == "bettingPool" && l.Status == "active")
                .GroupBy(l => l.EntityId)
                .Select(g => new { BettingPoolId = g.Key, TotalRemaining = g.Sum(l => l.RemainingBalance) })
                .ToListAsync();
            var loanMap = loanBalances.ToDictionary(x => x.BettingPoolId, x => x.TotalRemaining);

            // Apply transaction adjustments and loan balances to snapshot.
            // SKIP the tx adjustment for `useLiveBalance` rows: live current_balance
            // already reflects today's transactions, so re-adding them would
            // double-count.
            foreach (var result in results)
            {
                if (!useLiveBalance && adjustmentMap.TryGetValue(result.BettingPoolId, out var adjustment))
                {
                    result.Balance += adjustment;
                }
                if (loanMap.TryGetValue(result.BettingPoolId, out var loanBalance))
                {
                    result.Loans = loanBalance;
                }
            }

            // Natural sort by code so LC-0010 sits between LC-0009 and LC-0011
            // rather than next to LC-0100 (default string ordering puts the
            // 3-digit codes before the rest of the 4-digit ones).
            results = results
                .OrderBy(r => NaturalSortKey(r.BettingPoolCode))
                .ToList();

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
