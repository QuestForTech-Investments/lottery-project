using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using System.Text;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<TicketsController> _logger;

    public TicketsController(LotteryDbContext context, ILogger<TicketsController> logger)
    {
        _context = context;
        _logger = logger;
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
            var today = DateTime.Today;
            var now = DateTime.Now;

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
                        DiscountPercentage = 0.00m // TODO: Get from config
                    })
                    .FirstOrDefaultAsync();

                currentBettingPool = pool;
            }

            // Get available draws (active draws only, not yet closed)
            var draws = await _context.Draws
                .Include(d => d.Lottery)
                .Where(d => d.IsActive)
                .OrderBy(d => d.DrawTime)
                .Select(d => new DrawParamDto
                {
                    DrawId = d.DrawId,
                    LotteryId = d.LotteryId,
                    LotteryName = d.Lottery != null ? d.Lottery.LotteryName : "",
                    LotteryCode = null, // Not available in Lottery model
                    DrawDate = today,
                    DrawTime = d.DrawTime,
                    CutoffTime = today.Add(d.DrawTime).AddMinutes(-30), // 30 min before draw
                    IsActive = d.IsActive,
                    IsClosed = today.Add(d.DrawTime) <= now,
                    ImageUrl = null // Not available in Lottery model
                })
                .ToListAsync();

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
            var now = DateTime.Now;
            var today = DateTime.Today;
            var drawIds = dto.Lines.Select(l => l.DrawId).Distinct().ToList();
            var draws = await _context.Draws
                .Where(d => drawIds.Contains(d.DrawId))
                .ToListAsync();

            foreach (var line in dto.Lines)
            {
                var draw = draws.FirstOrDefault(d => d.DrawId == line.DrawId);
                if (draw == null)
                {
                    return UnprocessableEntity(new { message = $"El sorteo {line.DrawId} no existe" });
                }

                // TEMPORARY: Commented for testing purposes
                // var cutoffTime = today.Add(draw.DrawTime).AddMinutes(-30); // 30 min before
                // if (now >= cutoffTime)
                // {
                //     return UnprocessableEntity(new
                //     {
                //         message = $"El sorteo {draw.DrawName} ya cerró las ventas a las {cutoffTime:HH:mm}"
                //     });
                // }
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
                GlobalDiscount = dto.GlobalDiscount,
                CurrencyCode = "DOP",
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerEmail = dto.CustomerEmail,
                CustomerIdNumber = dto.CustomerIdNumber,
                Notes = dto.Notes,
                Status = "pending"
            };

            // 7. Get commission and discount percentages
            // Commission comes from user's commission rate (configured per user)
            // Discount comes from request or defaults to 0
            var commissionPercentage = user.CommissionRate; // User's configured commission rate
            var discountPercentage = dto.GlobalDiscount > 0 ? dto.GlobalDiscount : 0.00m;

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
                var drawDateTime = today.Add(draw.DrawTime);

                if (!earliestDrawTime.HasValue || drawDateTime < earliestDrawTime)
                    earliestDrawTime = drawDateTime;
                if (!latestDrawTime.HasValue || drawDateTime > latestDrawTime)
                    latestDrawTime = drawDateTime;

                lotteryIds.Add(draw.LotteryId);

                // Get bet type
                var betType = await _context.GameTypes
                    .FirstOrDefaultAsync(gt => gt.GameTypeId == lineDto.BetTypeId);

                var line = new TicketLine
                {
                    LineNumber = lineNumber++,
                    // LotteryId se obtiene de Draw.LotteryId, no duplicar
                    DrawId = lineDto.DrawId,
                    DrawDate = today,
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

                // Calculate line totals
                CalculateTicketLine(line, commissionPercentage, discountPercentage);

                totalBetAmount += line.BetAmount;
                totalDiscount += line.DiscountAmount;
                totalSubtotal += line.Subtotal;
                totalWithMultiplier += line.TotalWithMultiplier;
                totalCommission += line.CommissionAmount;
                totalNet += line.NetAmount;

                ticket.TicketLines.Add(line);
            }

            // 9. Set ticket totals
            ticket.TotalLines = dto.Lines.Count;
            ticket.TotalBetAmount = totalBetAmount;
            ticket.TotalDiscount = totalDiscount;
            ticket.TotalSubtotal = totalSubtotal;
            ticket.TotalWithMultiplier = totalWithMultiplier;
            ticket.TotalCommission = totalCommission;
            ticket.TotalNet = totalNet;
            ticket.GrandTotal = totalNet;
            ticket.LotteryIds = string.Join(",", lotteryIds);
            ticket.TotalLotteries = lotteryIds.Count;
            ticket.EarliestDrawTime = earliestDrawTime;
            ticket.LatestDrawTime = latestDrawTime;

            // 10. Save to database
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Created ticket {TicketCode} (ID: {TicketId}) with {LineCount} lines, total: ${Total}",
                ticket.TicketCode,
                ticket.TicketId,
                ticket.TotalLines,
                ticket.GrandTotal);

            // 11. Load full ticket for response
            var createdTicket = await GetTicketById(ticket.TicketId);
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
            if (filter.Date.HasValue)
            {
                var date = filter.Date.Value.Date;
                query = query.Where(t => t.CreatedAt.Date == date);
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
                    UserName = t.User != null ? t.User.FullName : null,
                    CreatedAt = t.CreatedAt,
                    TotalLines = t.TotalLines,
                    GrandTotal = t.GrandTotal,
                    TotalPrize = t.TotalPrize,
                    WinningLines = t.WinningLines,
                    Status = t.Status,
                    IsCancelled = t.IsCancelled,
                    CancelledAt = t.CancelledAt,
                    IsPaid = t.IsPaid,
                    PaidAt = t.PaidAt,
                    CustomerName = t.CustomerName,
                    CustomerPhone = t.CustomerPhone,
                    EarliestDrawTime = t.EarliestDrawTime,
                    LatestDrawTime = t.LatestDrawTime,
                    PrintCount = t.PrintCount
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
                return NotFound(new { message = "Ticket no encontrado" });
            }

            // 2. Validate ticket not already cancelled
            if (ticket.IsCancelled)
            {
                return UnprocessableEntity(new { message = "El ticket ya está cancelado" });
            }

            // 3. Validate ticket not already paid
            if (ticket.IsPaid)
            {
                return UnprocessableEntity(new { message = "No se puede cancelar un ticket ya pagado" });
            }

            // 4. Validate cancellation time window (default 30 minutes)
            var cancelMinutes = 30; // TODO: Get from config
            var now = DateTime.Now;
            var timeSinceCreation = now - ticket.CreatedAt;

            if (timeSinceCreation.TotalMinutes > cancelMinutes)
            {
                return UnprocessableEntity(new
                {
                    message = $"El tiempo de cancelación ({cancelMinutes} minutos) ha expirado"
                });
            }

            // 5. Validate user exists
            var user = await _context.Users.FindAsync(dto.CancelledBy);
            if (user == null)
            {
                return NotFound(new { message = "El usuario que cancela no existe" });
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
            var now = DateTime.Now;
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
    private void CalculateTicketLine(TicketLine line, decimal commissionPercentage, decimal discountPercentage)
    {
        line.DiscountPercentage = discountPercentage;
        line.DiscountAmount = line.BetAmount * (discountPercentage / 100);
        line.Subtotal = line.BetAmount - line.DiscountAmount;
        line.TotalWithMultiplier = line.Subtotal * line.Multiplier;
        line.CommissionPercentage = commissionPercentage;
        line.CommissionAmount = line.TotalWithMultiplier * (commissionPercentage / 100);
        line.NetAmount = line.TotalWithMultiplier - line.CommissionAmount;
    }

    /// <summary>
    /// Generate unique ticket code (format: EA-{BANCACODE}-{SEQUENCE:D9}, ~22 characters)
    /// Example: EA-LAN-517-000000001
    /// </summary>
    private async Task<string> GenerateTicketCode(string bancaCode)
    {
        // Get the next sequence number for this banca
        var prefix = $"EA-{bancaCode}-";

        var sequence = await _context.Tickets
            .Where(t => t.TicketCode.StartsWith(prefix))
            .CountAsync() + 1;

        return $"{prefix}{sequence:D9}";
    }

    /// <summary>
    /// Generate barcode from ticket code (same as ticket code)
    /// </summary>
    private string GenerateBarcode(string ticketCode)
    {
        return ticketCode;
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
}
