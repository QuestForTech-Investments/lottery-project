using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/login-sessions")]
[Authorize]
public class LoginSessionsController : ControllerBase
{
    private readonly ILoginSessionService _loginSessionService;
    private readonly ILogger<LoginSessionsController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public LoginSessionsController(ILoginSessionService loginSessionService, ILogger<LoginSessionsController> logger, IZoneScopeService zoneScope)
    {
        _loginSessionService = loginSessionService;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    /// <summary>
    /// Clamps the user-supplied zone filter to the admin's allowed zones.
    /// If the admin has no scope (super-admin), passes through unchanged.
    /// </summary>
    private async Task<List<int>?> ClampZoneIdsAsync(List<int>? requested)
    {
        var allowed = await _zoneScope.GetAllowedZoneIdsAsync();
        if (allowed == null) return requested;
        if (requested == null || requested.Count == 0) return allowed;
        var intersected = requested.Where(allowed.Contains).ToList();
        return intersected.Count > 0 ? intersected : new List<int> { -1 };  // -1 = no match → empty result
    }

    /// <summary>
    /// Get login sessions for a specific date with optional zone filters
    /// </summary>
    /// <param name="date">Date to query (defaults to today)</param>
    /// <param name="zoneIds">Optional comma-separated zone IDs to filter</param>
    /// <param name="searchText">Optional search text for banca/user</param>
    /// <param name="page">Page number (default 1)</param>
    /// <param name="pageSize">Page size (default 100)</param>
    /// <returns>Login sessions grouped by banca with IP collision detection</returns>
    [HttpGet]
    [ProducesResponseType(typeof(LoginSessionsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLoginSessions(
        [FromQuery] DateTime? date,
        [FromQuery] string? zoneIds,
        [FromQuery] string? searchText,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var requestedZones = string.IsNullOrWhiteSpace(zoneIds)
            ? null
            : zoneIds.Split(',').Select(int.Parse).ToList();

        var query = new LoginSessionQueryDto
        {
            Date = date,
            ZoneIds = await ClampZoneIdsAsync(requestedZones),
            SearchText = searchText,
            Page = page,
            PageSize = pageSize
        };

        var result = await _loginSessionService.GetLoginSessionsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get login sessions for today (convenience endpoint)
    /// </summary>
    [HttpGet("today")]
    [ProducesResponseType(typeof(LoginSessionsResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodayLoginSessions(
        [FromQuery] string? zoneIds,
        [FromQuery] string? searchText)
    {
        var requestedZones = string.IsNullOrWhiteSpace(zoneIds)
            ? null
            : zoneIds.Split(',').Select(int.Parse).ToList();

        var query = new LoginSessionQueryDto
        {
            Date = DateTimeHelper.TodayInBusinessTimezone(),
            ZoneIds = await ClampZoneIdsAsync(requestedZones),
            SearchText = searchText,
            Page = 1,
            PageSize = 1000
        };

        var result = await _loginSessionService.GetLoginSessionsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// End a specific login session (logout)
    /// </summary>
    [HttpPost("{sessionId}/logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EndSession(int sessionId)
    {
        await _loginSessionService.EndLoginSessionAsync(sessionId);
        return Ok(new { message = "Session ended successfully" });
    }
}
