using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Services.ExternalResults;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/external-results")]
[Authorize]
public class ExternalResultsController : ControllerBase
{
    private readonly IExternalResultsService _resultsService;
    private readonly ILogger<ExternalResultsController> _logger;
    private readonly LotteryDbContext _context;

    public ExternalResultsController(
        IExternalResultsService resultsService,
        ILogger<ExternalResultsController> logger,
        LotteryDbContext context)
    {
        _resultsService = resultsService;
        _logger = logger;
        _context = context;
    }

    /// <summary>
    /// Fetch and process lottery results for a specific date
    /// </summary>
    /// <param name="date">Date to fetch results for (defaults to today)</param>
    [HttpPost("fetch")]
    [ProducesResponseType(typeof(ResultFetchResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> FetchResults([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual fetch triggered for {Date}", targetDate.ToString("yyyy-MM-dd"));

        var result = await _resultsService.FetchAndProcessResultsAsync(targetDate);

        return Ok(result);
    }

    /// <summary>
    /// Fetch results for a specific draw
    /// </summary>
    /// <param name="drawId">The draw ID</param>
    /// <param name="date">Date to fetch results for (defaults to today)</param>
    [HttpPost("fetch/draw/{drawId}")]
    [ProducesResponseType(typeof(ResultFetchResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> FetchResultsForDraw(int drawId, [FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual fetch triggered for draw {DrawId} on {Date}",
            drawId, targetDate.ToString("yyyy-MM-dd"));

        var result = await _resultsService.FetchResultsForDrawAsync(drawId, targetDate);

        return Ok(result);
    }

    /// <summary>
    /// Process pending tickets against available results
    /// </summary>
    /// <param name="date">Date to process (defaults to today)</param>
    [HttpPost("process-tickets")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> ProcessTickets([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Processing tickets for {Date}", targetDate.ToString("yyyy-MM-dd"));

        var winnersFound = await _resultsService.ProcessPendingTicketsAsync(targetDate);

        return Ok(new
        {
            success = true,
            message = $"Processed tickets for {targetDate:yyyy-MM-dd}",
            winnersFound
        });
    }

    /// <summary>
    /// Get configured draw mappings
    /// </summary>
    [HttpGet("mappings")]
    [ProducesResponseType(typeof(List<DrawMapping>), StatusCodes.Status200OK)]
    public IActionResult GetDrawMappings()
    {
        var mappings = _resultsService.GetDrawMappings();
        return Ok(mappings);
    }

    /// <summary>
    /// Recalculate prizes for existing winners (use after changing prize configuration)
    /// </summary>
    /// <param name="date">Date to recalculate (defaults to today)</param>
    [HttpPost("recalculate-prizes")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> RecalculatePrizes([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Recalculating prizes for {Date}", targetDate.ToString("yyyy-MM-dd"));

        var (linesUpdated, totalPrize) = await _resultsService.RecalculatePrizesAsync(targetDate);

        return Ok(new
        {
            success = true,
            message = $"Recalculated prizes for {targetDate:yyyy-MM-dd}",
            linesUpdated,
            totalPrize
        });
    }

    /// <summary>
    /// Update ticket amounts to random values (for testing purposes)
    /// </summary>
    [HttpPost("update-test-amounts")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateTestAmounts([FromQuery] DateTime? date, [FromQuery] decimal minAmount = 1, [FromQuery] decimal maxAmount = 10)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Updating test amounts for {Date} (range: {Min}-{Max})",
            targetDate.ToString("yyyy-MM-dd"), minAmount, maxAmount);

        var random = new Random();
        var linesUpdated = 0;
        var ticketsUpdated = 0;

        // Get all ticket lines for the date
        var tickets = await _context.Set<LotteryApi.Models.Ticket>()
            .Include(t => t.TicketLines)
            .Where(t => t.CreatedAt.Date == targetDate.Date)
            .ToListAsync();

        foreach (var ticket in tickets)
        {
            decimal ticketTotal = 0;

            foreach (var line in ticket.TicketLines ?? new List<LotteryApi.Models.TicketLine>())
            {
                var newAmount = Math.Round((decimal)(random.NextDouble() * (double)(maxAmount - minAmount) + (double)minAmount), 2);
                line.BetAmount = newAmount;
                line.Subtotal = newAmount;
                line.TotalWithMultiplier = newAmount;
                line.NetAmount = newAmount;
                line.PrizeAmount = 0;
                line.PrizeMultiplier = null;
                ticketTotal += newAmount;
                linesUpdated++;
            }

            ticket.GrandTotal = ticketTotal;
            ticket.TotalPrize = 0;
            ticketsUpdated++;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated {Lines} lines in {Tickets} tickets", linesUpdated, ticketsUpdated);

        return Ok(new
        {
            success = true,
            message = $"Updated amounts for {targetDate:yyyy-MM-dd}",
            ticketsUpdated,
            linesUpdated,
            amountRange = new { min = minAmount, max = maxAmount }
        });
    }
}
