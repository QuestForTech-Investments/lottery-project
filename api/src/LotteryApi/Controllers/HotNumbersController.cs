using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs.HotNumbers;

namespace LotteryApi.Controllers;

/// <summary>
/// Controller for managing hot numbers (numeros calientes) and their limits.
/// Hot numbers are numbers 0-99 that are marked for special limit handling.
/// </summary>
[ApiController]
[Route("api/hot-numbers")]
public class HotNumbersController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<HotNumbersController> _logger;

    public HotNumbersController(LotteryDbContext context, ILogger<HotNumbersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Hot Numbers Selection

    /// <summary>
    /// Get the list of selected hot numbers
    /// </summary>
    /// <returns>Configuration with list of selected hot numbers</returns>
    [HttpGet]
    public async Task<ActionResult<HotNumbersConfigDto>> GetHotNumbers()
    {
        try
        {
            var hotNumbers = await _context.HotNumbers
                .Where(hn => hn.IsActive)
                .OrderBy(hn => hn.Number)
                .Select(hn => hn.Number)
                .ToListAsync();

            return Ok(new HotNumbersConfigDto
            {
                SelectedNumbers = hotNumbers
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hot numbers");
            return StatusCode(500, new { message = "Error al obtener los numeros calientes" });
        }
    }

    /// <summary>
    /// Update the list of selected hot numbers
    /// </summary>
    /// <param name="dto">Configuration with list of numbers to select</param>
    /// <returns>Updated configuration</returns>
    [HttpPut]
    public async Task<ActionResult<HotNumbersConfigDto>> UpdateHotNumbers([FromBody] UpdateHotNumbersDto dto)
    {
        try
        {
            // Validate numbers are in valid range (0-99)
            var validNumbers = dto.SelectedNumbers
                .Where(n => n >= 0 && n <= 99)
                .Distinct()
                .OrderBy(n => n)
                .ToList();

            // Get current hot numbers
            var existingHotNumbers = await _context.HotNumbers.ToListAsync();
            var existingNumbers = existingHotNumbers.Where(hn => hn.IsActive).Select(hn => hn.Number).ToHashSet();

            // Numbers to add (in new selection but not currently active)
            var numbersToAdd = validNumbers.Except(existingNumbers).ToList();

            // Numbers to deactivate (currently active but not in new selection)
            var numbersToDeactivate = existingNumbers.Except(validNumbers).ToList();

            // Add new hot numbers
            foreach (var number in numbersToAdd)
            {
                // Check if the number exists but is inactive
                var existing = existingHotNumbers.FirstOrDefault(hn => hn.Number == number);
                if (existing != null)
                {
                    existing.IsActive = true;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.HotNumbers.Add(new HotNumber
                    {
                        Number = number,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Deactivate removed hot numbers
            foreach (var number in numbersToDeactivate)
            {
                var existing = existingHotNumbers.FirstOrDefault(hn => hn.Number == number && hn.IsActive);
                if (existing != null)
                {
                    existing.IsActive = false;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated hot numbers. Added: {Added}, Removed: {Removed}",
                numbersToAdd.Count, numbersToDeactivate.Count);

            return Ok(new HotNumbersConfigDto
            {
                SelectedNumbers = validNumbers
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating hot numbers");
            return StatusCode(500, new { message = "Error al actualizar los numeros calientes" });
        }
    }

    #endregion

    #region Hot Number Limits

    /// <summary>
    /// Get all hot number limits
    /// </summary>
    /// <param name="drawIds">Optional filter by draw IDs</param>
    /// <returns>List of hot number limits</returns>
    [HttpGet("limits")]
    public async Task<ActionResult<List<HotNumberLimitDto>>> GetHotNumberLimits([FromQuery] List<int>? drawIds = null)
    {
        try
        {
            var query = _context.HotNumberLimits
                .Where(hnl => hnl.IsActive)
                .AsQueryable();

            var limits = await query
                .OrderBy(hnl => hnl.HotNumberLimitId)
                .ToListAsync();

            // Filter by draw IDs if provided
            if (drawIds != null && drawIds.Count > 0)
            {
                limits = limits.Where(hnl =>
                    hnl.DrawIdList.Any(id => drawIds.Contains(id)))
                    .ToList();
            }

            var result = limits.Select(hnl => new HotNumberLimitDto
            {
                Id = hnl.HotNumberLimitId,
                DrawIds = hnl.DrawIdList,
                Directo = hnl.Directo,
                Pale1Caliente = hnl.Pale1Caliente,
                Pale2Caliente = hnl.Pale2Caliente,
                Tripleta1Caliente = hnl.Tripleta1Caliente,
                Tripleta2Caliente = hnl.Tripleta2Caliente,
                Tripleta3Caliente = hnl.Tripleta3Caliente,
                CreatedAt = hnl.CreatedAt,
                UpdatedAt = hnl.UpdatedAt
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hot number limits");
            return StatusCode(500, new { message = "Error al obtener los limites de numeros calientes" });
        }
    }

    /// <summary>
    /// Get a single hot number limit by ID
    /// </summary>
    /// <param name="id">Hot number limit ID</param>
    /// <returns>Hot number limit details</returns>
    [HttpGet("limits/{id}")]
    public async Task<ActionResult<HotNumberLimitDto>> GetHotNumberLimit(int id)
    {
        try
        {
            var limit = await _context.HotNumberLimits.FindAsync(id);
            if (limit == null || !limit.IsActive)
            {
                return NotFound(new { message = "Limite de numero caliente no encontrado" });
            }

            return Ok(new HotNumberLimitDto
            {
                Id = limit.HotNumberLimitId,
                DrawIds = limit.DrawIdList,
                Directo = limit.Directo,
                Pale1Caliente = limit.Pale1Caliente,
                Pale2Caliente = limit.Pale2Caliente,
                Tripleta1Caliente = limit.Tripleta1Caliente,
                Tripleta2Caliente = limit.Tripleta2Caliente,
                Tripleta3Caliente = limit.Tripleta3Caliente,
                CreatedAt = limit.CreatedAt,
                UpdatedAt = limit.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hot number limit {Id}", id);
            return StatusCode(500, new { message = "Error al obtener el limite de numero caliente" });
        }
    }

    /// <summary>
    /// Create a new hot number limit
    /// </summary>
    /// <param name="dto">Hot number limit data</param>
    /// <returns>Created hot number limit</returns>
    [HttpPost("limits")]
    public async Task<ActionResult<HotNumberLimitDto>> CreateHotNumberLimit([FromBody] CreateHotNumberLimitDto dto)
    {
        try
        {
            // Validate draw IDs exist
            if (dto.DrawIds == null || dto.DrawIds.Count == 0)
            {
                return BadRequest(new { message = "Debe seleccionar al menos un sorteo" });
            }

            var validDrawIds = await _context.Draws
                .Where(d => dto.DrawIds.Contains(d.DrawId))
                .Select(d => d.DrawId)
                .ToListAsync();

            if (validDrawIds.Count != dto.DrawIds.Count)
            {
                return BadRequest(new { message = "Uno o mas sorteos especificados no existen" });
            }

            // Check for duplicate draw IDs (existing limit with same draws)
            var existingLimits = await _context.HotNumberLimits
                .Where(hnl => hnl.IsActive)
                .ToListAsync();

            foreach (var existingLimit in existingLimits)
            {
                var existingDrawIds = existingLimit.DrawIdList;
                if (dto.DrawIds.All(id => existingDrawIds.Contains(id)) &&
                    existingDrawIds.All(id => dto.DrawIds.Contains(id)))
                {
                    return Conflict(new { message = "Ya existe un limite con la misma configuracion de sorteos" });
                }
            }

            var limit = new HotNumberLimit
            {
                DrawIdList = dto.DrawIds,
                Directo = dto.Directo,
                Pale1Caliente = dto.Pale1Caliente,
                Pale2Caliente = dto.Pale2Caliente,
                Tripleta1Caliente = dto.Tripleta1Caliente,
                Tripleta2Caliente = dto.Tripleta2Caliente,
                Tripleta3Caliente = dto.Tripleta3Caliente,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.HotNumberLimits.Add(limit);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created hot number limit {Id} for draws {DrawIds}",
                limit.HotNumberLimitId, dto.DrawIds);

            var result = new HotNumberLimitDto
            {
                Id = limit.HotNumberLimitId,
                DrawIds = limit.DrawIdList,
                Directo = limit.Directo,
                Pale1Caliente = limit.Pale1Caliente,
                Pale2Caliente = limit.Pale2Caliente,
                Tripleta1Caliente = limit.Tripleta1Caliente,
                Tripleta2Caliente = limit.Tripleta2Caliente,
                Tripleta3Caliente = limit.Tripleta3Caliente,
                CreatedAt = limit.CreatedAt,
                UpdatedAt = limit.UpdatedAt
            };

            return CreatedAtAction(nameof(GetHotNumberLimit), new { id = limit.HotNumberLimitId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating hot number limit");
            return StatusCode(500, new { message = "Error al crear el limite de numero caliente" });
        }
    }

    /// <summary>
    /// Update an existing hot number limit
    /// </summary>
    /// <param name="id">Hot number limit ID</param>
    /// <param name="dto">Updated limit data</param>
    /// <returns>Updated hot number limit</returns>
    [HttpPut("limits/{id}")]
    public async Task<ActionResult<HotNumberLimitDto>> UpdateHotNumberLimit(int id, [FromBody] UpdateHotNumberLimitDto dto)
    {
        try
        {
            var limit = await _context.HotNumberLimits.FindAsync(id);
            if (limit == null || !limit.IsActive)
            {
                return NotFound(new { message = "Limite de numero caliente no encontrado" });
            }

            // Validate and update draw IDs if provided
            if (dto.DrawIds != null && dto.DrawIds.Count > 0)
            {
                var validDrawIds = await _context.Draws
                    .Where(d => dto.DrawIds.Contains(d.DrawId))
                    .Select(d => d.DrawId)
                    .ToListAsync();

                if (validDrawIds.Count != dto.DrawIds.Count)
                {
                    return BadRequest(new { message = "Uno o mas sorteos especificados no existen" });
                }

                limit.DrawIdList = dto.DrawIds;
            }

            // Update amounts if provided
            if (dto.Directo.HasValue)
                limit.Directo = dto.Directo.Value;

            if (dto.Pale1Caliente.HasValue)
                limit.Pale1Caliente = dto.Pale1Caliente.Value;

            if (dto.Pale2Caliente.HasValue)
                limit.Pale2Caliente = dto.Pale2Caliente.Value;

            if (dto.Tripleta1Caliente.HasValue)
                limit.Tripleta1Caliente = dto.Tripleta1Caliente.Value;

            if (dto.Tripleta2Caliente.HasValue)
                limit.Tripleta2Caliente = dto.Tripleta2Caliente.Value;

            if (dto.Tripleta3Caliente.HasValue)
                limit.Tripleta3Caliente = dto.Tripleta3Caliente.Value;

            limit.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated hot number limit {Id}", id);

            return Ok(new HotNumberLimitDto
            {
                Id = limit.HotNumberLimitId,
                DrawIds = limit.DrawIdList,
                Directo = limit.Directo,
                Pale1Caliente = limit.Pale1Caliente,
                Pale2Caliente = limit.Pale2Caliente,
                Tripleta1Caliente = limit.Tripleta1Caliente,
                Tripleta2Caliente = limit.Tripleta2Caliente,
                Tripleta3Caliente = limit.Tripleta3Caliente,
                CreatedAt = limit.CreatedAt,
                UpdatedAt = limit.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating hot number limit {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar el limite de numero caliente" });
        }
    }

    /// <summary>
    /// Delete a hot number limit
    /// </summary>
    /// <param name="id">Hot number limit ID</param>
    /// <returns>Success message</returns>
    [HttpDelete("limits/{id}")]
    public async Task<IActionResult> DeleteHotNumberLimit(int id)
    {
        try
        {
            var limit = await _context.HotNumberLimits.FindAsync(id);
            if (limit == null)
            {
                return NotFound(new { message = "Limite de numero caliente no encontrado" });
            }

            // Soft delete - deactivate instead of removing
            limit.IsActive = false;
            limit.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted (deactivated) hot number limit {Id}", id);

            return Ok(new { message = "Limite de numero caliente eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting hot number limit {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el limite de numero caliente" });
        }
    }

    /// <summary>
    /// Delete all hot number limits
    /// </summary>
    /// <returns>Success message with count of deleted limits</returns>
    [HttpDelete("limits")]
    public async Task<IActionResult> DeleteAllHotNumberLimits()
    {
        try
        {
            var limits = await _context.HotNumberLimits
                .Where(hnl => hnl.IsActive)
                .ToListAsync();

            if (limits.Count == 0)
            {
                return Ok(new { message = "No hay limites de numeros calientes para eliminar", deletedCount = 0 });
            }

            foreach (var limit in limits)
            {
                limit.IsActive = false;
                limit.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted (deactivated) all {Count} hot number limits", limits.Count);

            return Ok(new {
                message = $"Se eliminaron {limits.Count} limites de numeros calientes exitosamente",
                deletedCount = limits.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting all hot number limits");
            return StatusCode(500, new { message = "Error al eliminar los limites de numeros calientes" });
        }
    }

    #endregion
}
