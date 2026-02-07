using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Controllers;

/// <summary>
/// Controller para gestionar configuración personalizada de premios por sorteo y banca
/// </summary>
[ApiController]
[Route("api/betting-pools")]
[Produces("application/json")]
public class DrawPrizeConfigController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<DrawPrizeConfigController> _logger;

    public DrawPrizeConfigController(
        LotteryDbContext context,
        ILogger<DrawPrizeConfigController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Guardar o actualizar configuración de premios para un sorteo específico de una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="drawId">ID del sorteo</param>
    /// <param name="request">Lista de configuraciones de premios</param>
    /// <returns>Resultado de la operación con detalles de configuraciones guardadas</returns>
    /// <response code="200">Configuración guardada exitosamente</response>
    /// <response code="400">Datos inválidos</response>
    /// <response code="404">Banca o sorteo no encontrado</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost("{bettingPoolId}/draws/{drawId}/prize-config")]
    [ProducesResponseType(typeof(DrawPrizeConfigResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DrawPrizeConfigResponse>> SaveDrawPrizeConfig(
        int bettingPoolId,
        int drawId,
        [FromBody] SaveDrawPrizeConfigRequest request)
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

            // Validar que el sorteo existe y obtener su nombre
            var draw = await _context.Draws
                .FirstOrDefaultAsync(d => d.DrawId == drawId);

            if (draw == null)
            {
                _logger.LogWarning("Draw {DrawId} not found", drawId);
                return NotFound(new { message = $"Sorteo con ID {drawId} no encontrado" });
            }

            if (request.PrizeConfigs == null || !request.PrizeConfigs.Any())
            {
                _logger.LogWarning("Empty prize configs received for betting pool {BettingPoolId}, draw {DrawId}",
                    bettingPoolId, drawId);
                return BadRequest(new { message = "Debe proporcionar al menos una configuración de premio" });
            }

            int savedCount = 0;
            int updatedCount = 0;
            var savedConfigs = new List<DrawPrizeConfigDto>();

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
                var existingConfig = await _context.DrawPrizeConfigs
                    .FirstOrDefaultAsync(dpc =>
                        dpc.BettingPoolId == bettingPoolId &&
                        dpc.DrawId == drawId &&
                        dpc.PrizeTypeId == configItem.PrizeTypeId);

                if (existingConfig != null)
                {
                    // Actualizar configuración existente
                    existingConfig.CustomValue = configItem.Value;
                    existingConfig.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;

                    _logger.LogInformation(
                        "Updated draw prize config {ConfigId} for betting pool {BettingPoolId}, draw {DrawId}, prize field {PrizeTypeId}",
                        existingConfig.ConfigId, bettingPoolId, drawId, configItem.PrizeTypeId);

                    savedConfigs.Add(new DrawPrizeConfigDto
                    {
                        ConfigId = existingConfig.ConfigId,
                        BettingPoolId = existingConfig.BettingPoolId,
                        DrawId = existingConfig.DrawId,
                        DrawName = draw.DrawName,
                        PrizeTypeId = existingConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = existingConfig.CustomValue,
                        Source = "draw_specific",
                        CreatedAt = existingConfig.CreatedAt,
                        UpdatedAt = existingConfig.UpdatedAt
                    });
                }
                else
                {
                    // Crear nueva configuración
                    var newConfig = new DrawPrizeConfig
                    {
                        BettingPoolId = bettingPoolId,
                        DrawId = drawId,
                        PrizeTypeId = configItem.PrizeTypeId,
                        CustomValue = configItem.Value,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.DrawPrizeConfigs.Add(newConfig);
                    savedCount++;

                    _logger.LogInformation(
                        "Created new draw prize config for betting pool {BettingPoolId}, draw {DrawId}, prize field {PrizeTypeId}",
                        bettingPoolId, drawId, configItem.PrizeTypeId);

                    // Nota: ConfigId se asignará después de SaveChanges
                    savedConfigs.Add(new DrawPrizeConfigDto
                    {
                        ConfigId = 0, // Se asignará después de guardar
                        BettingPoolId = newConfig.BettingPoolId,
                        DrawId = newConfig.DrawId,
                        DrawName = draw.DrawName,
                        PrizeTypeId = newConfig.PrizeTypeId,
                        FieldCode = configItem.FieldCode,
                        CustomValue = newConfig.CustomValue,
                        Source = "draw_specific",
                        CreatedAt = newConfig.CreatedAt,
                        UpdatedAt = newConfig.UpdatedAt
                    });
                }
            }

            // Guardar todos los cambios
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Draw prize config saved successfully for betting pool {BettingPoolId}, draw {DrawId}: {SavedCount} new, {UpdatedCount} updated",
                bettingPoolId, drawId, savedCount, updatedCount);

            var response = new DrawPrizeConfigResponse
            {
                BettingPoolId = bettingPoolId,
                DrawId = drawId,
                DrawName = draw.DrawName,
                SavedCount = savedCount,
                UpdatedCount = updatedCount,
                Message = $"Configuración guardada exitosamente: {savedCount} nuevos, {updatedCount} actualizados",
                SavedConfigs = savedConfigs
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving draw prize config for betting pool {BettingPoolId}, draw {DrawId}",
                bettingPoolId, drawId);
            return StatusCode(500, new { message = "Error interno al guardar configuración de premios del sorteo" });
        }
    }

    /// <summary>
    /// Obtener configuración de premios de un sorteo específico de una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="drawId">ID del sorteo</param>
    /// <returns>Lista de configuraciones de premios</returns>
    /// <response code="200">Configuración obtenida exitosamente</response>
    /// <response code="404">Banca o sorteo no encontrado</response>
    [HttpGet("{bettingPoolId}/draws/{drawId}/prize-config")]
    [ProducesResponseType(typeof(List<DrawPrizeConfigDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DrawPrizeConfigDto>>> GetDrawPrizeConfig(int bettingPoolId, int drawId)
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

            // Validar que el sorteo existe y obtener su nombre
            var draw = await _context.Draws
                .FirstOrDefaultAsync(d => d.DrawId == drawId);

            if (draw == null)
            {
                _logger.LogWarning("Draw {DrawId} not found", drawId);
                return NotFound(new { message = $"Sorteo con ID {drawId} no encontrado" });
            }

            // Obtener configuraciones con información del prize field
            var configs = await _context.DrawPrizeConfigs
                .Where(dpc => dpc.BettingPoolId == bettingPoolId && dpc.DrawId == drawId)
                .Include(dpc => dpc.PrizeType)
                .Select(dpc => new DrawPrizeConfigDto
                {
                    ConfigId = dpc.ConfigId,
                    BettingPoolId = dpc.BettingPoolId,
                    DrawId = dpc.DrawId,
                    DrawName = draw.DrawName,
                    PrizeTypeId = dpc.PrizeTypeId,
                    FieldCode = dpc.PrizeType!.FieldCode,
                    CustomValue = dpc.CustomValue,
                    Source = "draw_specific",
                    CreatedAt = dpc.CreatedAt,
                    UpdatedAt = dpc.UpdatedAt
                })
                .ToListAsync();

            _logger.LogInformation(
                "Retrieved {Count} draw prize configs for betting pool {BettingPoolId}, draw {DrawId}",
                configs.Count, bettingPoolId, drawId);

            return Ok(configs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving draw prize config for betting pool {BettingPoolId}, draw {DrawId}",
                bettingPoolId, drawId);
            return StatusCode(500, new { message = "Error interno al obtener configuración de premios del sorteo" });
        }
    }

    /// <summary>
    /// Obtener configuración de premios resuelta con prioridad en cascada
    /// (draw_specific > banca_default > system_default)
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="drawId">ID del sorteo</param>
    /// <returns>Lista de todos los campos de premio con sus valores resueltos y fuente</returns>
    /// <response code="200">Configuración resuelta obtenida exitosamente</response>
    /// <response code="404">Banca o sorteo no encontrado</response>
    [HttpGet("{bettingPoolId}/draws/{drawId}/prize-config/resolved")]
    [ProducesResponseType(typeof(List<DrawPrizeConfigDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DrawPrizeConfigDto>>> GetResolvedDrawPrizeConfig(int bettingPoolId, int drawId)
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

            // Validar que el sorteo existe y obtener lottery_id
            var draw = await _context.Draws
                .Include(d => d.Lottery)
                .FirstOrDefaultAsync(d => d.DrawId == drawId);

            if (draw == null)
            {
                _logger.LogWarning("Draw {DrawId} not found", drawId);
                return NotFound(new { message = $"Sorteo con ID {drawId} no encontrado" });
            }

            // Get all active prize types (filtering by lottery compatibility is done on frontend)
            var allPrizeTypes = await _context.PrizeTypes
                .Where(pf => pf.IsActive)
                .ToListAsync();

            _logger.LogInformation(
                "Found {Count} prize types for resolved config (draw {DrawId})",
                allPrizeTypes.Count, drawId);

            // Obtener configuraciones específicas del sorteo
            var drawConfigs = await _context.DrawPrizeConfigs
                .Where(dpc => dpc.BettingPoolId == bettingPoolId && dpc.DrawId == drawId)
                .ToListAsync();

            // Obtener configuraciones de la banca
            var bancaConfigs = await _context.BancaPrizeConfigs
                .Where(bpc => bpc.BettingPoolId == bettingPoolId)
                .ToListAsync();

            var resolvedConfigs = new List<DrawPrizeConfigDto>();

            // Para cada prize field, resolver el valor con prioridad en cascada
            foreach (var prizeField in allPrizeTypes)
            {
                // 1. Prioridad más alta: configuración específica del sorteo
                var drawConfig = drawConfigs.FirstOrDefault(dc => dc.PrizeTypeId == prizeField.PrizeTypeId);
                if (drawConfig != null)
                {
                    resolvedConfigs.Add(new DrawPrizeConfigDto
                    {
                        ConfigId = drawConfig.ConfigId,
                        BettingPoolId = bettingPoolId,
                        DrawId = drawId,
                        DrawName = draw.DrawName,
                        PrizeTypeId = prizeField.PrizeTypeId,
                        FieldCode = prizeField.FieldCode,
                        CustomValue = drawConfig.CustomValue,
                        Source = "draw_specific",
                        CreatedAt = drawConfig.CreatedAt,
                        UpdatedAt = drawConfig.UpdatedAt
                    });
                    continue;
                }

                // 2. Prioridad media: configuración de la banca
                var bancaConfig = bancaConfigs.FirstOrDefault(bc => bc.PrizeTypeId == prizeField.PrizeTypeId);
                if (bancaConfig != null)
                {
                    resolvedConfigs.Add(new DrawPrizeConfigDto
                    {
                        ConfigId = bancaConfig.ConfigId,
                        BettingPoolId = bettingPoolId,
                        DrawId = drawId,
                        DrawName = draw.DrawName,
                        PrizeTypeId = prizeField.PrizeTypeId,
                        FieldCode = prizeField.FieldCode,
                        CustomValue = bancaConfig.CustomValue,
                        Source = "banca_default",
                        CreatedAt = bancaConfig.CreatedAt,
                        UpdatedAt = bancaConfig.UpdatedAt
                    });
                    continue;
                }

                // 3. Prioridad más baja: valor por defecto del sistema
                resolvedConfigs.Add(new DrawPrizeConfigDto
                {
                    ConfigId = 0, // No hay config personalizada
                    BettingPoolId = bettingPoolId,
                    DrawId = drawId,
                    DrawName = draw.DrawName,
                    PrizeTypeId = prizeField.PrizeTypeId,
                    FieldCode = prizeField.FieldCode,
                    CustomValue = prizeField.DefaultMultiplier,
                    Source = "system_default",
                    CreatedAt = prizeField.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = prizeField.UpdatedAt ?? DateTime.UtcNow
                });
            }

            _logger.LogInformation(
                "Retrieved {Count} resolved draw prize configs for betting pool {BettingPoolId}, draw {DrawId}",
                resolvedConfigs.Count, bettingPoolId, drawId);

            return Ok(resolvedConfigs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving resolved draw prize config for betting pool {BettingPoolId}, draw {DrawId}",
                bettingPoolId, drawId);
            return StatusCode(500, new { message = "Error interno al obtener configuración de premios resuelta del sorteo" });
        }
    }

    /// <summary>
    /// ⚡ OPTIMIZED: Batch save prize configs for multiple draws at once
    /// Accepts all draws in a single request instead of 70+ individual requests
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="request">Batch request with draws and their prize configs</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="200">Configuraciones guardadas exitosamente</response>
    /// <response code="400">Datos inválidos</response>
    /// <response code="404">Banca no encontrada</response>
    [HttpPost("{bettingPoolId}/draws/prize-config/batch")]
    [ProducesResponseType(typeof(BatchDrawPrizeConfigResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BatchDrawPrizeConfigResponse>> BatchSaveDrawPrizeConfig(
        int bettingPoolId,
        [FromBody] BatchDrawPrizeConfigRequest request)
    {
        try
        {
            // Validate betting pool exists
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = $"Banca con ID {bettingPoolId} no encontrada" });
            }

            if (request.DrawConfigs == null || !request.DrawConfigs.Any())
            {
                return Ok(new BatchDrawPrizeConfigResponse
                {
                    Success = true,
                    TotalDrawsProcessed = 0,
                    TotalConfigsSaved = 0,
                    TotalConfigsUpdated = 0,
                    Message = "No items to process"
                });
            }

            // Get all drawIds from request
            var drawIds = request.DrawConfigs.Select(dc => dc.DrawId).Distinct().ToList();

            // Validate all draws exist in one query
            var validDrawIds = await _context.Draws
                .Where(d => drawIds.Contains(d.DrawId))
                .Select(d => d.DrawId)
                .ToListAsync();

            // Get all prizeTypeIds from request
            var prizeTypeIds = request.DrawConfigs
                .SelectMany(dc => dc.PrizeConfigs.Select(pc => pc.PrizeTypeId))
                .Distinct()
                .ToList();

            // Validate all prize types exist in one query
            var validPrizeTypeIds = await _context.PrizeTypes
                .Where(pt => prizeTypeIds.Contains(pt.PrizeTypeId))
                .Select(pt => pt.PrizeTypeId)
                .ToListAsync();

            // Load all existing configs for this betting pool and these draws in one query
            var existingConfigs = await _context.DrawPrizeConfigs
                .Where(dpc => dpc.BettingPoolId == bettingPoolId && drawIds.Contains(dpc.DrawId))
                .ToListAsync();

            // Create a dictionary for fast lookup: (drawId, prizeTypeId) -> config
            var existingConfigsDict = existingConfigs
                .ToDictionary(c => (c.DrawId, c.PrizeTypeId));

            int totalSaved = 0;
            int totalUpdated = 0;
            int drawsProcessed = 0;

            // Process each draw's configs
            foreach (var drawConfig in request.DrawConfigs)
            {
                if (!validDrawIds.Contains(drawConfig.DrawId))
                {
                    _logger.LogWarning("Draw {DrawId} not found, skipping", drawConfig.DrawId);
                    continue;
                }

                foreach (var prizeConfig in drawConfig.PrizeConfigs)
                {
                    if (!validPrizeTypeIds.Contains(prizeConfig.PrizeTypeId))
                    {
                        continue;
                    }

                    var key = (drawConfig.DrawId, prizeConfig.PrizeTypeId);
                    if (existingConfigsDict.TryGetValue(key, out var existing))
                    {
                        // Update existing
                        existing.CustomValue = prizeConfig.Value;
                        existing.UpdatedAt = DateTime.UtcNow;
                        totalUpdated++;
                    }
                    else
                    {
                        // Create new
                        var newConfig = new DrawPrizeConfig
                        {
                            BettingPoolId = bettingPoolId,
                            DrawId = drawConfig.DrawId,
                            PrizeTypeId = prizeConfig.PrizeTypeId,
                            CustomValue = prizeConfig.Value,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.DrawPrizeConfigs.Add(newConfig);
                        existingConfigsDict[key] = newConfig;
                        totalSaved++;
                    }
                }
                drawsProcessed++;
            }

            // Save all changes in one transaction
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "⚡ BATCH draw prize config saved for betting pool {BettingPoolId}: {DrawsProcessed} draws, {Saved} new, {Updated} updated",
                bettingPoolId, drawsProcessed, totalSaved, totalUpdated);

            return Ok(new BatchDrawPrizeConfigResponse
            {
                Success = true,
                TotalDrawsProcessed = drawsProcessed,
                TotalConfigsSaved = totalSaved,
                TotalConfigsUpdated = totalUpdated,
                Message = $"Processed {drawsProcessed} draws: {totalSaved} new, {totalUpdated} updated"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in batch save draw prize config for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al guardar configuraciones en lote: {ex.Message}" });
        }
    }

    /// <summary>
    /// Eliminar configuración de premios de un sorteo específico de una banca
    /// </summary>
    /// <param name="bettingPoolId">ID de la banca</param>
    /// <param name="drawId">ID del sorteo</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="200">Configuración eliminada exitosamente</response>
    /// <response code="404">Banca o sorteo no encontrado</response>
    [HttpDelete("{bettingPoolId}/draws/{drawId}/prize-config")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDrawPrizeConfig(int bettingPoolId, int drawId)
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

            // Validar que el sorteo existe
            var drawExists = await _context.Draws
                .AnyAsync(d => d.DrawId == drawId);

            if (!drawExists)
            {
                _logger.LogWarning("Draw {DrawId} not found", drawId);
                return NotFound(new { message = $"Sorteo con ID {drawId} no encontrado" });
            }

            // Eliminar todas las configuraciones de este sorteo en esta banca
            var configs = await _context.DrawPrizeConfigs
                .Where(dpc => dpc.BettingPoolId == bettingPoolId && dpc.DrawId == drawId)
                .ToListAsync();

            if (!configs.Any())
            {
                return Ok(new { message = "No hay configuraciones de premios para eliminar" });
            }

            _context.DrawPrizeConfigs.RemoveRange(configs);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Deleted {Count} draw prize configs for betting pool {BettingPoolId}, draw {DrawId}",
                configs.Count, bettingPoolId, drawId);

            return Ok(new { message = $"Se eliminaron {configs.Count} configuraciones de premios del sorteo" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting draw prize config for betting pool {BettingPoolId}, draw {DrawId}",
                bettingPoolId, drawId);
            return StatusCode(500, new { message = "Error interno al eliminar configuración de premios del sorteo" });
        }
    }
}
