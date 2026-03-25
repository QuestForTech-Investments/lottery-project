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
            request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount, request.BetNumber);

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
    /// Get play stats: quantity of plays today, amount sold in group, amount sold in banca.
    /// Client sends: { "target": "GetPlayStats", "arguments": [{ "betNumber": "12", "gameTypeId": 1, "drawId": 167, "bettingPoolId": 9 }] }
    /// </summary>
    public async Task GetPlayStats(GetPlayStatsRequest request)
    {
        var betNumber = request.BetNumber?.Trim() ?? "";
        var gameTypeId = request.GameTypeId;
        var drawId = request.DrawId;
        var bettingPoolId = request.BettingPoolId;

        var today = DateOnly.FromDateTime(Helpers.DateTimeHelper.TodayInBusinessTimezone());

        // Query ticket lines for today matching this number + game type + draw
        var query = _context.Set<Models.TicketLine>()
            .AsNoTracking()
            .Where(tl => tl.BetNumber == betNumber
                && tl.BetTypeId == gameTypeId
                && tl.DrawId == drawId
                && tl.DrawDate.Date == today.ToDateTime(TimeOnly.MinValue)
                && tl.Ticket != null && !tl.Ticket.IsCancelled);

        // Global level: all bancas
        var groupStats = await query
            .GroupBy(tl => 1)
            .Select(g => new { Count = g.Count(), Total = g.Sum(tl => tl.BetAmount) })
            .FirstOrDefaultAsync();

        // Banca level: just this banca
        var bancaStats = await query
            .Where(tl => tl.Ticket!.BettingPoolId == bettingPoolId)
            .GroupBy(tl => 1)
            .Select(g => new { Count = g.Count(), Total = g.Sum(tl => tl.BetAmount) })
            .FirstOrDefaultAsync();

        await Clients.Caller.PlayStats(new PlayStatsResponse
        {
            BetNumber = betNumber,
            GameTypeId = gameTypeId,
            DrawId = drawId,
            BettingPoolId = bettingPoolId,
            PlayCount = groupStats?.Count ?? 0,
            SoldInGroup = groupStats?.Total ?? 0,
            SoldInPool = bancaStats?.Total ?? 0
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
                IsBlocked = true,
                BlockedBy = "no_limit"
            });
            return;
        }

        // Also find global limit
        var globalRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == LimitType.GeneralForGroup
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();

        // Check both the specific limit AND global, return the minimum available
        var rulesToCheck = new List<LimitRule> { limitRule };
        if (globalRule != null && globalRule.LimitRuleId != limitRule.LimitRuleId)
            rulesToCheck.Add(globalRule);

        decimal minAvailable = decimal.MaxValue;
        decimal reportLimitAmount = 0;
        decimal reportCurrentAmount = 0;
        bool blocked = false;
        string? blockedBy = null;

        foreach (var rule in rulesToCheck)
        {
            var ruleMax = await _context.LimitRuleAmounts.AsNoTracking()
                .Where(a => a.LimitRuleId == rule.LimitRuleId && a.GameTypeId == gameTypeId)
                .Select(a => a.MaxAmount)
                .FirstOrDefaultAsync();

            if (ruleMax <= 0) { blocked = true; blockedBy = GetBlockedByLabel(rule.LimitType); break; }

            var cQuery = _context.LimitConsumptions.AsNoTracking()
                .Where(lc => lc.DrawId == drawId && lc.DrawDate == today
                    && lc.LimitRuleId == rule.LimitRuleId
                    && lc.GameTypeId == gameTypeId && lc.BetNumber == betNumber);

            if (rule.LimitType == LimitType.GeneralForBettingPool || rule.LimitType == LimitType.LocalForBettingPool)
                cQuery = cQuery.Where(lc => lc.BettingPoolId == bettingPoolId);

            var consumed = await cQuery.SumAsync(lc => (decimal?)lc.CurrentAmount) ?? 0;

            // Scope reservations
            decimal reserved;
            if (rule.LimitType == LimitType.GeneralForBettingPool || rule.LimitType == LimitType.LocalForBettingPool)
                reserved = _limitReservationService.GetReservedAmountForPool(drawId, gameTypeId, betNumber, bettingPoolId);
            else if (rule.LimitType == LimitType.GeneralForZone)
            {
                var zpIds = await _context.BettingPools.AsNoTracking()
                    .Where(bp => bp.ZoneId == zoneId).Select(bp => bp.BettingPoolId).ToListAsync();
                reserved = _limitReservationService.GetReservedAmountForZone(drawId, gameTypeId, betNumber, new HashSet<int>(zpIds));
            }
            else
                reserved = _limitReservationService.GetReservedAmount(drawId, gameTypeId, betNumber);

            var used = consumed + reserved;
            var avail = ruleMax - used;

            if (avail < minAvailable)
            {
                minAvailable = avail;
                reportLimitAmount = ruleMax;
                reportCurrentAmount = consumed;
                blockedBy = GetBlockedByLabel(rule.LimitType);
            }
            if (used >= ruleMax) { blocked = true; blockedBy = GetBlockedByLabel(rule.LimitType); break; }
        }

        if (minAvailable == decimal.MaxValue) minAvailable = 0;
        var finalAvailable = Math.Max(0, minAvailable);
        var finalPercentage = reportLimitAmount > 0 ? ((reportLimitAmount - finalAvailable) / reportLimitAmount) * 100 : 0;

        await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
        {
            BetNumber = betNumber,
            GameTypeId = gameTypeId,
            DrawId = drawId,
            DrawName = draw.DrawName,
            AvailableAmount = finalAvailable,
            LimitAmount = reportLimitAmount,
            CurrentAmount = reportCurrentAmount,
            PercentageUsed = Math.Round(finalPercentage, 2),
            IsBlocked = blocked,
            BlockedBy = blocked ? blockedBy : null
        });
    }

    private static string GetBlockedByLabel(LimitType limitType)
    {
        return limitType switch
        {
            LimitType.GeneralForGroup => "global",
            LimitType.GeneralForZone => "zona",
            LimitType.GeneralForBettingPool => "banca",
            LimitType.LocalForBettingPool => "local_banca",
            _ => "unknown"
        };
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
    public string BetNumber { get; set; } = string.Empty;
}

public class GetPlayStatsRequest
{
    public string BetNumber { get; set; } = string.Empty;
    public int GameTypeId { get; set; }
    public int DrawId { get; set; }
    public int BettingPoolId { get; set; }
}

public class PlayStatsResponse : BaseNotification
{
    public string BetNumber { get; set; } = string.Empty;
    public int GameTypeId { get; set; }
    public int DrawId { get; set; }
    public int BettingPoolId { get; set; }
    public int PlayCount { get; set; }
    public decimal SoldInGroup { get; set; }
    public decimal SoldInPool { get; set; }

    public PlayStatsResponse()
    {
        Type = "PlayStats";
    }
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
