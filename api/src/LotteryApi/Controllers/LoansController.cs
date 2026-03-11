using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using System.Security.Claims;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/loans")]
public class LoansController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<LoansController> _logger;

    public LoansController(LotteryDbContext context, ILogger<LoansController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<LoanListDto>>> GetLoans(
        [FromQuery] string? status = null,
        [FromQuery] int? zoneId = null,
        [FromQuery] string? search = null,
        [FromQuery] int? limit = null)
    {
        try
        {
            var query = _context.Loans
                .AsNoTracking()
                .Include(l => l.CreatedByUser)
                .Include(l => l.Payments)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(l => l.Status == status);

            if (zoneId.HasValue)
            {
                // Filter by zone through betting pool
                var poolIdsInZone = _context.BettingPools
                    .Where(bp => bp.ZoneId == zoneId.Value)
                    .Select(bp => bp.BettingPoolId);
                query = query.Where(l => l.EntityType == "bettingPool" && poolIdsInZone.Contains(l.EntityId));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lower = search.ToLower();
                query = query.Where(l =>
                    l.LoanNumber.ToLower().Contains(lower) ||
                    l.EntityName.ToLower().Contains(lower) ||
                    l.EntityCode.ToLower().Contains(lower));
            }

            query = query.OrderByDescending(l => l.CreatedAt);

            if (limit.HasValue)
                query = query.Take(limit.Value);

            var loans = await query
                .Select(l => new LoanListDto
                {
                    LoanId = l.LoanId,
                    LoanNumber = l.LoanNumber,
                    EntityType = l.EntityType,
                    EntityId = l.EntityId,
                    EntityName = l.EntityName,
                    EntityCode = l.EntityCode,
                    PrincipalAmount = l.PrincipalAmount,
                    InterestRate = l.InterestRate,
                    InstallmentAmount = l.InstallmentAmount,
                    Frequency = l.Frequency,
                    PaymentDay = l.PaymentDay,
                    StartDate = l.StartDate,
                    TotalPaid = l.TotalPaid,
                    RemainingBalance = l.RemainingBalance,
                    Status = l.Status,
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    CreatedByName = l.CreatedByUser != null ? l.CreatedByUser.Username : null,
                    PaymentCount = l.Payments.Count
                })
                .ToListAsync();

            return Ok(loans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting loans");
            return StatusCode(500, new { error = "Error al obtener préstamos" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LoanDto>> GetLoan(int id)
    {
        try
        {
            var loan = await _context.Loans
                .AsNoTracking()
                .Include(l => l.CreatedByUser)
                .Include(l => l.Payments)
                    .ThenInclude(p => p.CreatedByUser)
                .FirstOrDefaultAsync(l => l.LoanId == id);

            if (loan == null)
                return NotFound(new { error = "Préstamo no encontrado" });

            var dto = new LoanDto
            {
                LoanId = loan.LoanId,
                LoanNumber = loan.LoanNumber,
                EntityType = loan.EntityType,
                EntityId = loan.EntityId,
                EntityName = loan.EntityName,
                EntityCode = loan.EntityCode,
                PrincipalAmount = loan.PrincipalAmount,
                InterestRate = loan.InterestRate,
                InstallmentAmount = loan.InstallmentAmount,
                Frequency = loan.Frequency,
                PaymentDay = loan.PaymentDay,
                StartDate = loan.StartDate,
                TotalPaid = loan.TotalPaid,
                RemainingBalance = loan.RemainingBalance,
                Status = loan.Status,
                Notes = loan.Notes,
                CreatedAt = loan.CreatedAt,
                CreatedByName = loan.CreatedByUser?.Username,
                Payments = loan.Payments
                    .OrderByDescending(p => p.PaymentDate)
                    .Select(p => new LoanPaymentDto
                    {
                        PaymentId = p.PaymentId,
                        LoanId = p.LoanId,
                        PaymentDate = p.PaymentDate,
                        AmountPaid = p.AmountPaid,
                        Notes = p.Notes,
                        CreatedAt = p.CreatedAt,
                        CreatedByName = p.CreatedByUser?.Username
                    })
                    .ToList()
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting loan {LoanId}", id);
            return StatusCode(500, new { error = "Error al obtener préstamo" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<LoanDto>> CreateLoan([FromBody] CreateLoanDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var userId = GetCurrentUserId();

            // Generate loan number
            var lastLoan = await _context.Loans
                .OrderByDescending(l => l.LoanId)
                .FirstOrDefaultAsync();
            var nextNumber = (lastLoan?.LoanId ?? 0) + 1;
            var loanNumber = $"PR-{nextNumber:D4}";

            var loan = new Loan
            {
                LoanNumber = loanNumber,
                EntityType = dto.EntityType,
                EntityId = dto.EntityId,
                EntityName = dto.EntityName,
                EntityCode = dto.EntityCode,
                PrincipalAmount = dto.PrincipalAmount,
                InterestRate = dto.InterestRate,
                InstallmentAmount = dto.InstallmentAmount,
                Frequency = dto.Frequency,
                PaymentDay = dto.PaymentDay,
                StartDate = dto.StartDate,
                TotalPaid = 0,
                RemainingBalance = Math.Round(dto.PrincipalAmount * (1 + dto.InterestRate / 100), 2),
                Status = "active",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.Loans.Add(loan);

            // Deduct from entity balance
            await UpdateEntityBalance(dto.EntityType, dto.EntityId, -dto.PrincipalAmount);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetLoan), new { id = loan.LoanId }, new LoanDto
            {
                LoanId = loan.LoanId,
                LoanNumber = loan.LoanNumber,
                EntityType = loan.EntityType,
                EntityId = loan.EntityId,
                EntityName = loan.EntityName,
                EntityCode = loan.EntityCode,
                PrincipalAmount = loan.PrincipalAmount,
                InterestRate = loan.InterestRate,
                InstallmentAmount = loan.InstallmentAmount,
                Frequency = loan.Frequency,
                PaymentDay = loan.PaymentDay,
                StartDate = loan.StartDate,
                TotalPaid = loan.TotalPaid,
                RemainingBalance = loan.RemainingBalance,
                Status = loan.Status,
                Notes = loan.Notes,
                CreatedAt = loan.CreatedAt
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating loan");
            return StatusCode(500, new { error = "Error al crear préstamo" });
        }
    }

    [HttpPost("{id}/payments")]
    public async Task<ActionResult<LoanPaymentDto>> CreatePayment(int id, [FromBody] CreateLoanPaymentDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.LoanId == id);
            if (loan == null)
                return NotFound(new { error = "Préstamo no encontrado" });

            if (loan.Status != "active")
                return BadRequest(new { error = "El préstamo no está activo" });

            var userId = GetCurrentUserId();

            var payment = new LoanPayment
            {
                LoanId = id,
                PaymentDate = DateTime.UtcNow,
                AmountPaid = dto.AmountPaid,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.LoanPayments.Add(payment);

            // Update loan totals
            loan.TotalPaid += dto.AmountPaid;
            loan.RemainingBalance -= dto.AmountPaid;
            loan.UpdatedAt = DateTime.UtcNow;
            loan.UpdatedBy = userId;

            if (loan.RemainingBalance <= 0)
            {
                loan.RemainingBalance = 0;
                loan.Status = "completed";
            }

            // Credit entity balance (payment returns money)
            await UpdateEntityBalance(loan.EntityType, loan.EntityId, dto.AmountPaid);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new LoanPaymentDto
            {
                PaymentId = payment.PaymentId,
                LoanId = payment.LoanId,
                PaymentDate = payment.PaymentDate,
                AmountPaid = payment.AmountPaid,
                Notes = payment.Notes,
                CreatedAt = payment.CreatedAt
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating loan payment for loan {LoanId}", id);
            return StatusCode(500, new { error = "Error al registrar pago" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateLoan(int id, [FromBody] UpdateLoanDto dto)
    {
        try
        {
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.LoanId == id);
            if (loan == null)
                return NotFound(new { error = "Préstamo no encontrado" });

            if (loan.Status != "active")
                return BadRequest(new { error = "Solo se pueden editar préstamos activos" });

            if (dto.InstallmentAmount.HasValue) loan.InstallmentAmount = dto.InstallmentAmount.Value;
            if (!string.IsNullOrWhiteSpace(dto.Frequency)) loan.Frequency = dto.Frequency;
            if (dto.PaymentDay.HasValue) loan.PaymentDay = dto.PaymentDay;
            if (dto.InterestRate.HasValue) loan.InterestRate = dto.InterestRate.Value;
            if (dto.Notes != null) loan.Notes = dto.Notes;

            loan.UpdatedAt = DateTime.UtcNow;
            loan.UpdatedBy = GetCurrentUserId();

            await _context.SaveChangesAsync();

            return Ok(new { message = "Préstamo actualizado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating loan {LoanId}", id);
            return StatusCode(500, new { error = "Error al actualizar préstamo" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> CancelLoan(int id)
    {
        try
        {
            var loan = await _context.Loans.FirstOrDefaultAsync(l => l.LoanId == id);
            if (loan == null)
                return NotFound(new { error = "Préstamo no encontrado" });

            if (loan.Status != "active")
                return BadRequest(new { error = "Solo se pueden cancelar préstamos activos" });

            loan.Status = "cancelled";
            loan.UpdatedAt = DateTime.UtcNow;
            loan.UpdatedBy = GetCurrentUserId();

            await _context.SaveChangesAsync();

            return Ok(new { message = "Préstamo cancelado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling loan {LoanId}", id);
            return StatusCode(500, new { error = "Error al cancelar préstamo" });
        }
    }

    private async Task UpdateEntityBalance(string entityType, int entityId, decimal delta)
    {
        if (delta == 0) return;

        if (entityType == "bettingPool")
        {
            var entity = await _context.AccountableEntities
                .FirstOrDefaultAsync(e => e.EntityType == "bettingPool" && e.EntityId == entityId);
            if (entity != null)
            {
                entity.CurrentBalance += delta;
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("userId")?.Value;
        return int.TryParse(userIdClaim, out var uid) ? uid : null;
    }
}
