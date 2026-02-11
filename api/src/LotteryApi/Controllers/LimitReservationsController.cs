using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
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

    /// <summary>
    /// Reserve a limit amount for a play being built (before ticket is saved).
    /// Returns the updated availability including all active reservations.
    /// </summary>
    [HttpPost("reserve")]
    public async Task<ActionResult<ReserveLimitResponse>> Reserve([FromBody] ReserveLimitRequest request)
    {
        try
        {
            var betNumber = request.BetNumber.Trim();
            var playPattern = new string('#', betNumber.Length);
            var now = DateTime.Now;
            var today = DateOnly.FromDateTime(DateTime.Today);

            // Find applicable limit rule (same logic as CheckIfPlayIsOnLimits)
            var limitRule = await _context.LimitRules
                .Where(lr => lr.IsActive
                    && (lr.DrawId == request.DrawId || lr.DrawId == null)
                    && (lr.BetNumberPattern == betNumber || lr.BetNumberPattern == playPattern || lr.BetNumberPattern == null)
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now))
                .OrderByDescending(lr => lr.BetNumberPattern == betNumber ? 3 : lr.BetNumberPattern == playPattern ? 2 : 1)
                .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
                .ThenByDescending(lr => lr.Priority ?? 0)
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                // No limit rule — unlimited, still reserve for tracking
                var unlimitedReservationId = _reservationService.Reserve(
                    request.DrawId, betNumber, request.BettingPoolId, request.Amount);

                return Ok(new ReserveLimitResponse
                {
                    ReservationId = unlimitedReservationId,
                    Remaining = -1, // -1 = unlimited
                    MaxLimit = 0,
                    CurrentAmount = 0,
                    ReservedAmount = 0,
                    PercentUsed = 0,
                    IsBlocked = false
                });
            }

            var maxLimit = limitRule.MaxBetPerNumber
                ?? limitRule.MaxBetPerBettingPool
                ?? limitRule.MaxBetGlobal
                ?? 0;

            // Get current DB consumption
            var consumption = await _context.LimitConsumptions
                .Where(lc => lc.LimitRuleId == limitRule.LimitRuleId
                    && lc.DrawId == request.DrawId
                    && lc.DrawDate == today
                    && lc.BetNumber == betNumber
                    && (lc.BettingPoolId == request.BettingPoolId || lc.BettingPoolId == null))
                .FirstOrDefaultAsync();

            var dbAmount = consumption?.CurrentAmount ?? 0;

            // Get existing reservations (before adding the new one)
            var existingReserved = _reservationService.GetReservedAmount(request.DrawId, betNumber);

            var totalUsed = dbAmount + existingReserved + request.Amount;
            var remaining = maxLimit > 0 ? maxLimit - totalUsed : 0;
            var isBlocked = maxLimit > 0 && totalUsed >= maxLimit;

            if (isBlocked)
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

            // Create the reservation
            var reservationId = _reservationService.Reserve(
                request.DrawId, betNumber, request.BettingPoolId, request.Amount);

            return Ok(new ReserveLimitResponse
            {
                ReservationId = reservationId,
                Remaining = Math.Max(0, remaining),
                MaxLimit = maxLimit,
                CurrentAmount = dbAmount,
                ReservedAmount = existingReserved + request.Amount,
                PercentUsed = maxLimit > 0 ? Math.Round(totalUsed / maxLimit * 100, 2) : 0,
                IsBlocked = false
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reservar límite");
            return StatusCode(500, new { message = "Error al reservar el límite" });
        }
    }

    /// <summary>
    /// Release a specific reservation (when user removes a play from the ticket being built).
    /// Returns the updated availability.
    /// </summary>
    [HttpDelete("{reservationId}")]
    public async Task<ActionResult<ReleaseLimitResponse>> Release(
        string reservationId,
        [FromQuery] int drawId,
        [FromQuery] string betNumber,
        [FromQuery] int bettingPoolId)
    {
        try
        {
            var released = _reservationService.Release(reservationId);

            if (!released)
            {
                return NotFound(new { message = "Reservación no encontrada o ya expirada" });
            }

            // Return updated availability
            betNumber = betNumber.Trim();
            var playPattern = new string('#', betNumber.Length);
            var now = DateTime.Now;
            var today = DateOnly.FromDateTime(DateTime.Today);

            var limitRule = await _context.LimitRules
                .Where(lr => lr.IsActive
                    && (lr.DrawId == drawId || lr.DrawId == null)
                    && (lr.BetNumberPattern == betNumber || lr.BetNumberPattern == playPattern || lr.BetNumberPattern == null)
                    && (lr.EffectiveFrom == null || lr.EffectiveFrom <= now)
                    && (lr.EffectiveTo == null || lr.EffectiveTo >= now))
                .OrderByDescending(lr => lr.BetNumberPattern == betNumber ? 3 : lr.BetNumberPattern == playPattern ? 2 : 1)
                .ThenByDescending(lr => lr.DrawId != null ? 1 : 0)
                .ThenByDescending(lr => lr.Priority ?? 0)
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                return Ok(new ReleaseLimitResponse
                {
                    Remaining = -1,
                    MaxLimit = 0,
                    PercentUsed = 0
                });
            }

            var maxLimit = limitRule.MaxBetPerNumber
                ?? limitRule.MaxBetPerBettingPool
                ?? limitRule.MaxBetGlobal
                ?? 0;

            var consumption = await _context.LimitConsumptions
                .Where(lc => lc.LimitRuleId == limitRule.LimitRuleId
                    && lc.DrawId == drawId
                    && lc.DrawDate == today
                    && lc.BetNumber == betNumber
                    && (lc.BettingPoolId == bettingPoolId || lc.BettingPoolId == null))
                .FirstOrDefaultAsync();

            var dbAmount = consumption?.CurrentAmount ?? 0;
            var reservedAmount = _reservationService.GetReservedAmount(drawId, betNumber);
            var totalUsed = dbAmount + reservedAmount;

            return Ok(new ReleaseLimitResponse
            {
                Remaining = maxLimit > 0 ? Math.Max(0, maxLimit - totalUsed) : -1,
                MaxLimit = maxLimit,
                PercentUsed = maxLimit > 0 ? Math.Round(totalUsed / maxLimit * 100, 2) : 0
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al liberar reservación {ReservationId}", reservationId);
            return StatusCode(500, new { message = "Error al liberar la reservación" });
        }
    }
}

