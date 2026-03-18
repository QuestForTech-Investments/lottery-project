using LotteryApi.Data;
using LotteryApi.Helpers;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services.Caida;

public class CaidaCalculationService : ICaidaCalculationService
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<CaidaCalculationService> _logger;

    public CaidaCalculationService(LotteryDbContext context, ILogger<CaidaCalculationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task ProcessScheduledCaidaAsync(DateTime date, CancellationToken ct = default)
    {
        var dayOfWeek = date.DayOfWeek;
        var isLastDayOfMonth = date.Day == DateTime.DaysInMonth(date.Year, date.Month);
        var isLastDayOfYear = date.Month == 12 && date.Day == 31;
        var isSunday = dayOfWeek == DayOfWeek.Sunday;

        // Get all bancas with caída enabled (not OFF)
        var configs = await _context.BettingPoolConfigs
            .Where(c => c.FallType != "OFF" && c.FallType != "COLLECTION" && c.FallPercentage > 0)
            .Include(c => c.BettingPool)
            .ToListAsync(ct);

        var processedCount = 0;

        foreach (var config in configs)
        {
            if (ct.IsCancellationRequested) break;

            var (shouldProcess, periodType, periodStart, periodEnd) = ShouldProcessForDate(config, date, isSunday, isLastDayOfMonth, isLastDayOfYear);
            if (!shouldProcess) continue;

            // Check if already processed for this period
            var alreadyProcessed = await _context.CaidaHistory
                .AnyAsync(h => h.BettingPoolId == config.BettingPoolId
                    && h.PeriodType == periodType
                    && h.PeriodStart == periodStart
                    && h.PeriodEnd == periodEnd, ct);

            if (alreadyProcessed) continue;

            try
            {
                await ProcessBancaCaidaAsync(config, periodType, periodStart, periodEnd, date, ct);
                processedCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing caída for banca {BettingPoolId} ({PeriodType})",
                    config.BettingPoolId, periodType);
            }
        }

        _logger.LogInformation("Caída processing complete for {Date}: {Count} bancas processed", date, processedCount);
    }

    public async Task<decimal> ProcessCobroCaidaAsync(int bettingPoolId, decimal cobroAmount, int? userId = null, CancellationToken ct = default)
    {
        var config = await _context.BettingPoolConfigs
            .FirstOrDefaultAsync(c => c.BettingPoolId == bettingPoolId, ct);

        if (config == null || config.FallType != "COLLECTION" || config.FallPercentage <= 0)
            return 0;

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var potentialCaida = Math.Round(cobroAmount * config.FallPercentage / 100, 2);

        decimal caidaAmount = 0;
        var accumulatedBefore = config.AccumulatedFall;

        // COBRO: if accumulated is negative, no cashback (and don't modify accumulated)
        if (config.AccumulatedFall >= 0)
        {
            caidaAmount = potentialCaida;

            // Credit to entity balance
            await CreditEntityBalanceAsync(bettingPoolId, caidaAmount, ct);
        }
        // If accumulated < 0, caidaAmount stays 0 and accumulated is not modified

        // Record history
        var history = new CaidaHistory
        {
            BettingPoolId = bettingPoolId,
            CalculationDate = today,
            PeriodType = "COLLECTION",
            PeriodStart = today,
            PeriodEnd = today,
            TotalSales = 0,
            TotalPrizes = 0,
            TotalCommissions = 0,
            TotalDiscounts = 0,
            NetAmount = 0,
            FallPercentage = config.FallPercentage,
            AccumulatedFallBefore = accumulatedBefore,
            AccumulatedFallAfter = config.AccumulatedFall, // unchanged for COBRO
            CaidaAmount = caidaAmount,
            CobroAmount = cobroAmount,
            Notes = caidaAmount > 0
                ? $"Cobro ${cobroAmount:F2} × {config.FallPercentage}% = ${caidaAmount:F2} cashback"
                : $"Cobro ${cobroAmount:F2} — no cashback (acumulada negativa: ${accumulatedBefore:F2})",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.CaidaHistory.Add(history);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("COBRO caída for banca {Id}: cobro=${Cobro}, cashback=${Caida}, accumulated={Acc}",
            bettingPoolId, cobroAmount, caidaAmount, config.AccumulatedFall);

        return caidaAmount;
    }

    private async Task ProcessBancaCaidaAsync(
        BettingPoolConfig config, string periodType,
        DateTime periodStart, DateTime periodEnd,
        DateTime calculationDate, CancellationToken ct)
    {
        var bpId = config.BettingPoolId;
        var adjustedEnd = periodEnd.AddDays(1).AddTicks(-1);

        // Calculate net for the period (same formula as SalesReportsController)
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.BettingPoolId == bpId && !t.IsCancelled)
            .Where(t => t.TicketLines.Any(tl => tl.DrawDate.Date >= periodStart && tl.DrawDate.Date <= periodEnd))
            .ToListAsync(ct);

        var totalSold = tickets.Sum(t => t.GrandTotal);
        var totalPrizes = tickets.Sum(t => t.TotalPrize);
        var totalCommissions = tickets.Sum(t => t.TotalCommission);
        var riferoDiscount = tickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);
        var netAmount = totalSold + riferoDiscount - totalCommissions - totalPrizes;

        var accumulatedBefore = config.AccumulatedFall;
        decimal caidaAmount = 0;
        decimal accumulatedAfter;
        var isWithAccumulation = config.FallType != "WEEKLY_NO_ACCUMULATED";

        if (isWithAccumulation)
        {
            // --- Acumulado logic ---
            if (netAmount >= 0)
            {
                // Positive final: check accumulated debt
                var effectiveNet = netAmount + accumulatedBefore; // accumulatedBefore is negative when debt exists
                if (effectiveNet > 0)
                {
                    caidaAmount = Math.Round(effectiveNet * config.FallPercentage / 100, 2);
                    accumulatedAfter = 0; // debt paid off
                }
                else
                {
                    // Still in debt
                    caidaAmount = 0;
                    accumulatedAfter = effectiveNet; // still negative
                }
            }
            else
            {
                // Negative final: add to accumulated debt
                caidaAmount = 0;
                accumulatedAfter = accumulatedBefore + netAmount; // more negative
            }

            config.AccumulatedFall = accumulatedAfter;
        }
        else
        {
            // --- Sin acumulado logic ---
            if (netAmount > 0)
            {
                caidaAmount = Math.Round(netAmount * config.FallPercentage / 100, 2);
            }
            accumulatedAfter = 0; // never accumulates
        }

        // Credit cashback to entity balance
        if (caidaAmount > 0)
        {
            await CreditEntityBalanceAsync(bpId, caidaAmount, ct);
        }

        // Record history
        var history = new CaidaHistory
        {
            BettingPoolId = bpId,
            CalculationDate = calculationDate,
            PeriodType = periodType,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            TotalSales = totalSold,
            TotalPrizes = totalPrizes,
            TotalCommissions = totalCommissions,
            TotalDiscounts = riferoDiscount,
            NetAmount = netAmount,
            FallPercentage = config.FallPercentage,
            AccumulatedFallBefore = accumulatedBefore,
            AccumulatedFallAfter = accumulatedAfter,
            CaidaAmount = caidaAmount,
            Notes = caidaAmount > 0
                ? $"{periodType}: net=${netAmount:F2} × {config.FallPercentage}% = ${caidaAmount:F2}"
                : $"{periodType}: net=${netAmount:F2}, no cashback",
            CreatedAt = DateTime.UtcNow
        };

        _context.CaidaHistory.Add(history);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Caída {Type} for banca {Id}: net=${Net}, caída=${Caida}, accBefore={Before}, accAfter={After}",
            periodType, bpId, netAmount, caidaAmount, accumulatedBefore, accumulatedAfter);
    }

    private async Task CreditEntityBalanceAsync(int bettingPoolId, decimal amount, CancellationToken ct)
    {
        var entity = await _context.AccountableEntities
            .FirstOrDefaultAsync(e => e.EntityType == "bettingPool" && e.EntityId == bettingPoolId, ct);

        if (entity != null)
        {
            entity.CurrentBalance += amount;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        // Also update the balances table (used for display)
        var balance = await _context.Balances
            .FirstOrDefaultAsync(b => b.BettingPoolId == bettingPoolId, ct);

        if (balance != null)
        {
            balance.CurrentBalance += amount;
            balance.LastUpdated = DateTime.UtcNow;
        }
    }

    private static (bool shouldProcess, string periodType, DateTime periodStart, DateTime periodEnd) ShouldProcessForDate(
        BettingPoolConfig config, DateTime date, bool isSunday, bool isLastDayOfMonth, bool isLastDayOfYear)
    {
        switch (config.FallType)
        {
            case "DAILY":
                return (true, "DAILY", date, date);

            case "WEEKLY":
            case "WEEKLY_ACCUMULATED":
                if (!isSunday) return (false, "", default, default);
                var weekStart = date.AddDays(-6); // Monday
                return (true, "WEEKLY", weekStart, date);

            case "WEEKLY_NO_ACCUMULATED":
                if (!isSunday) return (false, "", default, default);
                var weekStartNoAcc = date.AddDays(-6);
                return (true, "WEEKLY_NO_ACCUMULATED", weekStartNoAcc, date);

            case "MONTHLY":
                if (!isLastDayOfMonth) return (false, "", default, default);
                var monthStart = new DateTime(date.Year, date.Month, 1);
                return (true, "MONTHLY", monthStart, date);

            case "ANNUAL":
                if (!isLastDayOfYear) return (false, "", default, default);
                var yearStart = new DateTime(date.Year, 1, 1);
                return (true, "ANNUAL", yearStart, date);

            default:
                return (false, "", default, default);
        }
    }

    public async Task UpdateRealtimeCaidaAsync(int bettingPoolId, CancellationToken ct = default)
    {
        var config = await _context.BettingPoolConfigs
            .FirstOrDefaultAsync(c => c.BettingPoolId == bettingPoolId, ct);

        if (config == null || config.FallType == "OFF" || config.FallType == "COLLECTION" || config.FallPercentage <= 0)
            return;

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var (periodStart, periodEnd) = GetCurrentPeriodRange(config, today);

        var (caida, accumulatedFall) = await CalculateRealtimeValues(config, periodStart, periodEnd, ct);

        // Update the display value (no balance credit)
        config.AccumulatedFall = accumulatedFall;
        await _context.SaveChangesAsync(ct);
    }

    public async Task<(decimal caida, decimal accumulatedFall)> GetRealtimeCaidaAsync(int bettingPoolId, DateTime date, CancellationToken ct = default)
    {
        var config = await _context.BettingPoolConfigs
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.BettingPoolId == bettingPoolId, ct);

        if (config == null || config.FallType == "OFF" || config.FallType == "COLLECTION" || config.FallPercentage <= 0)
            return (0, config?.AccumulatedFall ?? 0);

        // Always calculate real-time accumulated fall
        var (periodStart, periodEnd) = GetCurrentPeriodRange(config, date);
        var (caida, accumulatedFall) = await CalculateRealtimeValues(config, periodStart, periodEnd, ct);

        // Only show caída value on the processing day; accumulated fall shows every day
        if (!IsShowDay(config.FallType, date))
            return (0, accumulatedFall);

        return (caida, accumulatedFall);
    }

    /// <summary>
    /// Determines if caída should be shown for this fall type on the given date.
    /// DAILY: every day. WEEKLY: only Sunday. MONTHLY: last day of month. ANNUAL: Dec 31.
    /// </summary>
    private static bool IsShowDay(string fallType, DateTime date)
    {
        return fallType switch
        {
            "DAILY" => true,
            "WEEKLY" or "WEEKLY_ACCUMULATED" or "WEEKLY_NO_ACCUMULATED" => date.DayOfWeek == DayOfWeek.Sunday,
            "MONTHLY" => date.Day == DateTime.DaysInMonth(date.Year, date.Month),
            "ANNUAL" => date.Month == 12 && date.Day == 31,
            _ => false
        };
    }

    /// <summary>
    /// Calculate caída and accumulated_fall without persisting or crediting balance.
    /// </summary>
    private async Task<(decimal caida, decimal accumulatedFall)> CalculateRealtimeValues(
        BettingPoolConfig config, DateTime periodStart, DateTime periodEnd, CancellationToken ct)
    {
        var bpId = config.BettingPoolId;

        // Get net for current period
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.BettingPoolId == bpId && !t.IsCancelled)
            .Where(t => t.TicketLines.Any(tl => tl.DrawDate.Date >= periodStart && tl.DrawDate.Date <= periodEnd))
            .ToListAsync(ct);

        var totalSold = tickets.Sum(t => t.GrandTotal);
        var totalPrizes = tickets.Sum(t => t.TotalPrize);
        var totalCommissions = tickets.Sum(t => t.TotalCommission);
        var riferoDiscount = tickets.Where(t => t.DiscountMode == "RIFERO").Sum(t => t.TotalDiscount);
        var netAmount = totalSold + riferoDiscount - totalCommissions - totalPrizes;

        // Get the accumulated_fall at the start of the current period
        // (from the last caida_history entry before this period)
        var lastHistory = await _context.CaidaHistory
            .AsNoTracking()
            .Where(h => h.BettingPoolId == bpId && h.PeriodEnd < periodStart)
            .OrderByDescending(h => h.PeriodEnd)
            .FirstOrDefaultAsync(ct);

        var accumulatedBefore = lastHistory?.AccumulatedFallAfter ?? 0;
        var isWithAccumulation = config.FallType != "WEEKLY_NO_ACCUMULATED";

        decimal caida;
        decimal accumulatedAfter;

        if (isWithAccumulation)
        {
            if (netAmount >= 0)
            {
                var effectiveNet = netAmount + accumulatedBefore;
                if (effectiveNet > 0)
                {
                    caida = Math.Round(effectiveNet * config.FallPercentage / 100, 2);
                    accumulatedAfter = 0;
                }
                else
                {
                    caida = 0;
                    accumulatedAfter = effectiveNet;
                }
            }
            else
            {
                caida = 0;
                accumulatedAfter = accumulatedBefore + netAmount;
            }
        }
        else
        {
            caida = netAmount > 0 ? Math.Round(netAmount * config.FallPercentage / 100, 2) : 0;
            accumulatedAfter = 0;
        }

        return (caida, accumulatedAfter);
    }

    /// <summary>
    /// Get the start/end of the current period based on fall type.
    /// </summary>
    private static (DateTime periodStart, DateTime periodEnd) GetCurrentPeriodRange(BettingPoolConfig config, DateTime date)
    {
        return config.FallType switch
        {
            "DAILY" => (date, date),
            "WEEKLY" or "WEEKLY_ACCUMULATED" or "WEEKLY_NO_ACCUMULATED" => (
                date.AddDays(-(int)date.DayOfWeek + 1), // Monday
                date.AddDays(7 - (int)date.DayOfWeek)   // Sunday
            ),
            "MONTHLY" => (
                new DateTime(date.Year, date.Month, 1),
                new DateTime(date.Year, date.Month, DateTime.DaysInMonth(date.Year, date.Month))
            ),
            "ANNUAL" => (
                new DateTime(date.Year, 1, 1),
                new DateTime(date.Year, 12, 31)
            ),
            _ => (date, date)
        };
    }
}
