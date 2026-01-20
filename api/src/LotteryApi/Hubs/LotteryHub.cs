using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LotteryApi.Hubs;

/// <summary>
/// Main SignalR Hub for real-time lottery notifications.
/// Handles connections, group management, and message broadcasting.
/// </summary>
[Authorize]
public class LotteryHub : Hub<ILotteryHubClient>
{
    private readonly ILogger<LotteryHub> _logger;

    public LotteryHub(ILogger<LotteryHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// Automatically joins user to their betting pool group if available.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value
            ?? Context.User?.FindFirst("userId")?.Value;
        var bettingPoolId = Context.User?.FindFirst("bettingPoolId")?.Value;

        _logger.LogInformation(
            "Client connected: ConnectionId={ConnectionId}, UserId={UserId}, BettingPoolId={BettingPoolId}",
            Context.ConnectionId, userId, bettingPoolId);

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
}