// ==================== DTOs ====================

public class ReserveLimitRequest
{
    [Required(ErrorMessage = "El ID del sorteo es requerido")]
    public int DrawId { get; set; }

    [Required(ErrorMessage = "El número de apuesta es requerido")]
    public string BetNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "El ID de la banca es requerido")]
    public int BettingPoolId { get; set; }

    [Range(0.01, 999999.99, ErrorMessage = "El monto debe ser mayor a 0")]
    public decimal Amount { get; set; }
}

public class ReserveLimitResponse
{
    /// <summary>
    /// Reservation ID to use for releasing. Null if blocked.
    /// </summary>
    public string? ReservationId { get; set; }

    /// <summary>
    /// Remaining available amount after this reservation. -1 = unlimited.
    /// </summary>
    public decimal Remaining { get; set; }

    /// <summary>
    /// Max limit configured for this number/draw.
    /// </summary>
    public decimal MaxLimit { get; set; }

    /// <summary>
    /// Amount already consumed in DB (saved tickets).
    /// </summary>
    public decimal CurrentAmount { get; set; }

    /// <summary>
    /// Amount reserved by other terminals (not yet saved).
    /// </summary>
    public decimal ReservedAmount { get; set; }

    /// <summary>
    /// Percentage of limit used (0-100).
    /// </summary>
    public decimal PercentUsed { get; set; }

    /// <summary>
    /// Whether this number is fully blocked (no more bets allowed).
    /// </summary>
    public bool IsBlocked { get; set; }
}

public class ReleaseLimitResponse
{
    public decimal Remaining { get; set; }
    public decimal MaxLimit { get; set; }
    public decimal PercentUsed { get; set; }
}
