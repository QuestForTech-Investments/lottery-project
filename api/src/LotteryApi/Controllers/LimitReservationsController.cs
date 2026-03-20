using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models.Enums;
using LotteryApi.Services;
using System.ComponentModel.DataAnnotations;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/limit-reservations")]
public class LimitReservationsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<LimitReservationsController> _logger;
    private readonly ILimitReservationService _reservationService;

    public LimitReservationsController(
        LotteryDbContext context,
        ILogger<LimitReservationsController> logger,
        ILimitReservationService reservationService)
    {
        _context = context;
        _logger = logger;
        _reservationService = reservationService;
    }

    [HttpPost("reserve")]
    public async Task<ActionResult<ReserveLimitResponse>> Reserve([FromBody] ReserveLimitRequest request)
    {
        try
        {
            var now = DateTime.UtcNow;
            var today = DateOnly.FromDateTime(Helpers.DateTimeHelper.TodayInBusinessTimezone());

            // Find applicable limit rule (game type based)
            var limitRule = await _context.LimitRules
                .AsNoTracking()
                .Where(lr => lr.IsActive
                    && (lr.DrawId == request.DrawId || lr.DrawId == null)
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now)
                    && lr.LimitRuleAmounts.Any(a => a.GameTypeId == request.GameTypeId))
                .OrderByDescending(lr => lr.BettingPoolId == request.BettingPoolId ? 4 : 0)
                .ThenByDescending(lr => lr.LimitType == LimitType.GeneralForBettingPool || lr.LimitType == LimitType.LocalForBettingPool ? 3 : 0)
                .ThenByDescending(lr => lr.LimitType == LimitType.GeneralForZone ? 2 : 0)
                .ThenByDescending(lr => lr.LimitType == LimitType.GeneralForGroup ? 1 : 0)
                .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                var unlimitedId = _reservationService.Reserve(request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount);
                return Ok(new ReserveLimitResponse { ReservationId = unlimitedId, Remaining = -1 });
            }

            var maxLimit = await _context.LimitRuleAmounts
                .AsNoTracking()
                .Where(a => a.LimitRuleId == limitRule.LimitRuleId && a.GameTypeId == request.GameTypeId)
                .Select(a => a.MaxAmount)
                .FirstOrDefaultAsync();

            if (maxLimit <= 0)
            {
                var noLimitId = _reservationService.Reserve(request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount);
                return Ok(new ReserveLimitResponse { ReservationId = noLimitId, Remaining = -1 });
            }

            // Sum consumption for this game type today
            var dbAmount = await _context.LimitConsumptions
                .AsNoTracking()
                .Where(lc => lc.LimitRuleId == limitRule.LimitRuleId
                    && lc.DrawId == request.DrawId
                    && lc.DrawDate == today
                    && (lc.BettingPoolId == request.BettingPoolId || lc.BettingPoolId == null))
                .SumAsync(lc => (decimal?)lc.CurrentAmount) ?? 0;

            var existingReserved = _reservationService.GetReservedAmount(request.DrawId, request.GameTypeId);
            var totalUsed = dbAmount + existingReserved + request.Amount;

            if (totalUsed > maxLimit)
            {
                return Ok(new ReserveLimitResponse
                {
                    ReservationId = null,
                    Remaining = Math.Max(0, maxLimit - dbAmount - existingReserved),
                    MaxLimit = maxLimit,
                    CurrentAmount = dbAmount,
                    ReservedAmount = existingReserved,
                    PercentUsed = maxLimit > 0 ? Math.Round((dbAmount + existingReserved) / maxLimit * 100, 2) : 0,
                    IsBlocked = true
                });
            }

            var reservationId = _reservationService.Reserve(request.DrawId, request.GameTypeId, request.BettingPoolId, request.Amount);

            return Ok(new ReserveLimitResponse
            {
                ReservationId = reservationId,
                Remaining = Math.Max(0, maxLimit - totalUsed),
                MaxLimit = maxLimit,
                CurrentAmount = dbAmount,
                ReservedAmount = existingReserved + request.Amount,
                PercentUsed = maxLimit > 0 ? Math.Round(totalUsed / maxLimit * 100, 2) : 0,
                IsBlocked = false
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reserving limit");
            return StatusCode(500, new { message = "Error al reservar el límite" });
        }
    }

    [HttpDelete("{reservationId}")]
    public ActionResult<ReleaseLimitResponse> Release(string reservationId)
    {
        var released = _reservationService.Release(reservationId);
        if (!released)
            return NotFound(new { message = "Reservación no encontrada o ya expirada" });

        return Ok(new ReleaseLimitResponse { Released = true });
    }
}

// ==================== DTOs ====================

public class ReserveLimitRequest
{
    [Required]
    public int DrawId { get; set; }

    [Required]
    public int GameTypeId { get; set; }

    [Required]
    public int BettingPoolId { get; set; }

    [Range(0.01, 999999.99)]
    public decimal Amount { get; set; }
}

public class ReserveLimitResponse
{
    public string? ReservationId { get; set; }
    public decimal Remaining { get; set; }
    public decimal MaxLimit { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal ReservedAmount { get; set; }
    public decimal PercentUsed { get; set; }
    public bool IsBlocked { get; set; }
}

public class ReleaseLimitResponse
{
    public bool Released { get; set; }
}
