using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Models.Enums;
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
    /// Reserve limit availability for a play (3-min TTL).
    /// Call this when a bet is added to the ticket (before printing).
    /// </summary>
    public async Task ReservePlay(ReservePlayRequest request)
    {
        var reservationId = _limitReservationService.Reserve(
            request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount);

        _logger.LogInformation(
            "ReservePlay: Draw={DrawId}, GameType={GameTypeId}, Pool={BettingPoolId}, Amount={Amount} -> {ReservationId}",
            request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount, reservationId);

        await Clients.Caller.Notify(new GenericNotification
        {
            EventName = "PlayReserved",
            Data = new Dictionary<string, object>
            {
                ["reservationId"] = reservationId,
                ["drawId"] = request.DrawId,
                ["gameTypeId"] = request.GameTypeId,
                ["amount"] = request.Amount
            }
        });
    }

    /// <summary>
    /// Release a previously made reservation (e.g., when bet is removed from ticket).
    /// </summary>
    public async Task ReleaseReservation(string reservationId)
    {
        var released = _limitReservationService.Release(reservationId);
        _logger.LogDebug("ReleaseReservation: {Id} -> {Released}", reservationId, released);

        await Clients.Caller.Notify(new GenericNotification
        {
            EventName = "ReservationReleased",
            Data = new Dictionary<string, object>
            {
                ["reservationId"] = reservationId,
                ["released"] = released
            }
        });
    }

    /// <summary>
    /// Check play limit availability for a single bet.
    /// Client sends: { "target": "CheckPlayLimit", "arguments": [{ "betNumber": "12", "gameTypeId": 1, "drawId": 167, "bettingPoolId": 9 }] }
    /// Response: PlayLimitAvailability
    /// </summary>
    public async Task CheckPlayLimit(CheckPlayLimitRequest request)
    {
        var userId = Context.User?.FindFirst("sub")?.Value
            ?? Context.User?.FindFirst("userId")?.Value;

        var bettingPoolId = request.BettingPoolId;
        if (bettingPoolId <= 0)
        {
            var bpClaim = Context.User?.FindFirst("bettingPoolId")?.Value;
            if (!string.IsNullOrEmpty(bpClaim) && int.TryParse(bpClaim, out var bpFromClaim))
                bettingPoolId = bpFromClaim;
        }

        var betNumber = request.BetNumber.Trim();
        var gameTypeId = request.GameTypeId;
        var drawId = request.DrawId;
        var today = DateOnly.FromDateTime(DateTime.Today);
        var now = DateTime.UtcNow;

        _logger.LogInformation(
            "CheckPlayLimit: User={UserId}, Bet={BetNumber}, GameType={GameTypeId}, Draw={DrawId}, Pool={BettingPoolId}",
            userId, betNumber, gameTypeId, drawId, bettingPoolId);

        var draw = await _context.Draws
            .AsNoTracking()
            .Where(d => d.DrawId == drawId)
            .FirstOrDefaultAsync();

        if (draw == null)
        {
            await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
            {
                BetNumber = betNumber,
                GameTypeId = gameTypeId,
                DrawId = drawId
            });
            return;
        }

        // Find the most specific limit rule: Banca > Local Banca > Zona > Global
        // Must filter by the correct entity at each level
        var bettingPool = await _context.BettingPools
            .AsNoTracking()
            .Where(bp => bp.BettingPoolId == bettingPoolId)
            .Select(bp => new { bp.BettingPoolId, bp.ZoneId })
            .FirstOrDefaultAsync();

        var zoneId = bettingPool?.ZoneId ?? 0;

        // Check day bitmask for today
        var todayDow = (int)now.DayOfWeek; // 0=Sun, 1=Mon...6=Sat
        var dayBit = todayDow switch
        {
            1 => 1,   // Monday
            2 => 2,   // Tuesday
            3 => 4,   // Wednesday
            4 => 8,   // Thursday
            5 => 16,  // Friday
            6 => 32,  // Saturday
            0 => 64,  // Sunday
            _ => 0
        };

        // Try each level in priority order
        LimitRule? limitRule = null;

        // 1. Limite Banca (GeneralForBettingPool) — for this specific banca
        limitRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == LimitType.GeneralForBettingPool
                && lr.BettingPoolId == bettingPoolId
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();

        // 2. Limite Local Banca (LocalForBettingPool) — for this specific banca
        if (limitRule == null)
        {
            limitRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == LimitType.LocalForBettingPool
                    && lr.BettingPoolId == bettingPoolId
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
        }

        // 3. Limite Zona (GeneralForZone) — for this banca's zone
        // Only check zona if no banca-level limit was found
        if (limitRule == null && zoneId > 0)
        {
            limitRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == LimitType.GeneralForZone
                    && lr.ZoneId == zoneId
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
        }

        // No banca or zona limit found — banca cannot sell (no limit configured = blocked)
        // Global is only consumed through zona/banca, not directly

        if (limitRule == null)
        {
            await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
            {
                BetNumber = betNumber,
                GameTypeId = gameTypeId,
                DrawId = drawId,
                DrawName = draw.DrawName,
                AvailableAmount = 0,
                LimitAmount = 0,
                CurrentAmount = 0,
                PercentageUsed = 100,
                IsBlocked = true
            });
            return;
        }

        var limitAmount = await _context.LimitRuleAmounts
            .AsNoTracking()
            .Where(a => a.LimitRuleId == limitRule.LimitRuleId && a.GameTypeId == gameTypeId)
            .Select(a => a.MaxAmount)
            .FirstOrDefaultAsync();

        // Sum consumption: for zona limits, sum ALL bancas in that zone
        var consumptionQuery = _context.LimitConsumptions
            .AsNoTracking()
            .Where(lc => lc.DrawId == drawId
                && lc.DrawDate == today
                && lc.LimitRuleId == limitRule.LimitRuleId);

        // Zona limits aggregate across all bancas; banca limits only for this banca
        if (limitRule.LimitType != LimitType.GeneralForZone)
        {
            consumptionQuery = consumptionQuery.Where(lc => lc.BettingPoolId == bettingPoolId);
        }

        var currentAmount = await consumptionQuery.SumAsync(lc => (decimal?)lc.CurrentAmount) ?? 0;

        var reservedAmount = _limitReservationService.GetReservedAmount(drawId, gameTypeId);
        var totalUsed = currentAmount + reservedAmount;
        var availableAmount = limitAmount > 0 ? limitAmount - totalUsed : 0;
        var percentageUsed = limitAmount > 0 ? (totalUsed / limitAmount) * 100 : 0;
        var isBlocked = limitAmount > 0 && totalUsed >= limitAmount;

        await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
        {
            BetNumber = betNumber,
            GameTypeId = gameTypeId,
            DrawId = drawId,
            DrawName = draw.DrawName,
            AvailableAmount = Math.Max(0, availableAmount),
            LimitAmount = limitAmount,
            CurrentAmount = currentAmount,
            PercentageUsed = Math.Round(percentageUsed, 2),
            IsBlocked = isBlocked
        });
    }
}

// ==================== REQUEST/RESPONSE CLASSES ====================

/// <summary>
/// Request for CheckPlayLimit hub method.
/// </summary>
public class ReservePlayRequest
{
    public int DrawId { get; set; }
    public int GameTypeId { get; set; }
    public int BettingPoolId { get; set; }
    public decimal Amount { get; set; }
}

public class CheckPlayLimitRequest
{
    /// <summary>The bet number (e.g., "12", "1234", "101")</summary>
    public string BetNumber { get; set; } = string.Empty;

    /// <summary>Game type ID from game_types table</summary>
    public int GameTypeId { get; set; }

    /// <summary>Draw ID to check</summary>
    public int DrawId { get; set; }

    /// <summary>Betting pool ID making the request</summary>
    public int BettingPoolId { get; set; }
}
