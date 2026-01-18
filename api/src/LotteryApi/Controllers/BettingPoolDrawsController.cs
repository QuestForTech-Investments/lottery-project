using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.DTOs;
using System.Diagnostics;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/betting-pools/{bettingPoolId}/draws")]
public class BettingPoolDrawsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BettingPoolDrawsController> _logger;

    public BettingPoolDrawsController(
        LotteryDbContext context,
        ILogger<BettingPoolDrawsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all draws configured for a betting pool
    /// Returns draw names, lottery names, and available game types
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<BettingPoolDrawDto>>> GetDraws(int bettingPoolId, [FromQuery] bool playableOnly = false)
    {
        try
        {
            // Verify betting pool exists
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Load all betting pool draws with related data
            var bettingPoolDraws = await _context.BettingPoolDraws
                .AsNoTracking()
                .Where(bpd => bpd.BettingPoolId == bettingPoolId)
                .Include(bpd => bpd.Draw)
                    .ThenInclude(d => d!.Lottery)
                        .ThenInclude(l => l!.Country)
                .Include(bpd => bpd.Draw)
                    .ThenInclude(d => d!.WeeklySchedules)
                .AsSplitQuery()
                .OrderBy(bpd => bpd.Draw!.DrawName)
                .ToListAsync();

            if (!bettingPoolDraws.Any())
            {
                return Ok(new List<BettingPoolDrawDto>());
            }

            if (playableOnly)
                bettingPoolDraws = bettingPoolDraws.FindAll(bpd => bpd.Draw!.WeeklySchedules.Where(ws =>
                    {
                        var TimeStamp = DateTime.Now.TimeOfDay;

                        return ws.DayOfWeek == (byte)DateTime.Now.DayOfWeek && ws.StartTime <= TimeStamp && ws.EndTime >= TimeStamp;
                    }).Any()
                );

            // Get all draw IDs
            var drawIds = bettingPoolDraws.Select(bpd => bpd.DrawId).ToHashSet();

            // Load available game types for these draws (from draw_game_compatibility)
            var drawGameTypes = await _context.DrawGameCompatibilities
                .AsNoTracking()
                .Where(dgc => drawIds.Contains(dgc.DrawId) && dgc.IsActive)
                .Include(dgc => dgc.GameType)
                .Where(dgc => dgc.GameType != null && dgc.GameType.IsActive)
                .OrderBy(dgc => dgc.DrawId)
                .ThenBy(dgc => dgc.GameType!.DisplayOrder ?? int.MaxValue)
                .ThenBy(dgc => dgc.GameType!.GameName)
                .Select(dgc => new
                {
                    dgc.DrawId,
                    GameType = new GameTypeDto
                    {
                        GameTypeId = dgc.GameType!.GameTypeId,
                        GameTypeCode = dgc.GameType.GameTypeCode,
                        GameName = dgc.GameType.GameName,
                        PrizeMultiplier = dgc.GameType.PrizeMultiplier,
                        NumberLength = dgc.GameType.NumberLength,
                        RequiresAdditionalNumber = dgc.GameType.RequiresAdditionalNumber,
                        DisplayOrder = dgc.GameType.DisplayOrder
                    }
                })
                .ToListAsync();

            var gameTypesByDraw = drawGameTypes
                .GroupBy(x => x.DrawId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.GameType).ToList()
                );

            // Load enabled game types for this betting pool
            var enabledGameTypes = await _context.BettingPoolDrawGameTypes
                .AsNoTracking()
                .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                               drawIds.Contains(bpdgt.DrawId) &&
                               bpdgt.IsActive)
                .Include(bpdgt => bpdgt.GameType)
                .Select(bpdgt => new
                {
                    bpdgt.DrawId,
                    GameType = new GameTypeDto
                    {
                        GameTypeId = bpdgt.GameType!.GameTypeId,
                        GameTypeCode = bpdgt.GameType.GameTypeCode,
                        GameName = bpdgt.GameType.GameName,
                        PrizeMultiplier = bpdgt.GameType.PrizeMultiplier,
                        NumberLength = bpdgt.GameType.NumberLength,
                        RequiresAdditionalNumber = bpdgt.GameType.RequiresAdditionalNumber,
                        DisplayOrder = bpdgt.GameType.DisplayOrder
                    }
                })
                .ToListAsync();

            var enabledGameTypesByDraw = enabledGameTypes
                .GroupBy(x => x.DrawId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.GameType).ToList()
                );

            // Build DTOs
            var result = bettingPoolDraws.Select(bpd => new BettingPoolDrawDto
            {
                BettingPoolDrawId = bpd.BettingPoolDrawId,
                BettingPoolId = bpd.BettingPoolId,
                DrawId = bpd.DrawId,
                DrawName = bpd.Draw?.DrawName,
                DrawTime = bpd.Draw!.WeeklySchedules!.Where(ws =>
                {
                    var TimeStamp = DateTime.Now.TimeOfDay;

                    return ws.DayOfWeek == (byte)DateTime.Now.DayOfWeek && ws.StartTime <= TimeStamp && ws.EndTime >= TimeStamp;
                })!.First()!.EndTime,
                LotteryId = bpd.Draw?.LotteryId,
                LotteryName = bpd.Draw?.Lottery?.LotteryName,
                CountryName = bpd.Draw?.Lottery?.Country?.CountryName,
                IsActive = bpd.IsActive,
                AnticipatedClosingMinutes = bpd.AnticipatedClosingMinutes,
                AvailableGameTypes = gameTypesByDraw.TryGetValue(bpd.DrawId, out var available)
                    ? available
                    : new List<GameTypeDto>(),
                EnabledGameTypes = enabledGameTypesByDraw.TryGetValue(bpd.DrawId, out var enabled)
                    ? enabled
                    : new List<GameTypeDto>(),
                LotteryImage = bpd.Draw!.Lottery!.ImageUrl,
                IsDominican = bpd.Draw!.Lottery!.Country!.CountryName == "República Dominicana" || bpd.Draw?.Lottery!.Country!.CountryName == "Dominican Republic",
                Color = bpd.Draw!.Lottery!.Colour
            }).ToList();

            _logger.LogInformation("Retrieved {Count} draws for betting pool {BettingPoolId}",
                result.Count, bettingPoolId);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting draws for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al obtener sorteos: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get a specific draw configuration for a betting pool
    /// </summary>
    [HttpGet("{bettingPoolDrawId}")]
    public async Task<ActionResult<BettingPoolDrawDto>> GetDraw(
        int bettingPoolId,
        int bettingPoolDrawId)
    {
        try
        {
            var bettingPoolDraw = await _context.BettingPoolDraws
                .AsNoTracking()
                .Where(bpd => bpd.BettingPoolId == bettingPoolId &&
                             bpd.BettingPoolDrawId == bettingPoolDrawId)
                .Include(bpd => bpd.Draw)
                    .ThenInclude(d => d!.Lottery)
                        .ThenInclude(l => l!.Country)
                .FirstOrDefaultAsync();

            if (bettingPoolDraw == null)
            {
                return NotFound(new { message = "Configuración de sorteo no encontrada" });
            }

            // Load available game types
            var availableGameTypes = await _context.DrawGameCompatibilities
                .AsNoTracking()
                .Where(dgc => dgc.DrawId == bettingPoolDraw.DrawId && dgc.IsActive)
                .Include(dgc => dgc.GameType)
                .Where(dgc => dgc.GameType != null && dgc.GameType.IsActive)
                .OrderBy(dgc => dgc.GameType!.DisplayOrder ?? int.MaxValue)
                .Select(dgc => new GameTypeDto
                {
                    GameTypeId = dgc.GameType!.GameTypeId,
                    GameTypeCode = dgc.GameType.GameTypeCode,
                    GameName = dgc.GameType.GameName,
                    PrizeMultiplier = dgc.GameType.PrizeMultiplier,
                    NumberLength = dgc.GameType.NumberLength,
                    RequiresAdditionalNumber = dgc.GameType.RequiresAdditionalNumber,
                    DisplayOrder = dgc.GameType.DisplayOrder
                })
                .ToListAsync();

            // Load enabled game types
            var enabledGameTypes = await _context.BettingPoolDrawGameTypes
                .AsNoTracking()
                .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                               bpdgt.DrawId == bettingPoolDraw.DrawId &&
                               bpdgt.IsActive)
                .Include(bpdgt => bpdgt.GameType)
                .OrderBy(bpdgt => bpdgt.GameType!.DisplayOrder ?? int.MaxValue)
                .Select(bpdgt => new GameTypeDto
                {
                    GameTypeId = bpdgt.GameType!.GameTypeId,
                    GameTypeCode = bpdgt.GameType.GameTypeCode,
                    GameName = bpdgt.GameType.GameName,
                    PrizeMultiplier = bpdgt.GameType.PrizeMultiplier,
                    NumberLength = bpdgt.GameType.NumberLength,
                    RequiresAdditionalNumber = bpdgt.GameType.RequiresAdditionalNumber,
                    DisplayOrder = bpdgt.GameType.DisplayOrder
                })
                .ToListAsync();

            var dto = new BettingPoolDrawDto
            {
                BettingPoolDrawId = bettingPoolDraw.BettingPoolDrawId,
                BettingPoolId = bettingPoolDraw.BettingPoolId,
                DrawId = bettingPoolDraw.DrawId,
                DrawName = bettingPoolDraw.Draw?.DrawName,
                DrawTime = bettingPoolDraw.Draw?.DrawTime,
                LotteryId = bettingPoolDraw.Draw?.LotteryId,
                LotteryName = bettingPoolDraw.Draw?.Lottery?.LotteryName,
                CountryName = bettingPoolDraw.Draw?.Lottery?.Country?.CountryName,
                IsActive = bettingPoolDraw.IsActive,
                AnticipatedClosingMinutes = bettingPoolDraw.AnticipatedClosingMinutes,
                AvailableGameTypes = availableGameTypes,
                EnabledGameTypes = enabledGameTypes
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting draw {DrawId} for betting pool {BettingPoolId}",
                bettingPoolDrawId, bettingPoolId);
            return StatusCode(500, new { message = $"Error al obtener sorteo: {ex.Message}" });
        }
    }

    /// <summary>
    /// Bulk create/update draws for a betting pool
    /// This endpoint handles multiple draws at once (for frontend compatibility)
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult<List<BettingPoolDrawDto>>> CreateOrUpdateDrawsBulk(
        int bettingPoolId,
        [FromBody] List<CreateBettingPoolDrawDto> dtos)
    {
        try
        {
            // Verify betting pool exists
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            var results = new List<BettingPoolDrawDto>();

            foreach (var dto in dtos)
            {
                // Handle legacy LotteryId from V1 frontend
                // If LotteryId is provided, get all draws for that lottery
                List<int> drawIds;

                if (dto.DrawId > 0)
                {
                    // Modern approach: use DrawId directly
                    drawIds = new List<int> { dto.DrawId };
                }
                else if (dto.LotteryId.HasValue && dto.LotteryId.Value > 0)
                {
                    // Legacy V1 approach: map LotteryId to all draws
                    drawIds = await _context.Draws
                        .Where(d => d.LotteryId == dto.LotteryId.Value && d.IsActive)
                        .Select(d => d.DrawId)
                        .ToListAsync();

                    if (!drawIds.Any())
                    {
                        _logger.LogWarning("No active draws found for lottery {LotteryId}, skipping", dto.LotteryId);
                        continue;
                    }
                }
                else
                {
                    _logger.LogWarning("Neither DrawId nor LotteryId provided, skipping");
                    continue;
                }

                // Process each draw
                foreach (var drawId in drawIds)
                {
                    // Verify draw exists
                    var drawExists = await _context.Draws
                        .AnyAsync(d => d.DrawId == drawId);

                    if (!drawExists)
                    {
                        _logger.LogWarning("Draw {DrawId} not found, skipping", drawId);
                        continue;
                    }

                    // Check if already exists
                    var existing = await _context.BettingPoolDraws
                        .FirstOrDefaultAsync(bpd => bpd.BettingPoolId == bettingPoolId &&
                                                    bpd.DrawId == drawId);

                    if (existing != null)
                    {
                        // Update existing
                        existing.IsActive = dto.IsActive;
                        existing.AnticipatedClosingMinutes = dto.AnticipatedClosingMinutes;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // Create new
                        var bettingPoolDraw = new BettingPoolDraw
                        {
                            BettingPoolId = bettingPoolId,
                            DrawId = drawId,
                            IsActive = dto.IsActive,
                            AnticipatedClosingMinutes = dto.AnticipatedClosingMinutes,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.BettingPoolDraws.Add(bettingPoolDraw);
                    }

                    await _context.SaveChangesAsync();

                    // Handle game types
                    if (dto.EnabledGameTypeIds != null)
                    {
                        // Remove existing game types
                        var existingGameTypes = await _context.BettingPoolDrawGameTypes
                            .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                                           bpdgt.DrawId == drawId)
                            .ToListAsync();

                        _context.BettingPoolDrawGameTypes.RemoveRange(existingGameTypes);

                        // Add new game types
                        if (dto.EnabledGameTypeIds.Any())
                        {
                            var gameTypes = dto.EnabledGameTypeIds.Select(gtId => new BettingPoolDrawGameType
                            {
                                BettingPoolId = bettingPoolId,
                                DrawId = drawId,
                                GameTypeId = gtId,
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow
                            });

                            _context.BettingPoolDrawGameTypes.AddRange(gameTypes);
                            await _context.SaveChangesAsync();
                        }
                    }
                } // End foreach drawId
            } // End foreach dto

            // Return all draws for this betting pool
            var allDraws = await GetDraws(bettingPoolId);
            return allDraws.Value ?? new List<BettingPoolDrawDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk creating/updating draws for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al guardar sorteos: {ex.Message}" });
        }
    }

    /// <summary>
    /// Add a draw to a betting pool
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BettingPoolDrawDto>> CreateDraw(
        int bettingPoolId,
        [FromBody] CreateBettingPoolDrawDto dto)
    {
        try
        {
            // Verify betting pool exists
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Verify draw exists
            var drawExists = await _context.Draws
                .AnyAsync(d => d.DrawId == dto.DrawId);

            if (!drawExists)
            {
                return BadRequest(new { message = "Sorteo no encontrado" });
            }

            // Check if already exists
            var exists = await _context.BettingPoolDraws
                .AnyAsync(bpd => bpd.BettingPoolId == bettingPoolId &&
                                bpd.DrawId == dto.DrawId);

            if (exists)
            {
                return BadRequest(new { message = "Este sorteo ya está configurado para esta banca" });
            }

            // Create betting pool draw
            var bettingPoolDraw = new BettingPoolDraw
            {
                BettingPoolId = bettingPoolId,
                DrawId = dto.DrawId,
                IsActive = dto.IsActive,
                AnticipatedClosingMinutes = dto.AnticipatedClosingMinutes,
                CreatedAt = DateTime.UtcNow
            };

            _context.BettingPoolDraws.Add(bettingPoolDraw);
            await _context.SaveChangesAsync();

            // Add enabled game types if provided
            if (dto.EnabledGameTypeIds != null && dto.EnabledGameTypeIds.Any())
            {
                var gameTypes = dto.EnabledGameTypeIds.Select(gtId => new BettingPoolDrawGameType
                {
                    BettingPoolId = bettingPoolId,
                    DrawId = dto.DrawId,
                    GameTypeId = gtId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                _context.BettingPoolDrawGameTypes.AddRange(gameTypes);
                await _context.SaveChangesAsync();
            }

            // Return the created draw
            return CreatedAtAction(
                nameof(GetDraw),
                new { bettingPoolId, bettingPoolDrawId = bettingPoolDraw.BettingPoolDrawId },
                await GetDrawDto(bettingPoolDraw.BettingPoolDrawId, bettingPoolId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating draw for betting pool {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al crear sorteo: {ex.Message}" });
        }
    }

    /// <summary>
    /// Update a draw configuration for a betting pool
    /// </summary>
    [HttpPut("{bettingPoolDrawId}")]
    public async Task<ActionResult<BettingPoolDrawDto>> UpdateDraw(
        int bettingPoolId,
        int bettingPoolDrawId,
        [FromBody] UpdateBettingPoolDrawDto dto)
    {
        try
        {
            var bettingPoolDraw = await _context.BettingPoolDraws
                .FirstOrDefaultAsync(bpd => bpd.BettingPoolId == bettingPoolId &&
                                           bpd.BettingPoolDrawId == bettingPoolDrawId);

            if (bettingPoolDraw == null)
            {
                return NotFound(new { message = "Configuración de sorteo no encontrada" });
            }

            // Update fields
            if (dto.IsActive.HasValue)
                bettingPoolDraw.IsActive = dto.IsActive.Value;

            if (dto.AnticipatedClosingMinutes.HasValue)
                bettingPoolDraw.AnticipatedClosingMinutes = dto.AnticipatedClosingMinutes.Value;

            bettingPoolDraw.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Update enabled game types if provided
            if (dto.EnabledGameTypeIds != null)
            {
                // Remove existing
                var existing = await _context.BettingPoolDrawGameTypes
                    .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                                   bpdgt.DrawId == bettingPoolDraw.DrawId)
                    .ToListAsync();

                _context.BettingPoolDrawGameTypes.RemoveRange(existing);

                // Add new ones
                if (dto.EnabledGameTypeIds.Any())
                {
                    var gameTypes = dto.EnabledGameTypeIds.Select(gtId => new BettingPoolDrawGameType
                    {
                        BettingPoolId = bettingPoolId,
                        DrawId = bettingPoolDraw.DrawId,
                        GameTypeId = gtId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });

                    _context.BettingPoolDrawGameTypes.AddRange(gameTypes);
                }

                await _context.SaveChangesAsync();
            }

            return Ok(await GetDrawDto(bettingPoolDrawId, bettingPoolId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating draw {DrawId} for betting pool {BettingPoolId}",
                bettingPoolDrawId, bettingPoolId);
            return StatusCode(500, new { message = $"Error al actualizar sorteo: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete a draw configuration from a betting pool
    /// </summary>
    [HttpDelete("{bettingPoolDrawId}")]
    public async Task<IActionResult> DeleteDraw(
        int bettingPoolId,
        int bettingPoolDrawId)
    {
        try
        {
            var bettingPoolDraw = await _context.BettingPoolDraws
                .FirstOrDefaultAsync(bpd => bpd.BettingPoolId == bettingPoolId &&
                                           bpd.BettingPoolDrawId == bettingPoolDrawId);

            if (bettingPoolDraw == null)
            {
                return NotFound(new { message = "Configuración de sorteo no encontrada" });
            }

            // Remove enabled game types first
            var gameTypes = await _context.BettingPoolDrawGameTypes
                .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                               bpdgt.DrawId == bettingPoolDraw.DrawId)
                .ToListAsync();

            _context.BettingPoolDrawGameTypes.RemoveRange(gameTypes);

            // Remove betting pool draw
            _context.BettingPoolDraws.Remove(bettingPoolDraw);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Sorteo eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting draw {DrawId} from betting pool {BettingPoolId}",
                bettingPoolDrawId, bettingPoolId);
            return StatusCode(500, new { message = $"Error al eliminar sorteo: {ex.Message}" });
        }
    }

    // ============================================================================
    // LEGACY ENDPOINTS - For backward compatibility with old frontend
    // DEPRECATED: These endpoints proxy to the new draws architecture
    // ============================================================================

    /// <summary>
    /// [DEPRECATED] Get all sortitions (legacy endpoint - use /draws instead)
    /// This endpoint is maintained for backward compatibility with existing frontends
    /// </summary>
    [HttpGet("~/api/betting-pools/{bettingPoolId}/sortitions")]
    [ApiExplorerSettings(GroupName = "legacy")]
    public async Task<ActionResult<List<BettingPoolSortitionDto>>> GetSortitionsLegacy(int bettingPoolId)
    {
        try
        {
            var bettingPoolExists = await _context.BettingPools
                .AnyAsync(bp => bp.BettingPoolId == bettingPoolId);

            if (!bettingPoolExists)
            {
                return NotFound(new { message = "Banca no encontrada" });
            }

            // Query betting_pool_draws instead of betting_pool_sortitions
            var draws = await _context.BettingPoolDraws
                .AsNoTracking()
                .Where(bpd => bpd.BettingPoolId == bettingPoolId)
                .Include(bpd => bpd.Draw)
                    .ThenInclude(d => d!.Lottery)
                .ToListAsync();

            if (!draws.Any())
            {
                return Ok(new List<BettingPoolSortitionDto>());
            }

            var drawIds = draws.Select(d => d.DrawId).ToList();

            // Load game types from draw_game_compatibility
            var gameTypesByDraw = await _context.DrawGameCompatibilities
                .Where(dgc => drawIds.Contains(dgc.DrawId) && dgc.IsActive)
                .Include(dgc => dgc.GameType)
                .Where(dgc => dgc.GameType != null && dgc.GameType.IsActive)
                .OrderBy(dgc => dgc.DrawId)
                .ThenBy(dgc => dgc.GameType!.DisplayOrder ?? int.MaxValue)
                .ThenBy(dgc => dgc.GameType!.GameName)
                .Select(dgc => new
                {
                    dgc.DrawId,
                    GameType = new GameTypeDto
                    {
                        GameTypeId = dgc.GameType!.GameTypeId,
                        GameTypeCode = dgc.GameType.GameTypeCode,
                        GameName = dgc.GameType.GameName,
                        PrizeMultiplier = dgc.GameType.PrizeMultiplier,
                        NumberLength = dgc.GameType.NumberLength,
                        RequiresAdditionalNumber = dgc.GameType.RequiresAdditionalNumber,
                        DisplayOrder = dgc.GameType.DisplayOrder
                    }
                })
                .ToListAsync();

            var gameTypesDict = gameTypesByDraw
                .GroupBy(x => x.DrawId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.GameType).ToList()
                );

            // Load enabled game types from betting_pool_draw_game_types
            var enabledGameTypes = await _context.BettingPoolDrawGameTypes
                .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                               drawIds.Contains(bpdgt.DrawId) &&
                               bpdgt.IsActive)
                .ToListAsync();

            var enabledGameTypesDict = enabledGameTypes
                .GroupBy(x => x.DrawId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.GameTypeId).ToList()
                );

            // Build DTOs in old sortition format for backward compatibility
            var result = new List<BettingPoolSortitionDto>();

            foreach (var draw in draws)
            {
                if (draw.Draw?.Lottery == null) continue;

                var dto = new BettingPoolSortitionDto
                {
                    SortitionId = draw.BettingPoolDrawId, // Map draw ID to sortition ID
                    BettingPoolId = draw.BettingPoolId,
                    SortitionType = draw.Draw.Lottery.LotteryName ?? string.Empty,
                    IsEnabled = draw.IsActive,
                    LotteryId = draw.Draw.LotteryId,
                    LotteryName = draw.Draw.Lottery.LotteryName,
                    AnticipatedClosing = draw.AnticipatedClosingMinutes,
                    EnabledGameTypeIds = enabledGameTypesDict.TryGetValue(draw.DrawId, out var enabled)
                        ? enabled
                        : new List<int>(),
                    AvailableGameTypes = gameTypesDict.TryGetValue(draw.DrawId, out var available)
                        ? available
                        : new List<GameTypeDto>(),
                    SpecificConfig = null // No longer using JSON config
                };

                result.Add(dto);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener sorteos para la banca {BettingPoolId}", bettingPoolId);
            return StatusCode(500, new { message = $"Error al obtener sorteos: {ex.Message}" });
        }
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    /// <summary>
    /// Helper method to build a complete DTO
    /// </summary>
    private async Task<BettingPoolDrawDto> GetDrawDto(int bettingPoolDrawId, int bettingPoolId)
    {
        var bettingPoolDraw = await _context.BettingPoolDraws
            .AsNoTracking()
            .Where(bpd => bpd.BettingPoolDrawId == bettingPoolDrawId)
            .Include(bpd => bpd.Draw)
                .ThenInclude(d => d!.Lottery)
                    .ThenInclude(l => l!.Country)
            .FirstOrDefaultAsync();

        if (bettingPoolDraw == null)
            return new BettingPoolDrawDto();

        var availableGameTypes = await _context.DrawGameCompatibilities
            .AsNoTracking()
            .Where(dgc => dgc.DrawId == bettingPoolDraw.DrawId && dgc.IsActive)
            .Include(dgc => dgc.GameType)
            .Where(dgc => dgc.GameType != null && dgc.GameType.IsActive)
            .OrderBy(dgc => dgc.GameType!.DisplayOrder ?? int.MaxValue)
            .Select(dgc => new GameTypeDto
            {
                GameTypeId = dgc.GameType!.GameTypeId,
                GameTypeCode = dgc.GameType.GameTypeCode,
                GameName = dgc.GameType.GameName,
                PrizeMultiplier = dgc.GameType.PrizeMultiplier,
                NumberLength = dgc.GameType.NumberLength,
                RequiresAdditionalNumber = dgc.GameType.RequiresAdditionalNumber,
                DisplayOrder = dgc.GameType.DisplayOrder
            })
            .ToListAsync();

        var enabledGameTypes = await _context.BettingPoolDrawGameTypes
            .AsNoTracking()
            .Where(bpdgt => bpdgt.BettingPoolId == bettingPoolId &&
                           bpdgt.DrawId == bettingPoolDraw.DrawId &&
                           bpdgt.IsActive)
            .Include(bpdgt => bpdgt.GameType)
            .OrderBy(bpdgt => bpdgt.GameType!.DisplayOrder ?? int.MaxValue)
            .Select(bpdgt => new GameTypeDto
            {
                GameTypeId = bpdgt.GameType!.GameTypeId,
                GameTypeCode = bpdgt.GameType.GameTypeCode,
                GameName = bpdgt.GameType.GameName,
                PrizeMultiplier = bpdgt.GameType.PrizeMultiplier,
                NumberLength = bpdgt.GameType.NumberLength,
                RequiresAdditionalNumber = bpdgt.GameType.RequiresAdditionalNumber,
                DisplayOrder = bpdgt.GameType.DisplayOrder
            })
            .ToListAsync();

        return new BettingPoolDrawDto
        {
            BettingPoolDrawId = bettingPoolDraw.BettingPoolDrawId,
            BettingPoolId = bettingPoolDraw.BettingPoolId,
            DrawId = bettingPoolDraw.DrawId,
            DrawName = bettingPoolDraw.Draw?.DrawName,
            DrawTime = bettingPoolDraw.Draw?.DrawTime,
            LotteryId = bettingPoolDraw.Draw?.LotteryId,
            LotteryName = bettingPoolDraw.Draw?.Lottery?.LotteryName,
            CountryName = bettingPoolDraw.Draw?.Lottery?.Country?.CountryName,
            IsActive = bettingPoolDraw.IsActive,
            AnticipatedClosingMinutes = bettingPoolDraw.AnticipatedClosingMinutes,
            AvailableGameTypes = availableGameTypes,
            EnabledGameTypes = enabledGameTypes
        };
    }
}
