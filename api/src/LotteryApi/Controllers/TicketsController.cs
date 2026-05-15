using Azure.Core.Serialization;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Models;
using LotteryApi.Services;
using LotteryApi.Services.Caida;
using LotteryApi.Services.ExternalResults;
using LotteryApi.Services.Warnings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<TicketsController> _logger;
    private readonly IExternalResultsService _externalResultsService;
    private readonly ILimitReservationService _limitReservationService;
    private readonly ICaidaCalculationService _caidaService;
    private readonly IWarningService _warningService;
    private readonly IZoneScopeService _zoneScope;

    public TicketsController(
        LotteryDbContext context,
        ILogger<TicketsController> logger,
        IExternalResultsService externalResultsService,
        ILimitReservationService limitReservationService,
        ICaidaCalculationService caidaService,
        IWarningService warningService,
        IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _limitReservationService = limitReservationService;
        _externalResultsService = externalResultsService;
        _caidaService = caidaService;
        _warningService = warningService;
        _zoneScope = zoneScope;
    }

    /// <summary>Returns true if the current user holds the given permission code.</summary>
    private async Task<bool> HasPermissionAsync(string code)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    [HttpGet]
    public async Task<ActionResult<TicketDetailDto[]>> GetTickets(
        [FromQuery] int bettingPoolId,
        [FromQuery] DateTime? date = null)
    {
        if (!await HasPermissionAsync("TICKET_MONITORING")) return Forbid();

        _logger.LogInformation("Getting tickets for bettingPoolId {BettingPoolId}, date {Date}", bettingPoolId, date);

        // Zone scope — admin cannot see tickets of a banca outside their zones.
        if (!await _zoneScope.IsBettingPoolAllowedAsync(bettingPoolId))
        {
            return Ok(Array.Empty<TicketDetailDto>());
        }

        var query = _context.Tickets
            .AsNoTracking()
            .Where(t => t.BettingPoolId == bettingPoolId);

        // Filter by date: tickets created on that date OR tickets with draws for that date
        if (date.HasValue)
        {
            var filterDate = date.Value.Date;

            string timezoneId = "America/Santo_Domingo";
            var businessTimezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
            var localStart = new DateTime(filterDate.Year, filterDate.Month, filterDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var localEnd = new DateTime(filterDate.Year, filterDate.Month, filterDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);
            var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStart, businessTimezone);
            var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEnd, businessTimezone);

            query = query.Where(t =>
                (t.CreatedAt >= utcStart && t.CreatedAt < utcEnd)
                || t.TicketLines.Any(tl => tl.DrawDate.Date == filterDate));
        }

        var tickets = await query
            .Select(t => new TicketDetailDto
            {
                TicketId = t.TicketId,
                TicketCode = t.TicketCode,
                Barcode = t.Barcode,
                BettingPoolId = t.BettingPoolId,
                BettingPoolName = t.BettingPool!.BettingPoolName,
                BettingPoolCode = t.BettingPool!.BettingPoolCode,
                UserId = t.UserId,
                UserName = t.User!.Username,
                TerminalId = t.TerminalId,
                IpAddress = t.IpAddress,
                CreatedAt = t.CreatedAt,
                GlobalMultiplier = t.GlobalMultiplier,
                GlobalDiscount = t.GlobalDiscount,
                CurrencyCode = t.CurrencyCode,
                TotalLines = t.TotalLines,
                TotalBetAmount = t.TotalBetAmount,
                TotalDiscount = t.TotalDiscount,
                TotalSubtotal = t.TotalSubtotal,
                TotalWithMultiplier = t.TotalWithMultiplier,
                TotalCommission = t.TotalCommission,
                TotalNet = t.TotalNet,
                GrandTotal = t.TotalBetAmount,
                TotalPrize = t.TotalPrize,
                WinningLines = t.WinningLines,
                Status = t.Status,
                TicketState = t.TicketState,
                IsCancelled = t.IsCancelled,
                CancelledAt = t.CancelledAt,
                CancelledBy = t.CancelledBy,
                CancelledByName = t.CancelledBy != null
                    ? _context.Users.Where(u => u.UserId == t.CancelledBy).Select(u => u.Username).FirstOrDefault()
                    : null,
                CancellationReason = t.CancellationReason,
                IsPaid = t.IsPaid,
                PaidAt = t.PaidAt,
                PaidBy = t.PaidBy,
                PaymentMethod = t.PaymentMethod,
                PaymentReference = t.PaymentReference,
                CustomerId = t.CustomerId,
                CustomerName = t.CustomerName,
                CustomerPhone = t.CustomerPhone,
                CustomerEmail = t.CustomerEmail,
                CustomerIdNumber = t.CustomerIdNumber,
                LotteryIds = t.LotteryIds,
                TotalLotteries = t.TotalLotteries,
                EarliestDrawTime = t.EarliestDrawTime,
                LatestDrawTime = t.LatestDrawTime,
                UpdatedAt = t.UpdatedAt,
                UpdatedBy = t.UpdatedBy,
                PrintCount = t.PrintCount,
                LastPrintedAt = t.LastPrintedAt,
                Notes = t.Notes,
                SpecialFlags = t.SpecialFlags,
                Lines = t.TicketLines.Select(l => new TicketLineDto
                {
                    LineId = l.LineId,
                    TicketId = l.TicketId,
                    LineNumber = l.LineNumber,
                    LotteryId = l.Draw!.LotteryId,
                    LotteryName = l.Draw!.Lottery!.LotteryName,
                    DrawId = l.DrawId,
                    DrawName = l.Draw!.DrawName,
                    DrawDate = l.DrawDate,
                    DrawTime = l.DrawTime,
                    BetNumber = l.BetNumber,
                    BetTypeId = l.BetTypeId,
                    BetTypeCode = l.BetTypeCode,
                    BetTypeName = l.BetType!.GameName,
                    Position = l.Position,
                    BetAmount = l.BetAmount,
                    Multiplier = l.Multiplier,
                    DiscountPercentage = l.DiscountPercentage,
                    DiscountAmount = l.DiscountAmount,
                    Subtotal = l.Subtotal,
                    TotalWithMultiplier = l.TotalWithMultiplier,
                    CommissionPercentage = l.CommissionPercentage,
                    CommissionAmount = l.CommissionAmount,
                    NetAmount = l.NetAmount,
                    PrizeMultiplier = l.PrizeMultiplier,
                    PrizeAmount = l.PrizeAmount,
                    IsWinner = l.IsWinner,
                    WinningPosition = l.WinningPosition,
                    ResultNumber = l.ResultNumber,
                    ResultCheckedAt = l.ResultCheckedAt,
                    LineStatus = l.LineStatus,
                    ExceedsLimit = l.ExceedsLimit,
                    IsLuckyPick = l.IsLuckyPick,
                    IsHotNumber = l.IsHotNumber,
                    IsOutOfScheduleSale = l.IsOutOfScheduleSale,
                    Notes = l.Notes
                }).ToList()
            })
            .ToArrayAsync();

        _logger.LogInformation("Retrieved {Count} tickets for bettingPoolId {BettingPoolId}",
            tickets.Length, bettingPoolId);

        return Ok(tickets);
    }

    /// <summary>
    /// GET /api/tickets/params/create?category={1|2}
    /// Get parameters needed to create a ticket (draws, bet types, limits, current betting pool, stats)
    /// Enhanced version with full context for ticket creation
    /// </summary>
    /// <param name="category">Category filter (1 or 2)</param>
    /// <param name="bettingPoolId">Optional betting pool ID to get specific context</param>
    /// <returns>Ticket creation parameters</returns>
    [HttpGet("params/create")]
    public async Task<ActionResult<TicketCreationParamsDto>> GetCreationParams(
        [FromQuery] int? category,
        [FromQuery] int? bettingPoolId)
    {
        try
        {
            var today = DateTimeHelper.TodayInBusinessTimezone();
            var now = DateTimeHelper.NowInBusinessTimezone();

            _logger.LogInformation("Getting ticket creation params for category {Category}, bettingPoolId {BettingPoolId}",
                category, bettingPoolId);

            // Get current betting pool if specified
            BettingPoolParamDto? currentBettingPool = null;
            if (bettingPoolId.HasValue)
            {
                var pool = await _context.BettingPools
                    .Where(bp => bp.BettingPoolId == bettingPoolId.Value)
                    .Select(bp => new BettingPoolParamDto
                    {
                        BettingPoolId = bp.BettingPoolId,
                        Code = bp.BettingPoolCode ?? "",
                        Name = bp.BettingPoolName ?? "",
                        IsActive = bp.IsActive,
                        CurrentBalance = bp.Balance != null ? bp.Balance.CurrentBalance : 0m,
                        CommissionPercentage = 10.00m, // TODO: Get from config
                        DiscountPercentage = 0.00m
                    })
                    .FirstOrDefaultAsync();

                if (pool != null)
                {
                    var discountConfig = await _context.BettingPoolDiscountConfigs
                        .Where(dc => dc.BettingPoolId == bettingPoolId.Value)
                        .FirstOrDefaultAsync();

                    if (discountConfig != null && discountConfig.DiscountMode != "OFF")
                    {
                        pool.DiscountMode = discountConfig.DiscountMode;
                        pool.DiscountAmount = discountConfig.DiscountAmount;
                        pool.DiscountPerEvery = discountConfig.DiscountPerEvery;
                    }
                }

                currentBettingPool = pool;
            }

            // Get available draws (active draws only, not yet closed)
            // Use each lottery's timezone to determine if the draw is closed
            var drawsRaw = await _context.Draws
                .Include(d => d.Lottery)
                .Where(d => d.IsActive)
                .OrderBy(d => d.DrawTime)
                .Select(d => new
                {
                    d.DrawId,
                    d.LotteryId,
                    LotteryName = d.Lottery != null ? d.Lottery.LotteryName : "",
                    d.DrawTime,
                    d.IsActive,
                    Timezone = d.Lottery != null ? d.Lottery.Timezone : "America/Santo_Domingo"
                })
                .ToListAsync();

            var draws = drawsRaw.Select(d =>
            {
                var nowInTz = DateTimeHelper.NowInTimezone(d.Timezone);
                var todayInTz = nowInTz.Date;
                return new DrawParamDto
                {
                    DrawId = d.DrawId,
                    LotteryId = d.LotteryId,
                    LotteryName = d.LotteryName,
                    LotteryCode = null,
                    DrawDate = todayInTz,
                    DrawTime = d.DrawTime,
                    CutoffTime = todayInTz.Add(d.DrawTime).AddMinutes(-30),
                    IsActive = d.IsActive,
                    IsClosed = todayInTz.Add(d.DrawTime) <= nowInTz,
                    ImageUrl = null
                };
            }).ToList();

            // Get available bet types (game types)
            var betTypes = await _context.GameTypes
                .Where(bt => bt.IsActive)
                .OrderBy(bt => bt.DisplayOrder)
                .Select(bt => new BetTypeParamDto
                {
                    BetTypeId = bt.GameTypeId,
                    Code = bt.GameTypeCode,
                    Name = bt.GameName,
                    MinDigits = bt.NumberLength,
                    MaxDigits = bt.NumberLength,
                    DefaultMultiplier = 1.00m,
                    IsActive = bt.IsActive
                })
                .ToListAsync();

            // Get limits from database (if any)
            // TODO: Implement proper limits query from limits table
            var limits = new List<TicketLimitDto>();

            // Calculate stats for today
            var stats = new TicketStatsDto
            {
                TotalTicketsToday = await _context.Tickets
                    .Where(t => t.CreatedAt.Date == today && !t.IsCancelled)
                    .CountAsync(),
                TotalSoldInGroup = await _context.Tickets
                    .Where(t => t.CreatedAt.Date == today && !t.IsCancelled)
                    .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m,
                TotalSoldInBettingPool = bettingPoolId.HasValue
                    ? await _context.Tickets
                        .Where(t => t.CreatedAt.Date == today &&
                                    t.BettingPoolId == bettingPoolId.Value &&
                                    !t.IsCancelled)
                        .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m
                    : 0m
            };

            var result = new TicketCreationParamsDto
            {
                ServerTime = DateTime.UtcNow.ToString("o"),
                CurrentBettingPool = currentBettingPool,
                AvailableDraws = draws,
                BetTypes = betTypes,
                Limits = limits,
                Stats = stats
            };

            _logger.LogInformation(
                "Retrieved ticket creation params: {DrawCount} draws, {BetTypeCount} bet types, {StatsToday} tickets today",
                draws.Count,
                betTypes.Count,
                stats.TotalTicketsToday);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket creation parameters");
            return StatusCode(500, new { message = "Error al obtener parámetros de creación de ticket" });
        }
    }

    /// <summary>
    /// GET /api/tickets/params/index?category={1|2}
    /// Get parameters for ticket monitor (betting pools, lotteries, bet types, zones)
    /// </summary>
    /// <param name="category">Category filter (1 or 2)</param>
    /// <returns>Ticket monitor parameters</returns>
    [HttpGet("params/index")]
    public async Task<ActionResult<TicketMonitorParamsDto>> GetMonitorParams([FromQuery] int? category)
    {
        try
        {
            _logger.LogInformation("Getting ticket monitor params for category {Category}", category);

            // Get betting pools
            var bettingPools = await _context.BettingPools
                .Where(bp => bp.IsActive)
                .OrderBy(bp => bp.BettingPoolName)
                .Select(bp => new BettingPoolParamDto
                {
                    BettingPoolId = bp.BettingPoolId,
                    Code = bp.BettingPoolCode ?? "",
                    Name = bp.BettingPoolName ?? "",
                    IsActive = bp.IsActive,
                    CurrentBalance = bp.Balance != null ? bp.Balance.CurrentBalance : 0m,
                    CommissionPercentage = 10.00m,
                    DiscountPercentage = 0.00m
                })
                .ToListAsync();

            // Get lotteries (unique from draws)
            var lotteries = await _context.Draws
                .Include(d => d.Lottery)
                .Where(d => d.IsActive && d.Lottery != null)
                .Select(d => new DrawParamDto
                {
                    DrawId = d.DrawId,
                    LotteryId = d.LotteryId,
                    LotteryName = d.Lottery!.LotteryName,
                    LotteryCode = null, // Not available in Lottery model
                    DrawDate = DateTime.Today,
                    DrawTime = d.DrawTime,
                    IsActive = d.IsActive,
                    IsClosed = false,
                    ImageUrl = null // Not available in Lottery model
                })
                .ToListAsync();

            // Get bet types
            var betTypes = await _context.GameTypes
                .Where(bt => bt.IsActive)
                .OrderBy(bt => bt.DisplayOrder)
                .Select(bt => new BetTypeParamDto
                {
                    BetTypeId = bt.GameTypeId,
                    Code = bt.GameTypeCode,
                    Name = bt.GameName,
                    MinDigits = bt.NumberLength,
                    MaxDigits = bt.NumberLength,
                    DefaultMultiplier = 1.00m,
                    IsActive = bt.IsActive
                })
                .ToListAsync();

            // Get zones
            var zones = await _context.Zones
                .Where(z => z.IsActive)
                .OrderBy(z => z.ZoneName)
                .Select(z => new ZoneParamDto
                {
                    ZoneId = z.ZoneId,
                    Name = z.ZoneName,
                    Code = null, // Not available in Zone model
                    IsActive = z.IsActive
                })
                .ToListAsync();

            var result = new TicketMonitorParamsDto
            {
                BettingPools = bettingPools,
                Lotteries = lotteries,
                BetTypes = betTypes,
                Zones = zones
            };

            _logger.LogInformation(
                "Retrieved monitor params: {PoolCount} pools, {LotteryCount} lotteries, {BetTypeCount} bet types, {ZoneCount} zones",
                bettingPools.Count,
                lotteries.Count,
                betTypes.Count,
                zones.Count);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket monitor parameters");
            return StatusCode(500, new { message = "Error al obtener parámetros de monitor de tickets" });
        }
    }

    /// <summary>
    /// POST /api/tickets
    /// Create a new ticket with multiple lines
    /// Includes validation, calculations, barcode generation, and transaction handling
    /// </summary>
    /// <param name="dto">Ticket creation data</param>
    /// <returns>Created ticket with all details</returns>
    [HttpPost]
    public async Task<ActionResult<TicketDetailDto>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        if (!await HasPermissionAsync("SELL_TICKETS")) return Forbid();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _logger.LogInformation(
                "Creating ticket for bettingPool {BettingPoolId}, user {UserId}, {LineCount} lines",
                dto.BettingPoolId,
                dto.UserId,
                dto.Lines.Count);

            // 1. Validate betting pool is active
            var bettingPool = await _context.BettingPools
                .FirstOrDefaultAsync(bp => bp.BettingPoolId == dto.BettingPoolId);

            if (bettingPool == null)
            {
                return NotFound(new { message = "La banca especificada no existe" });
            }

            if (!bettingPool.IsActive)
            {
                return UnprocessableEntity(new { message = "La banca no está activa" });
            }

            // 1.4 Banca attribution: user must be assigned to this banca unless they hold SELL_AS_ANY_BANK
            var isAssignedToBanca = await _context.UserBettingPools.AsNoTracking()
                .AnyAsync(ubp => ubp.UserId == dto.UserId
                    && ubp.BettingPoolId == dto.BettingPoolId
                    && ubp.IsActive);

            if (!isAssignedToBanca)
            {
                var canSellAsAnyBanca = await _context.UserPermissions.AsNoTracking()
                    .AnyAsync(up => up.UserId == dto.UserId
                        && up.IsActive
                        && up.Permission != null
                        && up.Permission.IsActive
                        && up.Permission.PermissionCode == "SELL_AS_ANY_BANK");

                if (!canSellAsAnyBanca)
                {
                    return StatusCode(403, new { message = "No tiene permiso para vender en esta banca" });
                }
            }

            // 1.5 Validate ticket date for future sales
            var todayBusiness = DateTimeHelper.TodayInBusinessTimezone();
            var ticketDate = dto.TicketDate?.Date ?? todayBusiness;

            var bpConfig = await _context.BettingPoolConfigs
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.BettingPoolId == dto.BettingPoolId);

            // Date validation (only if ticketDate is provided)
            if (dto.TicketDate.HasValue)
            {
                if (ticketDate < todayBusiness)
                {
                    // Allow exactly yesterday when AllowPastDate is true
                    var yesterday = todayBusiness.AddDays(-1);
                    if (!dto.AllowPastDate || ticketDate < yesterday)
                    {
                        return BadRequest(new { message = "No se puede crear tickets para fechas pasadas" });
                    }

                    // Server-side permission check for previous-day sales
                    var hasPastDatePermission = await _context.UserPermissions
                        .AnyAsync(up => up.UserId == dto.UserId
                            && up.Permission!.PermissionCode == "TICKET_PREVIOUS_DAY_SALE"
                            && up.IsActive);

                    if (!hasPastDatePermission)
                    {
                        return StatusCode(403, new { message = "No tiene permiso para ventas de dia anterior" });
                    }
                }

                if (ticketDate > todayBusiness)
                {
                    // Server-side permission check for future sales
                    var hasFutureDatePermission = await _context.UserPermissions
                        .AnyAsync(up => up.UserId == dto.UserId
                            && up.Permission!.PermissionCode == "TICKET_FUTURE_SALE"
                            && up.IsActive);

                    if (!hasFutureDatePermission)
                    {
                        return StatusCode(403, new { message = "No tiene permiso para ventas futuras" });
                    }

                    var futureSalesMode = bpConfig?.FutureSalesMode ?? "OFF";
                    var maxFutureDays = bpConfig?.MaxFutureDays ?? 7;

                    switch (futureSalesMode)
                    {
                        case "OFF":
                            return BadRequest(new { message = "Esta banca no permite ventas futuras" });

                        case "WEEK":
                            // Calculate next Sunday (end of current week)
                            var daysUntilSunday = ((int)DayOfWeek.Sunday - (int)todayBusiness.DayOfWeek + 7) % 7;
                            if (daysUntilSunday == 0) daysUntilSunday = 7; // If today is Sunday, allow until next Sunday
                            var nextSunday = todayBusiness.AddDays(daysUntilSunday);
                            if (ticketDate > nextSunday)
                            {
                                return BadRequest(new { message = "Solo se permite vender tickets hasta el domingo de esta semana" });
                            }
                            break;

                        case "DAYS":
                            if (ticketDate > todayBusiness.AddDays(maxFutureDays))
                            {
                                return BadRequest(new { message = $"No se puede crear tickets para más de {maxFutureDays} días en el futuro" });
                            }
                            break;

                        default:
                            return BadRequest(new { message = "Esta banca no permite ventas futuras" });
                    }
                }
            }

            // Check if user can bypass availability limits (admin permission)
            var canBypassLimits = await _context.UserPermissions
                .AnyAsync(up => up.UserId == dto.UserId
                    && up.Permission!.PermissionCode == "PLAY_WITHOUT_AVAILABILITY"
                    && up.IsActive);

            // Tracks whether canBypassLimits actually saved the ticket from being blocked.
            // Only when this is true do we record TICKET_BYPASS_VALIDATION.
            var bypassActuallyUsed = false;
            var bypassReasons = new List<string>();

            // 1.6 Validate daily sale limit
            var dailySaleLimit = bpConfig?.DailySaleLimit;
            if (dailySaleLimit.HasValue && dailySaleLimit.Value > 0)
            {
                // Use UTC range matching business day (same logic as daily-summary endpoint)
                var utcDayStart = DateTimeHelper.GetUtcStartOfDay(todayBusiness);
                var utcDayEnd = DateTimeHelper.GetUtcEndOfDay(todayBusiness);

                var currentDailySales = await _context.Tickets
                    .Where(t => t.BettingPoolId == dto.BettingPoolId
                              && !t.IsCancelled
                              && ((t.CreatedAt >= utcDayStart && t.CreatedAt < utcDayEnd)
                                  || t.TicketLines.Any(tl => tl.DrawDate.Date == todayBusiness)))
                    .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m;

                var newTicketEstimate = dto.Lines.Sum(l => l.BetAmount);

                if (currentDailySales + newTicketEstimate > dailySaleLimit.Value)
                {
                    if (canBypassLimits)
                    {
                        bypassActuallyUsed = true;
                        bypassReasons.Add("daily_sale_limit");
                    }
                    else
                    {
                        var remaining = dailySaleLimit.Value - currentDailySales;
                        return UnprocessableEntity(new
                        {
                            code = "ticket/daily-sale-limit-exceeded",
                            message = "La banca ha alcanzado su límite de venta diaria",
                            dailySaleLimit = dailySaleLimit.Value,
                            currentDailySales,
                            ticketAmount = newTicketEstimate,
                            remaining = remaining > 0 ? remaining : 0m
                        });
                    }
                }
            }

            // 2. Validate user is active
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            if (user == null)
            {
                return NotFound(new { message = "El usuario especificado no existe" });
            }

            if (!user.IsActive)
            {
                return UnprocessableEntity(new { message = "El usuario no está activo" });
            }

            // 3. Validate cutoff times for all draws
            var now = DateTime.UtcNow;
            var drawIds = dto.Lines.Select(l => l.DrawId).Distinct().ToList();
            var betTypeIds = dto.Lines.Select(l => l.BetTypeId).Distinct().ToList();

            // Pre-fetch all required data to avoid N+1 queries
            var draws = await _context.Draws
                .Include(d => d.Lottery)
                .Include(d => d.WeeklySchedules)
                .Where(d => drawIds.Contains(d.DrawId))
                .ToListAsync();

            // Pre-fetch AnticipatedClosingMinutes per draw for this betting pool
            var bettingPoolDraws = await _context.BettingPoolDraws
                .AsNoTracking()
                .Where(bpd => bpd.BettingPoolId == dto.BettingPoolId && drawIds.Contains(bpd.DrawId))
                .ToDictionaryAsync(bpd => bpd.DrawId, bpd => bpd.AnticipatedClosingMinutes);

            // Pre-check if user has SELL_OUT_OF_HOURS permission (used to skip closing validation)
            var canSellClosedDraws = await _context.UserPermissions
                .AnyAsync(up => up.UserId == dto.UserId
                    && up.Permission!.PermissionCode == "SELL_OUT_OF_HOURS"
                    && up.IsActive);

            var betTypesDict = await _context.GameTypes
                .Where(gt => betTypeIds.Contains(gt.GameTypeId))
                .ToDictionaryAsync(gt => gt.GameTypeId);

            // Pre-fetch game compatibility for validation
            // This tells us which bet types (game types) are allowed for each draw
            var drawGameCompatibilities = await _context.DrawGameCompatibilities
                .Where(dgc => drawIds.Contains(dgc.DrawId) && dgc.IsActive)
                .Select(dgc => new { dgc.DrawId, dgc.GameTypeId })
                .ToListAsync();

            // Build a set of valid (drawId, gameTypeId) combinations for O(1) lookup
            var validCombinations = new HashSet<(int DrawId, int GameTypeId)>(
                drawGameCompatibilities.Select(dgc => (dgc.DrawId, dgc.GameTypeId)));

            // Pre-fetch active blocked numbers for the draws in this ticket.
            // A block applies if it's global (zone_id IS NULL) or scoped to this banca's zone.
            var drawIdsInTicket = dto.Lines.Select(l => l.DrawId).Distinct().ToList();
            var bpZoneId = bettingPool.ZoneId;
            var blockedLookup = await _context.BlockedNumbers
                .AsNoTracking()
                .Where(b => b.IsActive
                    && drawIdsInTicket.Contains(b.DrawId)
                    && (b.ZoneId == null || b.ZoneId == bpZoneId)
                    && (b.ExpirationDate == null || b.ExpirationDate > now))
                .Select(b => new { b.DrawId, b.GameTypeId, b.BetNumber })
                .ToListAsync();
            var blockedSet = new HashSet<(int, int, string)>(
                blockedLookup.Select(b => (b.DrawId, b.GameTypeId, b.BetNumber)));

            List<object> invalidBets = new List<object>();
            bool hasClosedDraw = false;
            var closedDrawIds = new HashSet<int>();

            foreach (var line in dto.Lines)
            {
                if (blockedSet.Contains((line.DrawId, line.BetTypeId, line.BetNumber)))
                {
                    if (canBypassLimits)
                    {
                        bypassActuallyUsed = true;
                        if (!bypassReasons.Contains("number_blocked")) bypassReasons.Add("number_blocked");
                    }
                    else
                    {
                        return UnprocessableEntity(new
                        {
                            code = "NUMBER_BLOCKED",
                            message = $"El número {line.BetNumber} está bloqueado para este sorteo",
                            drawId = line.DrawId,
                            gameTypeId = line.BetTypeId,
                            betNumber = line.BetNumber
                        });
                    }
                }
                var draw = draws.FirstOrDefault(d => d.DrawId == line.DrawId);
                if (draw == null)
                {
                    return UnprocessableEntity(new { message = $"El sorteo {line.DrawId} no existe" });
                }

                // 3.1 Validate bet type is compatible with this draw
                if (!validCombinations.Contains((line.DrawId, line.BetTypeId)))
                {
                    // Get bet type name for error message
                    betTypesDict.TryGetValue(line.BetTypeId, out var betType);
                    var betTypeName = betType?.GameName ?? $"ID {line.BetTypeId}";

                    var lineError = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        JsonSerializer.Serialize(line)
                    );

                    lineError!["errorType"] = "invalid-for-lottery";

                    invalidBets.Add(lineError);
                    continue;
                }

                // Validate draw is still open for betting (only for today's tickets)
                if (ticketDate == todayBusiness)
                {
                    // Use the draw's lottery timezone for closing time comparison
                    // This ensures draws close at the correct absolute time regardless of POS location
                    var drawTimezone = draw.Lottery?.Timezone ?? "America/Santo_Domingo";
                    var nowInDrawTz = DateTimeHelper.NowInTimezone(drawTimezone);
                    var currentTimeInDrawTz = nowInDrawTz.TimeOfDay;
                    var dayOfWeekInDrawTz = (byte)nowInDrawTz.DayOfWeek;

                    var todaySchedule = draw.WeeklySchedules?
                        .FirstOrDefault(ws => ws.DayOfWeek == dayOfWeekInDrawTz && ws.IsActive);

                    if (todaySchedule != null)
                    {
                        var closingTime = todaySchedule.EndTime;

                        // Subtract AnticipatedClosingMinutes if configured for this pool
                        bettingPoolDraws.TryGetValue(draw.DrawId, out var anticipatedMinutes);
                        if (anticipatedMinutes.HasValue && anticipatedMinutes.Value > 0)
                        {
                            closingTime = closingTime.Subtract(TimeSpan.FromMinutes(anticipatedMinutes.Value));
                        }

                        if (currentTimeInDrawTz >= closingTime)
                        {
                            // Users with SELL_OUT_OF_HOURS permission skip closing rejection
                            if (!canSellClosedDraws)
                            {
                                var closingFormatted = DateTime.Today.Add(closingTime).ToString("hh:mm tt");
                                return UnprocessableEntity(new
                                {
                                    message = $"El sorteo {draw.DrawName} ya cerró las ventas a las {closingFormatted}"
                                });
                            }
                            hasClosedDraw = true;
                            closedDrawIds.Add(draw.DrawId);
                        }
                    }
                }
            }

            // 4. Generate ticket code (format: EA-{BANCACODE}-{SEQUENCE})
            var ticketCode = await GenerateTicketCode(bettingPool.BettingPoolCode);

            // 5. Generate barcode
            var barcode = GenerateBarcode(ticketCode);

            // 6. Create ticket entity
            var ticket = new Ticket
            {
                TicketCode = ticketCode,
                Barcode = barcode,
                BettingPoolId = dto.BettingPoolId,
                UserId = dto.UserId,
                TerminalId = dto.TerminalId,
                IpAddress = dto.IpAddress,
                CreatedAt = now,
                GlobalMultiplier = dto.GlobalMultiplier,
                CurrencyCode = "DOP",
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                CustomerIdNumber = dto.CustomerIdNumber,
                Notes = dto.Notes,
                SpecialFlags = hasClosedDraw ? "OUT_OF_SCHEDULE" : null,
                Status = "pending"
            };

            // 6.5 Resolve discount from betting pool config when ApplyDiscount = true
            var discountAmount = 0m;
            var discountPerEvery = 0;
            if (dto.ApplyDiscount)
            {
                var discountConfig = await _context.BettingPoolDiscountConfigs
                    .Where(dc => dc.BettingPoolId == dto.BettingPoolId)
                    .FirstOrDefaultAsync();

                if (discountConfig != null && discountConfig.DiscountMode != "OFF"
                    && discountConfig.DiscountAmount.HasValue && discountConfig.DiscountPerEvery.HasValue
                    && discountConfig.DiscountPerEvery.Value > 0)
                {
                    discountAmount = discountConfig.DiscountAmount.Value;
                    discountPerEvery = discountConfig.DiscountPerEvery.Value;
                    ticket.DiscountMode = discountConfig.DiscountMode;
                    ticket.GlobalDiscount = discountAmount;
                }
                else
                {
                    ticket.DiscountMode = "OFF";
                }
            }
            else
            {
                ticket.DiscountMode = "OFF";
            }

            // 7. Discount is floor-based: floor(betAmount / perEvery) * discountAmount

            // 8. Create ticket lines and calculate totals
            var lineNumber = 1;
            var totalBetAmount = 0m;
            var totalDiscount = 0m;
            var totalSubtotal = 0m;
            var totalWithMultiplier = 0m;
            var totalCommission = 0m;
            var totalNet = 0m;
            var lotteryIds = new HashSet<int>();
            DateTime? earliestDrawTime = null;
            DateTime? latestDrawTime = null;

            foreach (var lineDto in dto.Lines)
            {
                var draw = draws.First(d => d.DrawId == lineDto.DrawId);
                var drawDateTime = ticketDate.Add(draw.DrawTime);

                if (!earliestDrawTime.HasValue || drawDateTime < earliestDrawTime)
                    earliestDrawTime = drawDateTime;
                if (!latestDrawTime.HasValue || drawDateTime > latestDrawTime)
                    latestDrawTime = drawDateTime;

                lotteryIds.Add(draw.LotteryId);

                // Get bet type from pre-fetched dictionary (no DB call)
                betTypesDict.TryGetValue(lineDto.BetTypeId, out var betType);

                var line = new TicketLine
                {
                    LineNumber = lineNumber++,
                    // LotteryId se obtiene de Draw.LotteryId, no duplicar
                    DrawId = lineDto.DrawId,
                    DrawDate = ticketDate,
                    DrawTime = draw.DrawTime,
                    BetNumber = lineDto.BetNumber,
                    BetTypeId = lineDto.BetTypeId,
                    BetTypeCode = betType?.GameTypeCode,
                    Position = lineDto.Position,
                    BetAmount = lineDto.BetAmount,
                    Multiplier = lineDto.Multiplier > 0 ? lineDto.Multiplier : dto.GlobalMultiplier,
                    IsLuckyPick = lineDto.IsLuckyPick,
                    IsOutOfScheduleSale = closedDrawIds.Contains(lineDto.DrawId),
                    Notes = lineDto.Notes,
                    CreatedAt = now,
                    CreatedBy = dto.UserId,
                    LineStatus = "pending"
                };

                // Get commission percentage from betting pool configuration.
                // Lookup priority: per-draw → per-lottery → general (commission_discount_1 only).
                var commissionPercentage = await GetCommissionPercentageAsync(
                    dto.BettingPoolId,
                    lineDto.BetTypeId,
                    draw.LotteryId,
                    lineDto.DrawId);

                // Calculate line totals with commission (discount is on ticket total)
                CalculateTicketLine(line, commissionPercentage);

                totalBetAmount += line.BetAmount;
                totalDiscount += line.DiscountAmount;
                totalSubtotal += line.Subtotal;
                totalWithMultiplier += line.TotalWithMultiplier;
                totalCommission += line.CommissionAmount;
                totalNet += line.NetAmount;

                var limitCheck = await CheckIfPlayIsOnLimitsDetailed(
                    line.DrawId, dto.BettingPoolId, line.BetNumber, line.BetAmount, line.BetTypeId);

                if (limitCheck.Passed || canBypassLimits)
                {
                    if (!limitCheck.Passed && canBypassLimits)
                    {
                        bypassActuallyUsed = true;
                        if (!bypassReasons.Contains("limit_exceeded")) bypassReasons.Add("limit_exceeded");
                    }

                    ticket.TicketLines.Add(line);

                    // Update limit consumption for this line (use full bet amount, not net)
                    await UpdateLimitConsumption(
                        lineDto.DrawId,
                        ticketDate,
                        lineDto.BetNumber,
                        dto.BettingPoolId,
                        line.BetAmount,
                        now,
                        line.BetTypeId);
                } else
                {
                    line.ExceedsLimit = true;

                    var lineError = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        JsonSerializer.Serialize(line)
                    );

                    lineError!["errorType"] = "exceeds-limit";

                    // Attach limit detail for the UI
                    var drawForLine = draws.FirstOrDefault(d => d.DrawId == line.DrawId);
                    lineError["drawName"] = drawForLine?.DrawName ?? string.Empty;
                    lineError["limitScope"] = limitCheck.LimitScope ?? string.Empty;
                    lineError["limitScopeLabel"] = limitCheck.LimitScopeLabel ?? string.Empty;
                    if (limitCheck.LimitAmount.HasValue) lineError["limitAmount"] = limitCheck.LimitAmount.Value;
                    if (limitCheck.CurrentUsed.HasValue) lineError["currentUsed"] = limitCheck.CurrentUsed.Value;
                    if (limitCheck.Available.HasValue) lineError["available"] = limitCheck.Available.Value;
                    lineError["attempted"] = limitCheck.Attempted;
                    if (limitCheck.OverBy.HasValue) lineError["overBy"] = limitCheck.OverBy.Value;

                    invalidBets.Add(lineError);
                }
            }

            if (invalidBets.Count > 0) return BadRequest(new {
                code = "ticket/invalid-bets-exceed-limits",
                invalidBets = invalidBets.ToArray(),
            });

            // 9. Calculate discount on the ticket total bet amount
            // Floor-based: floor(totalBetAmount / perEvery) * discountAmount
            // e.g. config 1:10, totalBet $30 → floor(30/10) * 1 = $3 discount
            if (discountPerEvery > 0 && discountAmount > 0)
            {
                totalDiscount = Math.Floor(totalBetAmount / discountPerEvery) * discountAmount;
            }

            // 9b. Validate max ticket amount
            if (bpConfig?.MaxTicketAmount != null && bpConfig.MaxTicketAmount > 0
                && totalBetAmount > bpConfig.MaxTicketAmount)
            {
                if (canBypassLimits)
                {
                    bypassActuallyUsed = true;
                    if (!bypassReasons.Contains("max_ticket_amount")) bypassReasons.Add("max_ticket_amount");
                }
                else
                {
                    await transaction.RollbackAsync();
                    return UnprocessableEntity(new
                    {
                        code = "MAX_TICKET_AMOUNT_EXCEEDED",
                        ticketAmount = totalBetAmount,
                        maxAmount = bpConfig.MaxTicketAmount
                    });
                }
            }

            // 10. Set ticket totals
            ticket.TotalLines = dto.Lines.Count;
            ticket.TotalBetAmount = totalBetAmount;
            ticket.TotalDiscount = totalDiscount;
            ticket.TotalSubtotal = totalBetAmount - totalDiscount;
            ticket.TotalWithMultiplier = totalWithMultiplier;
            ticket.TotalCommission = totalCommission;
            ticket.TotalNet = totalNet;
            ticket.GrandTotal = totalWithMultiplier;
            ticket.LotteryIds = string.Join(",", lotteryIds);
            ticket.TotalLotteries = lotteryIds.Count;
            ticket.EarliestDrawTime = earliestDrawTime;
            ticket.LatestDrawTime = latestDrawTime;

            // 10. Update betting pool balance (totalNet - totalDiscount)
            var balanceAmount = totalNet - totalDiscount;

            // 10.1 Check deactivation threshold (credit limit)
            // Credito = DeactivationBalance - CurrentBalance (calculated on the fly)
            // If new balance would exceed DeactivationBalance, block the sale
            // DeactivationBalance == 0 or null means "not configured" (no credit limit)
            if (bpConfig?.DeactivationBalance != null && bpConfig.DeactivationBalance.Value > 0)
            {
                var currentBalanceRow = await _context.Balances
                    .AsNoTracking()
                    .FirstOrDefaultAsync(b => b.BettingPoolId == dto.BettingPoolId);
                var currentBalance = currentBalanceRow?.CurrentBalance ?? 0m;
                var projectedBalance = currentBalance + balanceAmount;
                var deactivation = bpConfig.DeactivationBalance.Value;

                if (projectedBalance > deactivation)
                {
                    if (canBypassLimits)
                    {
                        bypassActuallyUsed = true;
                        if (!bypassReasons.Contains("credit_limit")) bypassReasons.Add("credit_limit");
                    }
                    else
                    {
                        var remainingCredit = Math.Max(0, deactivation - currentBalance);
                        await transaction.RollbackAsync();
                        return UnprocessableEntity(new
                        {
                            code = "CREDIT_EXHAUSTED",
                            message = "La banca ha alcanzado su límite de crédito",
                            currentCredit = remainingCredit,
                            ticketAmount = balanceAmount,
                            deactivationBalance = deactivation,
                            currentBalance
                        });
                    }
                }
            }

            await UpdateBettingPoolBalanceAsync(dto.BettingPoolId, balanceAmount, dto.UserId);

            // 11. Save to database
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 11.1 Record warnings for notable conditions
            if (hasClosedDraw)
            {
                await _warningService.RecordAsync(
                    type: WarningTypes.TicketCreatedLate,
                    message: $"Ticket {ticket.TicketCode} creado fuera de hora ({closedDrawIds.Count} sorteo(s) cerrado(s))",
                    bettingPoolId: ticket.BettingPoolId,
                    userId: ticket.UserId,
                    referenceId: ticket.TicketId.ToString(),
                    referenceType: "ticket",
                    severity: "high",
                    metadata: new { ticketCode = ticket.TicketCode, closedDrawIds = closedDrawIds.ToArray() });
            }

            if (canBypassLimits && bypassActuallyUsed)
            {
                var reasonsLabel = string.Join(", ", bypassReasons);
                await _warningService.RecordAsync(
                    type: WarningTypes.TicketBypassValidation,
                    message: $"Ticket {ticket.TicketCode} creado saltando validaciones ({reasonsLabel})",
                    bettingPoolId: ticket.BettingPoolId,
                    userId: ticket.UserId,
                    referenceId: ticket.TicketId.ToString(),
                    referenceType: "ticket",
                    severity: "high",
                    metadata: new
                    {
                        ticketCode = ticket.TicketCode,
                        totalAmount = ticket.TotalBetAmount,
                        bypassReasons
                    });
            }

            // 10.0.1 Release limit reservations for saved plays
            var savedPlays = ticket.TicketLines
                .Select(l => (l.DrawId, l.BetNumber))
                .ToList();
            _limitReservationService.ReleaseAllForBettingPool(dto.BettingPoolId, savedPlays);

            _logger.LogInformation(
                "Created ticket {TicketCode} (ID: {TicketId}) with {LineCount} lines, total: ${Total}",
                ticket.TicketCode,
                ticket.TicketId,
                ticket.TotalLines,
                ticket.GrandTotal);

            // 10.0.2 Update real-time caída display values
            try
            {
                await _caidaService.UpdateRealtimeCaidaAsync(dto.BettingPoolId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to update real-time caída for banca {Id}", dto.BettingPoolId);
            }

            // 10.1 Check if any draws already have results and process ticket immediately
            try
            {
                var ticketDrawDates = ticket.TicketLines
                    .Select(l => (l.DrawId, l.DrawDate.Date))
                    .Distinct()
                    .ToList();

                var existingResults = await _context.Results
                    .Where(r => ticketDrawDates.Select(td => td.DrawId).Contains(r.DrawId))
                    .ToListAsync();

                if (existingResults.Any())
                {
                    _logger.LogInformation(
                        "Ticket {TicketId} has draws with existing results, processing immediately",
                        ticket.TicketId);

                    // Process each draw that has results
                    foreach (var result in existingResults)
                    {
                        var (processed, winners) = await _externalResultsService.ProcessTicketsForDrawAsync(
                            result.DrawId, result.ResultDate);

                        if (winners > 0)
                        {
                            _logger.LogInformation(
                                "Found {Winners} winners for draw {DrawId} in newly created ticket",
                                winners, result.DrawId);
                        }
                    }

                    // Reload ticket to get updated values
                    await _context.Entry(ticket).ReloadAsync();
                    foreach (var line in ticket.TicketLines)
                    {
                        await _context.Entry(line).ReloadAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail ticket creation if result processing fails
                _logger.LogWarning(ex, "Failed to process existing results for new ticket {TicketId}", ticket.TicketId);
            }

            // 11. Build response DTO directly (no additional DB query)
            var createdTicket = new TicketDetailDto
            {
                TicketId = ticket.TicketId,
                TicketCode = ticket.TicketCode,
                Barcode = ticket.Barcode,
                BettingPoolId = ticket.BettingPoolId,
                BettingPoolName = bettingPool.BettingPoolName,
                BettingPoolCode = bettingPool.BettingPoolCode,
                UserId = ticket.UserId,
                UserName = user.FullName,
                TerminalId = ticket.TerminalId,
                IpAddress = ticket.IpAddress,
                CreatedAt = ticket.CreatedAt,
                GlobalMultiplier = ticket.GlobalMultiplier,
                GlobalDiscount = ticket.GlobalDiscount,
                CurrencyCode = ticket.CurrencyCode,
                TotalLines = ticket.TotalLines,
                TotalBetAmount = ticket.TotalBetAmount,
                TotalDiscount = ticket.TotalDiscount,
                TotalSubtotal = ticket.TotalSubtotal,
                TotalWithMultiplier = ticket.TotalWithMultiplier,
                TotalCommission = ticket.TotalCommission,
                TotalNet = ticket.TotalNet,
                GrandTotal = ticket.GrandTotal,
                TotalPrize = ticket.TotalPrize,
                WinningLines = ticket.WinningLines,
                Status = ticket.Status,
                TicketState = ticket.TicketState,
                IsCancelled = ticket.IsCancelled,
                CancelledAt = ticket.CancelledAt,
                CancelledBy = ticket.CancelledBy,
                CancelledByName = null,
                CancellationReason = ticket.CancellationReason,
                IsPaid = ticket.IsPaid,
                PaidAt = ticket.PaidAt,
                PaidBy = ticket.PaidBy,
                PaidByName = null,
                PaymentMethod = ticket.PaymentMethod,
                PaymentReference = ticket.PaymentReference,
                CustomerId = ticket.CustomerId,
                CustomerName = ticket.CustomerName,
                CustomerPhone = ticket.CustomerPhone,
                CustomerEmail = ticket.CustomerEmail,
                CustomerIdNumber = ticket.CustomerIdNumber,
                LotteryIds = ticket.LotteryIds,
                TotalLotteries = ticket.TotalLotteries,
                EarliestDrawTime = ticket.EarliestDrawTime,
                LatestDrawTime = ticket.LatestDrawTime,
                UpdatedAt = ticket.UpdatedAt,
                UpdatedBy = ticket.UpdatedBy,
                UpdatedByName = null,
                PrintCount = ticket.PrintCount,
                LastPrintedAt = ticket.LastPrintedAt,
                Notes = ticket.Notes,
                SpecialFlags = ticket.SpecialFlags,
                Lines = ticket.TicketLines.Select(l =>
                {
                    var lineDraw = draws.First(d => d.DrawId == l.DrawId);
                    betTypesDict.TryGetValue(l.BetTypeId, out var lineBetType);
                    return new TicketLineDto
                    {
                        LineId = l.LineId,
                        TicketId = l.TicketId,
                        LineNumber = l.LineNumber,
                        LotteryId = lineDraw.LotteryId,
                        LotteryName = lineDraw.Lottery?.LotteryName,
                        DrawId = l.DrawId,
                        DrawName = lineDraw.DrawName,
                        DrawDate = l.DrawDate,
                        DrawTime = l.DrawTime,
                        BetNumber = l.BetNumber,
                        BetTypeId = l.BetTypeId,
                        BetTypeCode = lineBetType?.GameTypeCode,
                        BetTypeName = lineBetType?.GameName,
                        Position = l.Position,
                        BetAmount = l.BetAmount,
                        Multiplier = l.Multiplier,
                        DiscountPercentage = l.DiscountPercentage,
                        DiscountAmount = l.DiscountAmount,
                        Subtotal = l.Subtotal,
                        TotalWithMultiplier = l.TotalWithMultiplier,
                        CommissionPercentage = l.CommissionPercentage,
                        CommissionAmount = l.CommissionAmount,
                        NetAmount = l.NetAmount,
                        PrizeMultiplier = l.PrizeMultiplier,
                        PrizeAmount = l.PrizeAmount,
                        IsWinner = l.IsWinner,
                        WinningPosition = l.WinningPosition,
                        ResultNumber = l.ResultNumber,
                        ResultCheckedAt = l.ResultCheckedAt,
                        LineStatus = l.LineStatus,
                        ExceedsLimit = l.ExceedsLimit,
                        IsLuckyPick = l.IsLuckyPick,
                        IsHotNumber = l.IsHotNumber,
                        IsOutOfScheduleSale = l.IsOutOfScheduleSale,
                        Notes = l.Notes
                    };
                }).ToList()
            };
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.TicketId }, createdTicket);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating ticket for bettingPool {BettingPoolId}", dto.BettingPoolId);
            return StatusCode(500, new { message = "Error al crear el ticket", error = ex.Message });
        }
    }

    /// <summary>
    /// PATCH /api/tickets
    /// Filter/list tickets with pagination and aggregated totals
    /// Based on real Vue.js app analysis
    /// </summary>
    /// <param name="filter">Filter criteria</param>
    /// <returns>Paginated ticket list with totals</returns>
    [HttpPatch]
    public async Task<ActionResult<TicketListResponseDto>> FilterTickets([FromBody] TicketFilterDto filter)
    {
        if (!await HasPermissionAsync("TICKET_MONITORING")) return Forbid();

        try
        {
            _logger.LogInformation(
                "Filtering tickets: BettingPoolId={BettingPoolId}, LotteryId={LotteryId}, Date={Date}, Status={Status}",
                filter.BettingPoolId,
                filter.LotteryId,
                filter.Date,
                filter.Status);

            // Build query
            var query = _context.Tickets
                .Include(t => t.BettingPool)
                .Include(t => t.User)
                .AsQueryable();

            // Zone scope — only tickets from bancas in the admin's assigned zones.
            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(t => allowedBpIds.Contains(t.BettingPoolId));
            }

            // Apply filters
            // Get timezone from lottery if specified, otherwise use default (Dominican Republic)
            if (filter.Date.HasValue)
            {
                // Determine timezone based on lottery filter or use default
                string timezoneId = "America/Santo_Domingo";  // Default

                if (filter.LotteryId.HasValue)
                {
                    var lottery = await _context.Lotteries
                        .Where(l => l.LotteryId == filter.LotteryId.Value)
                        .Select(l => new { l.Timezone })
                        .FirstOrDefaultAsync();

                    if (lottery != null && !string.IsNullOrEmpty(lottery.Timezone))
                    {
                        timezoneId = lottery.Timezone;
                    }
                }

                // Convert filter date to UTC range for the full day in the lottery's timezone
                var lotteryTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
                var localStartOfDay = new DateTime(filter.Date.Value.Year, filter.Date.Value.Month, filter.Date.Value.Day, 0, 0, 0, DateTimeKind.Unspecified);
                var localEndOfDay = localStartOfDay.AddDays(1);

                // Filter by DrawDate (the date the ticket is FOR, not when it was created)
                // A ticket appears on a date if ANY of its lines have that DrawDate
                var filterDate = filter.Date.Value.Date;
                query = query.Where(t => t.TicketLines.Any(tl => tl.DrawDate.Date == filterDate));
            }

            if (filter.BettingPoolId.HasValue)
            {
                query = query.Where(t => t.BettingPoolId == filter.BettingPoolId.Value);
            }

            if (filter.LotteryId.HasValue)
            {
                // Filter by lottery ID through Draw navigation
                query = query.Where(t => t.TicketLines.Any(tl => tl.Draw.LotteryId == filter.LotteryId.Value));
            }

            if (filter.BetTypeId.HasValue)
            {
                query = query.Where(t => t.TicketLines.Any(tl => tl.BetTypeId == filter.BetTypeId.Value));
            }

            if (!string.IsNullOrEmpty(filter.BetNumber))
            {
                query = query.Where(t => t.TicketLines.Any(tl => tl.BetNumber == filter.BetNumber));
            }

            if (filter.ZoneIds != null && filter.ZoneIds.Count > 0)
            {
                query = query.Where(t => t.BettingPool != null &&
                                        filter.ZoneIds.Contains(t.BettingPool.ZoneId));
            }

            if (filter.PendingPayment.HasValue && filter.PendingPayment.Value)
            {
                query = query.Where(t => t.WinningLines > 0 && !t.IsPaid);
            }

            if (filter.WinnersOnly.HasValue && filter.WinnersOnly.Value)
            {
                query = query.Where(t => t.WinningLines > 0);
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                switch (filter.Status.ToLower())
                {
                    case "winner":
                        query = query.Where(t => t.WinningLines > 0);
                        break;
                    case "pending":
                        query = query.Where(t => t.Status == "pending");
                        break;
                    case "loser":
                        query = query.Where(t => t.WinningLines == 0 && t.Status != "pending");
                        break;
                    case "cancelled":
                        query = query.Where(t => t.IsCancelled);
                        break;
                }
            }

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var searchTerm = filter.Search.ToLower();
                query = query.Where(t =>
                    t.TicketCode.ToLower().Contains(searchTerm) ||
                    (t.CustomerName != null && t.CustomerName.ToLower().Contains(searchTerm)) ||
                    (t.CustomerPhone != null && t.CustomerPhone.Contains(searchTerm)) ||
                    (t.Barcode != null && t.Barcode.Contains(searchTerm)));
            }

            // Calculate totals before pagination
            var totalCount = await query.CountAsync();
            var totalAmount = await query.SumAsync(t => (decimal?)t.GrandTotal) ?? 0m;
            var totalPrizes = await query.SumAsync(t => (decimal?)t.TotalPrize) ?? 0m;
            var totalPending = await query.Where(t => t.Status == "pending")
                .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m;

            // Count by status
            var totalTickets = totalCount;
            var winnerTickets = await query.Where(t => t.WinningLines > 0).CountAsync();
            var pendingTickets = await query.Where(t => t.Status == "pending").CountAsync();
            var loserTickets = await query.Where(t => t.WinningLines == 0 && t.Status != "pending").CountAsync();
            var cancelledTickets = await query.Where(t => t.IsCancelled).CountAsync();

            // Apply pagination
            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(t => new TicketListDto
                {
                    TicketId = t.TicketId,
                    TicketCode = t.TicketCode,
                    Barcode = t.Barcode,
                    BettingPoolId = t.BettingPoolId,
                    BettingPoolName = t.BettingPool != null ? t.BettingPool.BettingPoolName : null,
                    UserId = t.UserId,
                    UserName = t.User != null ? t.User.Username : null,
                    CreatedAt = t.CreatedAt,
                    TotalLines = t.TotalLines,
                    GrandTotal = t.TotalBetAmount,
                    TotalPrize = t.TotalPrize,
                    WinningLines = t.WinningLines,
                    Status = t.Status,
                    TicketState = t.TicketState,
                    IsCancelled = t.IsCancelled,
                    CancelledAt = t.CancelledAt,
                    CancelledBy = t.CancelledBy,
                    CancelledByName = t.CancelledBy != null
                        ? _context.Users.Where(u => u.UserId == t.CancelledBy).Select(u => u.Username).FirstOrDefault()
                        : null,
                    IsPaid = t.IsPaid,
                    PaidAt = t.PaidAt,
                    CustomerName = t.CustomerName,
                    CustomerPhone = t.CustomerPhone,
                    EarliestDrawTime = t.EarliestDrawTime,
                    LatestDrawTime = t.LatestDrawTime,
                    PrintCount = t.PrintCount,
                    IsOutOfScheduleSale = t.SpecialFlags != null && t.SpecialFlags.Contains("OUT_OF_SCHEDULE"),
                    IsCancelledOutOfTime = t.SpecialFlags != null && t.SpecialFlags.Contains("CANCELLED_OUT_OF_TIME")
                })
                .ToListAsync();

            var result = new TicketListResponseDto
            {
                Tickets = tickets,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
                TotalAmount = totalAmount,
                TotalPrizes = totalPrizes,
                TotalPending = totalPending,
                TotalTickets = totalTickets,
                WinnerTickets = winnerTickets,
                PendingTickets = pendingTickets,
                LoserTickets = loserTickets,
                CancelledTickets = cancelledTickets
            };

            _logger.LogInformation(
                "Filtered tickets: {Count} results, {TotalAmount} total amount, {WinnerCount} winners",
                tickets.Count,
                totalAmount,
                winnerTickets);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error filtering tickets");
            return StatusCode(500, new { message = "Error al filtrar tickets", error = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/tickets/{id}
    /// Get complete ticket details with all lines
    /// </summary>
    /// <param name="id">Ticket ID</param>
    /// <returns>Ticket detail with lines</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicket(long id)
    {
        try
        {
            _logger.LogInformation("Getting ticket {TicketId}", id);

            var ticket = await GetTicketById(id);
            if (ticket == null)
            {
                return NotFound(new { message = "Ticket no encontrado" });
            }

            // Zone scope.
            if (!await _zoneScope.IsBettingPoolAllowedAsync(ticket.BettingPoolId))
            {
                return NotFound(new { message = "Ticket no encontrado" });
            }

            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al obtener el ticket", error = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/tickets/by-barcode/{barcode}
    /// Search ticket by barcode
    /// </summary>
    /// <param name="barcode">Ticket barcode</param>
    /// <returns>Ticket detail with lines</returns>
    [HttpGet("by-barcode/{barcode}")]
    public async Task<ActionResult<TicketDetailDto>> GetTicketByBarcode(string barcode)
    {
        try
        {
            _logger.LogInformation("Searching ticket by barcode {Barcode}", barcode);

            var ticketRef = await _context.Tickets
                .AsNoTracking()
                .Where(t => t.Barcode == barcode)
                .Select(t => new { t.TicketId, t.BettingPoolId })
                .FirstOrDefaultAsync();

            if (ticketRef == null)
            {
                return NotFound(new { message = "Ticket no encontrado con ese código de barras" });
            }

            // Zone scope — hide cross-zone tickets from scoped admins.
            if (!await _zoneScope.IsBettingPoolAllowedAsync(ticketRef.BettingPoolId))
            {
                return NotFound(new { message = "Ticket no encontrado con ese código de barras" });
            }

            var ticket = await GetTicketById(ticketRef.TicketId);
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching ticket by barcode {Barcode}", barcode);
            return StatusCode(500, new { message = "Error al buscar el ticket", error = ex.Message });
        }
    }

    /// <summary>
    /// PATCH /api/tickets/{id}/cancel
    /// Cancel a ticket (within cancellation time window)
    /// </summary>
    /// <param name="id">Ticket ID</param>
    /// <param name="dto">Cancellation data</param>
    /// <returns>Updated ticket</returns>
    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<TicketDetailDto>> CancelTicket(long id, [FromBody] CancelTicketDto dto)
    {
        if (!await HasPermissionAsync("CANCEL_TICKET")) return Forbid();

        try
        {
            _logger.LogInformation("Canceling ticket {TicketId} by user {UserId}", id, dto.CancelledBy);

            // 1. Get ticket
            var ticket = await _context.Tickets
                .Include(t => t.TicketLines)
                .FirstOrDefaultAsync(t => t.TicketId == id);

            if (ticket == null)
            {
                return NotFound(new { code = "TICKET_NOT_FOUND" });
            }

            // Zone scope — admin cannot cancel tickets of bancas outside their zones.
            if (!await _zoneScope.IsBettingPoolAllowedAsync(ticket.BettingPoolId))
            {
                return Forbid();
            }

            // 2. Validate ticket not already cancelled
            if (ticket.IsCancelled)
            {
                return UnprocessableEntity(new { code = "TICKET_ALREADY_CANCELLED" });
            }

            // 3. Validate ticket not already paid
            if (ticket.IsPaid)
            {
                return UnprocessableEntity(new { code = "TICKET_ALREADY_PAID" });
            }

            // 4. Validate cancellation time window
            var canCancelAnytime = await _context.UserPermissions
                .AnyAsync(up => up.UserId == dto.CancelledBy
                    && up.Permission!.PermissionCode == "CANCEL_TICKETS_ANYTIME"
                    && up.IsActive);

            var now = DateTime.UtcNow;

            if (!canCancelAnytime)
            {
                var bpCancelConfig = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.BettingPoolId == ticket.BettingPoolId);
                var cancelMinutes = bpCancelConfig?.CancelMinutes ?? 5;
                var timeSinceCreation = now - ticket.CreatedAt;

                if (timeSinceCreation.TotalMinutes > cancelMinutes)
                {
                    return UnprocessableEntity(new
                    {
                        code = "CANCELLATION_TIME_EXPIRED",
                        maxMinutes = cancelMinutes
                    });
                }
            }

            // 4b. Validate max cancel amount and daily cancel count
            if (!canCancelAnytime)
            {
                var bpConfig = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.BettingPoolId == ticket.BettingPoolId);

                if (bpConfig?.MaxCancelAmount != null && bpConfig.MaxCancelAmount > 0
                    && ticket.TotalBetAmount > bpConfig.MaxCancelAmount)
                {
                    return UnprocessableEntity(new
                    {
                        code = "CANCEL_AMOUNT_EXCEEDED",
                        ticketAmount = ticket.TotalBetAmount,
                        maxAmount = bpConfig.MaxCancelAmount
                    });
                }

                if (bpConfig?.DailyCancelTickets != null && bpConfig.DailyCancelTickets > 0)
                {
                    var todayStart = DateTime.UtcNow.Date;
                    var cancelledToday = await _context.Tickets
                        .CountAsync(t => t.BettingPoolId == ticket.BettingPoolId
                            && t.IsCancelled
                            && t.CancelledAt != null
                            && t.CancelledAt >= todayStart);

                    if (cancelledToday >= bpConfig.DailyCancelTickets)
                    {
                        return UnprocessableEntity(new
                        {
                            code = "DAILY_CANCEL_LIMIT_REACHED",
                            cancelledToday,
                            maxPerDay = bpConfig.DailyCancelTickets
                        });
                    }
                }
            }

            // 5. Validate user exists
            var user = await _context.Users.FindAsync(dto.CancelledBy);
            if (user == null)
            {
                return NotFound(new { code = "USER_NOT_FOUND" });
            }

            // 6. Check if cancellation is out of time (admin override)
            if (canCancelAnytime)
            {
                var bpCancelConfig = await _context.BettingPoolConfigs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.BettingPoolId == ticket.BettingPoolId);
                var cancelMinutes = bpCancelConfig?.CancelMinutes ?? 5;
                var timeSinceCreation = now - ticket.CreatedAt;

                if (timeSinceCreation.TotalMinutes > cancelMinutes)
                {
                    // Append CANCELLED_OUT_OF_TIME flag
                    var flags = string.IsNullOrEmpty(ticket.SpecialFlags)
                        ? "CANCELLED_OUT_OF_TIME"
                        : ticket.SpecialFlags + "|CANCELLED_OUT_OF_TIME";
                    ticket.SpecialFlags = flags;
                }
            }

            // 7. Cancel ticket
            ticket.IsCancelled = true;
            ticket.CancelledAt = now;
            ticket.CancelledBy = dto.CancelledBy;
            ticket.CancellationReason = dto.CancellationReason;
            ticket.Status = "cancelled";
            ticket.UpdatedAt = now;
            ticket.UpdatedBy = dto.CancelledBy;

            // 8. Cancel all lines
            foreach (var line in ticket.TicketLines)
            {
                line.LineStatus = "cancelled";
                line.UpdatedAt = now;
                line.UpdatedBy = dto.CancelledBy;
            }

            // 8.1 Reverse balance: subtract (TotalNet - TotalDiscount), add back TotalPrize if winner
            var balanceReversal = -(ticket.TotalNet - ticket.TotalDiscount) + ticket.TotalPrize;
            if (balanceReversal != 0)
            {
                await UpdateBettingPoolBalanceAsync(ticket.BettingPoolId, balanceReversal, dto.CancelledBy);
            }


            // 8.2 Reverse limit consumption for each line
            foreach (var line in ticket.TicketLines)
            {
                // Use the actual bet type stored on the line — inferring from bet number
                // length is wrong (PICK2 and DIRECTO are both 2 digits, etc.).
                var gameTypeId = line.BetTypeId;
                var drawDate = DateOnly.FromDateTime(line.DrawDate.Date);

                // Find all consumption records for this line across all rule levels
                var consumptions = await _context.LimitConsumptions
                    .Where(lc => lc.DrawId == line.DrawId
                        && lc.DrawDate == drawDate
                        && lc.GameTypeId == gameTypeId
                        && lc.BetNumber == line.BetNumber
                        && lc.BettingPoolId == ticket.BettingPoolId)
                    .ToListAsync();

                foreach (var lc in consumptions)
                {
                    lc.CurrentAmount = Math.Max(0, lc.CurrentAmount - line.BetAmount);
                    lc.BetCount = Math.Max(0, lc.BetCount - 1);
                    lc.UpdatedAt = now;
                }
            }

            await _context.SaveChangesAsync();

            // 8.3 Record warnings for notable cancellation conditions
            try
            {
                var cancelledLate = ticket.SpecialFlags?.Contains("CANCELLED_OUT_OF_TIME") == true;
                var cancelledAfterDraw = ticket.TicketLines.Any(l =>
                {
                    var drawDateTimeUtc = l.DrawDate.Date.Add(l.DrawTime);
                    return now > drawDateTimeUtc;
                });
                var winnerCancelled = ticket.TotalPrize > 0
                    || ticket.TicketLines.Any(l => l.IsWinner);

                if (cancelledLate)
                {
                    await _warningService.RecordAsync(
                        type: WarningTypes.TicketCancelledLate,
                        message: $"Ticket {ticket.TicketCode} cancelado fuera de hora",
                        bettingPoolId: ticket.BettingPoolId,
                        userId: dto.CancelledBy,
                        referenceId: ticket.TicketId.ToString(),
                        referenceType: "ticket",
                        severity: "high",
                        metadata: new { ticketCode = ticket.TicketCode, totalAmount = ticket.TotalBetAmount });
                }

                if (cancelledAfterDraw)
                {
                    await _warningService.RecordAsync(
                        type: WarningTypes.TicketCancelledAfterDraw,
                        message: $"Ticket {ticket.TicketCode} cancelado después de la hora del sorteo",
                        bettingPoolId: ticket.BettingPoolId,
                        userId: dto.CancelledBy,
                        referenceId: ticket.TicketId.ToString(),
                        referenceType: "ticket",
                        severity: "high",
                        metadata: new { ticketCode = ticket.TicketCode, totalAmount = ticket.TotalBetAmount });
                }

                if (winnerCancelled)
                {
                    await _warningService.RecordAsync(
                        type: WarningTypes.TicketWinnerCancelled,
                        message: $"Ticket ganador {ticket.TicketCode} fue cancelado (premio: ${ticket.TotalPrize})",
                        bettingPoolId: ticket.BettingPoolId,
                        userId: dto.CancelledBy,
                        referenceId: ticket.TicketId.ToString(),
                        referenceType: "ticket",
                        severity: "high",
                        metadata: new { ticketCode = ticket.TicketCode, totalPrize = ticket.TotalPrize });
                }
            }
            catch (Exception warnEx)
            {
                _logger.LogWarning(warnEx, "Failed to record cancellation warnings for ticket {TicketId}", ticket.TicketId);
            }

            _logger.LogInformation(
                "Cancelled ticket {TicketCode} (ID: {TicketId}) by user {UserId}, reason: {Reason}",
                ticket.TicketCode,
                ticket.TicketId,
                dto.CancelledBy,
                dto.CancellationReason);

            // 9. Return updated ticket
            var updatedTicket = await GetTicketById(ticket.TicketId);
            return Ok(updatedTicket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error canceling ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al cancelar el ticket", error = ex.Message });
        }
    }

    /// <summary>
    /// PATCH /api/tickets/{id}/pay
    /// Pay a prize for a winning ticket
    /// </summary>
    /// <param name="id">Ticket ID</param>
    /// <param name="dto">Payment data</param>
    /// <returns>Updated ticket</returns>
    [HttpPatch("{id}/pay")]
    public async Task<ActionResult<TicketDetailDto>> PayTicket(long id, [FromBody] PayTicketDto dto)
    {
        if (!await HasPermissionAsync("MARK_TICKET_AS_PAID")) return Forbid();

        try
        {
            _logger.LogInformation("Paying ticket {TicketId} by user {UserId}", id, dto.PaidBy);

            // 1. Get ticket
            var ticket = await _context.Tickets
                .Include(t => t.TicketLines)
                .FirstOrDefaultAsync(t => t.TicketId == id);

            if (ticket == null)
            {
                return NotFound(new { message = "Ticket no encontrado" });
            }

            // Zone scope — admin cannot pay tickets of bancas outside their zones.
            if (!await _zoneScope.IsBettingPoolAllowedAsync(ticket.BettingPoolId))
            {
                return Forbid();
            }

            // 2. Validate ticket is cancelled
            if (ticket.IsCancelled)
            {
                return UnprocessableEntity(new { message = "No se puede pagar un ticket cancelado" });
            }

            // 3. Validate ticket not already paid
            if (ticket.IsPaid)
            {
                return UnprocessableEntity(new { message = "El ticket ya está pagado" });
            }

            // 4. Validate ticket has prizes
            if (ticket.TotalPrize <= 0)
            {
                return UnprocessableEntity(new { message = "El ticket no tiene premios para pagar" });
            }

            // 5. Validate user exists
            var user = await _context.Users.FindAsync(dto.PaidBy);
            if (user == null)
            {
                return NotFound(new { message = "El usuario que paga no existe" });
            }

            // 6. Mark ticket as paid
            var now = DateTime.UtcNow;
            ticket.IsPaid = true;
            ticket.PaidAt = now;
            ticket.PaidBy = dto.PaidBy;
            ticket.PaymentMethod = dto.PaymentMethod;
            ticket.PaymentReference = dto.PaymentReference;
            ticket.Status = "paid";
            ticket.UpdatedAt = now;
            ticket.UpdatedBy = dto.PaidBy;

            // 7. Update winning lines status
            foreach (var line in ticket.TicketLines.Where(l => l.IsWinner))
            {
                line.LineStatus = "paid";
                line.UpdatedAt = now;
                line.UpdatedBy = dto.PaidBy;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Paid ticket {TicketCode} (ID: {TicketId}) by user {UserId}, amount: ${Amount}, method: {Method}",
                ticket.TicketCode,
                ticket.TicketId,
                dto.PaidBy,
                ticket.TotalPrize,
                dto.PaymentMethod);

            // 8. Return updated ticket
            var updatedTicket = await GetTicketById(ticket.TicketId);
            return Ok(updatedTicket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error paying ticket {TicketId}", id);
            return StatusCode(500, new { message = "Error al pagar el ticket", error = ex.Message });
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    /// <summary>
    /// Calculate ticket line amounts (discount, commission, net)
    /// </summary>
    private void CalculateTicketLine(TicketLine line, decimal commissionPercentage)
    {
        // Discount is calculated on the ticket total, not per line
        line.DiscountAmount = 0;
        line.DiscountPercentage = 0;

        line.Subtotal = line.BetAmount;
        line.TotalWithMultiplier = line.Subtotal * line.Multiplier;
        line.CommissionPercentage = commissionPercentage;
        line.CommissionAmount = line.TotalWithMultiplier * (commissionPercentage / 100);
        line.NetAmount = line.TotalWithMultiplier - line.CommissionAmount;
    }

    /// <summary>
    /// Get commission percentage from betting pool configuration.
    /// Currently uses commission_discount_1 only.
    ///
    /// FUTURE: The system supports 4 levels of commission per bet type:
    /// - commission_discount_1: Currently used (primary commission)
    /// - commission_discount_2: Reserved for future use (e.g., volume-based tiers)
    /// - commission_discount_3: Reserved for future use
    /// - commission_discount_4: Reserved for future use
    ///
    /// Additionally, there's a second set for sub-agents:
    /// - commission_2_discount_1 to commission_2_discount_4
    ///
    /// The bet type code mapping:
    /// - "DIRECTO" = Direct bet
    /// - "PALE" = Pale bet
    /// - "TRIPLETA" = Tripleta bet
    /// - "CASH3_STRAIGHT", "CASH3_BOX" = USA Cash3
    /// - "PLAY4_STRAIGHT", "PLAY4_BOX" = USA Play4
    /// - etc.
    /// </summary>
    private async Task<decimal> GetCommissionPercentageAsync(
        int bettingPoolId,
        int betTypeId,
        int? lotteryId,
        int? drawId = null)
    {
        // Get the bet type code to match against configuration
        var betType = await _context.GameTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(gt => gt.GameTypeId == betTypeId);

        if (betType == null)
        {
            _logger.LogWarning("Bet type {BetTypeId} not found, using default commission 0%", betTypeId);
            return 0.00m;
        }

        // Lookup priority (most specific wins):
        //   1. (banca, draw, gameType)   — per-draw override
        //   2. (banca, lottery, gameType) — per-lottery
        //   3. (banca, NULL, gameType)    — general fallback
        Models.BettingPoolPrizesCommission? config = null;

        if (drawId.HasValue)
        {
            config = await _context.Set<Models.BettingPoolPrizesCommission>()
                .AsNoTracking()
                .Where(c =>
                    c.BettingPoolId == bettingPoolId &&
                    c.GameType == betType.GameTypeCode &&
                    c.IsActive == true &&
                    c.DrawId == drawId.Value)
                .FirstOrDefaultAsync();
        }

        if (config == null && lotteryId.HasValue)
        {
            config = await _context.Set<Models.BettingPoolPrizesCommission>()
                .AsNoTracking()
                .Where(c =>
                    c.BettingPoolId == bettingPoolId &&
                    c.GameType == betType.GameTypeCode &&
                    c.IsActive == true &&
                    c.DrawId == null &&
                    c.LotteryId == lotteryId.Value)
                .FirstOrDefaultAsync();
        }

        if (config == null)
        {
            config = await _context.Set<Models.BettingPoolPrizesCommission>()
                .AsNoTracking()
                .Where(c =>
                    c.BettingPoolId == bettingPoolId &&
                    c.GameType == betType.GameTypeCode &&
                    c.IsActive == true &&
                    c.DrawId == null &&
                    c.LotteryId == null)
                .FirstOrDefaultAsync();
        }

        if (config != null)
        {
            var commission = config.CommissionDiscount1 ?? 0.00m;

            _logger.LogDebug(
                "Commission for pool {PoolId}, bet type {BetType}, draw {DrawId}, lottery {LotteryId}: {Commission}% (config #{ConfigId})",
                bettingPoolId, betType.GameTypeCode, drawId, lotteryId, commission, config.PrizeCommissionId);

            return commission;
        }

        // No configuration found, return 0 (no commission)
        _logger.LogDebug(
            "No commission config found for pool {PoolId}, bet type {BetType}, using 0%",
            bettingPoolId, betType.GameTypeCode);

        return 0.00m;
    }

    /// <summary>
    /// Generate unique ticket code (format: XX-{BANCACODE}-{SEQUENCE:D9}, ~22 characters)
    /// XX = Random 2-letter prefix, Example: EA-LB-0039-000000001
    /// </summary>
    private async Task<string> GenerateTicketCode(string bancaCode)
    {
        // Generate random 2-letter prefix
        var random = new Random();
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var randomPrefix = $"{letters[random.Next(letters.Length)]}{letters[random.Next(letters.Length)]}";

        // Get the next sequence number for this banca (regardless of prefix)
        var bancaPrefix = $"-{bancaCode}-";

        var sequence = await _context.Tickets
            .Where(t => t.TicketCode.Contains(bancaPrefix))
            .CountAsync() + 1;

        return $"{randomPrefix}-{bancaCode}-{sequence:D9}";
    }

    /// <summary>
    /// Generate unique barcode (numeric only, 12 digits)
    /// Format: 12 random digits
    /// Example: 738199870546
    /// </summary>
    private string GenerateBarcode(string ticketCode)
    {
        var random = new Random();
        var barcode = "";
        for (int i = 0; i < 12; i++)
        {
            barcode += random.Next(0, 10).ToString();
        }
        return barcode;
    }

    /// <summary>
    /// Get full ticket by ID with all related entities
    /// </summary>
    private async Task<TicketDetailDto?> GetTicketById(long ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.BettingPool)
            .Include(t => t.User)
            .Include(t => t.TicketLines)
                .ThenInclude(tl => tl.Draw)
                    .ThenInclude(d => d.Lottery)  // Lottery se accede a través de Draw
            .Include(t => t.TicketLines)
                .ThenInclude(tl => tl.BetType)
            .FirstOrDefaultAsync(t => t.TicketId == ticketId);

        if (ticket == null)
            return null;

        // Get user names for cancelled by and paid by
        string? cancelledByName = null;
        string? paidByName = null;
        string? updatedByName = null;

        if (ticket.CancelledBy.HasValue)
        {
            var cancelledByUser = await _context.Users.FindAsync(ticket.CancelledBy.Value);
            cancelledByName = cancelledByUser?.FullName;
        }

        if (ticket.PaidBy.HasValue)
        {
            var paidByUser = await _context.Users.FindAsync(ticket.PaidBy.Value);
            paidByName = paidByUser?.FullName;
        }

        if (ticket.UpdatedBy.HasValue)
        {
            var updatedByUser = await _context.Users.FindAsync(ticket.UpdatedBy.Value);
            updatedByName = updatedByUser?.FullName;
        }

        return new TicketDetailDto
        {
            TicketId = ticket.TicketId,
            TicketCode = ticket.TicketCode,
            Barcode = ticket.Barcode,
            BettingPoolId = ticket.BettingPoolId,
            BettingPoolName = ticket.BettingPool?.BettingPoolName,
            BettingPoolCode = ticket.BettingPool?.BettingPoolCode,
            UserId = ticket.UserId,
            UserName = ticket.User?.FullName,
            TerminalId = ticket.TerminalId,
            IpAddress = ticket.IpAddress,
            CreatedAt = ticket.CreatedAt,
            GlobalMultiplier = ticket.GlobalMultiplier,
            GlobalDiscount = ticket.GlobalDiscount,
            CurrencyCode = ticket.CurrencyCode,
            TotalLines = ticket.TotalLines,
            TotalBetAmount = ticket.TotalBetAmount,
            TotalDiscount = ticket.TotalDiscount,
            TotalSubtotal = ticket.TotalSubtotal,
            TotalWithMultiplier = ticket.TotalWithMultiplier,
            TotalCommission = ticket.TotalCommission,
            TotalNet = ticket.TotalNet,
            GrandTotal = ticket.GrandTotal,
            TotalPrize = ticket.TotalPrize,
            WinningLines = ticket.WinningLines,
            Status = ticket.Status,
            TicketState = ticket.TicketState,
            IsCancelled = ticket.IsCancelled,
            CancelledAt = ticket.CancelledAt,
            CancelledBy = ticket.CancelledBy,
            CancelledByName = cancelledByName,
            CancellationReason = ticket.CancellationReason,
            IsPaid = ticket.IsPaid,
            PaidAt = ticket.PaidAt,
            PaidBy = ticket.PaidBy,
            PaidByName = paidByName,
            PaymentMethod = ticket.PaymentMethod,
            PaymentReference = ticket.PaymentReference,
            CustomerId = ticket.CustomerId,
            CustomerName = ticket.CustomerName,
            CustomerPhone = ticket.CustomerPhone,
            CustomerEmail = ticket.CustomerEmail,
            CustomerIdNumber = ticket.CustomerIdNumber,
            LotteryIds = ticket.LotteryIds,
            TotalLotteries = ticket.TotalLotteries,
            EarliestDrawTime = ticket.EarliestDrawTime,
            LatestDrawTime = ticket.LatestDrawTime,
            UpdatedAt = ticket.UpdatedAt,
            UpdatedBy = ticket.UpdatedBy,
            UpdatedByName = updatedByName,
            PrintCount = ticket.PrintCount,
            LastPrintedAt = ticket.LastPrintedAt,
            Notes = ticket.Notes,
            SpecialFlags = ticket.SpecialFlags,
            Lines = ticket.TicketLines.Select(l => new TicketLineDto
            {
                LineId = l.LineId,
                TicketId = l.TicketId,
                LineNumber = l.LineNumber,
                LotteryId = l.Draw.LotteryId,
                LotteryName = l.Draw?.Lottery?.LotteryName,
                DrawId = l.DrawId,
                DrawName = l.Draw?.DrawName,
                DrawDate = l.DrawDate,
                DrawTime = l.DrawTime,
                BetNumber = l.BetNumber,
                BetTypeId = l.BetTypeId,
                BetTypeCode = l.BetTypeCode,
                BetTypeName = l.BetType?.GameName,
                Position = l.Position,
                BetAmount = l.BetAmount,
                Multiplier = l.Multiplier,
                DiscountPercentage = l.DiscountPercentage,
                DiscountAmount = l.DiscountAmount,
                Subtotal = l.Subtotal,
                TotalWithMultiplier = l.TotalWithMultiplier,
                CommissionPercentage = l.CommissionPercentage,
                CommissionAmount = l.CommissionAmount,
                NetAmount = l.NetAmount,
                PrizeMultiplier = l.PrizeMultiplier,
                PrizeAmount = l.PrizeAmount,
                IsWinner = l.IsWinner,
                WinningPosition = l.WinningPosition,
                ResultNumber = l.ResultNumber,
                ResultCheckedAt = l.ResultCheckedAt,
                LineStatus = l.LineStatus,
                ExceedsLimit = l.ExceedsLimit,
                IsLuckyPick = l.IsLuckyPick,
                IsHotNumber = l.IsHotNumber,
                IsOutOfScheduleSale = l.IsOutOfScheduleSale,
                Notes = l.Notes
            }).ToList()
        };
    }

    /// <summary>
    /// GET /api/tickets/plays/summary
    /// Get play summary (sales by bet number) for a specific draw and date
    /// </summary>
    /// <param name="drawId">Draw ID to filter by</param>
    /// <param name="date">Date to filter by (YYYY-MM-DD)</param>
    /// <param name="zoneIds">Optional comma-separated list of zone IDs</param>
    /// <param name="bettingPoolId">Optional betting pool ID</param>
    /// <returns>Play summary grouped by bet number</returns>
    [HttpGet("plays/summary")]
    public async Task<ActionResult<PlaySummaryResponseDto>> GetPlaysSummary(
        [FromQuery] int drawId,
        [FromQuery] DateTime date,
        [FromQuery] string? zoneIds,
        [FromQuery] int? bettingPoolId)
    {
        if (!await HasPermissionAsync("TICKET_MONITORING")) return Forbid();

        try
        {
            _logger.LogInformation(
                "Getting plays summary for drawId={DrawId}, date={Date}, zoneIds={ZoneIds}, bettingPoolId={BettingPoolId}",
                drawId, date, zoneIds, bettingPoolId);

            // Parse zone IDs if provided
            var zoneIdList = string.IsNullOrEmpty(zoneIds)
                ? new List<int>()
                : zoneIds.Split(',').Select(int.Parse).ToList();

            // Get the draw name for reference
            var draw = await _context.Draws.FindAsync(drawId);
            if (draw == null)
            {
                return NotFound(new { message = "Sorteo no encontrado" });
            }

            // Build query for ticket lines
            var query = _context.Set<TicketLine>()
                .Include(tl => tl.Ticket)
                    .ThenInclude(t => t!.BettingPool)
                .Where(tl => tl.DrawId == drawId)
                .Where(tl => tl.DrawDate.Date == date.Date)
                .Where(tl => tl.Ticket != null && tl.Ticket.Status != "cancelled");

            // Zone scope.
            var allowedBpIds = await _zoneScope.GetAllowedBettingPoolIdsAsync();
            if (allowedBpIds != null)
            {
                query = query.Where(tl => tl.Ticket != null && allowedBpIds.Contains(tl.Ticket.BettingPoolId));
            }

            // Filter by zones if provided (zone is on BettingPool, not Ticket)
            if (zoneIdList.Any())
            {
                query = query.Where(tl => tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            // Filter by betting pool if provided
            if (bettingPoolId.HasValue)
            {
                query = query.Where(tl => tl.Ticket != null && tl.Ticket.BettingPoolId == bettingPoolId.Value);
            }

            // Group by bet number and aggregate sales
            var playData = await query
                .GroupBy(tl => tl.BetNumber)
                .Select(g => new
                {
                    BetNumber = g.Key,
                    SalesAmount = g.Sum(tl => tl.BetAmount)
                })
                .ToListAsync();

            // Default limit amount (TODO: integrate with limits system when available)
            const decimal defaultLimit = 1000m;

            // Transform to DTOs
            var items = playData
                .Select(p => new PlaySummaryDto
                {
                    BetNumber = p.BetNumber,
                    SalesAmount = p.SalesAmount,
                    LimitAmount = defaultLimit,
                    AvailableAmount = Math.Max(0, defaultLimit - p.SalesAmount),
                    Percentage = Math.Round((p.SalesAmount / defaultLimit) * 100, 1)
                })
                .OrderBy(p => p.BetNumber)
                .ToList();

            var response = new PlaySummaryResponseDto
            {
                Items = items,
                TotalNumbers = items.Count,
                TotalSales = items.Sum(i => i.SalesAmount),
                DrawName = draw.DrawName,
                Date = date
            };

            _logger.LogInformation(
                "Returning {Count} play summaries with total sales {TotalSales}",
                items.Count, response.TotalSales);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting plays summary");
            return StatusCode(500, new { message = "Error al obtener el resumen de jugadas" });
        }
    }

    /// <summary>
    /// POST /api/tickets/reset-commissions
    /// Reset all commissions to 0 for all tickets and ticket lines
    /// </summary>
    [HttpPost("reset-commissions")]
    public async Task<ActionResult> ResetCommissions()
    {
        try
        {
            _logger.LogInformation("Resetting all commissions to 0");

            // Update all ticket lines
            var linesUpdated = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE ticket_lines SET commission_amount = 0, commission_percentage = 0");

            // Update all tickets
            var ticketsUpdated = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE tickets SET total_commission = 0");

            _logger.LogInformation("Reset commissions: {Lines} lines, {Tickets} tickets updated",
                linesUpdated, ticketsUpdated);

            return Ok(new {
                message = "Comisiones reseteadas a 0",
                linesUpdated,
                ticketsUpdated
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting commissions");
            return StatusCode(500, new { message = "Error al resetear las comisiones" });
        }
    }

    /// <summary>
    /// Update the betting pool balance. Positive amount increases, negative decreases.
    /// Creates the balance record if it doesn't exist.
    /// </summary>
    private async Task UpdateBettingPoolBalanceAsync(int bettingPoolId, decimal amount, int? userId = null)
    {
        var balance = await _context.Balances
            .FirstOrDefaultAsync(b => b.BettingPoolId == bettingPoolId);

        if (balance == null)
        {
            balance = new Balance
            {
                BettingPoolId = bettingPoolId,
                CurrentBalance = amount,
                LastUpdated = DateTime.UtcNow,
                UpdatedBy = userId
            };
            _context.Balances.Add(balance);
        }
        else
        {
            balance.CurrentBalance += amount;
            balance.LastUpdated = DateTime.UtcNow;
            balance.UpdatedBy = userId;
        }
    }

    /// <summary>
    /// Update or create limit consumption record for a bet
    /// </summary>
    /// <param name="drawId">Draw ID</param>
    /// <param name="drawDate">Draw date</param>
    /// <param name="betNumber">Bet number</param>
    /// <param name="bettingPoolId">Betting pool ID</param>
    /// <param name="betAmount">Amount to add to consumption</param>
    /// <param name="timestamp">Current timestamp</param>
    /// <summary>
    /// Determine game type ID from bet number length
    /// </summary>
    private static int GetGameTypeIdFromBetNumber(string betNumber)
    {
        return betNumber.Length switch
        {
            2 => 1,  // Directo
            4 => 2,  // Pale
            6 => 3,  // Tripleta
            3 => 4,  // Cash3 Straight
            5 => 12, // Pick5 Straight
            _ => 1   // Default to Directo
        };
    }

    /// <summary>
    /// Increment the consumption counters for all applicable limit rules.
    /// <paramref name="gameTypeId"/> MUST be the actual bet type the user selected.
    /// </summary>
    private async Task UpdateLimitConsumption(
        int drawId,
        DateTime drawDate,
        string betNumber,
        int bettingPoolId,
        decimal betAmount,
        DateTime timestamp,
        int gameTypeId)
    {
        var today = DateOnly.FromDateTime(drawDate);

        var bettingPool = await _context.BettingPools.AsNoTracking()
            .Where(bp => bp.BettingPoolId == bettingPoolId)
            .Select(bp => new { bp.BettingPoolId, bp.ZoneId })
            .FirstOrDefaultAsync();
        var zoneId = bettingPool?.ZoneId ?? 0;

        var todayDow = (int)timestamp.DayOfWeek;
        var dayBit = todayDow switch
        {
            1 => 1, 2 => 2, 3 => 4, 4 => 8, 5 => 16, 6 => 32, 0 => 64, _ => 0
        };

        // Find ALL applicable limit rules at every level (not just the most specific)
        var applicableRules = new List<LimitRule>();

        // Banca limit
        var bancaRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.GeneralForBettingPool
                && lr.BettingPoolId == bettingPoolId
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();
        if (bancaRule != null) applicableRules.Add(bancaRule);

        // Local Banca limit
        var localBancaRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.LocalForBettingPool
                && lr.BettingPoolId == bettingPoolId
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();
        if (localBancaRule != null) applicableRules.Add(localBancaRule);

        // Zona limit
        if (zoneId > 0)
        {
            var zonaRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == Models.Enums.LimitType.GeneralForZone
                    && lr.ZoneId == zoneId
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
            if (zonaRule != null) applicableRules.Add(zonaRule);
        }

        // Global limit
        var globalRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.GeneralForGroup
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();
        if (globalRule != null) applicableRules.Add(globalRule);

        // ByNumber Banca limit
        var byNumBancaRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.ByNumberForBettingPool
                && lr.BettingPoolId == bettingPoolId
                && lr.BetNumberPattern == betNumber
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();
        if (byNumBancaRule != null) applicableRules.Add(byNumBancaRule);

        // ByNumber Zona limit
        if (zoneId > 0)
        {
            var byNumZonaRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == Models.Enums.LimitType.ByNumberForZone
                    && lr.ZoneId == zoneId
                    && lr.BetNumberPattern == betNumber
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
            if (byNumZonaRule != null) applicableRules.Add(byNumZonaRule);
        }

        // ByNumber Global limit
        var byNumGlobalRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.ByNumberForGroup
                && lr.BetNumberPattern == betNumber
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();
        if (byNumGlobalRule != null) applicableRules.Add(byNumGlobalRule);

        // Record consumption at EVERY applicable level
        foreach (var rule in applicableRules)
        {
            var maxLimit = await _context.LimitRuleAmounts.AsNoTracking()
                .Where(a => a.LimitRuleId == rule.LimitRuleId && a.GameTypeId == gameTypeId)
                .Select(a => a.MaxAmount)
                .FirstOrDefaultAsync();

            if (maxLimit <= 0) continue;

            var consumption = _context.LimitConsumptions.Local
                .FirstOrDefault(lc => lc.LimitRuleId == rule.LimitRuleId
                    && lc.DrawId == drawId
                    && lc.DrawDate == today
                    && lc.GameTypeId == gameTypeId
                    && lc.BetNumber == betNumber
                    && lc.BettingPoolId == bettingPoolId);

            consumption ??= await _context.LimitConsumptions
                .Where(lc => lc.LimitRuleId == rule.LimitRuleId
                    && lc.DrawId == drawId
                    && lc.DrawDate == today
                    && lc.GameTypeId == gameTypeId
                    && lc.BetNumber == betNumber
                    && lc.BettingPoolId == bettingPoolId)
                .FirstOrDefaultAsync();

            if (consumption == null)
            {
                consumption = new LimitConsumption
                {
                    LimitRuleId = rule.LimitRuleId,
                    DrawId = drawId,
                    DrawDate = today,
                    GameTypeId = gameTypeId,
                    BetNumber = betNumber,
                    BettingPoolId = bettingPoolId,
                    CurrentAmount = betAmount,
                    BetCount = 1,
                    LastBetAt = timestamp,
                    IsNearLimit = false,
                    IsAtLimit = false,
                    CreatedAt = timestamp,
                    UpdatedAt = timestamp
                };
                _context.LimitConsumptions.Add(consumption);
            }
            else
            {
                consumption.CurrentAmount += betAmount;
                consumption.BetCount += 1;
                consumption.LastBetAt = timestamp;
                consumption.UpdatedAt = timestamp;
            }

            _logger.LogDebug(
                "Limit consumption: DrawId={DrawId}, BetNumber={BetNumber}, RuleId={RuleId}, RuleType={RuleType}, Amount={Amount}",
                drawId, betNumber, rule.LimitRuleId, rule.LimitType, betAmount);
        }
    }

    private class LimitCheckDetail
    {
        public bool Passed { get; set; }
        public string? LimitScope { get; set; }        // banca | local-banca | zona | global | por-numero-banca | por-numero-zona | por-numero-global
        public string? LimitScopeLabel { get; set; }   // Spanish label for UI
        public decimal? LimitAmount { get; set; }
        public decimal? CurrentUsed { get; set; }
        public decimal? Available { get; set; }
        public decimal Attempted { get; set; }
        public decimal? OverBy { get; set; }
    }

    private static (string scope, string label) GetLimitScope(Models.Enums.LimitType type) => type switch
    {
        Models.Enums.LimitType.GeneralForBettingPool => ("banca", "Límite de banca"),
        Models.Enums.LimitType.LocalForBettingPool => ("local-banca", "Límite local de banca"),
        Models.Enums.LimitType.GeneralForZone => ("zona", "Límite de zona"),
        Models.Enums.LimitType.GeneralForGroup => ("global", "Límite global"),
        Models.Enums.LimitType.ByNumberForBettingPool => ("por-numero-banca", "Límite por número (banca)"),
        Models.Enums.LimitType.ByNumberForZone => ("por-numero-zona", "Límite por número (zona)"),
        Models.Enums.LimitType.ByNumberForGroup => ("por-numero-global", "Límite por número (global)"),
        _ => ("desconocido", "Límite")
    };

    private async Task<bool> CheckIfPlayIsOnLimits(int drawId, int bettingPoolId, string betNumber, decimal bet, int gameTypeId)
    {
        var detail = await CheckIfPlayIsOnLimitsDetailed(drawId, bettingPoolId, betNumber, bet, gameTypeId);
        return detail.Passed;
    }

    /// <summary>
    /// Validate that a play is within the configured limits.
    /// <paramref name="gameTypeId"/> MUST be the actual bet type the user selected (e.g. PICK2, not DIRECTO).
    /// Inferring it from the bet number length is wrong — many draws have 2-digit
    /// game types that are not DIRECTO (Pick2 variants, etc.).
    /// </summary>
    private async Task<LimitCheckDetail> CheckIfPlayIsOnLimitsDetailed(int drawId, int bettingPoolId, string betNumber, decimal bet, int gameTypeId)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(Helpers.DateTimeHelper.TodayInBusinessTimezone());

        var bettingPool = await _context.BettingPools.AsNoTracking()
            .Where(bp => bp.BettingPoolId == bettingPoolId)
            .Select(bp => new { bp.BettingPoolId, bp.ZoneId })
            .FirstOrDefaultAsync();
        var zoneId = bettingPool?.ZoneId ?? 0;

        // Day bitmask
        var todayDow = (int)now.DayOfWeek;
        var dayBit = todayDow switch
        {
            1 => 1, 2 => 2, 3 => 4, 4 => 8, 5 => 16, 6 => 32, 0 => 64, _ => 0
        };

        // Find limit: Banca > Local Banca > Zona (no global fallback)
        LimitRule? limitRule = null;

        // 1. Limite Banca
        limitRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.GeneralForBettingPool
                && lr.BettingPoolId == bettingPoolId
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();

        // 2. Limite Local Banca
        if (limitRule == null)
        {
            limitRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == Models.Enums.LimitType.LocalForBettingPool
                    && lr.BettingPoolId == bettingPoolId
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
        }

        // 3. Limite Zona
        if (limitRule == null && zoneId > 0)
        {
            limitRule = await _context.LimitRules.AsNoTracking()
                .Where(lr => lr.IsActive && lr.DrawId == drawId
                    && lr.LimitType == Models.Enums.LimitType.GeneralForZone
                    && lr.ZoneId == zoneId
                    && (lr.DaysOfWeek & dayBit) != 0
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
                .FirstOrDefaultAsync();
        }

        // No banca or zona limit = blocked (can't sell without limits)
        if (limitRule == null)
        {
            return new LimitCheckDetail
            {
                Passed = false,
                LimitScope = "no-config",
                LimitScopeLabel = "Sin límite configurado",
                Attempted = bet
            };
        }

        // Also find global limit (must check separately)
        var globalRule = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.LimitType == Models.Enums.LimitType.GeneralForGroup
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .FirstOrDefaultAsync();

        // Check all applicable limits: the specific one (banca/zona) AND global AND per-number
        var rulesToCheck = new List<(LimitRule rule, bool isGlobal)> { (limitRule, false) };
        if (globalRule != null && globalRule.LimitRuleId != limitRule.LimitRuleId)
            rulesToCheck.Add((globalRule, true));

        // Add per-number limits (most specific — tighter constraints)
        var byNumberRules = await _context.LimitRules.AsNoTracking()
            .Where(lr => lr.IsActive && lr.DrawId == drawId
                && lr.BetNumberPattern == betNumber
                && (lr.LimitType == Models.Enums.LimitType.ByNumberForBettingPool
                    || lr.LimitType == Models.Enums.LimitType.ByNumberForZone
                    || lr.LimitType == Models.Enums.LimitType.ByNumberForGroup)
                && (lr.DaysOfWeek & dayBit) != 0
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                && lr.LimitRuleAmounts.Any(a => a.GameTypeId == gameTypeId))
            .Where(lr =>
                (lr.LimitType == Models.Enums.LimitType.ByNumberForBettingPool && lr.BettingPoolId == bettingPoolId)
                || (lr.LimitType == Models.Enums.LimitType.ByNumberForZone && lr.ZoneId == zoneId)
                || lr.LimitType == Models.Enums.LimitType.ByNumberForGroup)
            .ToListAsync();

        foreach (var byNumRule in byNumberRules)
        {
            if (rulesToCheck.All(r => r.rule.LimitRuleId != byNumRule.LimitRuleId))
                rulesToCheck.Add((byNumRule, false));
        }

        foreach (var (rule, isGlobal) in rulesToCheck)
        {
            var maxLimit = await _context.LimitRuleAmounts.AsNoTracking()
                .Where(a => a.LimitRuleId == rule.LimitRuleId && a.GameTypeId == gameTypeId)
                .Select(a => a.MaxAmount)
                .FirstOrDefaultAsync();

            if (maxLimit <= 0)
            {
                var (sc, lb) = GetLimitScope(rule.LimitType);
                return new LimitCheckDetail
                {
                    Passed = false,
                    LimitScope = sc,
                    LimitScopeLabel = lb,
                    LimitAmount = 0m,
                    CurrentUsed = 0m,
                    Available = 0m,
                    Attempted = bet,
                    OverBy = bet
                };
            }

            // Consumption for THIS specific number + game type
            var consumptionQuery = _context.LimitConsumptions
                .Where(lc => lc.LimitRuleId == rule.LimitRuleId
                    && lc.DrawId == drawId
                    && lc.DrawDate == today
                    && lc.GameTypeId == gameTypeId
                    && lc.BetNumber == betNumber);

            // Banca limits: only this banca's consumption
            // Zona limits: all bancas in the zone
            // Global limits: all bancas (no filter)
            if (rule.LimitType == Models.Enums.LimitType.GeneralForBettingPool
                || rule.LimitType == Models.Enums.LimitType.LocalForBettingPool)
            {
                consumptionQuery = consumptionQuery.Where(lc => lc.BettingPoolId == bettingPoolId);
            }
            // Zona and Global: sum across all bancas (no bettingPoolId filter)

            var currentAmount = await consumptionQuery.SumAsync(lc => (decimal?)lc.CurrentAmount) ?? 0;
            var totalUsed = currentAmount;

            _logger.LogDebug(
                "Limit check: draw={DrawId}, bet={BetNumber}, gameType={GameTypeId}, limit={MaxLimit}, used={TotalUsed}, bet={Bet}, ruleType={RuleType}",
                drawId, betNumber, gameTypeId, maxLimit, totalUsed, bet, rule.LimitType);

            if (totalUsed + bet > maxLimit)
            {
                var (sc, lb) = GetLimitScope(rule.LimitType);
                var available = Math.Max(0m, maxLimit - totalUsed);
                return new LimitCheckDetail
                {
                    Passed = false,
                    LimitScope = sc,
                    LimitScopeLabel = lb,
                    LimitAmount = maxLimit,
                    CurrentUsed = totalUsed,
                    Available = available,
                    Attempted = bet,
                    OverBy = (totalUsed + bet) - maxLimit
                };
            }
        }

        return new LimitCheckDetail { Passed = true, Attempted = bet };
    }
}
