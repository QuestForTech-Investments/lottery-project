using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/winning-plays")]
[Authorize]
public class WinningPlaysController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<WinningPlaysController> _logger;

    public WinningPlaysController(LotteryDbContext context, ILogger<WinningPlaysController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/winning-plays/params
    /// Get parameters needed for filtering winning plays (draws, zones)
    /// Based on Vue.js original: GET /api/v1/winning-plays/params
    /// </summary>
    [HttpGet("params")]
    public async Task<ActionResult<WinningPlaysParamsDto>> GetParams()
    {
        try
        {
            _logger.LogInformation("Getting winning plays filter params");

            // Get active draws
            var draws = await _context.Draws
                .Include(d => d.Lottery)
                .Where(d => d.IsActive)
                .OrderBy(d => d.DrawTime)
                .Select(d => new DrawParamDto
                {
                    DrawId = d.DrawId,
                    LotteryId = d.LotteryId,
                    LotteryName = d.Lottery != null ? d.Lottery.LotteryName : "",
                    LotteryCode = null,
                    DrawDate = DateTime.Today,
                    DrawTime = d.DrawTime,
                    CutoffTime = null,
                    IsActive = d.IsActive,
                    IsClosed = false,
                    ImageUrl = null
                })
                .ToListAsync();

            // Get active zones
            var zones = await _context.Zones
                .Where(z => z.IsActive)
                .OrderBy(z => z.ZoneName)
                .Select(z => new ZoneParamDto
                {
                    ZoneId = z.ZoneId,
                    Name = z.ZoneName ?? "",
                    Code = null,
                    IsActive = z.IsActive
                })
                .ToListAsync();

            return Ok(new WinningPlaysParamsDto
            {
                Draws = draws,
                Zones = zones
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting winning plays params");
            return StatusCode(500, new { error = "Error al obtener parámetros de filtro" });
        }
    }

    /// <summary>
    /// GET /api/winning-plays
    /// Get winning plays (ticket lines where IsWinner = true)
    /// Based on Vue.js original: GET /api/v1/winning-plays
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<WinningPlaysResponseDto>> GetWinningPlays(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int? drawId,
        [FromQuery] string? zoneIds,
        [FromQuery] int? bettingPoolId,
        [FromQuery] bool? isPaid,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        try
        {
            var start = startDate ?? DateTime.Today;
            var end = endDate ?? DateTime.Today;

            _logger.LogInformation(
                "Getting winning plays: startDate={StartDate}, endDate={EndDate}, drawId={DrawId}, zoneIds={ZoneIds}, bettingPoolId={BettingPoolId}",
                start, end, drawId, zoneIds, bettingPoolId);

            // Parse zone IDs
            List<int>? zoneIdList = null;
            if (!string.IsNullOrEmpty(zoneIds))
            {
                zoneIdList = zoneIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse)
                    .ToList();
            }

            // Build query for winning ticket lines
            var query = _context.TicketLines
                .Include(tl => tl.Ticket)
                    .ThenInclude(t => t!.BettingPool)
                        .ThenInclude(bp => bp!.Zone)
                .Include(tl => tl.Draw)
                    .ThenInclude(d => d!.Lottery)
                .Include(tl => tl.BetType)
                .Where(tl => tl.IsWinner == true)
                .Where(tl => tl.DrawDate >= start && tl.DrawDate <= end)
                .Where(tl => tl.Ticket != null && tl.Ticket.IsCancelled == false);

            // Apply filters
            if (drawId.HasValue)
            {
                query = query.Where(tl => tl.DrawId == drawId.Value);
            }

            if (zoneIdList != null && zoneIdList.Count > 0)
            {
                query = query.Where(tl =>
                    tl.Ticket != null &&
                    tl.Ticket.BettingPool != null &&
                    zoneIdList.Contains(tl.Ticket.BettingPool.ZoneId));
            }

            if (bettingPoolId.HasValue)
            {
                query = query.Where(tl =>
                    tl.Ticket != null &&
                    tl.Ticket.BettingPoolId == bettingPoolId.Value);
            }

            if (isPaid.HasValue)
            {
                query = query.Where(tl =>
                    tl.Ticket != null &&
                    tl.Ticket.IsPaid == isPaid.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Calculate totals
            var totals = await query.GroupBy(_ => 1).Select(g => new
            {
                TotalSales = g.Sum(tl => tl.BetAmount),
                TotalPrizes = g.Sum(tl => tl.PrizeAmount)
            }).FirstOrDefaultAsync();

            // Apply pagination and get items
            var items = await query
                .OrderByDescending(tl => tl.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(tl => new WinningPlayDto
                {
                    LineId = tl.LineId,
                    TicketId = tl.TicketId,
                    TicketCode = tl.Ticket != null ? tl.Ticket.TicketCode : "",
                    BetTypeName = tl.BetType != null ? tl.BetType.GameName : "",
                    BetTypeCode = tl.BetTypeCode ?? "",
                    BetNumber = tl.BetNumber,
                    SalesAmount = tl.BetAmount,
                    PrizeAmount = tl.PrizeAmount,
                    Total = tl.PrizeAmount - tl.BetAmount,
                    DrawId = tl.DrawId,
                    DrawName = tl.Draw != null && tl.Draw.Lottery != null
                        ? tl.Draw.Lottery.LotteryName
                        : "",
                    DrawDate = tl.DrawDate,
                    DrawTime = tl.DrawTime,
                    WinningPosition = tl.WinningPosition,
                    ResultNumber = tl.ResultNumber,
                    BettingPoolId = tl.Ticket != null ? tl.Ticket.BettingPoolId : 0,
                    BettingPoolName = tl.Ticket != null && tl.Ticket.BettingPool != null
                        ? tl.Ticket.BettingPool.BettingPoolName ?? ""
                        : "",
                    ZoneId = tl.Ticket != null && tl.Ticket.BettingPool != null
                        ? tl.Ticket.BettingPool.ZoneId
                        : (int?)null,
                    ZoneName = tl.Ticket != null && tl.Ticket.BettingPool != null && tl.Ticket.BettingPool.Zone != null
                        ? tl.Ticket.BettingPool.Zone.ZoneName
                        : null,
                    CreatedAt = tl.CreatedAt,
                    IsPaid = tl.Ticket != null && tl.Ticket.IsPaid,
                    PaidAt = tl.Ticket != null ? tl.Ticket.PaidAt : null
                })
                .ToListAsync();

            var totalSales = totals?.TotalSales ?? 0;
            var totalPrizes = totals?.TotalPrizes ?? 0;

            return Ok(new WinningPlaysResponseDto
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                TotalSales = totalSales,
                TotalPrizes = totalPrizes,
                GrandTotal = totalPrizes - totalSales
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting winning plays");
            return StatusCode(500, new { error = "Error al obtener jugadas ganadoras" });
        }
    }
}
