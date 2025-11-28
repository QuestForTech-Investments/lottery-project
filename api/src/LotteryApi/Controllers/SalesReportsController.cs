using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;

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
            var targetDate = date ?? DateTime.Today;
            var startDate = targetDate.Date;
            var endDate = startDate.AddDays(1).AddTicks(-1); // End of day

            _logger.LogInformation("Getting daily sales summary for {Date}", targetDate);

            // Get all tickets for the day (not cancelled)
            var tickets = await _context.Tickets
                .Where(t => !t.IsCancelled
                    && t.CreatedAt >= startDate
                    && t.CreatedAt <= endDate)
                .ToListAsync();

            var summary = new SalesSummaryDto
            {
                TotalSold = tickets.Sum(t => t.GrandTotal),
                TotalPrizes = tickets.Sum(t => t.TotalPrize),
                TotalCommissions = tickets.Sum(t => t.TotalCommission)
            };

            summary.TotalNet = summary.TotalSold - summary.TotalCommissions - summary.TotalPrizes;

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

            _logger.LogInformation(
                "Getting sales by betting pool from {StartDate} to {EndDate}, ZoneId: {ZoneId}",
                startDate, endDate, zoneId);

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
                            && t.CreatedAt >= startDate
                            && t.CreatedAt <= endDate)
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

                    return new BettingPoolSalesDto
                    {
                        BettingPoolId = x.BettingPool.BettingPoolId,
                        BettingPoolName = x.BettingPool.BettingPoolName,
                        BettingPoolCode = x.BettingPool.BettingPoolCode,
                        ZoneId = x.BettingPool.ZoneId,
                        ZoneName = x.BettingPool.Zone != null ? x.BettingPool.Zone.ZoneName : string.Empty,
                        TotalSold = totalSold,
                        TotalPrizes = totalPrizes,
                        TotalCommissions = totalCommissions,
                        TotalNet = totalSold - totalCommissions - totalPrizes
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
}
