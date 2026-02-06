using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.Models.Enums;
using LotteryApi.DTOs;
using LotteryApi.DTOs.Limits;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LimitsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<LimitsController> _logger;

    // Days of week mapping (bitmask values)
    private static readonly Dictionary<int, string> DayOfWeekNames = new()
    {
        { 1, "Lunes" },
        { 2, "Martes" },
        { 4, "Miércoles" },
        { 8, "Jueves" },
        { 16, "Viernes" },
        { 32, "Sábado" },
        { 64, "Domingo" }
    };

    // Limit type names in Spanish
    private static readonly Dictionary<LimitType, string> LimitTypeNames = new()
    {
        { LimitType.GeneralForGroup, "General para Grupo" },
        { LimitType.ByNumberForGroup, "Por Número para Grupo" },
        { LimitType.GeneralForBettingPool, "General para Banca" },
        { LimitType.ByNumberForBettingPool, "Por Número para Banca (Línea)" },
        { LimitType.LocalForBettingPool, "Local para Banca" },
        { LimitType.GeneralForZone, "General para Zona" },
        { LimitType.ByNumberForZone, "Por Número para Zona" },
        { LimitType.GeneralForExternalGroup, "General para Grupo Externo" },
        { LimitType.ByNumberForExternalGroup, "Por Número para Grupo Externo" },
        { LimitType.Absolute, "Absoluto" }
    };

    public LimitsController(LotteryDbContext context, ILogger<LimitsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all limit rules with optional filtering and pagination
    /// </summary>
    /// <param name="filter">Filter criteria</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 200)</param>
    /// <returns>Paginated list of limit rules</returns>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<LimitRuleDto>>> GetLimits(
        [FromQuery] LimitFilterDto filter,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            // Validate pagination
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);

            var query = _context.LimitRules.AsQueryable();

            // Apply filters
            if (filter.LimitTypes != null && filter.LimitTypes.Count > 0)
            {
                var limitTypes = filter.LimitTypes.Select(lt => (LimitType)lt).ToList();
                query = query.Where(lr => limitTypes.Contains(lr.LimitType));
            }

            if (filter.LotteryIds != null && filter.LotteryIds.Count > 0)
            {
                query = query.Where(lr => lr.LotteryId.HasValue && filter.LotteryIds.Contains(lr.LotteryId.Value));
            }

            if (filter.DrawIds != null && filter.DrawIds.Count > 0)
            {
                query = query.Where(lr => lr.DrawId.HasValue && filter.DrawIds.Contains(lr.DrawId.Value));
            }

            if (filter.GameTypeIds != null && filter.GameTypeIds.Count > 0)
            {
                query = query.Where(lr => lr.GameTypeId.HasValue && filter.GameTypeIds.Contains(lr.GameTypeId.Value));
            }

            if (filter.DaysOfWeek != null && filter.DaysOfWeek.Count > 0)
            {
                // Match any rule that includes any of the specified days
                query = query.Where(lr => lr.DaysOfWeek == null || filter.DaysOfWeek.Any(d => (lr.DaysOfWeek & d) != 0));
            }

            if (filter.BettingPoolId.HasValue)
            {
                query = query.Where(lr => lr.BettingPoolId == filter.BettingPoolId.Value);
            }

            if (filter.ZoneId.HasValue)
            {
                query = query.Where(lr => lr.ZoneId == filter.ZoneId.Value);
            }

            if (filter.GroupId.HasValue)
            {
                query = query.Where(lr => lr.GroupId == filter.GroupId.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(lr => lr.IsActive == filter.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var searchLower = filter.Search.ToLower();
                query = query.Where(lr =>
                    (lr.RuleName != null && lr.RuleName.ToLower().Contains(searchLower)) ||
                    (lr.BetNumberPattern != null && lr.BetNumberPattern.Contains(searchLower)));
            }

            if (filter.EffectiveDate.HasValue)
            {
                var date = filter.EffectiveDate.Value;
                query = query.Where(lr =>
                    (lr.EffectiveFrom == null || lr.EffectiveFrom <= date) &&
                    (lr.EffectiveTo == null || lr.EffectiveTo >= date));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination with projections
            var limits = await query
                .OrderByDescending(lr => lr.CreatedAt)
                .ThenBy(lr => lr.LimitRuleId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LimitRuleDto
                {
                    LimitRuleId = lr.LimitRuleId,
                    RuleName = lr.RuleName,
                    LimitType = (int)lr.LimitType,
                    LimitTypeName = GetLimitTypeName(lr.LimitType),
                    LotteryId = lr.LotteryId,
                    LotteryName = lr.Lottery != null ? lr.Lottery.LotteryName : null,
                    DrawId = lr.DrawId,
                    DrawName = lr.Draw != null ? lr.Draw.DrawName : null,
                    GameTypeId = lr.GameTypeId,
                    GameTypeName = lr.GameType != null ? lr.GameType.GameName : null,
                    ZoneId = lr.ZoneId,
                    ZoneName = lr.Zone != null ? lr.Zone.ZoneName : null,
                    GroupId = lr.GroupId,
                    BettingPoolId = lr.BettingPoolId,
                    BettingPoolName = lr.BettingPool != null ? lr.BettingPool.BettingPoolName : null,
                    BetNumberPattern = lr.BetNumberPattern,
                    MaxBetPerNumber = lr.MaxBetPerNumber,
                    MaxBetPerTicket = lr.MaxBetPerTicket,
                    MaxBetPerBettingPool = lr.MaxBetPerBettingPool,
                    MaxBetGlobal = lr.MaxBetGlobal,
                    IsActive = lr.IsActive,
                    Priority = lr.Priority,
                    DaysOfWeek = lr.DaysOfWeek,
                    DaysOfWeekNames = GetDaysOfWeekNames(lr.DaysOfWeek),
                    EffectiveFrom = lr.EffectiveFrom,
                    EffectiveTo = lr.EffectiveTo,
                    CreatedAt = lr.CreatedAt,
                    UpdatedAt = lr.UpdatedAt
                })
                .ToListAsync();

            var response = new PagedResponse<LimitRuleDto>
            {
                Items = limits,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting limit rules");
            return StatusCode(500, new { message = "Error al obtener los límites" });
        }
    }

    /// <summary>
    /// Get a single limit rule by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<LimitRuleDto>> GetLimit(int id)
    {
        try
        {
            var limitRule = await _context.LimitRules
                .Where(lr => lr.LimitRuleId == id)
                .Select(lr => new LimitRuleDto
                {
                    LimitRuleId = lr.LimitRuleId,
                    RuleName = lr.RuleName,
                    LimitType = (int)lr.LimitType,
                    LimitTypeName = GetLimitTypeName(lr.LimitType),
                    LotteryId = lr.LotteryId,
                    LotteryName = lr.Lottery != null ? lr.Lottery.LotteryName : null,
                    DrawId = lr.DrawId,
                    DrawName = lr.Draw != null ? lr.Draw.DrawName : null,
                    GameTypeId = lr.GameTypeId,
                    GameTypeName = lr.GameType != null ? lr.GameType.GameName : null,
                    ZoneId = lr.ZoneId,
                    ZoneName = lr.Zone != null ? lr.Zone.ZoneName : null,
                    GroupId = lr.GroupId,
                    BettingPoolId = lr.BettingPoolId,
                    BettingPoolName = lr.BettingPool != null ? lr.BettingPool.BettingPoolName : null,
                    BetNumberPattern = lr.BetNumberPattern,
                    MaxBetPerNumber = lr.MaxBetPerNumber,
                    MaxBetPerTicket = lr.MaxBetPerTicket,
                    MaxBetPerBettingPool = lr.MaxBetPerBettingPool,
                    MaxBetGlobal = lr.MaxBetGlobal,
                    IsActive = lr.IsActive,
                    Priority = lr.Priority,
                    DaysOfWeek = lr.DaysOfWeek,
                    DaysOfWeekNames = GetDaysOfWeekNames(lr.DaysOfWeek),
                    EffectiveFrom = lr.EffectiveFrom,
                    EffectiveTo = lr.EffectiveTo,
                    CreatedAt = lr.CreatedAt,
                    UpdatedAt = lr.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                return NotFound(new { message = "Límite no encontrado" });
            }

            return Ok(limitRule);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting limit rule {Id}", id);
            return StatusCode(500, new { message = "Error al obtener el límite" });
        }
    }

    /// <summary>
    /// Create a new limit rule
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<List<LimitRuleDto>>> CreateLimit([FromBody] CreateLimitDto dto)
    {
        try
        {
            // Validate limit type
            if (!Enum.IsDefined(typeof(LimitType), dto.LimitType))
            {
                return BadRequest(new { message = "Tipo de límite inválido" });
            }

            // Validate lottery if provided
            if (dto.LotteryId.HasValue)
            {
                var lotteryExists = await _context.Lotteries.AnyAsync(l => l.LotteryId == dto.LotteryId.Value);
                if (!lotteryExists)
                {
                    return BadRequest(new { message = "La lotería especificada no existe" });
                }
            }

            // Validate draws if provided
            var validDrawIds = new List<int>();
            if (dto.DrawIds != null && dto.DrawIds.Count > 0)
            {
                validDrawIds = await _context.Draws
                    .Where(d => dto.DrawIds.Contains(d.DrawId))
                    .Select(d => d.DrawId)
                    .ToListAsync();

                if (validDrawIds.Count != dto.DrawIds.Count)
                {
                    return BadRequest(new { message = "Uno o más sorteos especificados no existen" });
                }
            }

            // Validate game type if provided
            if (dto.GameTypeId.HasValue)
            {
                var gameTypeExists = await _context.GameTypes.AnyAsync(gt => gt.GameTypeId == dto.GameTypeId.Value);
                if (!gameTypeExists)
                {
                    return BadRequest(new { message = "El tipo de juego especificado no existe" });
                }
            }

            // Validate zone if provided
            if (dto.ZoneId.HasValue)
            {
                var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId.Value);
                if (!zoneExists)
                {
                    return BadRequest(new { message = "La zona especificada no existe" });
                }
            }

            // Validate betting pool if provided
            if (dto.BettingPoolId.HasValue)
            {
                var bettingPoolExists = await _context.BettingPools.AnyAsync(bp => bp.BettingPoolId == dto.BettingPoolId.Value);
                if (!bettingPoolExists)
                {
                    return BadRequest(new { message = "La banca especificada no existe" });
                }
            }

            // Convert days of week names to bitmask if provided
            var daysOfWeek = dto.DaysOfWeek;
            if (dto.DaysOfWeekNames != null && dto.DaysOfWeekNames.Count > 0)
            {
                daysOfWeek = ConvertDayNamesToMask(dto.DaysOfWeekNames);
            }

            var createdRules = new List<LimitRule>();

            // If multiple draws specified, create a rule for each
            if (validDrawIds.Count > 0)
            {
                foreach (var drawId in validDrawIds)
                {
                    var rule = CreateLimitRuleFromDto(dto, daysOfWeek, drawId);
                    _context.LimitRules.Add(rule);
                    createdRules.Add(rule);
                }
            }
            else
            {
                // Create a single rule without draw
                var rule = CreateLimitRuleFromDto(dto, daysOfWeek, null);
                _context.LimitRules.Add(rule);
                createdRules.Add(rule);
            }

            await _context.SaveChangesAsync();

            // Load navigation properties for response
            var createdIds = createdRules.Select(r => r.LimitRuleId).ToList();
            var result = await _context.LimitRules
                .Where(lr => createdIds.Contains(lr.LimitRuleId))
                .Select(lr => new LimitRuleDto
                {
                    LimitRuleId = lr.LimitRuleId,
                    RuleName = lr.RuleName,
                    LimitType = (int)lr.LimitType,
                    LimitTypeName = GetLimitTypeName(lr.LimitType),
                    LotteryId = lr.LotteryId,
                    LotteryName = lr.Lottery != null ? lr.Lottery.LotteryName : null,
                    DrawId = lr.DrawId,
                    DrawName = lr.Draw != null ? lr.Draw.DrawName : null,
                    GameTypeId = lr.GameTypeId,
                    GameTypeName = lr.GameType != null ? lr.GameType.GameName : null,
                    ZoneId = lr.ZoneId,
                    ZoneName = lr.Zone != null ? lr.Zone.ZoneName : null,
                    GroupId = lr.GroupId,
                    BettingPoolId = lr.BettingPoolId,
                    BettingPoolName = lr.BettingPool != null ? lr.BettingPool.BettingPoolName : null,
                    BetNumberPattern = lr.BetNumberPattern,
                    MaxBetPerNumber = lr.MaxBetPerNumber,
                    MaxBetPerTicket = lr.MaxBetPerTicket,
                    MaxBetPerBettingPool = lr.MaxBetPerBettingPool,
                    MaxBetGlobal = lr.MaxBetGlobal,
                    IsActive = lr.IsActive,
                    Priority = lr.Priority,
                    DaysOfWeek = lr.DaysOfWeek,
                    DaysOfWeekNames = GetDaysOfWeekNames(lr.DaysOfWeek),
                    EffectiveFrom = lr.EffectiveFrom,
                    EffectiveTo = lr.EffectiveTo,
                    CreatedAt = lr.CreatedAt,
                    UpdatedAt = lr.UpdatedAt
                })
                .ToListAsync();

            _logger.LogInformation("Created {Count} limit rules", result.Count);

            if (result.Count == 1)
            {
                return CreatedAtAction(nameof(GetLimit), new { id = result[0].LimitRuleId }, result);
            }

            return CreatedAtAction(nameof(GetLimits), result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating limit rule");
            return StatusCode(500, new { message = "Error al crear el límite" });
        }
    }

    /// <summary>
    /// Update an existing limit rule
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<LimitRuleDto>> UpdateLimit(int id, [FromBody] UpdateLimitDto dto)
    {
        try
        {
            var limitRule = await _context.LimitRules.FindAsync(id);
            if (limitRule == null)
            {
                return NotFound(new { message = "Límite no encontrado" });
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(dto.RuleName))
            {
                limitRule.RuleName = dto.RuleName;
            }

            if (dto.LimitType.HasValue)
            {
                if (!Enum.IsDefined(typeof(LimitType), dto.LimitType.Value))
                {
                    return BadRequest(new { message = "Tipo de límite inválido" });
                }
                limitRule.LimitType = (LimitType)dto.LimitType.Value;
            }

            if (dto.LotteryId.HasValue)
            {
                var lotteryExists = await _context.Lotteries.AnyAsync(l => l.LotteryId == dto.LotteryId.Value);
                if (!lotteryExists)
                {
                    return BadRequest(new { message = "La lotería especificada no existe" });
                }
                limitRule.LotteryId = dto.LotteryId.Value;
            }

            if (dto.DrawId.HasValue)
            {
                var drawExists = await _context.Draws.AnyAsync(d => d.DrawId == dto.DrawId.Value);
                if (!drawExists)
                {
                    return BadRequest(new { message = "El sorteo especificado no existe" });
                }
                limitRule.DrawId = dto.DrawId.Value;
            }

            if (dto.GameTypeId.HasValue)
            {
                var gameTypeExists = await _context.GameTypes.AnyAsync(gt => gt.GameTypeId == dto.GameTypeId.Value);
                if (!gameTypeExists)
                {
                    return BadRequest(new { message = "El tipo de juego especificado no existe" });
                }
                limitRule.GameTypeId = dto.GameTypeId.Value;
            }

            if (dto.ZoneId.HasValue)
            {
                var zoneExists = await _context.Zones.AnyAsync(z => z.ZoneId == dto.ZoneId.Value);
                if (!zoneExists)
                {
                    return BadRequest(new { message = "La zona especificada no existe" });
                }
                limitRule.ZoneId = dto.ZoneId.Value;
            }

            if (dto.BettingPoolId.HasValue)
            {
                var bettingPoolExists = await _context.BettingPools.AnyAsync(bp => bp.BettingPoolId == dto.BettingPoolId.Value);
                if (!bettingPoolExists)
                {
                    return BadRequest(new { message = "La banca especificada no existe" });
                }
                limitRule.BettingPoolId = dto.BettingPoolId.Value;
            }

            if (dto.GroupId.HasValue)
            {
                limitRule.GroupId = dto.GroupId.Value;
            }

            if (dto.BetNumberPattern != null)
            {
                limitRule.BetNumberPattern = dto.BetNumberPattern;
            }

            if (dto.MaxBetPerNumber.HasValue)
            {
                limitRule.MaxBetPerNumber = dto.MaxBetPerNumber.Value;
            }

            if (dto.MaxBetPerTicket.HasValue)
            {
                limitRule.MaxBetPerTicket = dto.MaxBetPerTicket.Value;
            }

            if (dto.MaxBetPerBettingPool.HasValue)
            {
                limitRule.MaxBetPerBettingPool = dto.MaxBetPerBettingPool.Value;
            }

            if (dto.MaxBetGlobal.HasValue)
            {
                limitRule.MaxBetGlobal = dto.MaxBetGlobal.Value;
            }

            if (dto.DaysOfWeek.HasValue)
            {
                limitRule.DaysOfWeek = dto.DaysOfWeek.Value;
            }

            if (dto.EffectiveFrom.HasValue)
            {
                limitRule.EffectiveFrom = dto.EffectiveFrom.Value;
            }

            if (dto.EffectiveTo.HasValue)
            {
                limitRule.EffectiveTo = dto.EffectiveTo.Value;
            }

            if (dto.Priority.HasValue)
            {
                limitRule.Priority = dto.Priority.Value;
            }

            if (dto.IsActive.HasValue)
            {
                limitRule.IsActive = dto.IsActive.Value;
            }

            limitRule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Return updated rule
            return await GetLimit(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating limit rule {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar el límite" });
        }
    }

    /// <summary>
    /// Delete a limit rule
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLimit(int id)
    {
        try
        {
            var limitRule = await _context.LimitRules.FindAsync(id);
            if (limitRule == null)
            {
                return NotFound(new { message = "Límite no encontrado" });
            }

            // Check for consumption records
            var hasConsumption = await _context.LimitConsumptions.AnyAsync(lc => lc.LimitRuleId == id);
            if (hasConsumption)
            {
                // Soft delete instead - just deactivate
                limitRule.IsActive = false;
                limitRule.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Límite desactivado exitosamente (tiene registros de consumo asociados)" });
            }

            _context.LimitRules.Remove(limitRule);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted limit rule {Id}", id);

            return Ok(new { message = "Límite eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting limit rule {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar el límite" });
        }
    }

    /// <summary>
    /// Batch delete limit rules
    /// </summary>
    [HttpDelete("batch")]
    public async Task<ActionResult<BatchDeleteResponseDto>> DeleteLimitsBatch([FromBody] BatchDeleteLimitsDto dto)
    {
        try
        {
            var rulesToDelete = new List<LimitRule>();
            var rulesToDeactivate = new List<LimitRule>();
            var deletedIds = new List<int>();
            var errors = new List<string>();

            // Get rules by IDs
            if (dto.LimitRuleIds != null && dto.LimitRuleIds.Count > 0)
            {
                rulesToDelete = await _context.LimitRules
                    .Where(lr => dto.LimitRuleIds.Contains(lr.LimitRuleId))
                    .ToListAsync();
            }
            // Or get rules by filter
            else if (dto.Filter != null)
            {
                var query = _context.LimitRules.AsQueryable();

                if (dto.Filter.LimitTypes != null && dto.Filter.LimitTypes.Count > 0)
                {
                    var limitTypes = dto.Filter.LimitTypes.Select(lt => (LimitType)lt).ToList();
                    query = query.Where(lr => limitTypes.Contains(lr.LimitType));
                }

                if (dto.Filter.DrawIds != null && dto.Filter.DrawIds.Count > 0)
                {
                    query = query.Where(lr => lr.DrawId.HasValue && dto.Filter.DrawIds.Contains(lr.DrawId.Value));
                }

                if (dto.Filter.BettingPoolId.HasValue)
                {
                    query = query.Where(lr => lr.BettingPoolId == dto.Filter.BettingPoolId.Value);
                }

                if (dto.Filter.ZoneId.HasValue)
                {
                    query = query.Where(lr => lr.ZoneId == dto.Filter.ZoneId.Value);
                }

                if (dto.Filter.IsActive.HasValue)
                {
                    query = query.Where(lr => lr.IsActive == dto.Filter.IsActive.Value);
                }

                rulesToDelete = await query.ToListAsync();
            }

            if (rulesToDelete.Count == 0)
            {
                return Ok(new BatchDeleteResponseDto
                {
                    Success = true,
                    DeletedCount = 0,
                    Message = "No se encontraron límites para eliminar"
                });
            }

            // Check which rules have consumption records
            var ruleIds = rulesToDelete.Select(r => r.LimitRuleId).ToList();
            var rulesWithConsumption = await _context.LimitConsumptions
                .Where(lc => ruleIds.Contains(lc.LimitRuleId))
                .Select(lc => lc.LimitRuleId)
                .Distinct()
                .ToListAsync();

            foreach (var rule in rulesToDelete)
            {
                if (rulesWithConsumption.Contains(rule.LimitRuleId))
                {
                    // Deactivate instead of delete
                    rule.IsActive = false;
                    rule.UpdatedAt = DateTime.UtcNow;
                    rulesToDeactivate.Add(rule);
                }
                else
                {
                    _context.LimitRules.Remove(rule);
                }
                deletedIds.Add(rule.LimitRuleId);
            }

            await _context.SaveChangesAsync();

            var message = $"Eliminados: {rulesToDelete.Count - rulesToDeactivate.Count}, Desactivados: {rulesToDeactivate.Count}";

            _logger.LogInformation("Batch deleted/deactivated {Count} limit rules", deletedIds.Count);

            return Ok(new BatchDeleteResponseDto
            {
                Success = true,
                DeletedCount = deletedIds.Count,
                DeletedIds = deletedIds,
                Message = message,
                Errors = errors.Count > 0 ? errors : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in batch delete of limit rules");
            return StatusCode(500, new BatchDeleteResponseDto
            {
                Success = false,
                DeletedCount = 0,
                Message = "Error al eliminar los límites",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Get form parameters for creating/editing limits
    /// </summary>
    [HttpGet("params")]
    public async Task<ActionResult<LimitParamsDto>> GetLimitParams()
    {
        try
        {
            // Get limit types
            var limitTypes = Enum.GetValues<LimitType>()
                .Select(lt => new SelectOption
                {
                    Value = (int)lt,
                    Label = LimitTypeNames.GetValueOrDefault(lt, lt.ToString())
                })
                .ToList();

            // Get lotteries
            var lotteries = await _context.Lotteries
                .Where(l => l.IsActive)
                .OrderBy(l => l.LotteryName)
                .Select(l => new SelectOption
                {
                    Value = l.LotteryId,
                    Label = l.LotteryName
                })
                .ToListAsync();

            // Get draws with lottery info
            var draws = await _context.Draws
                .Where(d => d.IsActive)
                .OrderBy(d => d.Lottery!.LotteryName)
                .ThenBy(d => d.DrawName)
                .Select(d => new DrawSelectOption
                {
                    Value = d.DrawId,
                    Label = d.DrawName,
                    LotteryId = d.LotteryId,
                    LotteryName = d.Lottery != null ? d.Lottery.LotteryName : null,
                    DisplayColor = d.DisplayColor
                })
                .ToListAsync();

            // Get game types
            var gameTypes = await _context.GameTypes
                .Where(gt => gt.IsActive)
                .OrderBy(gt => gt.DisplayOrder)
                .ThenBy(gt => gt.GameName)
                .Select(gt => new SelectOption
                {
                    Value = gt.GameTypeId,
                    Label = gt.GameName
                })
                .ToListAsync();

            // Get betting pools
            var bettingPools = await _context.BettingPools
                .Where(bp => bp.IsActive)
                .OrderBy(bp => bp.BettingPoolName)
                .Select(bp => new SelectOption
                {
                    Value = bp.BettingPoolId,
                    Label = bp.BettingPoolName
                })
                .ToListAsync();

            // Get zones
            var zones = await _context.Zones
                .Where(z => z.IsActive)
                .OrderBy(z => z.ZoneName)
                .Select(z => new SelectOption
                {
                    Value = z.ZoneId,
                    Label = z.ZoneName
                })
                .ToListAsync();

            // Days of week options
            var daysOfWeek = DayOfWeekNames.Select(kv => new DayOfWeekOption
            {
                Value = kv.Key,
                Label = kv.Value,
                ShortLabel = kv.Value.Substring(0, 3)
            }).ToList();

            return Ok(new LimitParamsDto
            {
                LimitTypes = limitTypes,
                Lotteries = lotteries,
                Draws = draws,
                GameTypes = gameTypes,
                BettingPools = bettingPools,
                Zones = zones,
                DaysOfWeek = daysOfWeek
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting limit params");
            return StatusCode(500, new { message = "Error al obtener los parámetros" });
        }
    }

    /// <summary>
    /// Toggle active status of a limit rule
    /// </summary>
    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<LimitRuleDto>> ToggleLimitStatus(int id)
    {
        try
        {
            var limitRule = await _context.LimitRules.FindAsync(id);
            if (limitRule == null)
            {
                return NotFound(new { message = "Límite no encontrado" });
            }

            limitRule.IsActive = !limitRule.IsActive;
            limitRule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetLimit(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling limit rule status {Id}", id);
            return StatusCode(500, new { message = "Error al cambiar el estado del límite" });
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private static string GetLimitTypeName(LimitType limitType)
    {
        return LimitTypeNames.GetValueOrDefault(limitType, limitType.ToString());
    }

    private static List<string>? GetDaysOfWeekNames(int? daysOfWeekMask)
    {
        if (!daysOfWeekMask.HasValue || daysOfWeekMask.Value == 0)
        {
            return null;
        }

        var days = new List<string>();
        foreach (var (bit, name) in DayOfWeekNames)
        {
            if ((daysOfWeekMask.Value & bit) != 0)
            {
                days.Add(name);
            }
        }

        return days.Count > 0 ? days : null;
    }

    private static int? ConvertDayNamesToMask(List<string> dayNames)
    {
        if (dayNames == null || dayNames.Count == 0)
        {
            return null;
        }

        var reverseMap = DayOfWeekNames.ToDictionary(
            kv => kv.Value.ToLower(),
            kv => kv.Key
        );

        int mask = 0;
        foreach (var dayName in dayNames)
        {
            var normalizedName = dayName.ToLower().Trim();
            if (reverseMap.TryGetValue(normalizedName, out int bit))
            {
                mask |= bit;
            }
        }

        return mask > 0 ? mask : null;
    }

    private LimitRule CreateLimitRuleFromDto(CreateLimitDto dto, int? daysOfWeek, int? drawId)
    {
        return new LimitRule
        {
            RuleName = dto.RuleName,
            LimitType = (LimitType)dto.LimitType,
            LotteryId = dto.LotteryId,
            DrawId = drawId,
            GameTypeId = dto.GameTypeId,
            ZoneId = dto.ZoneId,
            GroupId = dto.GroupId,
            BettingPoolId = dto.BettingPoolId,
            BetNumberPattern = dto.BetNumberPattern,
            MaxBetPerNumber = dto.MaxBetPerNumber,
            MaxBetPerTicket = dto.MaxBetPerTicket,
            MaxBetPerBettingPool = dto.MaxBetPerBettingPool,
            MaxBetGlobal = dto.MaxBetGlobal,
            DaysOfWeek = daysOfWeek,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            Priority = dto.Priority,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
    }
}
