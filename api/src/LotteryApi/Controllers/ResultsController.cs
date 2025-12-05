using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
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
        var targetDate = date ?? DateTime.Today;

        var query = _context.Results
            .Include(r => r.Draw)
            .Where(r => r.ResultDate.Date == targetDate.Date)
            .AsQueryable();

        if (drawId.HasValue)
        {
            query = query.Where(r => r.DrawId == drawId.Value);
        }

        var results = await query
            .OrderBy(r => r.Draw!.DrawName)
            .Select(r => MapToDto(r))
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

            return Ok(MapToDto(existingResult));
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

        return Ok(MapToDto(result));
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

        return Ok(MapToDto(result));
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

        var logs = await query
            .OrderByDescending(r => r.CreatedAt)
            .Take(100)
            .Select(r => new ResultLogDto
            {
                DrawName = r.Draw != null ? r.Draw.DrawName : "Unknown",
                Username = "System", // TODO: Join with users table
                ResultDate = r.ResultDate,
                CreatedAt = r.CreatedAt,
                WinningNumbers = r.WinningNumber
            })
            .ToListAsync();

        return Ok(logs);
    }

    /// <summary>
    /// Get available draws for results
    /// </summary>
    [HttpGet("draws")]
    [ProducesResponseType(typeof(List<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDrawsForResults()
    {
        var draws = await _context.Draws
            .Where(d => d.IsActive == true)
            .OrderBy(d => d.DrawName)
            .Select(d => new
            {
                d.DrawId,
                d.DrawName,
                d.Abbreviation
            })
            .ToListAsync();

        return Ok(draws);
    }

    /// <summary>
    /// Manually refresh/fetch external results for a specific date
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshResultsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshResults([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.Today;

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
        var targetDate = date ?? DateTime.Today;

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

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
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

        return new ResultDto
        {
            ResultId = result.ResultId,
            DrawId = result.DrawId,
            DrawName = result.Draw?.DrawName ?? "Unknown",
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
            Pick5 = pick5
        };
    }
}
