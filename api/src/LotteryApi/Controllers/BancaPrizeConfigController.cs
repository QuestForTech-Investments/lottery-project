using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Controllers;

/// <summary>
/// Controller para gestionar configuración personalizada de premios por banca
/// </summary>
[ApiController]
[Route("api/betting-pools")]
[Produces("application/json")]
public class BancaPrizeConfigController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BancaPrizeConfigController> _logger;

    public BancaPrizeConfigController(
        LotteryDbContext context,
        ILogger<BancaPrizeConfigController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Guardar o actualizar configuración de premios para una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="request">Lista de configuraciones de premios</param>
    /// <returns>Resultado de la operación con detalles de configuraciones guardadas</returns>
    /// <response code="200">Configuración guardada exitosamente</response>
    /// <response code="400">Datos inválidos</response>
    /// <response code="404">Banca no encontrada</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{bettingPoolId:int}/prize-config", Order = -1)]
    [ProducesResponseType(typeof(BancaPrizeConfigResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BancaPrizeConfigResponse>> SavePrizeConfig(
        int bettingPoolId,
        [FromBody] SaveBancaPrizeConfigRequest request)
    {
        try
        {
            // Validar que la banca existe
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                _logger.LogWarning("Betting pool {BettingPoolId} not found", bettingPoolId);
                return NotFound(new { message = $"Banca con ID {bettingPoolId} no encontrada" });
            }

            if (request.PrizeConfigs == null || !request.PrizeConfigs.Any())
            {
                _logger.LogWarning("Empty prize configs received for betting pool {BettingPoolId}", bettingPoolId);
                return BadRequest(new { message = "Debe proporcionar al menos una configuración de premio" });
            }

            int savedCount = 0;
            int updatedCount = 0;
            var savedConfigs = new List<BancaPrizeConfigDto>();

            // Procesar cada configuración de premio
            foreach (var configItem in request.PrizeConfigs)
            {
                // Validar que el prize field existe
                var prizeFieldExists = await _context.PrizeTypes
                    .AnyAsync(pf => pf.PrizeTypeId == configItem.PrizeTypeId);

                if (!prizeFieldExists)
                {
                    _logger.LogWarning("Prize field {PrizeTypeId} not found, skipping", configItem.PrizeTypeId);
                    continue;
                }

                // Buscar si ya existe una configuración para esta combinación
                var existingConfig = await _context.BancaPrizeConfigs
                    .FirstOrDefaultAsync(bpc =>
                        bpc.BettingPoolId == bettingPoolId &&
                        bpc.PrizeTypeId == configItem.PrizeTypeId);

                if (existingConfig != null)
                {
                    // Actualizar configuración existente
                    existingConfig.CustomValue = configItem.Value;
                    existingConfig.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;

                    _logger.LogInformation(
                        "Updated prize config {ConfigId} for betting pool {BettingPoolId}, prize field {PrizeTypeId}",
                        existingConfig.ConfigId, bettingPoolId, configItem.PrizeTypeId);

                    savedConfigs.Add(new BancaPrizeConfigDto
                    {
                        ConfigId = existingConfig.ConfigId,
                        BettingPoolId = existingConfig.BettingPoolId,
                        PrizeTypeId = existingConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = existingConfig.CustomValue,
                        CreatedAt = existingConfig.CreatedAt,
                        UpdatedAt = existingConfig.UpdatedAt
                    });
                }
                else
                {
                    // Crear nueva configuración
                    var newConfig = new BancaPrizeConfig
                    {
                        BettingPoolId = bettingPoolId,
                        PrizeTypeId = configItem.PrizeTypeId,
                        CustomValue = configItem.Value,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.BancaPrizeConfigs.Add(newConfig);
                    savedCount++;

                    _logger.LogInformation(
                        "Created new prize config for betting pool {BettingPoolId}, prize field {PrizeTypeId}",
                        bettingPoolId, configItem.PrizeTypeId);

                    // Nota: ConfigId se asignará después de SaveChanges
                    savedConfigs.Add(new BancaPrizeConfigDto
                    {
                        ConfigId = 0, // Se asignará después de guardar
                        BettingPoolId = newConfig.BettingPoolId,
                        PrizeTypeId = newConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = newConfig.CustomValue,
                        CreatedAt = newConfig.CreatedAt,
                        UpdatedAt = newConfig.UpdatedAt
                    });
                }
            }

            // Guardar todos los cambios
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Prize config saved successfully for betting pool {BettingPoolId}: {SavedCount} new, {UpdatedCount} updated",
                bettingPoolId, savedCount, updatedCount);

            var response = new BancaPrizeConfigResponse
            {
                BettingPoolId = bettingPoolId,
                SavedCount = savedCount,
                UpdatedCount = updatedCount,
                Message = $"Configuración guardada exitosamente: {savedCount} nuevos, {updatedCount} actualizados",
                SavedConfigs = savedConfigs
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving prize config for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error interno al guardar configuración de premios" });
        }
    }

    /// <summary>
    /// Obtener configuración de premios de una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <returns>Lista de configuraciones de premios</returns>
    /// <response code="200">Configuración obtenida exitosamente</response>
    /// <response code="404">Banca no encontrada</response>
    [HttpGet("{bettingPoolId:int}/prize-config", Order = -1)]
    [ProducesResponseType(typeof(List<BancaPrizeConfigDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<BancaPrizeConfigDto>>> GetPrizeConfig(int bettingPoolId)
    {
        try
        {
            // Validar que la banca existe
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                _logger.LogWarning("Betting pool {BettingPoolId} not found", bettingPoolId);
                return NotFound(new { message = $"Banca con ID {bettingPoolId} no encontrada" });
            }

            // Obtener configuraciones con información del prize field
            var configs = await _context.BancaPrizeConfigs
                .Where(bpc => bpc.BettingPoolId == bettingPoolId)
                .Include(bpc => bpc.PrizeType)
                .Select(bpc => new BancaPrizeConfigDto
                {
                    ConfigId = bpc.ConfigId,
                    BettingPoolId = bpc.BettingPoolId,
                    PrizeTypeId = bpc.PrizeTypeId,
                    FieldCode = bpc.PrizeType!.FieldCode,
                    CustomValue = bpc.CustomValue,
                    CreatedAt = bpc.CreatedAt,
                    UpdatedAt = bpc.UpdatedAt
                })
                .ToListAsync();

            _logger.LogInformation(
                "Retrieved {Count} prize configs for betting pool {BettingPoolId}",
                configs.Count, bettingPoolId);

            return Ok(configs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving prize config for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error interno al obtener configuración de premios" });
        }
    }

    /// <summary>
    /// Actualizar parcialmente configuración de premios de una banca (UPSERT selectivo)
    /// </summary>
    /// <remarks>
    /// Este endpoint está optimizado para actualizaciones parciales.
    /// Solo envía los campos que cambiaron, no todos.
    ///
    /// Ventajas sobre POST:
    /// - Solo actualiza campos específicos que cambiaron
    /// - No requiere DELETE previo
    /// - 95-98% más rápido para cambios pequeños
    /// - Operación atómica (UPDATE si existe, INSERT si no)
    ///
    /// Ejemplo: Si solo cambió 1 campo de 50, solo enviar ese 1 campo.
    /// </remarks>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="request">Lista de configuraciones de premios SOLO con los campos que cambiaron</param>
    /// <returns>Resultado de la operación con detalles de configuraciones actualizadas</returns>
    /// <response code="200">Configuración actualizada exitosamente</response>
    /// <response code="400">Datos inválidos</response>
    /// <response code="404">Banca no encontrada</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPatch("{bettingPoolId:int}/prize-config", Order = -1)]
    [ProducesResponseType(typeof(BancaPrizeConfigResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BancaPrizeConfigResponse>> PatchPrizeConfig(
        int bettingPoolId,
        [FromBody] SaveBancaPrizeConfigRequest request)
    {
        try
        {
            // Validar que la banca existe
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                _logger.LogWarning("Betting pool {BettingPoolId} not found", bettingPoolId);
                return NotFound(new { message = $"Banca con ID {bettingPoolId} no encontrada" });
            }

            if (request.PrizeConfigs == null || !request.PrizeConfigs.Any())
            {
                _logger.LogWarning("Empty prize configs received for betting pool {BettingPoolId}", bettingPoolId);
                return BadRequest(new { message = "Debe proporcionar al menos una configuración de premio" });
            }

            _logger.LogInformation(
                "⚡ OPTIMIZED PATCH prize config for betting pool {BettingPoolId}: {Count} fields to update",
                bettingPoolId, request.PrizeConfigs.Count);

            // 🚀 OPTIMIZACIÓN: Cargar todos los prize fields en 1 query (en lugar de N queries)
            var prizeFieldIds = request.PrizeConfigs.Select(c => c.PrizeTypeId).Distinct().ToList();
            var validPrizeTypeIds = await _context.PrizeTypes
                .Where(pf => prizeFieldIds.Contains(pf.PrizeTypeId))
                .Select(pf => pf.PrizeTypeId)
                .ToListAsync();

            _logger.LogDebug("Validated {Count} prize fields in 1 query", validPrizeTypeIds.Count);

            // 🚀 OPTIMIZACIÓN: Cargar todas las configs existentes en 1 query (en lugar de N queries)
            var existingConfigs = await _context.BancaPrizeConfigs
                .Where(bpc => bpc.BettingPoolId == bettingPoolId &&
                             prizeFieldIds.Contains(bpc.PrizeTypeId))
                .ToListAsync();

            var configsDict = existingConfigs.ToDictionary(c => c.PrizeTypeId);

            _logger.LogDebug("Loaded {Count} existing configs in 1 query", existingConfigs.Count);

            int insertedCount = 0;
            int updatedCount = 0;
            var processedConfigs = new List<BancaPrizeConfigDto>();

            // 🚀 OPTIMIZACIÓN: Procesar en memoria (sin queries adicionales)
            foreach (var configItem in request.PrizeConfigs)
            {
                // Validar que el prize field existe (ya cargado en memoria)
                if (!validPrizeTypeIds.Contains(configItem.PrizeTypeId))
                {
                    _logger.LogWarning("Prize field {PrizeTypeId} not found, skipping", configItem.PrizeTypeId);
                    continue;
                }

                // Buscar en el diccionario (sin query)
                if (configsDict.TryGetValue(configItem.PrizeTypeId, out var existingConfig))
                {
                    // UPDATE: Actualizar configuración existente (en memoria)
                    existingConfig.CustomValue = configItem.Value;
                    existingConfig.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;

                    _logger.LogDebug(
                        "Updated prize config {ConfigId} for field {FieldCode}: {Value}",
                        existingConfig.ConfigId, configItem.FieldCode, configItem.Value);

                    processedConfigs.Add(new BancaPrizeConfigDto
                    {
                        ConfigId = existingConfig.ConfigId,
                        BettingPoolId = existingConfig.BettingPoolId,
                        PrizeTypeId = existingConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = existingConfig.CustomValue,
                        CreatedAt = existingConfig.CreatedAt,
                        UpdatedAt = existingConfig.UpdatedAt
                    });
                }
                else
                {
                    // INSERT: Crear nueva configuración
                    var newConfig = new BancaPrizeConfig
                    {
                        BettingPoolId = bettingPoolId,
                        PrizeTypeId = configItem.PrizeTypeId,
                        CustomValue = configItem.Value,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.BancaPrizeConfigs.Add(newConfig);
                    insertedCount++;

                    _logger.LogDebug(
                        "Inserted new prize config for field {FieldCode}: {Value}",
                        configItem.FieldCode, configItem.Value);

                    processedConfigs.Add(new BancaPrizeConfigDto
                    {
                        ConfigId = 0, // Se asignará después de guardar
                        BettingPoolId = newConfig.BettingPoolId,
                        PrizeTypeId = newConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = newConfig.CustomValue,
                        CreatedAt = newConfig.CreatedAt,
                        UpdatedAt = newConfig.UpdatedAt
                    });
                }
            }

            // Guardar todos los cambios en una sola transacción (1 query final)
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "⚡ OPTIMIZED PATCH completed for betting pool {BettingPoolId}: {InsertedCount} inserted, {UpdatedCount} updated (3 total queries)",
                bettingPoolId, insertedCount, updatedCount);

            var response = new BancaPrizeConfigResponse
            {
                BettingPoolId = bettingPoolId,
                SavedCount = insertedCount,
                UpdatedCount = updatedCount,
                Message = $"Actualización selectiva completada: {insertedCount} nuevos, {updatedCount} actualizados",
                SavedConfigs = processedConfigs
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in PATCH prize config for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error interno al actualizar configuración de premios" });
        }
    }

    /// <summary>
    /// Eliminar configuración de premios de una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="200">Configuración eliminada exitosamente</response>
    /// <response code="404">Banca no encontrada</response>
    [HttpDelete("{bettingPoolId:int}/prize-config", Order = -1)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePrizeConfig(int bettingPoolId)
    {
        try
        {
            // Validar que la banca existe
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                _logger.LogWarning("Betting pool {BettingPoolId} not found", bettingPoolId);
                return NotFound(new { message = $"Banca con ID {bettingPoolId} no encontrada" });
            }

            // Eliminar todas las configuraciones de esta banca
            var configs = await _context.BancaPrizeConfigs
                .Where(bpc => bpc.BettingPoolId == bettingPoolId)
                .ToListAsync();

            if (!configs.Any())
            {
                return Ok(new { message = "No hay configuraciones de premios para eliminar" });
            }

            _context.BancaPrizeConfigs.RemoveRange(configs);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Deleted {Count} prize configs for betting pool {BettingPoolId}",
                configs.Count, bettingPoolId);

            return Ok(new { message = $"Se eliminaron {configs.Count} configuraciones de premios" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting prize config for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = "Error interno al eliminar configuración de premios" });
        }
    }
}
