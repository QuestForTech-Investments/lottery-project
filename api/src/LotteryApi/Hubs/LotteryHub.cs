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
    private readonly IDbContextFactory<LotteryDbContext> _contextFactory;
    private readonly ILimitReservationService _limitReservationService;

    public LotteryHub(
        ILogger<LotteryHub> logger,
        LotteryDbContext context,
        IDbContextFactory<LotteryDbContext> contextFactory,
        ILimitReservationService limitReservationService)
    {
        _logger = logger;
        _context = context;
        _contextFactory = contextFactory;
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
    ///
    /// Group-level and banca-level aggregates run in parallel on independent
    /// pooled contexts, halving the wall-clock latency.
    /// </summary>
    public async Task GetPlayStats(GetPlayStatsRequest request)
    {
        var betNumber = request.BetNumber?.Trim() ?? "";
        var gameTypeId = request.GameTypeId;
        var drawId = request.DrawId;
        var bettingPoolId = request.BettingPoolId;
        var todayDate = Helpers.DateTimeHelper.TodayInBusinessTimezone();

        var groupTask = PrefetchPlayStatsGroup(betNumber, gameTypeId, drawId, todayDate);
        var bancaTask = PrefetchPlayStatsBanca(betNumber, gameTypeId, drawId, bettingPoolId, todayDate);
        await Task.WhenAll(groupTask, bancaTask);

        var (groupCount, groupTotal) = groupTask.Result;
        var bancaTotal = bancaTask.Result;

        await Clients.Caller.PlayStats(new PlayStatsResponse
        {
            BetNumber = betNumber,
            GameTypeId = gameTypeId,
            DrawId = drawId,
            BettingPoolId = bettingPoolId,
            PlayCount = groupCount,
            SoldInGroup = groupTotal,
            SoldInPool = bancaTotal
        });
    }

    private async Task<(int Count, decimal Total)> PrefetchPlayStatsGroup(
        string betNumber, int gameTypeId, int drawId, DateTime todayDate)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        var query = ctx.Set<Models.TicketLine>().AsNoTracking()
            .Where(tl => tl.BetNumber == betNumber
                && tl.BetTypeId == gameTypeId
                && tl.DrawId == drawId
                && tl.DrawDate.Date == todayDate
                && tl.Ticket != null && !tl.Ticket.IsCancelled);

        // Single round-trip thanks to projection — EF folds Count+Sum into one query.
        var agg = await query
            .Select(_ => 1)
            .GroupBy(_ => 1)
            .Select(g => new { Count = g.Count(), Total = query.Sum(tl => (decimal?)tl.BetAmount) ?? 0m })
            .FirstOrDefaultAsync();
        return (agg?.Count ?? 0, agg?.Total ?? 0m);
    }

    private async Task<decimal> PrefetchPlayStatsBanca(
        string betNumber, int gameTypeId, int drawId, int bettingPoolId, DateTime todayDate)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.Set<Models.TicketLine>().AsNoTracking()
            .Where(tl => tl.BetNumber == betNumber
                && tl.BetTypeId == gameTypeId
                && tl.DrawId == drawId
                && tl.DrawDate.Date == todayDate
                && tl.Ticket != null && !tl.Ticket.IsCancelled
                && tl.Ticket.BettingPoolId == bettingPoolId)
            .SumAsync(tl => (decimal?)tl.BetAmount) ?? 0m;
    }

    /// <summary>
    /// Check play limit availability for a single bet.
    /// Client sends: { "target": "CheckPlayLimit", "arguments": [{ "betNumber": "12", "gameTypeId": 1, "drawId": 167, "bettingPoolId": 9 }] }
    /// Response: PlayLimitAvailability
    ///
    /// Performance: the EF queries are issued in parallel using independent
    /// pooled DbContexts (via <see cref="IDbContextFactory{T}"/>) so the round-
    /// trip latency is dominated by the slowest single query rather than the
    /// sum of all of them. Limit-rule selection (3 levels + global + per-number)
    /// is collapsed into one query and ranked in memory. Per-rule consumption
    /// is fetched in a single batched query.
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
        var now = DateTime.UtcNow;
        var businessToday = Helpers.DateTimeHelper.TodayInBusinessTimezone().Date;
        var targetDateValue = request.DrawDate?.Date ?? businessToday;
        var isFutureSale = targetDateValue > businessToday;
        // Echo the client's DrawDate string in every response so the client can
        // discard stale responses that arrive after switching ticket-date modes.
        var drawDateEcho = request.DrawDate?.ToString("yyyy-MM-dd");
        var targetDate = DateOnly.FromDateTime(targetDateValue);
        // Legacy variable kept for downstream callers — points to the date the
        // rules and consumption queries should use (draw date for futures,
        // today for same-day).
        var today = targetDate;
        // Day-of-week bit is derived from the target draw date so future-sale
        // checks evaluate the rules that apply on the actual draw's weekday,
        // not on today's.
        var dow = (int)targetDateValue.DayOfWeek; // 0=Sun, 1=Mon...6=Sat
        var dayBit = dow switch
        {
            1 => 1, 2 => 2, 3 => 4, 4 => 8, 5 => 16, 6 => 32, 0 => 64, _ => 0
        };
        int.TryParse(userId, out var parsedUserId);
        var hasUserId = parsedUserId > 0;

        _logger.LogInformation(
            "CheckPlayLimit: User={UserId}, Bet={BetNumber}, GameType={GameTypeId}, Draw={DrawId}, Pool={BettingPoolId}",
            userId, betNumber, gameTypeId, drawId, bettingPoolId);

        // Stage 1: fire all independent prefetches in parallel using pooled contexts.
        // Each task owns its DbContext for the duration; EF Core forbids sharing one
        // context across concurrent awaits.
        var permsTask = hasUserId ? PrefetchUserCanBypass(parsedUserId) : Task.FromResult(false);
        var drawTask = PrefetchDraw(drawId);
        var bpTask = PrefetchBettingPoolZone(bettingPoolId);
        var bpConfigTask = PrefetchBettingPoolConfig(bettingPoolId);
        var balanceTask = PrefetchBalance(bettingPoolId);
        var blockedTask = PrefetchIsNumberBlocked(drawId, gameTypeId, betNumber, now);
        var allRulesTask = PrefetchCandidateRules(drawId, gameTypeId, bettingPoolId, betNumber, dayBit, now);

        await Task.WhenAll(permsTask, drawTask, bpTask, bpConfigTask, balanceTask, blockedTask, allRulesTask);

        var canBypassLimits = permsTask.Result;
        var draw = drawTask.Result;
        var zoneId = bpTask.Result;
        var bpConfig = bpConfigTask.Result;
        var currentBalance = balanceTask.Result;
        var isNumberBlocked = blockedTask.Result;
        var (specificRule, globalRule, byNumberRules) = SelectRulesByPriority(allRulesTask.Result, bettingPoolId, zoneId);

        if (draw == null)
        {
            await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
            {
                BetNumber = betNumber,
                GameTypeId = gameTypeId,
                DrawId = drawId,
                DrawDate = drawDateEcho
            });
            return;
        }

        if (specificRule == null)
        {
            await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
            {
                BetNumber = betNumber,
                GameTypeId = gameTypeId,
                DrawId = drawId,
                DrawName = draw.DrawName,
                DrawDate = drawDateEcho,
                AvailableAmount = 0,
                LimitAmount = 0,
                CurrentAmount = 0,
                PercentageUsed = 100,
                IsBlocked = true,
                BlockedBy = "no_limit"
            });
            return;
        }

        // Stage 2: deduplicated list of rules we need to evaluate.
        var rulesToCheck = new List<LimitRule> { specificRule };
        if (globalRule != null && globalRule.LimitRuleId != specificRule.LimitRuleId)
            rulesToCheck.Add(globalRule);
        foreach (var bnr in byNumberRules)
        {
            if (rulesToCheck.All(r => r.LimitRuleId != bnr.LimitRuleId))
                rulesToCheck.Add(bnr);
        }

        var ruleIds = rulesToCheck.Select(r => r.LimitRuleId).ToList();

        // Stage 3: max-amount per rule + consumption per (rule, banca|null) in two
        // batched queries instead of 2*N. Also resolve zone pool ids in parallel —
        // only needed if any rule is zone-scoped.
        var hasZoneRule = rulesToCheck.Any(r =>
            r.LimitType == LimitType.GeneralForZone || r.LimitType == LimitType.ByNumberForZone);

        var maxAmountsTask = PrefetchMaxAmounts(ruleIds, gameTypeId);
        var consumptionsTask = PrefetchConsumptions(ruleIds, drawId, today, gameTypeId, betNumber, isFutureSale);
        var zonePoolsTask = hasZoneRule && zoneId > 0
            ? PrefetchZonePoolIds(zoneId)
            : Task.FromResult<HashSet<int>>(new HashSet<int>());
        // Daily sales is independent; fetch only if config requests it.
        var dailySalesTask = bpConfig?.DailySaleLimit > 0
            ? PrefetchDailySales(bettingPoolId)
            : Task.FromResult(0m);

        await Task.WhenAll(maxAmountsTask, consumptionsTask, zonePoolsTask, dailySalesTask);

        var maxAmounts = maxAmountsTask.Result;
        var consumptionByRule = consumptionsTask.Result;
        var zonePoolIds = zonePoolsTask.Result;
        var currentDailySales = dailySalesTask.Result;

        // Stage 4: rank rules in memory.
        decimal minAvailable = decimal.MaxValue;
        decimal reportLimitAmount = 0;
        decimal reportCurrentAmount = 0;
        bool blocked = false;
        string? blockedBy = null;

        foreach (var rule in rulesToCheck)
        {
            if (!maxAmounts.TryGetValue(rule.LimitRuleId, out var cap))
            {
                blocked = true;
                blockedBy = GetBlockedByLabel(rule.LimitType);
                break;
            }

            // For future-sale lines, pick FutureMaxAmount. NULL/0 = future
            // sales prohibited under this rule (matches the REST API's
            // FUTURE_SALES_DISABLED_FOR_LIMIT error).
            decimal ruleMax;
            if (isFutureSale)
            {
                if (cap.FutureMaxAmount == null || cap.FutureMaxAmount.Value <= 0)
                {
                    blocked = true;
                    blockedBy = "future_sales_disabled";
                    break;
                }
                ruleMax = cap.FutureMaxAmount.Value;
            }
            else
            {
                ruleMax = cap.MaxAmount;
            }

            if (ruleMax <= 0)
            {
                blocked = true;
                blockedBy = GetBlockedByLabel(rule.LimitType);
                break;
            }

            var isBancaScope = rule.LimitType == LimitType.GeneralForBettingPool
                || rule.LimitType == LimitType.LocalForBettingPool
                || rule.LimitType == LimitType.ByNumberForBettingPool;
            var isZoneScope = rule.LimitType == LimitType.GeneralForZone
                || rule.LimitType == LimitType.ByNumberForZone;

            // Consumption: for banca-scoped rules we restrict to this banca; otherwise
            // sum all bancas under the rule (group-wide).
            decimal consumed;
            if (isBancaScope)
            {
                consumed = consumptionByRule.TryGetValue((rule.LimitRuleId, bettingPoolId), out var c)
                    ? c : 0m;
            }
            else
            {
                consumed = consumptionByRule
                    .Where(kv => kv.Key.RuleId == rule.LimitRuleId)
                    .Sum(kv => kv.Value);
            }

            decimal reserved;
            if (isBancaScope)
                reserved = _limitReservationService.GetReservedAmountForPool(drawId, gameTypeId, betNumber, bettingPoolId);
            else if (isZoneScope)
                reserved = _limitReservationService.GetReservedAmountForZone(drawId, gameTypeId, betNumber, zonePoolIds);
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
            if (used >= ruleMax)
            {
                blocked = true;
                blockedBy = GetBlockedByLabel(rule.LimitType);
                break;
            }
        }

        if (minAvailable == decimal.MaxValue) minAvailable = 0;
        var finalAvailable = Math.Max(0, minAvailable);
        var finalPercentage = reportLimitAmount > 0 ? ((reportLimitAmount - finalAvailable) / reportLimitAmount) * 100 : 0;

        if (isNumberBlocked && !blocked)
        {
            blocked = true;
            blockedBy = "number_blocked";
        }

        // Daily sale / credit limit (computed from prefetched data — no extra round-trip).
        decimal? dailySaleLimit = null;
        decimal? dailySaleRemaining = null;
        decimal? creditLimit = null;
        decimal? creditRemaining = null;

        if (bpConfig != null)
        {
            if (bpConfig.DailySaleLimit.HasValue && bpConfig.DailySaleLimit.Value > 0)
            {
                dailySaleLimit = bpConfig.DailySaleLimit.Value;
                dailySaleRemaining = Math.Max(0, dailySaleLimit.Value - currentDailySales);
                if (dailySaleRemaining <= 0 && !blocked)
                {
                    blocked = true;
                    blockedBy = "daily_sale_limit";
                }
            }

            if (bpConfig.DeactivationBalance.HasValue && bpConfig.DeactivationBalance.Value > 0)
            {
                creditLimit = bpConfig.DeactivationBalance.Value;
                creditRemaining = Math.Max(0, creditLimit.Value - currentBalance);
                if (creditRemaining <= 0 && !blocked)
                {
                    blocked = true;
                    blockedBy = "credit_limit";
                }
            }
        }

        // PLAY_WITHOUT_AVAILABILITY lets the user push past a CAP that's been
        // exhausted (a limit decision). "future_sales_disabled" is a
        // configuration POLICY ("no future sales under this rule, period"), not
        // a cap — bypass must not silently override it.
        if (canBypassLimits && blocked && blockedBy != "future_sales_disabled")
        {
            blocked = false;
            blockedBy = null;
        }

        await Clients.Caller.PlayLimitAvailability(new PlayLimitAvailabilityResponse
        {
            BetNumber = betNumber,
            GameTypeId = gameTypeId,
            DrawId = drawId,
            DrawName = draw.DrawName,
            DrawDate = drawDateEcho,
            AvailableAmount = finalAvailable,
            LimitAmount = reportLimitAmount,
            CurrentAmount = reportCurrentAmount,
            PercentageUsed = Math.Round(finalPercentage, 2),
            IsBlocked = blocked,
            BlockedBy = blocked ? blockedBy : null,
            DailySaleLimit = dailySaleLimit,
            DailySaleRemaining = dailySaleRemaining,
            CreditLimit = creditLimit,
            CreditRemaining = creditRemaining
        });
    }

    // ==================== PREFETCH HELPERS ====================
    // Each uses its own pooled DbContext so they can run concurrently.

    private async Task<bool> PrefetchUserCanBypass(int userId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.UserPermissions
            .AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.Permission!.PermissionCode == "PLAY_WITHOUT_AVAILABILITY"
                && up.IsActive);
    }

    private async Task<DrawSnapshot?> PrefetchDraw(int drawId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.Draws
            .AsNoTracking()
            .Where(d => d.DrawId == drawId)
            .Select(d => new DrawSnapshot { DrawId = d.DrawId, DrawName = d.DrawName })
            .FirstOrDefaultAsync();
    }

    private async Task<int> PrefetchBettingPoolZone(int bettingPoolId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.BettingPools
            .AsNoTracking()
            .Where(bp => bp.BettingPoolId == bettingPoolId)
            .Select(bp => bp.ZoneId)
            .FirstOrDefaultAsync();
    }

    private async Task<BettingPoolConfigSnapshot?> PrefetchBettingPoolConfig(int bettingPoolId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.BettingPoolConfigs
            .AsNoTracking()
            .Where(c => c.BettingPoolId == bettingPoolId)
            .Select(c => new BettingPoolConfigSnapshot
            {
                DailySaleLimit = c.DailySaleLimit,
                DeactivationBalance = c.DeactivationBalance
            })
            .FirstOrDefaultAsync();
    }

    private async Task<decimal> PrefetchBalance(int bettingPoolId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.Balances
            .AsNoTracking()
            .Where(b => b.BettingPoolId == bettingPoolId)
            .Select(b => b.CurrentBalance)
            .FirstOrDefaultAsync();
    }

    private async Task<bool> PrefetchIsNumberBlocked(int drawId, int gameTypeId, string betNumber, DateTime nowUtc)
    {
        // Note: this is filtered post-fetch against the zone too, but the zone
        // value isn't known until PrefetchBettingPoolZone resolves. The fast
        // path checks any active block matching number/game/draw; zone scoping
        // happens at the consumer because the cardinality is tiny.
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.BlockedNumbers
            .AsNoTracking()
            .AnyAsync(b => b.IsActive
                && b.DrawId == drawId
                && b.GameTypeId == gameTypeId
                && b.BetNumber == betNumber
                && (b.ExpirationDate == null || b.ExpirationDate > nowUtc));
    }

    /// <summary>
    /// Single round-trip that pulls every limit rule that could possibly match
    /// this (draw, gameType, day, banca, zone, betNumber) request. The caller
    /// ranks them in memory via <see cref="SelectRulesByPriority"/>.
    /// </summary>
    private async Task<List<LimitRule>> PrefetchCandidateRules(
        int drawId, int gameTypeId, int bettingPoolId, string betNumber, int dayBit, DateTime now)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId)
                && (
                    // Banca-scoped rules: must target this banca
                    ((lr.LimitType == LimitType.GeneralForBettingPool
                        || lr.LimitType == LimitType.LocalForBettingPool)
                      && lr.BettingPoolId == bettingPoolId)
                    // Group/zone selection happens later; load all candidates
                    || lr.LimitType == LimitType.GeneralForZone
                    || lr.LimitType == LimitType.GeneralForGroup
                    // Per-number rules must match the exact bet number
                    || ((lr.LimitType == LimitType.ByNumberForBettingPool
                            || lr.LimitType == LimitType.ByNumberForZone
                            || lr.LimitType == LimitType.ByNumberForGroup)
                        && lr.BetNumberPattern == betNumber
                        && (lr.LimitType != LimitType.ByNumberForBettingPool || lr.BettingPoolId == bettingPoolId))
                ))
            .ToListAsync();
    }

    private async Task<Dictionary<int, RuleCap>> PrefetchMaxAmounts(List<int> ruleIds, int gameTypeId)
    {
        if (ruleIds.Count == 0) return new Dictionary<int, RuleCap>();
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        return await ctx.LimitRuleAmounts.AsNoTracking()
            .Where(a => ruleIds.Contains(a.LimitRuleId) && a.GameTypeId == gameTypeId)
            .ToDictionaryAsync(a => a.LimitRuleId, a => new RuleCap(a.MaxAmount, a.FutureMaxAmount));
    }

    /// <summary>
    /// Consumption per (rule, banca) for all rules in one shot. The caller
    /// chooses whether to scope by banca or aggregate based on rule scope.
    /// Group-scoped rules store NULL in <c>BettingPoolId</c>; those rows are
    /// bucketed under <c>BettingPoolId = 0</c> so the dictionary remains
    /// non-nullable.
    /// </summary>
    private async Task<Dictionary<(int RuleId, int BettingPoolId), decimal>> PrefetchConsumptions(
        List<int> ruleIds, int drawId, DateOnly date, int gameTypeId, string betNumber, bool isFutureSale)
    {
        if (ruleIds.Count == 0) return new();
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        var rows = await ctx.LimitConsumptions.AsNoTracking()
            .Where(lc => ruleIds.Contains(lc.LimitRuleId)
                && lc.DrawId == drawId && lc.DrawDate == date
                && lc.GameTypeId == gameTypeId && lc.BetNumber == betNumber
                && lc.IsFutureSale == isFutureSale)
            .GroupBy(lc => new { lc.LimitRuleId, lc.BettingPoolId })
            .Select(g => new { g.Key.LimitRuleId, g.Key.BettingPoolId, Total = g.Sum(x => x.CurrentAmount) })
            .ToListAsync();
        return rows.ToDictionary(r => (r.LimitRuleId, r.BettingPoolId ?? 0), r => r.Total);
    }

    private async Task<HashSet<int>> PrefetchZonePoolIds(int zoneId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        var ids = await ctx.BettingPools.AsNoTracking()
            .Where(bp => bp.ZoneId == zoneId)
            .Select(bp => bp.BettingPoolId)
            .ToListAsync();
        return new HashSet<int>(ids);
    }

    private async Task<decimal> PrefetchDailySales(int bettingPoolId)
    {
        await using var ctx = await _contextFactory.CreateDbContextAsync();
        var todayBusiness = Helpers.DateTimeHelper.TodayInBusinessTimezone();
        var utcDayStart = Helpers.DateTimeHelper.GetUtcStartOfDay(todayBusiness);
        var utcDayEnd = Helpers.DateTimeHelper.GetUtcEndOfDay(todayBusiness);

        return await ctx.Tickets
            .AsNoTracking()
            .Where(t => t.BettingPoolId == bettingPoolId
                && !t.IsCancelled
                && ((t.CreatedAt >= utcDayStart && t.CreatedAt < utcDayEnd)
                    || t.TicketLines.Any(tl => tl.DrawDate.Date == todayBusiness)))
            .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m;
    }

    /// <summary>
    /// Pick the most specific rule (banca > local banca > zone) plus the global
    /// rule and any by-number rules that apply. Operates entirely in memory on
    /// the candidate list returned by <see cref="PrefetchCandidateRules"/>.
    /// </summary>
    private static (LimitRule? Specific, LimitRule? Global, List<LimitRule> ByNumber) SelectRulesByPriority(
        List<LimitRule> candidates, int bettingPoolId, int zoneId)
    {
        LimitRule? specific = null;

        // 1. GeneralForBettingPool
        specific = candidates.FirstOrDefault(r =>
            r.LimitType == LimitType.GeneralForBettingPool && r.BettingPoolId == bettingPoolId);

        // 2. LocalForBettingPool
        if (specific == null)
        {
            specific = candidates.FirstOrDefault(r =>
                r.LimitType == LimitType.LocalForBettingPool && r.BettingPoolId == bettingPoolId);
        }

        // 3. GeneralForZone (only if banca-level not found)
        if (specific == null && zoneId > 0)
        {
            specific = candidates.FirstOrDefault(r =>
                r.LimitType == LimitType.GeneralForZone && r.ZoneId == zoneId);
        }

        var global = candidates.FirstOrDefault(r => r.LimitType == LimitType.GeneralForGroup);

        var byNumber = candidates.Where(r =>
            (r.LimitType == LimitType.ByNumberForBettingPool && r.BettingPoolId == bettingPoolId)
            || (r.LimitType == LimitType.ByNumberForZone && r.ZoneId == zoneId)
            || r.LimitType == LimitType.ByNumberForGroup
        ).ToList();

        return (specific, global, byNumber);
    }

    private static string GetBlockedByLabel(LimitType limitType)
    {
        return limitType switch
        {
            LimitType.GeneralForGroup => "global",
            LimitType.GeneralForZone => "zona",
            LimitType.GeneralForBettingPool => "banca",
            LimitType.LocalForBettingPool => "local_banca",
            LimitType.ByNumberForGroup => "numero_global",
            LimitType.ByNumberForZone => "numero_zona",
            LimitType.ByNumberForBettingPool => "numero_banca",
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

    /// <summary>
    /// Draw date for this play. When greater than today (in business timezone)
    /// the check uses the future-sale bucket and <c>future_max_amount</c> cap
    /// from the matching limit rule. When null or &lt;= today, behaves as
    /// same-day (legacy behaviour preserved for older clients).
    /// </summary>
    public DateTime? DrawDate { get; set; }
}

// Lightweight projections used by the parallel CheckPlayLimit prefetches so we
// don't materialize full entities when only a couple of fields are read.
internal sealed class DrawSnapshot
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
}

internal sealed class BettingPoolConfigSnapshot
{
    public decimal? DailySaleLimit { get; set; }
    public decimal? DeactivationBalance { get; set; }
}

/// <summary>
/// Per-rule cap pair: same-day + future-sale. FutureMaxAmount=null/0 means
/// futures are prohibited under that rule.
/// </summary>
internal sealed record RuleCap(decimal MaxAmount, decimal? FutureMaxAmount);
