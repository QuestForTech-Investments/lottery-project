using LotteryApi.Data;
using LotteryApi.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services;

/// <summary>
/// Builds the data model that feeds <see cref="PlayMonitoringEmailBuilder"/>.
/// Pulled out of EmailReceiversController so both the preview endpoints and
/// the automatic notifier (fired when a result is published) share a single
/// source of truth for filtering / aggregation.
/// </summary>
public class PlayMonitoringReportService
{
    private readonly LotteryDbContext _context;

    public PlayMonitoringReportService(LotteryDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Aggregates active plays for the given date+zones, grouped
    /// Draw → BetType → (number, amount). When `drawId` is set, the report is
    /// scoped to a single lottery — which mirrors what the publication trigger
    /// sends. Without it, returns every draw of the day (used by the "browse"
    /// preview).
    /// </summary>
    public async Task<PlayMonitoringEmailBuilder.ReportModel> BuildAsync(
        DateTime targetDate,
        List<int> zoneIds,
        int? drawId = null)
    {
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

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

        if (zoneIds.Count > 0)
        {
            var bpIds = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => zoneIds.Contains(bp.ZoneId))
                .Select(bp => bp.BettingPoolId)
                .ToListAsync();

            if (bpIds.Count == 0)
            {
                return new PlayMonitoringEmailBuilder.ReportModel
                {
                    Date = targetDate,
                    ZoneNames = await ZoneNamesAsync(zoneIds),
                };
            }
            query = query.Where(tl => bpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        var grouped = await query
            .GroupBy(tl => new { tl.DrawId, tl.BetTypeCode, tl.BetNumber })
            .Select(g => new
            {
                g.Key.DrawId,
                g.Key.BetTypeCode,
                g.Key.BetNumber,
                TotalAmount = g.Sum(x => x.BetAmount),
            })
            .ToListAsync();

        var model = new PlayMonitoringEmailBuilder.ReportModel
        {
            Date = targetDate,
            ZoneNames = await ZoneNamesAsync(zoneIds),
        };

        if (grouped.Count == 0)
        {
            return model;
        }

        // Lookup tables for display names + ordering. Pulls the lottery icon so
        // the email can show the draw's logo (with a colored-abbreviation fallback).
        var drawIds = grouped.Select(g => g.DrawId).Distinct().ToList();
        var drawMeta = await _context.Draws
            .AsNoTracking()
            .Where(d => drawIds.Contains(d.DrawId))
            .Select(d => new
            {
                d.DrawId,
                d.DrawName,
                d.DisplayColor,
                d.Abbreviation,
                LogoUrl = d.Lottery!.ImageUrl,
            })
            .ToDictionaryAsync(d => d.DrawId);

        var codes = grouped.Select(g => g.BetTypeCode!).Distinct().ToList();
        var gameTypes = await _context.GameTypes
            .AsNoTracking()
            .Where(gt => codes.Contains(gt.GameTypeCode))
            .ToDictionaryAsync(gt => gt.GameTypeCode, gt => new { gt.GameName, gt.DisplayOrder });

        var draws = grouped
            .GroupBy(g => g.DrawId)
            .Select(drawGroup =>
            {
                var betTypes = drawGroup
                    .GroupBy(x => x.BetTypeCode!)
                    .Select(btGroup =>
                    {
                        var meta = gameTypes.TryGetValue(btGroup.Key, out var m) ? m : null;
                        return new PlayMonitoringEmailBuilder.ReportBetType
                        {
                            Code = btGroup.Key,
                            Name = meta?.GameName ?? btGroup.Key,
                            Total = btGroup.Sum(x => x.TotalAmount),
                            Plays = btGroup
                                .OrderBy(x => x.BetNumber)
                                .Select(x => new PlayMonitoringEmailBuilder.ReportPlay
                                {
                                    BetNumber = x.BetNumber,
                                    Amount = x.TotalAmount,
                                })
                                .ToList(),
                            DisplayOrder = meta?.DisplayOrder ?? 9999,
                        };
                    })
                    .OrderBy(bt => bt.DisplayOrder)
                    .ThenBy(bt => bt.Name)
                    .ToList();

                var dm = drawMeta.TryGetValue(drawGroup.Key, out var d) ? d : null;
                return new PlayMonitoringEmailBuilder.ReportDraw
                {
                    DrawId = drawGroup.Key,
                    DrawName = dm?.DrawName ?? $"Sorteo {drawGroup.Key}",
                    LogoUrl = dm?.LogoUrl,
                    Color = dm?.DisplayColor,
                    Abbreviation = dm?.Abbreviation,
                    Total = betTypes.Sum(bt => bt.Total),
                    BetTypes = betTypes,
                };
            })
            .OrderBy(d => d.DrawName)
            .ToList();

        model.Draws = draws;
        model.GrandTotal = draws.Sum(d => d.Total);
        model.TotalPlays = grouped.Count;
        model.DistinctNumbers = grouped.Select(g => g.BetNumber).Distinct().Count();
        return model;
    }

    private async Task<List<string>> ZoneNamesAsync(List<int> zoneIds)
    {
        if (zoneIds.Count == 0) return new List<string>();
        return await _context.Zones
            .AsNoTracking()
            .Where(z => zoneIds.Contains(z.ZoneId))
            .OrderBy(z => z.ZoneName)
            .Select(z => z.ZoneName)
            .ToListAsync();
    }
}
