using Azure.Core.Serialization;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Models;
using LotteryApi.Services;
using LotteryApi.Services.ExternalResults;
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

    public TicketsController(
        LotteryDbContext context,
        ILogger<TicketsController> logger,
        IExternalResultsService externalResultsService,
        ILimitReservationService limitReservationService)
    {
        _context = context;
        _logger = logger;
        _limitReservationService = limitReservationService;
        _externalResultsService = externalResultsService;
    }

    [HttpGet]
    public async Task<ActionResult<TicketDetailDto[]>> GetTickets(
        [FromQuery] int bettingPoolId,
        [FromQuery] DateTime? date = null)
    {
        _logger.LogInformation("Getting tickets for bettingPoolId {BettingPoolId}, date {Date}", bettingPoolId, date);

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
                        CurrentBalance = 0m, // TODO: Calculate from balances table
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
                    CurrentBalance = 0m,
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

            // 1.6 Validate daily sale limit
            var dailySaleLimit = bpConfig?.DailySaleLimit;
            if (dailySaleLimit.HasValue && dailySaleLimit.Value > 0)
            {
                var currentDailySales = await _context.Tickets
                    .Where(t => t.BettingPoolId == dto.BettingPoolId
                              && t.CreatedAt.Date == todayBusiness
                              && !t.IsCancelled)
                    .SumAsync(t => (decimal?)t.GrandTotal) ?? 0m;

                var newTicketEstimate = dto.Lines.Sum(l => l.BetAmount);

                if (currentDailySales + newTicketEstimate > dailySaleLimit.Value)
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

            List<object> invalidBets = new List<object>();
            bool hasClosedDraw = false;

            foreach (var line in dto.Lines)
            {
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
                    Notes = lineDto.Notes,
                    CreatedAt = now,
                    CreatedBy = dto.UserId,
                    LineStatus = "pending"
                };

                // Get commission percentage from betting pool configuration
                // Currently uses commission_discount_1 only (see GetCommissionPercentageAsync for future expansion)
                var commissionPercentage = await GetCommissionPercentageAsync(
                    dto.BettingPoolId,
                    lineDto.BetTypeId,
                    draw.LotteryId);

                // Calculate line totals with commission (discount is on ticket total)
                CalculateTicketLine(line, commissionPercentage);

                totalBetAmount += line.BetAmount;
                totalDiscount += line.DiscountAmount;
                totalSubtotal += line.Subtotal;
                totalWithMultiplier += line.TotalWithMultiplier;
                totalCommission += line.CommissionAmount;
                totalNet += line.NetAmount;

                if (await CheckIfPlayIsOnLimits(line.DrawId, dto.BettingPoolId, line.BetNumber, line.BetAmount))
                {
                    ticket.TicketLines.Add(line);

                    // Update limit consumption for this line
                    await UpdateLimitConsumption(
                        lineDto.DrawId,
                        ticketDate,
                        lineDto.BetNumber,
                        dto.BettingPoolId,
                        line.NetAmount,
                        now);
                } else
                {
                    line.ExceedsLimit = true;

                    var lineError = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        JsonSerializer.Serialize(line)
                    );

                    lineError!["errorType"] = "exceeds-limit";
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

            // 10. Save to database
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

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
                    IsPaid = t.IsPaid,
                    PaidAt = t.PaidAt,
                    CustomerName = t.CustomerName,
                    CustomerPhone = t.CustomerPhone,
                    EarliestDrawTime = t.EarliestDrawTime,
                    LatestDrawTime = t.LatestDrawTime,
                    PrintCount = t.PrintCount,
                    IsOutOfScheduleSale = t.SpecialFlags != null && t.SpecialFlags.Contains("OUT_OF_SCHEDULE")
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

            var ticketId = await _context.Tickets
                .AsNoTracking()
                .Where(t => t.Barcode == barcode)
                .Select(t => (long?)t.TicketId)
                .FirstOrDefaultAsync();

            if (ticketId == null)
            {
                return NotFound(new { message = "Ticket no encontrado con ese código de barras" });
            }

            var ticket = await GetTicketById(ticketId.Value);
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
            var bpCancelConfig = await _context.BettingPoolConfigs
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.BettingPoolId == ticket.BettingPoolId);
            var cancelMinutes = bpCancelConfig?.CancelMinutes ?? 5;
            var now = DateTime.UtcNow;
            var timeSinceCreation = now - ticket.CreatedAt;

            if (timeSinceCreation.TotalMinutes > cancelMinutes)
            {
                return UnprocessableEntity(new
                {
                    code = "CANCELLATION_TIME_EXPIRED",
                    maxMinutes = cancelMinutes
                });
            }

            // 5. Validate user exists
            var user = await _context.Users.FindAsync(dto.CancelledBy);
            if (user == null)
            {
                return NotFound(new { code = "USER_NOT_FOUND" });
            }

            // 6. Cancel ticket
            ticket.IsCancelled = true;
            ticket.CancelledAt = now;
            ticket.CancelledBy = dto.CancelledBy;
            ticket.CancellationReason = dto.CancellationReason;
            ticket.Status = "cancelled";
            ticket.UpdatedAt = now;
            ticket.UpdatedBy = dto.CancelledBy;

            // 7. Cancel all lines
            foreach (var line in ticket.TicketLines)
            {
                line.LineStatus = "cancelled";
                line.UpdatedAt = now;
                line.UpdatedBy = dto.CancelledBy;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Cancelled ticket {TicketCode} (ID: {TicketId}) by user {UserId}, reason: {Reason}",
                ticket.TicketCode,
                ticket.TicketId,
                dto.CancelledBy,
                dto.CancellationReason);

            // 8. Return updated ticket
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
        int? lotteryId)
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

        // Step 1: Look for lottery-specific commission configuration
        var config = await _context.Set<Models.BettingPoolPrizesCommission>()
            .AsNoTracking()
            .Where(c =>
                c.BettingPoolId == bettingPoolId &&
                c.GameType == betType.GameTypeCode &&
                c.IsActive == true &&
                c.LotteryId == lotteryId)
            .FirstOrDefaultAsync();

        // Step 2: If no lottery-specific config, fallback to general config (lotteryId=null)
        if (config == null && lotteryId != null)
        {
            config = await _context.Set<Models.BettingPoolPrizesCommission>()
                .AsNoTracking()
                .Where(c =>
                    c.BettingPoolId == bettingPoolId &&
                    c.GameType == betType.GameTypeCode &&
                    c.IsActive == true &&
                    c.LotteryId == null)
                .FirstOrDefaultAsync();

            if (config != null)
            {
                _logger.LogDebug(
                    "Using general commission for pool {PoolId}, bet type {BetType}: {Commission}%",
                    bettingPoolId, betType.GameTypeCode, config.CommissionDiscount1);
            }
        }

        if (config != null)
        {
            var commission = config.CommissionDiscount1 ?? 0.00m;

            _logger.LogDebug(
                "Commission for pool {PoolId}, bet type {BetType}, lottery {LotteryId}: {Commission}%",
                bettingPoolId, betType.GameTypeCode, lotteryId, commission);

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
    /// Update or create limit consumption record for a bet
    /// </summary>
    /// <param name="drawId">Draw ID</param>
    /// <param name="drawDate">Draw date</param>
    /// <param name="betNumber">Bet number</param>
    /// <param name="bettingPoolId">Betting pool ID</param>
    /// <param name="betAmount">Amount to add to consumption</param>
    /// <param name="timestamp">Current timestamp</param>
    private async Task UpdateLimitConsumption(
        int drawId,
        DateTime drawDate,
        string betNumber,
        int bettingPoolId,
        decimal betAmount,
        DateTime timestamp)
    {
        var today = DateOnly.FromDateTime(drawDate);
        var playPattern = new string('#', betNumber.Length);

        // Find the applicable limit rule for this bet
        var limitRule = await _context.LimitRules
            .Where(lr => lr.IsActive
                && (lr.DrawId == drawId || lr.DrawId == null)
                && (lr.BetNumberPattern == betNumber || lr.BetNumberPattern == playPattern || lr.BetNumberPattern == null)
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp))
            .OrderByDescending(lr => lr.BetNumberPattern == betNumber ? 3 : lr.BetNumberPattern == playPattern ? 2 : 1)
            .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
            .ThenByDescending(lr => lr.Priority ?? 0)
            .FirstOrDefaultAsync();

        if (limitRule == null)
        {
            // No limit rule applies, no consumption tracking needed
            _logger.LogInformation("NO LIMIT FOUND");
            return;
        }

        // Find existing consumption record
        var consumption = await _context.LimitConsumptions
            .Where(lc => lc.LimitRuleId == limitRule.LimitRuleId
                && lc.DrawId == drawId
                && lc.DrawDate == today
                && lc.BetNumber == betNumber
                && lc.BettingPoolId == bettingPoolId)
            .FirstOrDefaultAsync();

        // Determine the max limit for this rule
        var maxLimit = limitRule.MaxBetPerNumber
            ?? limitRule.MaxBetPerBettingPool
            ?? limitRule.MaxBetGlobal
            ?? 0;

        if (consumption == null)
        {
            // Create new consumption record
            consumption = new LimitConsumption
            {
                LimitRuleId = limitRule.LimitRuleId,
                DrawId = drawId,
                DrawDate = today,
                BetNumber = betNumber,
                BettingPoolId = bettingPoolId,
                CurrentAmount = betAmount,
                BetCount = 1,
                LastBetAt = timestamp,
                IsNearLimit = maxLimit > 0 && betAmount >= (maxLimit * 0.8m),
                IsAtLimit = maxLimit > 0 && betAmount >= maxLimit,
                CreatedAt = timestamp,
                UpdatedAt = timestamp
            };
            _context.LimitConsumptions.Add(consumption);
        }
        else
        {
            // Update existing consumption record
            consumption.CurrentAmount += betAmount;
            consumption.BetCount += 1;
            consumption.LastBetAt = timestamp;
            consumption.IsNearLimit = maxLimit > 0 && consumption.CurrentAmount >= (maxLimit * 0.8m);
            consumption.IsAtLimit = maxLimit > 0 && consumption.CurrentAmount >= maxLimit;
            consumption.UpdatedAt = timestamp;
        }

        _logger.LogDebug(
            "Updated limit consumption: DrawId={DrawId}, BetNumber={BetNumber}, BettingPoolId={BettingPoolId}, CurrentAmount={CurrentAmount}, IsAtLimit={IsAtLimit}",
            drawId, betNumber, bettingPoolId, consumption.CurrentAmount, consumption.IsAtLimit);
    }

    private async Task<bool> CheckIfPlayIsOnLimits(int drawId, int bettingPool, string betNumber, decimal bet)
    {
        var timestamp = DateTime.Today;
        var playPattern = new string('#', betNumber.Length);

        // Find the applicable limit rule for this bet
        var limitRule = await _context.LimitRules
            .Where(lr => lr.IsActive
                && (lr.DrawId == drawId || lr.DrawId == null)
                && (lr.BetNumberPattern == betNumber || lr.BetNumberPattern == playPattern || lr.BetNumberPattern == null)
                && (lr.EffectiveFrom == null || lr.EffectiveFrom <= timestamp)
                && (lr.EffectiveTo == null || lr.EffectiveTo >= timestamp))
            .OrderByDescending(lr => lr.BetNumberPattern == betNumber ? 3 : lr.BetNumberPattern == playPattern ? 2 : 1)
            .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
            .ThenByDescending(lr => lr.Priority ?? 0)
            .FirstOrDefaultAsync();

        if (limitRule == null)
        {
            // No limit rule applies - allow the bet (no restrictions)
            _logger.LogInformation("NO LIMIT FOUND - allowing bet");
            return true;
        }

        // Find existing consumption record
        var consumption = await _context.LimitConsumptions
            .Where(lc => lc.LimitRuleId == limitRule.LimitRuleId
                && lc.DrawId == drawId
                && lc.DrawDate == DateOnly.FromDateTime(timestamp)
                && lc.BetNumber == betNumber
                && lc.BettingPoolId == bettingPool || lc.BettingPoolId == null)
            .FirstOrDefaultAsync();

        var limit = (decimal?)-1;

        if (limitRule!.MaxBetPerNumber.HasValue)
            limit = limitRule.MaxBetPerNumber;
        else if (limitRule!.MaxBetPerBettingPool.HasValue)
            limit = limitRule.MaxBetPerBettingPool;
        else if (limitRule!.MaxBetPerTicket.HasValue)
            limit = limitRule.MaxBetPerTicket;

        bool isAtLimit = false;
        decimal currentAmount = 0;
        if (consumption != null)
        {
            isAtLimit = consumption.IsAtLimit;
            currentAmount = consumption.CurrentAmount;
        }

        // Include in-memory reservations from other terminals
        var reservedAmount = _limitReservationService.GetReservedAmount(drawId, betNumber);
        var totalUsed = currentAmount + reservedAmount;

        _logger.LogInformation($"LIMIT FOUND: d{drawId}, l{limit}, b{bet}, bn{betNumber}, bp{bettingPool}, il{isAtLimit}, ca{currentAmount}, ra{reservedAmount}, t{DateOnly.FromDateTime(timestamp)}");

        return limit == -1 || (!isAtLimit && totalUsed + bet <= limit);
    }
}
