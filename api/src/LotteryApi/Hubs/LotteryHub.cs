using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Hubs;

/// <summary>
/// Main SignalR Hub for real-time lottery notifications.
/// Handles connections, group management, and message broadcasting.
/// </summary>
[Authorize]
public class LotteryHub : Hub<ILotteryHubClient>
{
    private readonly ILogger<LotteryHub> _logger;
    private readonly LotteryDbContext _context;
    private readonly ILimitReservationService _limitReservationService;

    public LotteryHub(ILogger<LotteryHub> logger, LotteryDbContext context, ILimitReservationService limitReservationService)
    {
        _logger = logger;
        _context = context;
        _limitReservationService = limitReservationService;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// Automatically joins user to their betting pool group if available.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        // Claims use original JWT names (mapping disabled in Program.cs)
        var userId = Context.User?.FindFirst("userId")?.Value;
        var username = Context.User?.FindFirst("username")?.Value;
        var bettingPoolId = Context.User?.FindFirst("bettingPoolId")?.Value;
        _logger.LogInformation(
            "Client connected: ConnectionId={ConnectionId}, UserId={UserId}, Username={Username}, BettingPoolId={BettingPoolId}",
            Context.ConnectionId, userId, username, bettingPoolId);

        // Join user-specific group
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        // Join betting pool group if user belongs to one
        if (!string.IsNullOrEmpty(bettingPoolId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"bettingpool_{bettingPoolId}");
        }

        // Join global group for system-wide announcements
        await Groups.AddToGroupAsync(Context.ConnectionId, "global");

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value
            ?? Context.User?.FindFirst("userId")?.Value;

        if (exception != null)
        {
            _logger.LogWarning(
                exception,
                "Client disconnected with error: ConnectionId={ConnectionId}, UserId={UserId}",
                Context.ConnectionId, userId);
        }
        else
        {
            _logger.LogInformation(
                "Client disconnected: ConnectionId={ConnectionId}, UserId={UserId}",
                Context.ConnectionId, userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a specific draw group to receive updates for that draw.
    /// </summary>
    /// <param name="drawId">The draw ID to subscribe to</param>
    public async Task JoinDrawGroup(int drawId)
    {
        var groupName = $"draw_{drawId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation(
            "Client joined draw group: ConnectionId={ConnectionId}, DrawId={DrawId}",
            Context.ConnectionId, drawId);
    }

    /// <summary>
    /// Leave a specific draw group.
    /// </summary>
    /// <param name="drawId">The draw ID to unsubscribe from</param>
    public async Task LeaveDrawGroup(int drawId)
    {
        var groupName = $"draw_{drawId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation(
            "Client left draw group: ConnectionId={ConnectionId}, DrawId={DrawId}",
            Context.ConnectionId, drawId);
    }

    /// <summary>
    /// Join a zone group to receive zone-specific updates.
    /// </summary>
    /// <param name="zoneId">The zone ID to subscribe to</param>
    public async Task JoinZoneGroup(int zoneId)
    {
        var groupName = $"zone_{zoneId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation(
            "Client joined zone group: ConnectionId={ConnectionId}, ZoneId={ZoneId}",
            Context.ConnectionId, zoneId);
    }

