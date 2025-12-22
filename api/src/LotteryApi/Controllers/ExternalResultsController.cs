using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public ExternalResultsController(
        IExternalResultsService resultsService,
        ILogger<ExternalResultsController> logger)
    {
        _resultsService = resultsService;
        _logger = logger;
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
}
