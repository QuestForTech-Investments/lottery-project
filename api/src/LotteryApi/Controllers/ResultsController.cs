using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Helpers;
using LotteryApi.Services.ExternalResults;
using System.Security.Claims;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/results")]
[Authorize]
public class ResultsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<ResultsController> _logger;
    private readonly IExternalResultsService _externalResultsService;

    public ResultsController(
        LotteryDbContext context,
        ILogger<ResultsController> logger,
        IExternalResultsService externalResultsService)
    {
        _context = context;
        _logger = logger;
        _externalResultsService = externalResultsService;
    }

    /// <summary>
    /// Get all results for a specific date
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResults([FromQuery] DateTime? date, [FromQuery] int? drawId)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        // OPTIMIZED: Use projection to avoid loading full entities
        var query = _context.Results
            .Where(r => r.ResultDate.Date == targetDate.Date)
            .Join(_context.Draws,
                r => r.DrawId,
                d => d.DrawId,
                (r, d) => new { Result = r, Draw = d })
            .Where(joined => joined.Draw.IsActive) // Only show results for active draws
            .AsQueryable();

        if (drawId.HasValue)
        {
            query = query.Where(joined => joined.Result.DrawId == drawId.Value);
        }

        var results = await query
            .OrderBy(joined => joined.Draw.DrawName)
            .Select(joined => MapToDtoFromProjection(joined.Result, joined.Draw))
            .ToListAsync();

        return Ok(results);
    }

    /// <summary>
    /// Get a specific result by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResult(int id)
    {
        var result = await _context.Results
            .Include(r => r.Draw)
            .FirstOrDefaultAsync(r => r.ResultId == id);

        if (result == null)
        {
            return NotFound(new { message = $"Result with ID {id} not found" });
        }

        return Ok(MapToDto(result));
    }

    /// <summary>
    /// Get results for a specific draw
    /// </summary>
    [HttpGet("draw/{drawId}")]
    [ProducesResponseType(typeof(List<ResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResultsByDraw(int drawId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var query = _context.Results
            .Include(r => r.Draw)
            .Where(r => r.DrawId == drawId)
            .AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(r => r.ResultDate.Date >= startDate.Value.Date);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.ResultDate.Date <= endDate.Value.Date);
        }

        var results = await query
            .OrderByDescending(r => r.ResultDate)
            .Take(100)
            .Select(r => MapToDto(r))
            .ToListAsync();

        return Ok(results);
    }

    /// <summary>
    /// Create or update a result
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateResult([FromBody] CreateResultDto dto)
    {
        var userId = GetCurrentUserId();

        // Validate winning number format (prevent date-like patterns)
        var validation = ValidateWinningNumber(dto.WinningNumber);
        if (!validation.IsValid)
        {
            _logger.LogWarning("Invalid winning number rejected: {WinningNumber} - {Error}", dto.WinningNumber, validation.ErrorMessage);
            return BadRequest(new { message = validation.ErrorMessage });
        }

        // Check if draw exists
        var draw = await _context.Draws.FindAsync(dto.DrawId);
        if (draw == null)
        {
            return BadRequest(new { message = $"Draw with ID {dto.DrawId} not found" });
        }

        // Check if result already exists for this draw and date
        var existingResult = await _context.Results
            .Include(r => r.Draw)
            .FirstOrDefaultAsync(r => r.DrawId == dto.DrawId && r.ResultDate.Date == dto.ResultDate.Date);

        if (existingResult != null)
        {
            // Update existing result
            existingResult.WinningNumber = dto.WinningNumber;
            existingResult.AdditionalNumber = dto.AdditionalNumber;
            existingResult.Position = dto.Position;
            existingResult.UpdatedAt = DateTime.UtcNow;
            existingResult.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated result {ResultId} for draw {DrawId}", existingResult.ResultId, dto.DrawId);

            // Automatically check for winners when result is updated
            var (ticketsProcessed, winnersFound) = await _externalResultsService.ProcessTicketsForDrawAsync(
                dto.DrawId, dto.ResultDate);

            _logger.LogInformation("Processed {TicketsProcessed} tickets for draw {DrawId}, found {WinnersFound} winners",
                ticketsProcessed, dto.DrawId, winnersFound);

            var resultDto = MapToDto(existingResult);
            return Ok(new
            {
                result = resultDto,
                ticketsProcessed,
                winnersFound
            });
        }

        // Create new result
        var result = new Result
        {
            DrawId = dto.DrawId,
            WinningNumber = dto.WinningNumber,
            AdditionalNumber = dto.AdditionalNumber,
            Position = dto.Position,
            ResultDate = dto.ResultDate,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Results.Add(result);
        await _context.SaveChangesAsync();

        // Reload with Draw navigation property
        await _context.Entry(result).Reference(r => r.Draw).LoadAsync();

        _logger.LogInformation("Created result {ResultId} for draw {DrawId}", result.ResultId, dto.DrawId);

        // Automatically check for winners when new result is created
        var (newTicketsProcessed, newWinnersFound) = await _externalResultsService.ProcessTicketsForDrawAsync(
            dto.DrawId, dto.ResultDate);

        _logger.LogInformation("Processed {TicketsProcessed} tickets for draw {DrawId}, found {WinnersFound} winners",
            newTicketsProcessed, dto.DrawId, newWinnersFound);

        var newResultDto = MapToDto(result);
        return Ok(new
        {
            result = newResultDto,
            ticketsProcessed = newTicketsProcessed,
            winnersFound = newWinnersFound
        });
    }

    /// <summary>
    /// Update a result
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateResult(int id, [FromBody] CreateResultDto dto)
    {
        var userId = GetCurrentUserId();

        // Validate winning number format (prevent date-like patterns)
        var validation = ValidateWinningNumber(dto.WinningNumber);
        if (!validation.IsValid)
        {
            _logger.LogWarning("Invalid winning number rejected on update: {WinningNumber} - {Error}", dto.WinningNumber, validation.ErrorMessage);
            return BadRequest(new { message = validation.ErrorMessage });
        }

        var result = await _context.Results
            .Include(r => r.Draw)
            .FirstOrDefaultAsync(r => r.ResultId == id);

        if (result == null)
        {
            return NotFound(new { message = $"Result with ID {id} not found" });
        }

        result.DrawId = dto.DrawId;
        result.WinningNumber = dto.WinningNumber;
        result.AdditionalNumber = dto.AdditionalNumber;
        result.Position = dto.Position;
        result.ResultDate = dto.ResultDate;
        result.UpdatedAt = DateTime.UtcNow;
        result.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated result {ResultId}", id);

        // Automatically check for winners when result is updated
        var (ticketsProcessed, winnersFound) = await _externalResultsService.ProcessTicketsForDrawAsync(
            dto.DrawId, dto.ResultDate);

        _logger.LogInformation("Processed {TicketsProcessed} tickets for draw {DrawId}, found {WinnersFound} winners",
            ticketsProcessed, dto.DrawId, winnersFound);

        var resultDto = MapToDto(result);
        return Ok(new
        {
            result = resultDto,
            ticketsProcessed,
            winnersFound
        });
    }

    /// <summary>
    /// Delete a result
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteResult(int id)
    {
        var result = await _context.Results.FindAsync(id);

        if (result == null)
        {
            return NotFound(new { message = $"Result with ID {id} not found" });
        }

        _context.Results.Remove(result);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted result {ResultId}", id);

        return NoContent();
    }

    /// <summary>
    /// Approve a result
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveResult(int id)
    {
        var userId = GetCurrentUserId();

        var result = await _context.Results
            .Include(r => r.Draw)
            .FirstOrDefaultAsync(r => r.ResultId == id);

        if (result == null)
        {
            return NotFound(new { message = $"Result with ID {id} not found" });
        }

        result.ApprovedAt = DateTime.UtcNow;
        result.ApprovedBy = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Approved result {ResultId}", id);

        return Ok(MapToDto(result));
    }

    /// <summary>
    /// Get result logs for a specific date
    /// </summary>
    [HttpGet("logs")]
    [ProducesResponseType(typeof(List<ResultLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResultLogs([FromQuery] DateTime? date)
    {
        var query = _context.Results
            .Include(r => r.Draw)
            .AsQueryable();

        if (date.HasValue)
        {
            query = query.Where(r => r.ResultDate.Date == date.Value.Date);
        }

        // Get results first
        var results = await query
            .OrderByDescending(r => r.CreatedAt)
            .Take(100)
            .ToListAsync();

        // Get unique user IDs from results
        var userIds = results
            .Where(r => r.CreatedBy.HasValue)
            .Select(r => r.CreatedBy!.Value)
            .Distinct()
            .ToList();

        // Fetch usernames in one query
        var usernames = await _context.Users
            .Where(u => userIds.Contains(u.UserId))
            .ToDictionaryAsync(u => u.UserId, u => u.Username ?? "System");

        // Map to DTOs with real usernames and parsed numbers
        var logs = results.Select(r => {
            var winningNumber = r.WinningNumber ?? "";
            var additionalNumber = r.AdditionalNumber ?? "";

            // Parse winning number into individual components
            // Format: "889475" -> num1=88, num2=94, num3=75
            var num1 = winningNumber.Length >= 2 ? winningNumber.Substring(0, 2) : "";
            var num2 = winningNumber.Length >= 4 ? winningNumber.Substring(2, 2) : "";
            var num3 = winningNumber.Length >= 6 ? winningNumber.Substring(4, 2) : "";

            // Parse additional number for USA lotteries
            // Format: "084017908401" -> cash3=084, play4=0179, pick5=08401
            var cash3 = additionalNumber.Length >= 3 ? additionalNumber.Substring(0, 3) : "";
            var play4 = additionalNumber.Length >= 7 ? additionalNumber.Substring(3, 4) : "";
            var pick5 = additionalNumber.Length >= 12 ? additionalNumber.Substring(7, 5) : "";

            // Calculate derived bet types from Cash3
            // Bolita1 = first 2 digits (e.g., "084" -> "08")
            // Bolita2 = last 2 digits (e.g., "084" -> "84")
            // Singulaccion1/2/3 = individual digits (e.g., "084" -> "0", "8", "4")
            var bolita1 = cash3.Length >= 2 ? cash3.Substring(0, 2) : "";
            var bolita2 = cash3.Length >= 3 ? cash3.Substring(1, 2) : "";
            var singulaccion1 = cash3.Length >= 1 ? cash3.Substring(0, 1) : "";
            var singulaccion2 = cash3.Length >= 2 ? cash3.Substring(1, 1) : "";
            var singulaccion3 = cash3.Length >= 3 ? cash3.Substring(2, 1) : "";

            return new ResultLogDto
            {
                DrawName = r.Draw?.DrawName ?? "Unknown",
                Username = r.CreatedBy.HasValue && usernames.TryGetValue(r.CreatedBy.Value, out var name) ? name : "System",
                ResultDate = r.ResultDate,
                CreatedAt = r.CreatedAt ?? DateTime.UtcNow,
                WinningNumbers = r.WinningNumber ?? "",
                Num1 = num1,
                Num2 = num2,
                Num3 = num3,
                Cash3 = cash3,
                Play4 = play4,
                Pick5 = pick5,
                Bolita1 = bolita1,
                Bolita2 = bolita2,
                Singulaccion1 = singulaccion1,
                Singulaccion2 = singulaccion2,
                Singulaccion3 = singulaccion3
            };
        }).ToList();

        return Ok(logs);
    }

    /// <summary>
    /// Get available draws for results, filtered by date
    /// Shows draws whose scheduled time has passed for the specified date (for entering results)
    /// For draws with UseWeeklySchedule=true, checks weekly schedule; otherwise uses DrawTime for all days
    /// Uses America/Santo_Domingo timezone for time comparison (lottery business timezone)
    /// OPTIMIZED: Filters in SQL using query predicates instead of loading all data to memory
    /// </summary>
    [HttpGet("draws")]
    [ProducesResponseType(typeof(List<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDrawsForResults([FromQuery] DateTime? date)
    {
        // Use lottery business timezone (America/Santo_Domingo) for time comparisons
        var lotteryTimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo");
        var nowInLotteryTz = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, lotteryTimeZone);
        var todayInLotteryTz = nowInLotteryTz.Date;

        var targetDate = date ?? todayInLotteryTz;
        var currentTime = nowInLotteryTz.TimeOfDay;
        var isToday = targetDate.Date == todayInLotteryTz;
        var dayOfWeekByte = (byte)targetDate.DayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday

        _logger.LogInformation("Getting draws for date {Date}, dayOfWeek={DayOfWeek}, current time {Time} (America/Santo_Domingo), isToday={IsToday}",
            targetDate.ToString("yyyy-MM-dd"), dayOfWeekByte, currentTime.ToString(@"hh\:mm\:ss"), isToday);

        // OPTIMIZED: Build query with SQL-side filtering
        var baseQuery = _context.Draws
            .Where(d => d.IsActive == true)
            .AsQueryable();

        // Filter by day of week for draws that use weekly schedules
        // For draws with UseWeeklySchedule=false, they appear every day
        // For draws with UseWeeklySchedule=true, only include if they have an active schedule for this day
        var drawsQuery = baseQuery
            .Where(d => d.UseWeeklySchedule != true ||
                        d.WeeklySchedules.Any(s => s.DayOfWeek == dayOfWeekByte && s.IsActive));

        // OPTIMIZED: Filter by time in SQL for "today" queries
        // Use WeeklySchedule.EndTime when available, otherwise fall back to DrawTime
        if (isToday)
        {
            drawsQuery = drawsQuery.Where(d =>
                // For draws with weekly schedule, use the EndTime of today's schedule
                (d.UseWeeklySchedule == true &&
                 d.WeeklySchedules.Any(s => s.DayOfWeek == dayOfWeekByte && s.IsActive && s.EndTime <= currentTime)) ||
                // For draws without weekly schedule, use DrawTime
                (d.UseWeeklySchedule != true && d.DrawTime <= currentTime));
        }

        // OPTIMIZED: Use projection (Select) before materializing to avoid loading full entities
        var filteredDraws = await drawsQuery
            .OrderBy(d => d.UseWeeklySchedule == true
                ? d.WeeklySchedules.Where(s => s.DayOfWeek == dayOfWeekByte && s.IsActive).Select(s => s.EndTime).FirstOrDefault()
                : d.DrawTime)
            .ThenBy(d => d.DrawName)
            .Select(d => new
            {
                d.DrawId,
                d.DrawName,
                d.Abbreviation,
                DrawTime = d.UseWeeklySchedule == true
                    ? d.WeeklySchedules.Where(s => s.DayOfWeek == dayOfWeekByte && s.IsActive).Select(s => s.EndTime).FirstOrDefault().ToString()
                    : d.DrawTime.ToString(@"hh\:mm\:ss"),
                Color = d.DisplayColor ?? "#37b9f9"
            })
            .ToListAsync();

        _logger.LogInformation("Found {Count} draws after filtering (isToday={IsToday}, currentTime={Time})",
            filteredDraws.Count, isToday, currentTime.ToString(@"hh\:mm\:ss"));

        return Ok(filteredDraws);
    }

    /// <summary>
    /// Manually refresh/fetch external results for a specific date
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshResultsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshResults([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual refresh requested for date {Date}", targetDate.ToString("yyyy-MM-dd"));

        try
        {
            var result = await _externalResultsService.FetchAndProcessResultsAsync(targetDate);

            var response = new RefreshResultsResponse
            {
                Success = result.Success,
                Message = result.Message,
                ResultsFetched = result.ResultsFetched,
                ResultsSaved = result.ResultsSaved,
                TicketsProcessed = result.TicketsProcessed,
                WinnersFound = result.WinnersFound,
                Errors = result.Errors,
                FetchedAt = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during manual refresh");
            return Ok(new RefreshResultsResponse
            {
                Success = false,
                Message = $"Error: {ex.Message}",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Refresh results for a specific draw
    /// </summary>
    [HttpPost("refresh/{drawId}")]
    [ProducesResponseType(typeof(RefreshResultsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshResultForDraw(int drawId, [FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTimeHelper.TodayInBusinessTimezone();

        _logger.LogInformation("Manual refresh requested for draw {DrawId} on {Date}", drawId, targetDate.ToString("yyyy-MM-dd"));

        try
        {
            var result = await _externalResultsService.FetchResultsForDrawAsync(drawId, targetDate);

            var response = new RefreshResultsResponse
            {
                Success = result.Success,
                Message = result.Message,
                ResultsFetched = result.ResultsFetched,
                ResultsSaved = result.ResultsSaved,
                TicketsProcessed = result.TicketsProcessed,
                WinnersFound = result.WinnersFound,
                Errors = result.Errors,
                FetchedAt = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during manual refresh for draw {DrawId}", drawId);
            return Ok(new RefreshResultsResponse
            {
                Success = false,
                Message = $"Error: {ex.Message}",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get draw mappings configuration (for debugging/admin)
    /// </summary>
    [HttpGet("mappings")]
    [ProducesResponseType(typeof(List<DrawMapping>), StatusCodes.Status200OK)]
    public IActionResult GetDrawMappings()
    {
        var mappings = _externalResultsService.GetDrawMappings();
        return Ok(mappings);
    }

    /// <summary>
    /// Reprocess pending tickets that have results available.
    /// Use this to update tickets that were created after results were published.
    /// </summary>
    [HttpPost("reprocess-tickets")]
    [ProducesResponseType(typeof(ReprocessTicketsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReprocessPendingTickets(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        _logger.LogInformation("Reprocess tickets requested from {Start} to {End}",
            startDate?.ToString("yyyy-MM-dd") ?? "7 days ago",
            endDate?.ToString("yyyy-MM-dd") ?? "today");

        try
        {
            var (ticketsProcessed, winnersFound, ticketsUpdated) =
                await _externalResultsService.ReprocessPendingTicketsAsync(startDate, endDate);

            return Ok(new ReprocessTicketsResponse
            {
                Success = true,
                Message = $"Processed {ticketsProcessed} lines, found {winnersFound} winners, updated {ticketsUpdated} tickets",
                LinesProcessed = ticketsProcessed,
                WinnersFound = winnersFound,
                TicketsUpdated = ticketsUpdated,
                ProcessedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reprocessing tickets");
            return Ok(new ReprocessTicketsResponse
            {
                Success = false,
                Message = $"Error: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Sync results from external source (scraped data from original app)
    /// </summary>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(SyncResultsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncResults([FromBody] SyncResultsRequestDto request)
    {
        var userId = GetCurrentUserId();
        var response = new SyncResultsResponseDto
        {
            TotalReceived = request.Results.Count,
            Details = new List<SyncResultDetailDto>()
        };

        _logger.LogInformation("Sync request received with {Count} results for date {Date}",
            request.Results.Count, request.Date.ToString("yyyy-MM-dd"));

        // Get all active draws for matching
        var draws = await _context.Draws
            .Where(d => d.IsActive == true)
            .ToListAsync();

        // Create a dictionary for case-insensitive matching
        var drawsByName = draws.ToDictionary(
            d => d.DrawName.ToUpperInvariant(),
            d => d,
            StringComparer.OrdinalIgnoreCase);

        foreach (var item in request.Results)
        {
            var detail = new SyncResultDetailDto { DrawName = item.Name };

            try
            {
                // Find matching draw by name (case-insensitive)
                var matchingDraw = FindMatchingDraw(draws, item.Name);

                if (matchingDraw == null)
                {
                    detail.Status = "skipped";
                    detail.Error = $"No matching draw found for '{item.Name}'";
                    response.Skipped++;
                    response.Details.Add(detail);
                    continue;
                }

                response.Matched++;

                // Build winning number from num1, num2, num3
                var winningNumber = $"{item.Num1}{item.Num2}{item.Num3}".TrimEnd();
                detail.NewValue = winningNumber;

                // Check if result exists for this draw and date
                var existingResult = await _context.Results
                    .FirstOrDefaultAsync(r => r.DrawId == matchingDraw.DrawId &&
                                              r.ResultDate.Date == request.Date.Date);

                if (existingResult != null)
                {
                    detail.OldValue = existingResult.WinningNumber;

                    // Only update if different
                    if (existingResult.WinningNumber != winningNumber)
                    {
                        existingResult.WinningNumber = winningNumber;
                        existingResult.UpdatedAt = DateTime.UtcNow;
                        existingResult.UpdatedBy = userId;

                        // Build additional number if provided
                        if (!string.IsNullOrEmpty(item.Cash3) || !string.IsNullOrEmpty(item.Play4) || !string.IsNullOrEmpty(item.Pick5))
                        {
                            existingResult.AdditionalNumber = $"{item.Cash3 ?? ""}{item.Play4 ?? ""}{item.Pick5 ?? ""}";
                        }

                        detail.Status = "updated";
                        response.Updated++;
                        _logger.LogInformation("Updated result for {Draw}: {Old} -> {New}",
                            matchingDraw.DrawName, detail.OldValue, winningNumber);
                    }
                    else
                    {
                        detail.Status = "unchanged";
                        response.Skipped++;
                    }
                }
                else
                {
                    // Create new result
                    var newResult = new Result
                    {
                        DrawId = matchingDraw.DrawId,
                        WinningNumber = winningNumber,
                        ResultDate = request.Date,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = userId
                    };

                    // Build additional number if provided
                    if (!string.IsNullOrEmpty(item.Cash3) || !string.IsNullOrEmpty(item.Play4) || !string.IsNullOrEmpty(item.Pick5))
                    {
                        newResult.AdditionalNumber = $"{item.Cash3 ?? ""}{item.Play4 ?? ""}{item.Pick5 ?? ""}";
                    }

                    _context.Results.Add(newResult);
                    detail.Status = "created";
                    response.Created++;
                    _logger.LogInformation("Created result for {Draw}: {Number}",
                        matchingDraw.DrawName, winningNumber);
                }

                response.Details.Add(detail);
            }
            catch (Exception ex)
            {
                detail.Status = "error";
                detail.Error = ex.Message;
                response.Errors.Add($"{item.Name}: {ex.Message}");
                response.Details.Add(detail);
                _logger.LogError(ex, "Error syncing result for {Draw}", item.Name);
            }
        }

        await _context.SaveChangesAsync();

        // Automatically check for winners for all synced results
        var totalTicketsProcessed = 0;
        var totalWinnersFound = 0;

        // Get unique draw IDs that were updated or created
        var processedDrawIds = response.Details
            .Where(d => d.Status == "updated" || d.Status == "created")
            .Select(d => GetDrawIdByName(d.DrawName))
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        foreach (var drawId in processedDrawIds)
        {
            var (ticketsProcessed, winnersFound) = await _externalResultsService.ProcessTicketsForDrawAsync(
                drawId, request.Date);
            totalTicketsProcessed += ticketsProcessed;
            totalWinnersFound += winnersFound;
        }

        _logger.LogInformation("Processed {TicketsProcessed} tickets across {DrawCount} draws, found {WinnersFound} winners",
            totalTicketsProcessed, processedDrawIds.Count, totalWinnersFound);

        response.Success = response.Errors.Count == 0;
        response.Message = $"Sync completed: {response.Updated} updated, {response.Created} created, {response.Skipped} skipped, {totalWinnersFound} winners found";
        response.TicketsProcessed = totalTicketsProcessed;
        response.WinnersFound = totalWinnersFound;

        _logger.LogInformation("Sync completed: {Message}", response.Message);

        return Ok(response);
    }

    /// <summary>
    /// Get draw ID by name for winner processing
    /// </summary>
    private int? GetDrawIdByName(string drawName)
    {
        return _context.Draws
            .Where(d => d.DrawName == drawName && d.IsActive == true)
            .Select(d => (int?)d.DrawId)
            .FirstOrDefault();
    }

    /// <summary>
    /// Find a matching draw by name with fuzzy matching
    /// </summary>
    private Models.Draw? FindMatchingDraw(List<Models.Draw> draws, string name)
    {
        var upperName = name.ToUpperInvariant();

        // Exact match first
        var exact = draws.FirstOrDefault(d =>
            d.DrawName.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (exact != null) return exact;

        // Try contains match
        var contains = draws.FirstOrDefault(d =>
            d.DrawName.ToUpperInvariant().Contains(upperName) ||
            upperName.Contains(d.DrawName.ToUpperInvariant()));
        if (contains != null) return contains;

        // Special mappings for common name variations
        var mappings = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            { "King Lottery AM", new[] { "KING LOTTERY", "KING AM" } },
            { "King Lottery PM", new[] { "KING PM" } },
            { "LA PRIMERA", new[] { "PRIMERA" } },
            { "LA PRIMERA 7PM", new[] { "PRIMERA 7PM", "PRIMERA PM" } },
            { "LA SUERTE", new[] { "SUERTE" } },
            { "LA SUERTE 6:00pm", new[] { "SUERTE 6PM", "SUERTE PM" } },
            { "GANA MAS", new[] { "GANAMAS" } },
            { "Anguila 10am", new[] { "ANGUILA AM", "ANGUILA 10" } },
            { "Anguila 1pm", new[] { "ANGUILA 1PM", "ANGUILA PM" } },
            { "Anguila 6PM", new[] { "ANGUILA NOCHE", "ANGUILA 6" } },
            { "SUPER PALE TARDE", new[] { "SUPER PALE", "PALE TARDE" } },
            { "SUPER PALE NY-FL AM", new[] { "PALE NY FL", "NY FL AM" } },
            { "FL PICK2 AM", new[] { "FLORIDA PICK2", "FL PICK 2" } },
            { "NEW YORK DAY", new[] { "NY DAY", "NEW YORK AM" } },
            { "FLORIDA AM", new[] { "FL AM" } },
            { "TEXAS DAY", new[] { "TX DAY" } },
            { "TEXAS MORNING", new[] { "TX MORNING", "TX AM" } },
            { "GEORGIA-MID AM", new[] { "GEORGIA AM", "GA AM" } },
            { "NEW JERSEY AM", new[] { "NJ AM" } },
            { "CONNECTICUT AM", new[] { "CT AM" } },
            { "PENN MIDDAY", new[] { "PA MIDDAY", "PENN AM" } },
            { "MARYLAND MIDDAY", new[] { "MD MIDDAY", "MARYLAND AM" } },
            { "VIRGINIA AM", new[] { "VA AM" } },
            { "DELAWARE AM", new[] { "DE AM" } },
            { "SOUTH CAROLINA AM", new[] { "SC AM" } },
            { "NORTH CAROLINA AM", new[] { "NC AM" } },
            { "CHICAGO AM", new[] { "IL AM", "ILLINOIS AM" } },
            { "CALIFORNIA AM", new[] { "CA AM" } },
            { "MASS AM", new[] { "MA AM", "MASSACHUSETTS AM" } },
            { "INDIANA MIDDAY", new[] { "IN MIDDAY", "INDIANA AM" } },
            { "DIARIA 11AM", new[] { "DIARIA AM", "DIARIA 11" } },
            { "DIARIA 3PM", new[] { "DIARIA PM", "DIARIA 3" } },
        };

        // Check if input matches any alias
        foreach (var mapping in mappings)
        {
            if (upperName.Contains(mapping.Key.ToUpperInvariant()) ||
                mapping.Value.Any(alias => upperName.Contains(alias.ToUpperInvariant())))
            {
                var match = draws.FirstOrDefault(d =>
                    d.DrawName.Equals(mapping.Key, StringComparison.OrdinalIgnoreCase) ||
                    d.DrawName.ToUpperInvariant().Contains(mapping.Key.ToUpperInvariant()));
                if (match != null) return match;
            }
        }

        return null;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Validate winning number format to prevent date-like patterns (e.g., "202512" which looks like YYYYMM)
    /// </summary>
    private (bool IsValid, string? ErrorMessage) ValidateWinningNumber(string? winningNumber)
    {
        if (string.IsNullOrEmpty(winningNumber))
        {
            return (true, null); // Empty is valid (no result yet)
        }

        // Only allow digits
        if (!System.Text.RegularExpressions.Regex.IsMatch(winningNumber, @"^\d+$"))
        {
            return (false, "Winning number must contain only digits");
        }

        // Check for YYYYMM patterns like "202512" (2025-12) - likely a date mistakenly entered
        if (System.Text.RegularExpressions.Regex.IsMatch(winningNumber, @"^202[45]\d{2}$"))
        {
            return (false, $"Winning number '{winningNumber}' looks like a date (YYYYMM format). Please enter valid lottery numbers.");
        }

        // Check for MMYYYY patterns
        if (System.Text.RegularExpressions.Regex.IsMatch(winningNumber, @"^\d{2}202[45]$"))
        {
            return (false, $"Winning number '{winningNumber}' looks like a date (MMYYYY format). Please enter valid lottery numbers.");
        }

        // Check for YYYYMMDD patterns
        if (System.Text.RegularExpressions.Regex.IsMatch(winningNumber, @"^202[45](0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$"))
        {
            return (false, $"Winning number '{winningNumber}' looks like a date (YYYYMMDD format). Please enter valid lottery numbers.");
        }

        return (true, null);
    }

    private static ResultDto MapToDto(Result result)
    {
        var winningNumber = result.WinningNumber ?? "";

        // Parse winning number into individual components
        // Format: "889475" -> num1=88, num2=94, num3=75
        var num1 = "";
        var num2 = "";
        var num3 = "";
        var cash3 = "";
        var play4 = "";
        var pick5 = "";

        if (winningNumber.Length >= 2)
        {
            num1 = winningNumber.Substring(0, 2);
        }
        if (winningNumber.Length >= 4)
        {
            num2 = winningNumber.Substring(2, 2);
        }
        if (winningNumber.Length >= 6)
        {
            num3 = winningNumber.Substring(4, 2);
        }

        // Additional number might contain cash3, play4, pick5
        var additionalNumber = result.AdditionalNumber ?? "";
        if (additionalNumber.Length >= 3)
        {
            cash3 = additionalNumber.Substring(0, 3);
        }
        if (additionalNumber.Length >= 7)
        {
            play4 = additionalNumber.Substring(3, 4);
        }
        if (additionalNumber.Length >= 12)
        {
            pick5 = additionalNumber.Substring(7, 5);
        }

        // Calculate derived bet types from Cash3 for USA lotteries
        // Bolita1 = first 2 digits (e.g., "084" -> "08")
        // Bolita2 = last 2 digits (e.g., "084" -> "84")
        // Singulaccion1/2/3 = individual digits (e.g., "084" -> "0", "8", "4")
        var bolita1 = cash3.Length >= 2 ? cash3.Substring(0, 2) : "";
        var bolita2 = cash3.Length >= 3 ? cash3.Substring(1, 2) : "";
        var singulaccion1 = cash3.Length >= 1 ? cash3.Substring(0, 1) : "";
        var singulaccion2 = cash3.Length >= 2 ? cash3.Substring(1, 1) : "";
        var singulaccion3 = cash3.Length >= 3 ? cash3.Substring(2, 1) : "";

        return new ResultDto
        {
            ResultId = result.ResultId,
            DrawId = result.DrawId,
            DrawName = result.Draw?.DrawName ?? "Unknown",
            Abbreviation = result.Draw?.Abbreviation,
            WinningNumber = result.WinningNumber,
            AdditionalNumber = result.AdditionalNumber,
            Position = result.Position,
            ResultDate = result.ResultDate,
            CreatedAt = result.CreatedAt,
            CreatedBy = result.CreatedBy,
            UpdatedAt = result.UpdatedAt,
            ApprovedAt = result.ApprovedAt,
            ApprovedBy = result.ApprovedBy,
            Num1 = num1,
            Num2 = num2,
            Num3 = num3,
            Cash3 = cash3,
            Play4 = play4,
            Pick5 = pick5,
            Bolita1 = bolita1,
            Bolita2 = bolita2,
            Singulaccion1 = singulaccion1,
            Singulaccion2 = singulaccion2,
            Singulaccion3 = singulaccion3
        };
    }

    /// <summary>
    /// Map Result and Draw to ResultDto (optimized version for projections)
    /// Used when Result and Draw are already loaded separately to avoid navigation property access
    /// </summary>
    private static ResultDto MapToDtoFromProjection(Result result, Draw draw)
    {
        var winningNumber = result.WinningNumber ?? "";

        // Parse winning number into individual components
        // Format: "889475" -> num1=88, num2=94, num3=75
        var num1 = winningNumber.Length >= 2 ? winningNumber.Substring(0, 2) : "";
        var num2 = winningNumber.Length >= 4 ? winningNumber.Substring(2, 2) : "";
        var num3 = winningNumber.Length >= 6 ? winningNumber.Substring(4, 2) : "";

        // Additional number might contain cash3, play4, pick5
        var additionalNumber = result.AdditionalNumber ?? "";
        var cash3 = additionalNumber.Length >= 3 ? additionalNumber.Substring(0, 3) : "";
        var play4 = additionalNumber.Length >= 7 ? additionalNumber.Substring(3, 4) : "";
        var pick5 = additionalNumber.Length >= 12 ? additionalNumber.Substring(7, 5) : "";

        // Calculate derived bet types from Cash3 for USA lotteries
        var bolita1 = cash3.Length >= 2 ? cash3.Substring(0, 2) : "";
        var bolita2 = cash3.Length >= 3 ? cash3.Substring(1, 2) : "";
        var singulaccion1 = cash3.Length >= 1 ? cash3.Substring(0, 1) : "";
        var singulaccion2 = cash3.Length >= 2 ? cash3.Substring(1, 1) : "";
        var singulaccion3 = cash3.Length >= 3 ? cash3.Substring(2, 1) : "";

        return new ResultDto
        {
            ResultId = result.ResultId,
            DrawId = result.DrawId,
            DrawName = draw.DrawName,
            Abbreviation = draw.Abbreviation,
            WinningNumber = result.WinningNumber,
            AdditionalNumber = result.AdditionalNumber,
            Position = result.Position,
            ResultDate = result.ResultDate,
            CreatedAt = result.CreatedAt,
            CreatedBy = result.CreatedBy,
            UpdatedAt = result.UpdatedAt,
            ApprovedAt = result.ApprovedAt,
            ApprovedBy = result.ApprovedBy,
            Num1 = num1,
            Num2 = num2,
            Num3 = num3,
            Cash3 = cash3,
            Play4 = play4,
            Pick5 = pick5,
            Bolita1 = bolita1,
            Bolita2 = bolita2,
            Singulaccion1 = singulaccion1,
            Singulaccion2 = singulaccion2,
            Singulaccion3 = singulaccion3
        };
    }
}