    /// <summary>
    /// Leave a zone group.
    /// </summary>
    /// <param name="zoneId">The zone ID to unsubscribe from</param>
    public async Task LeaveZoneGroup(int zoneId)
    {
        var groupName = $"zone_{zoneId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation(
            "Client left zone group: ConnectionId={ConnectionId}, ZoneId={ZoneId}",
            Context.ConnectionId, zoneId);
    }

    /// <summary>
    /// Join multiple draw groups at once (useful for monitoring multiple draws).
    /// </summary>
    /// <param name="drawIds">List of draw IDs to subscribe to</param>
    public async Task JoinMultipleDrawGroups(int[] drawIds)
    {
        foreach (var drawId in drawIds)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"draw_{drawId}");
        }

        _logger.LogInformation(
            "Client joined multiple draw groups: ConnectionId={ConnectionId}, DrawIds={DrawIds}",
            Context.ConnectionId, string.Join(",", drawIds));
    }

    /// <summary>
    /// Ping method to verify connection is alive.
    /// </summary>
    public async Task Ping()
    {
        await Clients.Caller.Pong(DateTime.UtcNow);
    }

    /// <summary>
    /// Request play limit availability for specific draws.
    /// Client sends: {"target": "PlayLimitUpdate", "arguments": [{"play": "n"}, {"draws": [drawId] }] }
    /// </summary>
    /// <param name="playRequest">Object containing the play number</param>
    /// <param name="drawsRequest">Object containing the draw IDs</param>
    public async Task PlayLimitUpdate(PlayLimitUpdatePlayParam playRequest, PlayLimitUpdateDrawsParam drawsRequest)
    {
        var userId = Context.User?.FindFirst("sub")?.Value
            ?? Context.User?.FindFirst("userId")?.Value;
        var bettingPoolIdStr = Context.User?.FindFirst("bettingPoolId")?.Value;

        if (string.IsNullOrEmpty(bettingPoolIdStr) || !int.TryParse(bettingPoolIdStr, out var bettingPoolId))
        {
            _logger.LogWarning("PlayLimitUpdate: No valid bettingPoolId found for user {UserId}", userId);
            return;
        }

        _logger.LogInformation(
            "PlayLimitUpdate requested: ConnectionId={ConnectionId}, UserId={UserId}, Play={Play}, Draws={Draws}",
            Context.ConnectionId, userId, playRequest.Play, string.Join(",", drawsRequest.Draws));

        // Convert play number to pattern (e.g., "123" -> "###", "12" -> "##")
        var playNumber = playRequest.Play.Trim();
        var playPattern = new string('#', playNumber.Length);
        var today = DateOnly.FromDateTime(DateTime.Today);

        var drawsAvailability = new List<DrawAvailability>();

        foreach (var drawId in drawsRequest.Draws)
        {
            // Get the draw with its limit rules
            var draw = await _context.Draws
                .Where(d => d.DrawId == drawId
                    && d.BettingPoolDraws!.Any(bpd => bpd.BettingPoolId == bettingPoolId))
                .FirstOrDefaultAsync();

            if (draw == null)
            {
                continue;
            }

            // Find the applicable limit rule for this play pattern
            // Priority: specific number > pattern > global (null pattern)
            var limitRule = await _context.LimitRules
                .Where(lr => lr.IsActive
                    && (lr.DrawId == drawId || lr.DrawId == null)
                    && (lr.BetNumberPattern == playNumber || lr.BetNumberPattern == playPattern || lr.BetNumberPattern == null)
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= DateTime.Now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= DateTime.Now))
                .OrderByDescending(lr => lr.BetNumberPattern == playNumber ? 3 : lr.BetNumberPattern == playPattern ? 2 : 1)
                .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
                .ThenByDescending(lr => lr.Priority ?? 0)
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                // No limit rule found, unlimited availability
                drawsAvailability.Add(new DrawAvailability
                {
                    DrawId = drawId,
                    DrawName = draw.DrawName,
                    AvailableAmount = -1, // -1 indicates unlimited
                    LimitAmount = 0,
                    CurrentAmount = 0,
                    PercentageUsed = 0,
                    IsBlocked = false
                });
                continue;
            }

            // Get current consumption for this play number
            var consumption = await _context.LimitConsumptions
                .Where(lc => lc.DrawId == drawId
                    && lc.DrawDate == today
                    && lc.BetNumber == playNumber
                    && (lc.BettingPoolId == bettingPoolId || lc.BettingPoolId == null))
                .FirstOrDefaultAsync();

            // Determine the applicable limit based on the limit rule
            var maxLimit = limitRule.MaxBetPerNumber
                ?? limitRule.MaxBetPerBettingPool
                ?? limitRule.MaxBetGlobal
                ?? 0;

            var currentAmount = consumption?.CurrentAmount ?? 0;
            var reservedAmount = _limitReservationService.GetReservedAmount(drawId, playNumber);
            var totalUsed = currentAmount + reservedAmount;
            var availableAmount = maxLimit > 0 ? maxLimit - totalUsed : 0;
            var percentageUsed = maxLimit > 0 ? (totalUsed / maxLimit) * 100 : 0;
            var isBlocked = consumption?.IsAtLimit ?? false || (maxLimit > 0 && totalUsed > maxLimit);

            drawsAvailability.Add(new DrawAvailability
            {
                DrawId = drawId,
                DrawName = draw.DrawName,
                AvailableAmount = Math.Max(0, availableAmount),
                LimitAmount = maxLimit,
                CurrentAmount = currentAmount,
                PercentageUsed = Math.Round(percentageUsed, 2),
                IsBlocked = isBlocked
            });
        }

        var response = new PlayLimitAvailabilityResponse
        {
            Play = playRequest.Play,
            DrawsAvailability = drawsAvailability
        };

        // Send response only to the caller
        await Clients.Caller.PlayLimitAvailability(response);
    }
}

// ==================== PLAY LIMIT UPDATE PARAMETER CLASSES ====================

/// <summary>
/// Parameter class for play in PlayLimitUpdate.
/// </summary>
public class PlayLimitUpdatePlayParam
{
    public string Play { get; set; } = string.Empty;
}

/// <summary>
/// Parameter class for draws in PlayLimitUpdate.
/// </summary>
public class PlayLimitUpdateDrawsParam
{
    public List<int> Draws { get; set; } = new();
}
