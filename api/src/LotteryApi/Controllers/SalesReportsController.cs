using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/reports/sales")]
public class SalesReportsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<SalesReportsController> _logger;

    public SalesReportsController(LotteryDbContext context, ILogger<SalesReportsController> logger)
    {
        _context = context;
        _logger = logger;
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
        try
        {
            // Validate date range
            if (filter.EndDate < filter.StartDate)
            {
                return BadRequest(new { message = "La fecha de fin debe ser mayor o igual a la fecha de inicio" });
            }

            // Adjust EndDate to include the entire day (23:59:59.999)
            var adjustedEndDate = filter.EndDate.Date.AddDays(1).AddTicks(-1);

            _logger.LogInformation(
                "Generating sales report from {StartDate} to {EndDate}, DrawIds: {DrawIds}, ZoneIds: {ZoneIds}",
                filter.StartDate, adjustedEndDate, filter.DrawIds, filter.ZoneIds);

            // Start with all betting pools
            var bettingPoolsQuery = _context.BettingPools
                .AsQueryable();

            // Apply zone filter if specified
            if (filter.ZoneIds != null && filter.ZoneIds.Count > 0)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => filter.ZoneIds.Contains(bp.ZoneId));
            }

            // Get betting pools with their tickets in the date range
            var salesData = await bettingPoolsQuery
                .Select(bp => new
                {
                    BettingPool = bp,
                    Tickets = bp.Tickets
                        .Where(t => !t.IsCancelled
                            && t.CreatedAt >= filter.StartDate
                            && t.CreatedAt <= adjustedEndDate)
                        .Where(t => filter.DrawIds == null || filter.DrawIds.Count == 0
                            || t.TicketLines.Any(tl => filter.DrawIds.Contains(tl.DrawId)))
                        .ToList()
                })
                .ToListAsync();

            // Calculate aggregated sales per betting pool
            var bettingPoolSales = salesData
                .Where(x => x.Tickets.Any()) // Only include betting pools with sales
                .Select(x =>
                {
                    var totalSold = x.Tickets.Sum(t => t.GrandTotal);
                    var totalPrizes = x.Tickets.Sum(t => t.TotalPrize);
                    var totalCommissions = x.Tickets.Sum(t => t.TotalCommission);
                    var totalNet = totalSold - totalCommissions - totalPrizes;

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
                        TotalNet = totalNet
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
            return StatusCode(500, new { message = "Error al generar el reporte de ventas" });
        }
    }

    /// <summary>
    /// Get sales summary for a specific date (used for daily sales widget)
    /// </summary>
    /// <param name="date">Date to get sales summary for (defaults to today)</param>
    /// <returns>Sales summary for the specified date</returns>
    [HttpGet("daily-summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetDailySalesSummary([FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1); // End of day

            _logger.LogInformation("Getting daily sales summary for {Date}", targetDate);

            // Get all tickets for the day (not cancelled)
            var tickets = await _context.Tickets
                .Where(t => !t.IsCancelled
                    && t.CreatedAt >= startDate
                    && t.CreatedAt <= endDate)
                .ToListAsync();

            decimal totalSold = tickets.Sum(t => t.GrandTotal);
            decimal totalNet = tickets.Sum(t => t.TotalNet);
            decimal totalPrizes = tickets.Sum(t => t.TotalPrize);

            var summary = new SalesSummaryDto
            {
                TotalSold = totalSold,
                TotalPrizes = totalPrizes,
                TotalCommissions = tickets.Sum(t => t.TotalCommission),
                TotalNet = totalNet,
                Balance = 0,
                Credits = 0,
                BenefitPercentage = 0
            };

            summary.TotalNet = summary.TotalSold - summary.TotalCommissions - summary.TotalPrizes;

            if (totalSold > 0) summary.BenefitPercentage = (summary.TotalNet / summary.TotalSold) * 100;

            _logger.LogInformation(
                "Daily summary for {Date}: Sold={TotalSold}, Prizes={TotalPrizes}, Commissions={TotalCommissions}, Net={TotalNet}",
                targetDate, summary.TotalSold, summary.TotalPrizes, summary.TotalCommissions, summary.TotalNet);

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily sales summary");
            return StatusCode(500, new { message = "Error al obtener el resumen de ventas del día" });
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

            // Get all tickets in the date range
            var rangeStart = startDate.Date;
            var rangeEnd = endDate.Date.AddDays(1).AddTicks(-1);

            var query = _context.Tickets
                .Include(t => t.BettingPool)
                .Where(t => !t.IsCancelled
                    && t.CreatedAt >= rangeStart
                    && t.CreatedAt <= rangeEnd);

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

            // Group by date and calculate summaries
            var dailySummaries = new List<DailySalesSummaryDto>();
            var currentDate = startDate.Date;

            while (currentDate <= endDate.Date)
            {
                var dayStart = currentDate;
                var dayEnd = currentDate.AddDays(1).AddTicks(-1);

                var dayTickets = tickets.Where(t => t.CreatedAt >= dayStart && t.CreatedAt <= dayEnd).ToList();

                var totalSold = dayTickets.Sum(t => t.GrandTotal);
                var totalPrizes = dayTickets.Sum(t => t.TotalPrize);
                var totalCommissions = dayTickets.Sum(t => t.TotalCommission);
                var totalDiscounts = dayTickets.Sum(t => t.TotalDiscount);
                var totalNet = totalSold - totalCommissions - totalPrizes;

                dailySummaries.Add(new DailySalesSummaryDto
                {
                    Date = currentDate,
                    TotalSold = totalSold,
                    TotalPrizes = totalPrizes,
                    TotalCommissions = totalCommissions,
                    TotalDiscounts = totalDiscounts,
                    Fall = 0, // TODO: Calculate based on business rules
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
            return StatusCode(500, new { message = "Error al obtener el resumen de ventas por fecha" });
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
        [FromQuery] int? zoneId = null)
    {
        try
        {
            // Validate date range
            if (endDate < startDate)
            {
                return BadRequest(new { message = "La fecha de fin debe ser mayor o igual a la fecha de inicio" });
            }

            // Convert dates to UTC using Santo Domingo timezone (UTC-4)
            // This ensures that when user selects Dec 13, they see tickets created during Dec 13 Santo Domingo time
            string timezoneId = "America/Santo_Domingo";
            var businessTimezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);

            var localStartOfDay = new DateTime(startDate.Year, startDate.Month, startDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var localEndOfDay = new DateTime(endDate.Year, endDate.Month, endDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);

            var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStartOfDay, businessTimezone);
            var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEndOfDay, businessTimezone);

            _logger.LogInformation(
                "Getting sales by betting pool from {StartDate} to {EndDate} (UTC: {UtcStart} to {UtcEnd}), ZoneId: {ZoneId}",
                startDate, endDate, utcStart, utcEnd, zoneId);

            var query = _context.BettingPools.AsQueryable();

            // Apply zone filter if specified
            if (zoneId.HasValue)
            {
                query = query.Where(bp => bp.ZoneId == zoneId.Value);
            }

            var salesData = await query
                .Select(bp => new
                {
                    BettingPool = bp,
                    Tickets = bp.Tickets
                        .Where(t => !t.IsCancelled
                            && t.CreatedAt >= utcStart
                            && t.CreatedAt < utcEnd)
                        .ToList()
                })
                .ToListAsync();

            var result = salesData
                .Where(x => x.Tickets.Any())
                .Select(x =>
                {
                    var totalSold = x.Tickets.Sum(t => t.GrandTotal);
                    var totalPrizes = x.Tickets.Sum(t => t.TotalPrize);
                    var totalCommissions = x.Tickets.Sum(t => t.TotalCommission);

                    // Count tickets by state
                    var pendingCount = x.Tickets.Count(t => t.TicketState == "P");
                    var winnerCount = x.Tickets.Count(t => t.TicketState == "W");
                    var loserCount = x.Tickets.Count(t => t.TicketState == "L");

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
                        TotalNet = totalSold - totalCommissions - totalPrizes,
                        PendingCount = pendingCount,
                        WinnerCount = winnerCount,
                        LoserCount = loserCount
                    };
                })
                .OrderBy(x => x.BettingPoolCode)
                .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by betting pool");
            return StatusCode(500, new { message = "Error al obtener las ventas por banca" });
        }
    }

    /// <summary>
    /// Get sales aggregated by draw (sorteo) for a specific date
    /// Used in "Por sorteo" tab of DailySales
    /// </summary>
    [HttpGet("by-draw")]
    public async Task<ActionResult<DrawSalesResponseDto>> GetSalesByDraw(
        [FromQuery] DateTime? date,
        [FromQuery] string? zoneIds)
    {
        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            _logger.LogInformation("Getting sales by draw for {Date}", targetDate);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Get ticket lines grouped by draw
            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.Ticket!.CreatedAt >= startDate && tl.Ticket.CreatedAt <= endDate);

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            var lines = await query.ToListAsync();

            var drawSales = lines
                .GroupBy(tl => tl.DrawId)
                .Select(g =>
                {
                    var firstLine = g.First();
                    var draw = firstLine.Draw;
                    var ticketIds = g.Select(tl => tl.TicketId).Distinct().ToList();

                    return new DrawSalesDto
                    {
                        DrawId = g.Key,
                        DrawName = draw?.Lottery?.LotteryName ?? "Unknown",
                        LotteryName = draw?.Lottery?.LotteryName,
                        DrawTime = draw?.DrawTime ?? TimeSpan.Zero,
                        DrawColor = draw?.Lottery?.Colour,
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
                TotalSold = drawSales.Sum(d => d.TotalSold),
                TotalPrizes = drawSales.Sum(d => d.TotalPrizes),
                TotalCommissions = drawSales.Sum(d => d.TotalCommissions),
                TotalNet = drawSales.Sum(d => d.TotalNet)
            };

            return Ok(new DrawSalesResponseDto
            {
                Date = targetDate,
                Draws = drawSales,
                Summary = summary,
                TotalCount = drawSales.Count()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by draw");
            return StatusCode(500, new { message = "Error al obtener las ventas por sorteo" });
        }
    }

    /// <summary>
    /// Get sales aggregated by zone for a specific date
    /// Used in "Por zona" tab of DailySales
    /// </summary>
    [HttpGet("by-zone")]
    public async Task<ActionResult<ZoneSalesResponseDto>> GetSalesByZone(
        [FromQuery] DateTime? date,
        [FromQuery] string? zoneIds)
    {
        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            _logger.LogInformation("Getting sales by zone for {Date}", targetDate);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var zonesQuery = _context.Zones.Where(z => z.IsActive);
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                zonesQuery = zonesQuery.Where(z => zoneIdList.Contains(z.ZoneId));
            }

            var zones = await zonesQuery.ToListAsync();

            var zoneSales = new List<ZoneSalesDto>();

            foreach (var zone in zones)
            {
                var tickets = await _context.Tickets
                    .Include(t => t.BettingPool)
                    .Include(t => t.TicketLines)
                    .Where(t => !t.IsCancelled)
                    .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                    .Where(t => t.BettingPool != null && t.BettingPool.ZoneId == zone.ZoneId)
                    .ToListAsync();

                if (!tickets.Any()) continue;

                var bettingPoolIds = tickets.Select(t => t.BettingPoolId).Distinct().Count();

                zoneSales.Add(new ZoneSalesDto
                {
                    ZoneId = zone.ZoneId,
                    ZoneName = zone.ZoneName ?? "Unknown",
                    BettingPoolCount = bettingPoolIds,
                    TicketCount = tickets.Count,
                    LineCount = tickets.Sum(t => t.TotalLines),
                    WinnerCount = tickets.Sum(t => t.WinningLines),
                    TotalSold = tickets.Sum(t => t.GrandTotal),
                    TotalPrizes = tickets.Sum(t => t.TotalPrize),
                    TotalCommissions = tickets.Sum(t => t.TotalCommission),
                    TotalDiscounts = tickets.Sum(t => t.TotalDiscount),
                    TotalNet = tickets.Sum(t => t.GrandTotal) - tickets.Sum(t => t.TotalCommission) - tickets.Sum(t => t.TotalPrize),
                    Fall = 0, // TODO: Calculate based on business rules
                    Final = tickets.Sum(t => t.GrandTotal) - tickets.Sum(t => t.TotalCommission) - tickets.Sum(t => t.TotalPrize),
                    Balance = 0 // TODO: Calculate based on business rules
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
                Date = targetDate,
                Zones = zoneSales.OrderBy(z => z.ZoneName).ToList(),
                Summary = summary,
                TotalCount = zoneSales.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sales by zone");
            return StatusCode(500, new { message = "Error al obtener las ventas por zona" });
        }
    }

    /// <summary>
    /// Get sales by betting pool broken down by draw
    /// Used in "Banca por sorteo" tab of DailySales
    /// </summary>
    [HttpGet("betting-pool-by-draw")]
    public async Task<ActionResult<BettingPoolDrawSalesResponseDto>> GetBettingPoolByDraw(
        [FromQuery] DateTime? date,
        [FromQuery] string? zoneIds)
    {
        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            _logger.LogInformation("Getting betting pool by draw for {Date}", targetDate);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            var bettingPoolsQuery = _context.BettingPools.Include(bp => bp.Zone).Where(bp => bp.IsActive);
            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                bettingPoolsQuery = bettingPoolsQuery.Where(bp => zoneIdList.Contains(bp.ZoneId));
            }

            var bettingPools = await bettingPoolsQuery.ToListAsync();
            var result = new List<BettingPoolDrawSalesDto>();

            foreach (var bp in bettingPools)
            {
                var lines = await _context.TicketLines
                    .Include(tl => tl.Ticket)
                    .Include(tl => tl.Draw)
                        .ThenInclude(d => d!.Lottery)
                    .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                    .Where(tl => tl.Ticket!.BettingPoolId == bp.BettingPoolId)
                    .Where(tl => tl.Ticket!.CreatedAt >= startDate && tl.Ticket.CreatedAt <= endDate)
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
                .Where(tl => tl.Ticket!.CreatedAt >= startDate && tl.Ticket.CreatedAt <= endDate)
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
                Date = targetDate,
                BettingPools = result.OrderBy(r => r.BettingPoolCode).ToList(),
                DrawTotals = drawTotals,
                Summary = summary,
                TotalCount = result.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting betting pool by draw");
            return StatusCode(500, new { message = "Error al obtener las ventas por banca y sorteo" });
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
                .Where(tl => tl.Ticket!.CreatedAt >= startDate && tl.Ticket.CreatedAt <= endDate);

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
            return StatusCode(500, new { message = "Error al obtener las categorías de premios" });
        }
    }

    /// <summary>
    /// Get combinations (bet numbers by draw)
    /// Used in "Combinaciones" tab of DailySales
    /// </summary>
    [HttpGet("combinations")]
    public async Task<ActionResult<CombinationSalesResponseDto>> GetCombinations(
        [FromQuery] DateTime? date,
        [FromQuery] int? drawId,
        [FromQuery] string? zoneIds,
        [FromQuery] int? bettingPoolId)
    {
        try
        {
            var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1);

            _logger.LogInformation("Getting combinations for {Date}, DrawId: {DrawId}", targetDate, drawId);

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
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Include(tl => tl.BetType)
                .Where(tl => tl.Ticket != null && !tl.Ticket.IsCancelled)
                .Where(tl => tl.Ticket!.CreatedAt >= startDate && tl.Ticket.CreatedAt <= endDate);

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

            if (bettingPoolId.HasValue)
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
                Date = targetDate,
                DrawId = drawId,
                Combinations = combinations,
                Summary = summary,
                TotalCount = combinations.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting combinations");
            return StatusCode(500, new { message = "Error al obtener las combinaciones" });
        }
    }
}
