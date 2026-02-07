using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/betting-pools/{bettingPoolId}")]
public class BettingPoolPrizesCommissionsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BettingPoolPrizesCommissionsController> _logger;

    public BettingPoolPrizesCommissionsController(
        LotteryDbContext context,
        ILogger<BettingPoolPrizesCommissionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all prizes and commissions for a betting pool
    /// </summary>
    [HttpGet("prizes-commissions")]
    public async Task<ActionResult<List<BettingPoolPrizesCommissionDto>>> GetPrizesCommissions(int bettingPoolId)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            var prizesCommissions = await _context.BettingPoolPrizesCommissions
                .Include(pc => pc.Lottery)
                .Where(pc => pc.BettingPoolId == bettingPoolId)
                .Select(pc => new BettingPoolPrizesCommissionDto
                {
                    PrizeCommissionId = pc.PrizeCommissionId,
                    BettingPoolId = pc.BettingPoolId,
                    LotteryId = pc.LotteryId,
                    LotteryName = pc.Lottery != null ? pc.Lottery.LotteryName : null,
                    GameType = pc.GameType,
                    PrizePayment1 = pc.PrizePayment1,
                    PrizePayment2 = pc.PrizePayment2,
                    PrizePayment3 = pc.PrizePayment3,
                    PrizePayment4 = pc.PrizePayment4,
                    CommissionDiscount1 = pc.CommissionDiscount1,
                    CommissionDiscount2 = pc.CommissionDiscount2,
                    CommissionDiscount3 = pc.CommissionDiscount3,
                    CommissionDiscount4 = pc.CommissionDiscount4,
                    Commission2Discount1 = pc.Commission2Discount1,
                    Commission2Discount2 = pc.Commission2Discount2,
                    Commission2Discount3 = pc.Commission2Discount3,
                    Commission2Discount4 = pc.Commission2Discount4,
                    IsActive = pc.IsActive
                })
                .ToListAsync();

            return Ok(prizesCommissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener premios y comisiones para la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al obtener premios y comisiones: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get a specific prize/commission by ID
    /// </summary>
    [HttpGet("{prizeCommissionId}")]
    public async Task<ActionResult<BettingPoolPrizesCommissionDto>> GetPrizeCommission(
        int bettingPoolId,
        int prizeCommissionId)
    {
        try
        {
            var prizeCommission = await _context.BettingPoolPrizesCommissions
                .Include(pc => pc.Lottery)
                .Where(pc => pc.BettingPoolId == bettingPoolId && pc.PrizeCommissionId == prizeCommissionId)
                .Select(pc => new BettingPoolPrizesCommissionDto
                {
                    PrizeCommissionId = pc.PrizeCommissionId,
                    BettingPoolId = pc.BettingPoolId,
                    LotteryId = pc.LotteryId,
                    LotteryName = pc.Lottery != null ? pc.Lottery.LotteryName : null,
                    GameType = pc.GameType,
                    PrizePayment1 = pc.PrizePayment1,
                    PrizePayment2 = pc.PrizePayment2,
                    PrizePayment3 = pc.PrizePayment3,
                    PrizePayment4 = pc.PrizePayment4,
                    CommissionDiscount1 = pc.CommissionDiscount1,
                    CommissionDiscount2 = pc.CommissionDiscount2,
                    CommissionDiscount3 = pc.CommissionDiscount3,
                    CommissionDiscount4 = pc.CommissionDiscount4,
                    Commission2Discount1 = pc.Commission2Discount1,
                    Commission2Discount2 = pc.Commission2Discount2,
                    Commission2Discount3 = pc.Commission2Discount3,
                    Commission2Discount4 = pc.Commission2Discount4,
                    IsActive = pc.IsActive
                })
                .FirstOrDefaultAsync();

            if (prizeCommission == null)
            {
                return NotFound(new { message = "Premio/comisión no encontrado" });
            }

            return Ok(prizeCommission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener premio/comisión {PrizeCommissionId}", prizeCommissionId);
            return StatusCode(500, new { message = $"Error al obtener premio/comisión: {ex.Message}" });
        }
    }

    /// <summary>
    /// Create a new prize/commission for a betting pool
    /// </summary>
    [HttpPost("prizes-commissions")]
    public async Task<ActionResult<BettingPoolPrizesCommissionDto>> CreatePrizeCommission(
        int bettingPoolId,
        [FromBody] CreateBettingPoolPrizesCommissionDto dto)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Validate lottery only if provided
            if (dto.LotteryId.HasValue)
            {
                var lotteryExists = await _context.Lotteries
                    .AnyAsync(l => l.LotteryId == dto.LotteryId.Value);

                if (!lotteryExists)
                {
                    return BadRequest(new { message = "Lotería no encontrada" });
                }
            }

            var exists = await _context.BettingPoolPrizesCommissions
                .AnyAsync(pc => pc.BettingPoolId == bettingPoolId &&
                               pc.LotteryId == dto.LotteryId &&
                               pc.GameType == dto.GameType);

            if (exists)
            {
                return BadRequest(new { message = "Ya existe una configuración de premios para esta lotería y tipo de juego" });
            }

            var prizeCommission = new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                LotteryId = dto.LotteryId,
                GameType = dto.GameType,
                PrizePayment1 = dto.PrizePayment1,
                PrizePayment2 = dto.PrizePayment2,
                PrizePayment3 = dto.PrizePayment3,
                PrizePayment4 = dto.PrizePayment4,
                CommissionDiscount1 = dto.CommissionDiscount1,
                CommissionDiscount2 = dto.CommissionDiscount2,
                CommissionDiscount3 = dto.CommissionDiscount3,
                CommissionDiscount4 = dto.CommissionDiscount4,
                Commission2Discount1 = dto.Commission2Discount1,
                Commission2Discount2 = dto.Commission2Discount2,
                Commission2Discount3 = dto.Commission2Discount3,
                Commission2Discount4 = dto.Commission2Discount4,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.BettingPoolPrizesCommissions.Add(prizeCommission);
            await _context.SaveChangesAsync();

            var lottery = await _context.Lotteries.FindAsync(dto.LotteryId);

            var result = new BettingPoolPrizesCommissionDto
            {
                PrizeCommissionId = prizeCommission.PrizeCommissionId,
                BettingPoolId = prizeCommission.BettingPoolId,
                LotteryId = prizeCommission.LotteryId,
                LotteryName = lottery?.LotteryName,
                GameType = prizeCommission.GameType,
                PrizePayment1 = prizeCommission.PrizePayment1,
                PrizePayment2 = prizeCommission.PrizePayment2,
                PrizePayment3 = prizeCommission.PrizePayment3,
                PrizePayment4 = prizeCommission.PrizePayment4,
                CommissionDiscount1 = prizeCommission.CommissionDiscount1,
                CommissionDiscount2 = prizeCommission.CommissionDiscount2,
                CommissionDiscount3 = prizeCommission.CommissionDiscount3,
                CommissionDiscount4 = prizeCommission.CommissionDiscount4,
                Commission2Discount1 = prizeCommission.Commission2Discount1,
                Commission2Discount2 = prizeCommission.Commission2Discount2,
                Commission2Discount3 = prizeCommission.Commission2Discount3,
                Commission2Discount4 = prizeCommission.Commission2Discount4,
                IsActive = prizeCommission.IsActive
            };

            return CreatedAtAction(
                nameof(GetPrizeCommission),
                new { bettingPoolId, prizeCommissionId = prizeCommission.PrizeCommissionId },
                result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear premio/comisión para la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al crear premio/comisión: {ex.Message}" });
        }
    }

    /// <summary>
    /// Update an existing prize/commission
    /// </summary>
    [HttpPut("{prizeCommissionId}")]
    public async Task<ActionResult<BettingPoolPrizesCommissionDto>> UpdatePrizeCommission(
        int bettingPoolId,
        int prizeCommissionId,
        [FromBody] UpdateBettingPoolPrizesCommissionDto dto)
    {
        try
        {
            var prizeCommission = await _context.BettingPoolPrizesCommissions
                .FirstOrDefaultAsync(pc => pc.BettingPoolId == bettingPoolId &&
                                          pc.PrizeCommissionId == prizeCommissionId);

            if (prizeCommission == null)
            {
                return NotFound(new { message = "Premio/comisión no encontrado" });
            }

            if (dto.LotteryId.HasValue)
            {
                var lotteryExists = await _context.Lotteries
                    .AnyAsync(l => l.LotteryId == dto.LotteryId.Value);

                if (!lotteryExists)
                {
                    return BadRequest(new { message = "Lotería no encontrada" });
                }

                prizeCommission.LotteryId = dto.LotteryId.Value;
            }

            if (!string.IsNullOrEmpty(dto.GameType))
                prizeCommission.GameType = dto.GameType;

            if (dto.PrizePayment1.HasValue)
                prizeCommission.PrizePayment1 = dto.PrizePayment1.Value;
            if (dto.PrizePayment2.HasValue)
                prizeCommission.PrizePayment2 = dto.PrizePayment2.Value;
            if (dto.PrizePayment3.HasValue)
                prizeCommission.PrizePayment3 = dto.PrizePayment3.Value;
            if (dto.PrizePayment4.HasValue)
                prizeCommission.PrizePayment4 = dto.PrizePayment4.Value;

            if (dto.CommissionDiscount1.HasValue)
                prizeCommission.CommissionDiscount1 = dto.CommissionDiscount1.Value;
            if (dto.CommissionDiscount2.HasValue)
                prizeCommission.CommissionDiscount2 = dto.CommissionDiscount2.Value;
            if (dto.CommissionDiscount3.HasValue)
                prizeCommission.CommissionDiscount3 = dto.CommissionDiscount3.Value;
            if (dto.CommissionDiscount4.HasValue)
                prizeCommission.CommissionDiscount4 = dto.CommissionDiscount4.Value;

            if (dto.Commission2Discount1.HasValue)
                prizeCommission.Commission2Discount1 = dto.Commission2Discount1.Value;
            if (dto.Commission2Discount2.HasValue)
                prizeCommission.Commission2Discount2 = dto.Commission2Discount2.Value;
            if (dto.Commission2Discount3.HasValue)
                prizeCommission.Commission2Discount3 = dto.Commission2Discount3.Value;
            if (dto.Commission2Discount4.HasValue)
                prizeCommission.Commission2Discount4 = dto.Commission2Discount4.Value;

            if (dto.IsActive.HasValue)
                prizeCommission.IsActive = dto.IsActive.Value;

            prizeCommission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var lottery = await _context.Lotteries.FindAsync(prizeCommission.LotteryId);

            var result = new BettingPoolPrizesCommissionDto
            {
                PrizeCommissionId = prizeCommission.PrizeCommissionId,
                BettingPoolId = prizeCommission.BettingPoolId,
                LotteryId = prizeCommission.LotteryId,
                LotteryName = lottery?.LotteryName,
                GameType = prizeCommission.GameType,
                PrizePayment1 = prizeCommission.PrizePayment1,
                PrizePayment2 = prizeCommission.PrizePayment2,
                PrizePayment3 = prizeCommission.PrizePayment3,
                PrizePayment4 = prizeCommission.PrizePayment4,
                CommissionDiscount1 = prizeCommission.CommissionDiscount1,
                CommissionDiscount2 = prizeCommission.CommissionDiscount2,
                CommissionDiscount3 = prizeCommission.CommissionDiscount3,
                CommissionDiscount4 = prizeCommission.CommissionDiscount4,
                Commission2Discount1 = prizeCommission.Commission2Discount1,
                Commission2Discount2 = prizeCommission.Commission2Discount2,
                Commission2Discount3 = prizeCommission.Commission2Discount3,
                Commission2Discount4 = prizeCommission.Commission2Discount4,
                IsActive = prizeCommission.IsActive
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar premio/comisión {PrizeCommissionId}", prizeCommissionId);
            return StatusCode(500, new { message = $"Error al actualizar premio/comisión: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete a prize/commission
    /// </summary>
    [HttpDelete("{prizeCommissionId}")]
    public async Task<IActionResult> DeletePrizeCommission(
        int bettingPoolId,
        int prizeCommissionId)
    {
        try
        {
            var prizeCommission = await _context.BettingPoolPrizesCommissions
                .FirstOrDefaultAsync(pc => pc.BettingPoolId == bettingPoolId &&
                                          pc.PrizeCommissionId == prizeCommissionId);

            if (prizeCommission == null)
            {
                return NotFound(new { message = "Premio/comisión no encontrado" });
            }

            _context.BettingPoolPrizesCommissions.Remove(prizeCommission);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Premio/comisión eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar premio/comisión {PrizeCommissionId}", prizeCommissionId);
            return StatusCode(500, new { message = $"Error al eliminar premio/comisión: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get all prizes/commissions in flat structure (frontend v2 compatibility)
    /// </summary>
    [HttpGet("prizes-bulk")]
    public async Task<ActionResult<FlatPrizesConfigDto>> GetPrizesCommissionsBulk(int bettingPoolId)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            var records = await _context.BettingPoolPrizesCommissions
                .Where(pc => pc.BettingPoolId == bettingPoolId)
                .ToListAsync();

            var flatDto = ConvertToFlatDto(records);

            return Ok(flatDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener configuración plana de premios para la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al obtener configuración: {ex.Message}" });
        }
    }

    /// <summary>
    /// Save all prizes/commissions from flat structure (frontend v2 compatibility)
    /// </summary>
    [HttpPost("prizes-bulk")]
    public async Task<ActionResult<FlatPrizesConfigDto>> SavePrizesCommissionsBulk(
        int bettingPoolId,
        [FromBody] FlatPrizesConfigDto dto)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Delete existing records for this betting pool
            var existing = await _context.BettingPoolPrizesCommissions
                .Where(pc => pc.BettingPoolId == bettingPoolId)
                .ToListAsync();

            _context.BettingPoolPrizesCommissions.RemoveRange(existing);

            // Convert flat DTO to individual records
            var records = ConvertFromFlatDto(bettingPoolId, dto);

            // Add new records
            _context.BettingPoolPrizesCommissions.AddRange(records);
            await _context.SaveChangesAsync();

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar configuración plana de premios para la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al guardar configuración: {ex.Message}" });
        }
    }

    // Helper methods for flat DTO conversion
    private FlatPrizesConfigDto ConvertToFlatDto(List<BettingPoolPrizesCommission> records)
    {
        var dto = new FlatPrizesConfigDto();

        foreach (var record in records)
        {
            switch (record.GameType)
            {
                case "PICK3":
                    dto.Pick3FirstPayment = record.PrizePayment1;
                    dto.Pick3SecondPayment = record.PrizePayment2;
                    dto.Pick3ThirdPayment = record.PrizePayment3;
                    dto.Pick3Doubles = record.PrizePayment4;
                    break;
                case "PICK3_SUPER":
                    dto.Pick3SuperAllSequence = record.PrizePayment1;
                    dto.Pick3SuperFirstPayment = record.PrizePayment2;
                    dto.Pick3SuperSecondPayment = record.PrizePayment3;
                    dto.Pick3SuperThirdPayment = record.PrizePayment4;
                    break;
                case "PICK3_NY":
                    dto.Pick3NY_3Way2Identical = record.PrizePayment1;
                    dto.Pick3NY_6Way3Unique = record.PrizePayment2;
                    break;
                case "PICK4":
                    dto.Pick4FirstPayment = record.PrizePayment1;
                    dto.Pick4SecondPayment = record.PrizePayment2;
                    dto.Pick4_4Way3Identical = record.PrizePayment3;
                    dto.Pick4_6Way2Identical = record.PrizePayment4;
                    dto.Pick4_12Way2Identical = record.CommissionDiscount1;
                    dto.Pick4_24Way4Unique = record.CommissionDiscount2;
                    break;
                case "PICK4_SUPER":
                    dto.Pick4SuperAllSequence = record.PrizePayment1;
                    dto.Pick4SuperDoubles = record.PrizePayment2;
                    break;
                case "PICK4_NY":
                    dto.Pick4NY_AllSequence = record.PrizePayment1;
                    dto.Pick4NY_Doubles = record.PrizePayment2;
                    break;
                case "PICK5":
                    dto.Pick5FirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_BRONX":
                    dto.Pick5BronxFirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_BROOKLYN":
                    dto.Pick5BrooklynFirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_MEGA":
                    dto.Pick5MegaFirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_NY":
                    dto.Pick5NYFirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_QUEENS":
                    dto.Pick5QueensFirstPayment = record.PrizePayment1;
                    break;
                case "PICK5_SUPER":
                    dto.Pick5SuperAllSequence = record.PrizePayment1;
                    dto.Pick5SuperDoubles = record.PrizePayment2;
                    dto.Pick5Super_5Way4Identical = record.PrizePayment3;
                    dto.Pick5Super_10Way3Identical = record.PrizePayment4;
                    dto.Pick5Super_20Way3Identical = record.CommissionDiscount1;
                    dto.Pick5Super_30Way2Identical = record.CommissionDiscount2;
                    dto.Pick5Super_60Way2Identical = record.CommissionDiscount3;
                    dto.Pick5Super_120Way5Unique = record.CommissionDiscount4;
                    break;
                case "PICK6":
                    dto.Pick6AllSequence = record.PrizePayment1;
                    dto.Pick6Triples = record.PrizePayment2;
                    dto.Pick6NY_3Way2Identical = record.PrizePayment3;
                    dto.Pick6NY_6Way3Unique = record.PrizePayment4;
                    break;
                case "PICK6_CALIFORNIA":
                    dto.Pick6CaliforniaAllSequence = record.PrizePayment1;
                    dto.Pick6CaliforniaTriples = record.PrizePayment2;
                    dto.Pick6Cali_3Way2Identical = record.PrizePayment3;
                    dto.Pick6Cali_6Way3Unique = record.PrizePayment4;
                    break;
                case "PICK6_MIAMI":
                    dto.Pick6MiamiFirstPayment = record.PrizePayment1;
                    dto.Pick6MiamiDoubles = record.PrizePayment2;
                    break;
                case "LOTTO_CLASSIC":
                    dto.LottoClassicFirstPayment = record.PrizePayment1;
                    dto.LottoClassicDoubles = record.PrizePayment2;
                    break;
                case "LOTTO_PLUS":
                    dto.LottoPlusFirstPayment = record.PrizePayment1;
                    dto.LottoPlusDoubles = record.PrizePayment2;
                    break;
                case "MEGA_MILLIONS":
                    dto.MegaMillionsFirstPayment = record.PrizePayment1;
                    dto.MegaMillionsDoubles = record.PrizePayment2;
                    break;
                case "POWERBALL":
                    dto.PowerballLastNumberFirstRound = record.PrizePayment1;
                    dto.PowerballLastNumberSecondRound = record.PrizePayment2;
                    dto.PowerballLastNumberThirdRound = record.PrizePayment3;
                    dto.PowerballLast2NumbersSecondRound = record.PrizePayment4;
                    dto.PowerballLast2NumbersThirdRound = record.CommissionDiscount1;
                    dto.Powerball2NumbersFirstRound = record.CommissionDiscount2;
                    dto.Powerball3NumbersFirstRound = record.CommissionDiscount3;
                    dto.Powerball3NumbersSecondRound = record.CommissionDiscount4;
                    dto.Powerball3NumbersThirdRound = record.Commission2Discount1;
                    dto.Powerball4NumbersFirstRound = record.Commission2Discount2;
                    dto.Powerball4NumbersSecondRound = record.Commission2Discount3;
                    dto.Powerball4NumbersThirdRound = record.Commission2Discount4;
                    break;
            }
        }

        return dto;
    }

    /// <summary>
    /// Batch save multiple commission records at once (optimized endpoint)
    /// Creates new records or updates existing ones based on lotteryId + gameType combination
    /// </summary>
    [HttpPost("prizes-commissions/batch")]
    public async Task<ActionResult<BatchSaveCommissionsResponseDto>> BatchSaveCommissions(
        int bettingPoolId,
        [FromBody] BatchSaveCommissionsDto dto)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            if (dto.Items == null || dto.Items.Count == 0)
            {
                return Ok(new BatchSaveCommissionsResponseDto
                {
                    Success = true,
                    Message = "No items to process",
                    TotalProcessed = 0
                });
            }

            // Load all existing records for this betting pool in one query
            var existingRecords = await _context.BettingPoolPrizesCommissions
                .Where(pc => pc.BettingPoolId == bettingPoolId)
                .ToListAsync();

            int createdCount = 0;
            int updatedCount = 0;
            var errors = new List<string>();

            foreach (var item in dto.Items)
            {
                try
                {
                    // Find existing record by lotteryId + gameType
                    var existing = existingRecords.FirstOrDefault(r =>
                        r.GameType == item.GameType &&
                        ((item.LotteryId == null && r.LotteryId == null) ||
                         (item.LotteryId != null && r.LotteryId == item.LotteryId)));

                    if (existing != null)
                    {
                        // Update existing record
                        if (item.CommissionDiscount1.HasValue)
                            existing.CommissionDiscount1 = item.CommissionDiscount1.Value;
                        if (item.Commission2Discount1.HasValue)
                            existing.Commission2Discount1 = item.Commission2Discount1.Value;
                        existing.UpdatedAt = DateTime.UtcNow;
                        updatedCount++;
                    }
                    else
                    {
                        // Create new record
                        var newRecord = new BettingPoolPrizesCommission
                        {
                            BettingPoolId = bettingPoolId,
                            LotteryId = item.LotteryId,
                            GameType = item.GameType,
                            CommissionDiscount1 = item.CommissionDiscount1,
                            Commission2Discount1 = item.Commission2Discount1,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.BettingPoolPrizesCommissions.Add(newRecord);
                        existingRecords.Add(newRecord); // Track for subsequent items with same key
                        createdCount++;
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"Error processing {item.GameType} (lotteryId={item.LotteryId}): {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new BatchSaveCommissionsResponseDto
            {
                Success = errors.Count == 0,
                CreatedCount = createdCount,
                UpdatedCount = updatedCount,
                TotalProcessed = createdCount + updatedCount,
                Message = $"Processed {createdCount + updatedCount} items ({createdCount} created, {updatedCount} updated)",
                Errors = errors.Count > 0 ? errors : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in batch save commissions for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al guardar comisiones en lote: {ex.Message}" });
        }
    }

    private List<BettingPoolPrizesCommission> ConvertFromFlatDto(int bettingPoolId, FlatPrizesConfigDto dto)
    {
        var records = new List<BettingPoolPrizesCommission>();
        var now = DateTime.UtcNow;

        // Pick 3
        if (dto.Pick3FirstPayment.HasValue || dto.Pick3SecondPayment.HasValue ||
            dto.Pick3ThirdPayment.HasValue || dto.Pick3Doubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK3",
                PrizePayment1 = dto.Pick3FirstPayment,
                PrizePayment2 = dto.Pick3SecondPayment,
                PrizePayment3 = dto.Pick3ThirdPayment,
                PrizePayment4 = dto.Pick3Doubles,
                CreatedAt = now
            });
        }

        // Pick 3 Super
        if (dto.Pick3SuperAllSequence.HasValue || dto.Pick3SuperFirstPayment.HasValue ||
            dto.Pick3SuperSecondPayment.HasValue || dto.Pick3SuperThirdPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK3_SUPER",
                PrizePayment1 = dto.Pick3SuperAllSequence,
                PrizePayment2 = dto.Pick3SuperFirstPayment,
                PrizePayment3 = dto.Pick3SuperSecondPayment,
                PrizePayment4 = dto.Pick3SuperThirdPayment,
                CreatedAt = now
            });
        }

        // Pick 3 NY
        if (dto.Pick3NY_3Way2Identical.HasValue || dto.Pick3NY_6Way3Unique.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK3_NY",
                PrizePayment1 = dto.Pick3NY_3Way2Identical,
                PrizePayment2 = dto.Pick3NY_6Way3Unique,
                CreatedAt = now
            });
        }

        // Pick 4
        if (dto.Pick4FirstPayment.HasValue || dto.Pick4SecondPayment.HasValue ||
            dto.Pick4_4Way3Identical.HasValue || dto.Pick4_6Way2Identical.HasValue ||
            dto.Pick4_12Way2Identical.HasValue || dto.Pick4_24Way4Unique.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK4",
                PrizePayment1 = dto.Pick4FirstPayment,
                PrizePayment2 = dto.Pick4SecondPayment,
                PrizePayment3 = dto.Pick4_4Way3Identical,
                PrizePayment4 = dto.Pick4_6Way2Identical,
                CommissionDiscount1 = dto.Pick4_12Way2Identical,
                CommissionDiscount2 = dto.Pick4_24Way4Unique,
                CreatedAt = now
            });
        }

        // Pick 4 Super
        if (dto.Pick4SuperAllSequence.HasValue || dto.Pick4SuperDoubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK4_SUPER",
                PrizePayment1 = dto.Pick4SuperAllSequence,
                PrizePayment2 = dto.Pick4SuperDoubles,
                CreatedAt = now
            });
        }

        // Pick 4 NY
        if (dto.Pick4NY_AllSequence.HasValue || dto.Pick4NY_Doubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK4_NY",
                PrizePayment1 = dto.Pick4NY_AllSequence,
                PrizePayment2 = dto.Pick4NY_Doubles,
                CreatedAt = now
            });
        }

        // Pick 5 variants
        if (dto.Pick5FirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5",
                PrizePayment1 = dto.Pick5FirstPayment,
                CreatedAt = now
            });
        }

        if (dto.Pick5BronxFirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_BRONX",
                PrizePayment1 = dto.Pick5BronxFirstPayment,
                CreatedAt = now
            });
        }

        if (dto.Pick5BrooklynFirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_BROOKLYN",
                PrizePayment1 = dto.Pick5BrooklynFirstPayment,
                CreatedAt = now
            });
        }

        if (dto.Pick5MegaFirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_MEGA",
                PrizePayment1 = dto.Pick5MegaFirstPayment,
                CreatedAt = now
            });
        }

        if (dto.Pick5NYFirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_NY",
                PrizePayment1 = dto.Pick5NYFirstPayment,
                CreatedAt = now
            });
        }

        if (dto.Pick5QueensFirstPayment.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_QUEENS",
                PrizePayment1 = dto.Pick5QueensFirstPayment,
                CreatedAt = now
            });
        }

        // Pick 5 Super
        if (dto.Pick5SuperAllSequence.HasValue || dto.Pick5SuperDoubles.HasValue ||
            dto.Pick5Super_5Way4Identical.HasValue || dto.Pick5Super_10Way3Identical.HasValue ||
            dto.Pick5Super_20Way3Identical.HasValue || dto.Pick5Super_30Way2Identical.HasValue ||
            dto.Pick5Super_60Way2Identical.HasValue || dto.Pick5Super_120Way5Unique.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK5_SUPER",
                PrizePayment1 = dto.Pick5SuperAllSequence,
                PrizePayment2 = dto.Pick5SuperDoubles,
                PrizePayment3 = dto.Pick5Super_5Way4Identical,
                PrizePayment4 = dto.Pick5Super_10Way3Identical,
                CommissionDiscount1 = dto.Pick5Super_20Way3Identical,
                CommissionDiscount2 = dto.Pick5Super_30Way2Identical,
                CommissionDiscount3 = dto.Pick5Super_60Way2Identical,
                CommissionDiscount4 = dto.Pick5Super_120Way5Unique,
                CreatedAt = now
            });
        }

        // Pick 6
        if (dto.Pick6AllSequence.HasValue || dto.Pick6Triples.HasValue ||
            dto.Pick6NY_3Way2Identical.HasValue || dto.Pick6NY_6Way3Unique.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK6",
                PrizePayment1 = dto.Pick6AllSequence,
                PrizePayment2 = dto.Pick6Triples,
                PrizePayment3 = dto.Pick6NY_3Way2Identical,
                PrizePayment4 = dto.Pick6NY_6Way3Unique,
                CreatedAt = now
            });
        }

        // Pick 6 California
        if (dto.Pick6CaliforniaAllSequence.HasValue || dto.Pick6CaliforniaTriples.HasValue ||
            dto.Pick6Cali_3Way2Identical.HasValue || dto.Pick6Cali_6Way3Unique.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK6_CALIFORNIA",
                PrizePayment1 = dto.Pick6CaliforniaAllSequence,
                PrizePayment2 = dto.Pick6CaliforniaTriples,
                PrizePayment3 = dto.Pick6Cali_3Way2Identical,
                PrizePayment4 = dto.Pick6Cali_6Way3Unique,
                CreatedAt = now
            });
        }

        // Pick 6 Miami
        if (dto.Pick6MiamiFirstPayment.HasValue || dto.Pick6MiamiDoubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "PICK6_MIAMI",
                PrizePayment1 = dto.Pick6MiamiFirstPayment,
                PrizePayment2 = dto.Pick6MiamiDoubles,
                CreatedAt = now
            });
        }

        // Lotto Classic
        if (dto.LottoClassicFirstPayment.HasValue || dto.LottoClassicDoubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "LOTTO_CLASSIC",
                PrizePayment1 = dto.LottoClassicFirstPayment,
                PrizePayment2 = dto.LottoClassicDoubles,
                CreatedAt = now
            });
        }

        // Lotto Plus
        if (dto.LottoPlusFirstPayment.HasValue || dto.LottoPlusDoubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "LOTTO_PLUS",
                PrizePayment1 = dto.LottoPlusFirstPayment,
                PrizePayment2 = dto.LottoPlusDoubles,
                CreatedAt = now
            });
        }

        // Mega Millions
        if (dto.MegaMillionsFirstPayment.HasValue || dto.MegaMillionsDoubles.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "MEGA_MILLIONS",
                PrizePayment1 = dto.MegaMillionsFirstPayment,
                PrizePayment2 = dto.MegaMillionsDoubles,
                CreatedAt = now
            });
        }

        // Powerball
        if (dto.PowerballLastNumberFirstRound.HasValue || dto.PowerballLastNumberSecondRound.HasValue ||
            dto.PowerballLastNumberThirdRound.HasValue || dto.PowerballLast2NumbersSecondRound.HasValue ||
            dto.PowerballLast2NumbersThirdRound.HasValue || dto.Powerball2NumbersFirstRound.HasValue ||
            dto.Powerball3NumbersFirstRound.HasValue || dto.Powerball3NumbersSecondRound.HasValue ||
            dto.Powerball3NumbersThirdRound.HasValue || dto.Powerball4NumbersFirstRound.HasValue ||
            dto.Powerball4NumbersSecondRound.HasValue || dto.Powerball4NumbersThirdRound.HasValue)
        {
            records.Add(new BettingPoolPrizesCommission
            {
                BettingPoolId = bettingPoolId,
                GameType = "POWERBALL",
                PrizePayment1 = dto.PowerballLastNumberFirstRound,
                PrizePayment2 = dto.PowerballLastNumberSecondRound,
                PrizePayment3 = dto.PowerballLastNumberThirdRound,
                PrizePayment4 = dto.PowerballLast2NumbersSecondRound,
                CommissionDiscount1 = dto.PowerballLast2NumbersThirdRound,
                CommissionDiscount2 = dto.Powerball2NumbersFirstRound,
                CommissionDiscount3 = dto.Powerball3NumbersFirstRound,
                CommissionDiscount4 = dto.Powerball3NumbersSecondRound,
                Commission2Discount1 = dto.Powerball3NumbersThirdRound,
                Commission2Discount2 = dto.Powerball4NumbersFirstRound,
                Commission2Discount3 = dto.Powerball4NumbersSecondRound,
                Commission2Discount4 = dto.Powerball4NumbersThirdRound,
                CreatedAt = now
            });
        }

        return records;
    }
}
