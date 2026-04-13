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
        { LimitType.GeneralForGroup, "Limite Global" },
        { LimitType.ByNumberForGroup, "Por Número para Grupo" },
        { LimitType.GeneralForBettingPool, "Limite Banca" },
        { LimitType.ByNumberForBettingPool, "Por Número para Banca (Línea)" },
        { LimitType.LocalForBettingPool, "Limite Local Banca" },
        { LimitType.GeneralForZone, "Limite Zona" },
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
                    UpdatedAt = lr.UpdatedAt,
                    Amounts = null // populated below
                })
                .ToListAsync();

            await PopulateAmountsAsync(limits);

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
                    UpdatedAt = lr.UpdatedAt,
                    Amounts = null // populated below
                })
                .FirstOrDefaultAsync();

            if (limitRule == null)
            {
                return NotFound(new { message = "Límite no encontrado" });
            }

            await PopulateAmountsAsync(limitRule);

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
            var existingRuleIds = new HashSet<int>();
            var limitType = (LimitType)dto.LimitType;

            // Validate BetNumberPattern is required for ByNumber types
            var isByNumberType = limitType == LimitType.ByNumberForGroup
                || limitType == LimitType.ByNumberForZone
                || limitType == LimitType.ByNumberForBettingPool;

            var hasPatterns = (dto.BetNumberPatterns != null && dto.BetNumberPatterns.Any(p => !string.IsNullOrWhiteSpace(p)))
                || !string.IsNullOrWhiteSpace(dto.BetNumberPattern);
            if (isByNumberType && !hasPatterns)
            {
                return BadRequest(new { message = "El número es requerido para límites por número" });
            }

            // Require Global limits to exist before creating any other type
            if (limitType != LimitType.GeneralForGroup)
            {
                var hasGlobal = await _context.LimitRules
                    .AnyAsync(r => r.LimitType == LimitType.GeneralForGroup && r.IsActive);
                if (!hasGlobal)
                {
                    return BadRequest(new { message = "Debe crear primero un Límite Global antes de crear otros tipos de límites" });
                }
            }

            // ByNumber types do NOT require parent general limits — they can be created independently.
            // Parent validation (when a parent exists) still ensures per-number amounts cannot
            // exceed the parent general amount; if no parent exists, no upper bound applies.

            // Require Zona limits to exist for Limite Banca (not Local Banca)
            if (limitType == LimitType.GeneralForBettingPool)
            {
                var targetEntitiesForCheck = await ResolveTargetEntities(dto, limitType);
                var bpIds = targetEntitiesForCheck.Where(e => e.Id > 0).Select(e => e.Id).ToList();
                if (bpIds.Count > 0)
                {
                    // Get zone IDs for target bancas
                    var bpZoneIds = await _context.BettingPools
                        .Where(bp => bpIds.Contains(bp.BettingPoolId) && bp.ZoneId > 0)
                        .Select(bp => bp.ZoneId)
                        .Distinct()
                        .ToListAsync();

                    foreach (var zId in bpZoneIds)
                    {
                        var hasZonaLimit = await _context.LimitRules
                            .AnyAsync(r => r.LimitType == LimitType.GeneralForZone && r.ZoneId == zId && r.IsActive);
                        if (!hasZonaLimit)
                        {
                            var zoneName = await _context.Zones.Where(z => z.ZoneId == zId).Select(z => z.ZoneName).FirstOrDefaultAsync();
                            return BadRequest(new { message = $"Debe crear primero un Límite Zona para '{zoneName ?? $"Zona {zId}"}' antes de crear Límite Banca" });
                        }
                    }
                }
            }

            // Resolve target entities based on limit type
            var targetEntities = await ResolveTargetEntities(dto, limitType);

            // Parent validation
            if (dto.Amounts != null && dto.Amounts.Count > 0)
            {
                var parentViolations = await ValidateParentAmounts(limitType, validDrawIds, targetEntities, dto.Amounts);
                if (parentViolations.Count > 0)
                {
                    return BadRequest(new
                    {
                        message = "Los montos exceden los límites del nivel superior",
                        violations = parentViolations
                    });
                }
            }

            // Validate mutual exclusion: Limite Banca and Limite Local Banca cannot coexist for same banca
            if (limitType == LimitType.GeneralForBettingPool || limitType == LimitType.LocalForBettingPool)
            {
                var conflictType = limitType == LimitType.GeneralForBettingPool
                    ? LimitType.LocalForBettingPool
                    : LimitType.GeneralForBettingPool;
                var conflictTypeName = limitType == LimitType.GeneralForBettingPool
                    ? "Limite Local Banca"
                    : "Limite Banca";

                var entityBpIds = targetEntities.Where(e => e.Id > 0).Select(e => e.Id).ToList();
                if (entityBpIds.Count > 0)
                {
                    var conflicting = await _context.LimitRules
                        .AsNoTracking()
                        .Where(r => r.LimitType == conflictType && r.IsActive
                            && r.BettingPoolId.HasValue && entityBpIds.Contains(r.BettingPoolId.Value))
                        .Select(r => r.BettingPool != null ? r.BettingPool.BettingPoolName : $"Banca #{r.BettingPoolId}")
                        .Distinct()
                        .ToListAsync();

                    if (conflicting.Count > 0)
                    {
                        return BadRequest(new
                        {
                            message = $"Las siguientes bancas ya tienen {conflictTypeName} y no pueden tener ambos tipos: {string.Join(", ", conflicting)}"
                        });
                    }
                }
            }

            // Resolve bet number patterns for ByNumber types
            // Strip all non-digit chars to match ticket line storage format (e.g., "02-20" -> "0220")
            static string NormalizeBetNumber(string pattern) => new string(pattern.Where(char.IsDigit).ToArray());

            var betNumberPatterns = new List<string> { "" }; // default: single empty pattern (non-ByNumber)
            if (isByNumberType)
            {
                if (dto.BetNumberPatterns != null && dto.BetNumberPatterns.Count > 0)
                    betNumberPatterns = dto.BetNumberPatterns
                        .Where(p => !string.IsNullOrWhiteSpace(p))
                        .Select(NormalizeBetNumber)
                        .Distinct()
                        .ToList();
                else if (!string.IsNullOrWhiteSpace(dto.BetNumberPattern))
                    betNumberPatterns = new List<string> { NormalizeBetNumber(dto.BetNumberPattern) };
            }

            // Upsert rules: find existing or create new
            var updatedCount = 0;
            foreach (var entity in targetEntities)
            {
                var drawIds = validDrawIds.Count > 0 ? validDrawIds : new List<int> { 0 };
                foreach (var drawId in drawIds)
                {
                    foreach (var pattern in betNumberPatterns)
                    {
                        // Try to find existing rule for this type + draw + entity
                        var existingQuery = _context.LimitRules
                            .Where(r => r.LimitType == limitType && r.IsActive && r.DrawId == (drawId == 0 ? null : drawId));

                        if (limitType == LimitType.GeneralForGroup || limitType == LimitType.ByNumberForGroup)
                        {
                            // Global: match by draw only (+ betNumberPattern for ByNumber)
                        }
                        else if (limitType == LimitType.GeneralForZone || limitType == LimitType.ByNumberForZone)
                        {
                            existingQuery = existingQuery.Where(r => r.ZoneId == entity.Id);
                        }
                        else
                        {
                            existingQuery = existingQuery.Where(r => r.BettingPoolId == entity.Id);
                        }

                        // ByNumber types must also match on BetNumberPattern
                        if (isByNumberType)
                        {
                            existingQuery = existingQuery.Where(r => r.BetNumberPattern == pattern);
                        }

                        var existingRule = await existingQuery.FirstOrDefaultAsync();

                        if (existingRule != null)
                        {
                            // Update existing rule's days and expiration
                            existingRule.DaysOfWeek = daysOfWeek ?? existingRule.DaysOfWeek;
                            if (dto.EffectiveTo.HasValue) existingRule.EffectiveTo = dto.EffectiveTo;
                            existingRule.UpdatedAt = DateTime.UtcNow;

                            existingRuleIds.Add(existingRule.LimitRuleId);
                            createdRules.Add(existingRule);
                            updatedCount++;
                        }
                        else
                        {
                            var rule = CreateLimitRuleFromDto(dto, daysOfWeek, drawId == 0 ? null : drawId);
                            if (isByNumberType) rule.BetNumberPattern = pattern;

                            if (limitType == LimitType.GeneralForZone || limitType == LimitType.ByNumberForZone)
                            {
                                rule.ZoneId = entity.Id;
                            }
                            else if (limitType == LimitType.GeneralForBettingPool || limitType == LimitType.LocalForBettingPool
                                || limitType == LimitType.ByNumberForBettingPool)
                            {
                                rule.BettingPoolId = entity.Id;
                                rule.ZoneId = entity.ZoneId;
                            }

                            _context.LimitRules.Add(rule);
                            createdRules.Add(rule);
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Persist per-game-type amounts, filtered by what each draw allows
            if (dto.Amounts != null && dto.Amounts.Count > 0)
            {
                // Map frontend camelCase keys to game_type_id
                var gameTypes = await _context.GameTypes
                    .AsNoTracking()
                    .Where(gt => gt.IsActive)
                    .Select(gt => new { gt.GameTypeId, gt.GameTypeCode })
                    .ToListAsync();

                var frontendToGameTypeId = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                var codeToId = gameTypes.ToDictionary(gt => gt.GameTypeCode, gt => gt.GameTypeId, StringComparer.OrdinalIgnoreCase);

                // Frontend key -> DB code -> game_type_id
                var keyMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["directo"] = "DIRECTO", ["pale"] = "PALE", ["tripleta"] = "TRIPLETA",
                    ["cash3Straight"] = "CASH3_STRAIGHT", ["cash3Box"] = "CASH3_BOX",
                    ["cash3FrontStraight"] = "CASH3_FRONT_STRAIGHT", ["cash3FrontBox"] = "CASH3_FRONT_BOX",
                    ["cash3BackStraight"] = "CASH3_BACK_STRAIGHT", ["cash3BackBox"] = "CASH3_BACK_BOX",
                    ["play4Straight"] = "PLAY4_STRAIGHT", ["play4Box"] = "PLAY4_BOX",
                    ["pick5Straight"] = "PICK5_STRAIGHT", ["pick5Box"] = "PICK5_BOX",
                    ["superPale"] = "SUPER_PALE", ["pickTwo"] = "PICK2",
                    ["pickTwoFront"] = "PICK2_FRONT", ["pickTwoBack"] = "PICK2_BACK",
                    ["pickTwoMiddle"] = "PICK2_MIDDLE",
                    ["bolita1"] = "BOLITA", ["bolita2"] = "BOLITA",
                    ["singulacion1"] = "SINGULACION", ["singulacion2"] = "SINGULACION", ["singulacion3"] = "SINGULACION"
                };

                foreach (var (feKey, dbCode) in keyMap)
                {
                    if (codeToId.TryGetValue(dbCode, out var gtId))
                        frontendToGameTypeId[feKey] = gtId;
                }

                // Pre-fetch allowed game_type_ids per draw
                var drawIdsUsed = createdRules.Where(r => r.DrawId.HasValue).Select(r => r.DrawId!.Value).Distinct().ToList();
                var allowedByDraw = new Dictionary<int, HashSet<int>>();
                if (drawIdsUsed.Count > 0)
                {
                    var compatData = await _context.Set<DrawGameCompatibility>()
                        .AsNoTracking()
                        .Where(dgc => drawIdsUsed.Contains(dgc.DrawId) && dgc.IsActive)
                        .Select(dgc => new { dgc.DrawId, dgc.GameTypeId })
                        .ToListAsync();

                    foreach (var item in compatData)
                    {
                        if (!allowedByDraw.ContainsKey(item.DrawId))
                            allowedByDraw[item.DrawId] = new HashSet<int>();
                        allowedByDraw[item.DrawId].Add(item.GameTypeId);
                    }
                }

                // Track which game_type_ids are already processed per rule (to avoid duplicates for bolita1/2, singulacion1/2/3)
                foreach (var rule in createdRules)
                {
                    var isExisting = existingRuleIds.Contains(rule.LimitRuleId);

                    var drawAllowed = rule.DrawId.HasValue && allowedByDraw.TryGetValue(rule.DrawId.Value, out var allowed)
                        ? allowed : null;
                    var processedGameTypes = new HashSet<int>();

                    // Load existing amounts for merge
                    var existingAmounts = isExisting
                        ? await _context.LimitRuleAmounts
                            .Where(a => a.LimitRuleId == rule.LimitRuleId)
                            .ToListAsync()
                        : new List<LimitRuleAmount>();

                    foreach (var (feKey, amount) in dto.Amounts)
                    {
                        if (!frontendToGameTypeId.TryGetValue(feKey, out var gameTypeId)) continue;
                        if (processedGameTypes.Contains(gameTypeId)) continue;

                        // Check if this game type is allowed for the draw
                        if (drawAllowed != null && !drawAllowed.Contains(gameTypeId)) continue;

                        var existingAmount = existingAmounts.FirstOrDefault(a => a.GameTypeId == gameTypeId);

                        if (amount <= 0)
                        {
                            // Remove this game type if it exists
                            if (existingAmount != null)
                                _context.LimitRuleAmounts.Remove(existingAmount);
                        }
                        else if (existingAmount != null)
                        {
                            // Update existing amount
                            existingAmount.MaxAmount = amount;
                        }
                        else
                        {
                            // Add new amount
                            _context.LimitRuleAmounts.Add(new LimitRuleAmount
                            {
                                LimitRuleId = rule.LimitRuleId,
                                GameTypeId = gameTypeId,
                                MaxAmount = amount
                            });
                        }
                        processedGameTypes.Add(gameTypeId);
                    }
                }
                await _context.SaveChangesAsync();

                // Clean up rules that ended up with no amounts (e.g., game type not supported by draw)
                var rulesWithNoAmounts = new List<LimitRule>();
                foreach (var rule in createdRules)
                {
                    var hasAmounts = await _context.LimitRuleAmounts
                        .AnyAsync(a => a.LimitRuleId == rule.LimitRuleId);
                    if (!hasAmounts)
                        rulesWithNoAmounts.Add(rule);
                }
                if (rulesWithNoAmounts.Count > 0)
                {
                    _context.LimitRules.RemoveRange(rulesWithNoAmounts);
                    await _context.SaveChangesAsync();
                    foreach (var r in rulesWithNoAmounts) createdRules.Remove(r);
                }
            }

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
                    UpdatedAt = lr.UpdatedAt,
                    Amounts = null // populated below
                })
                .ToListAsync();

            await PopulateAmountsAsync(result);

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
                // Strip all non-digit chars to match ticket line storage format
                limitRule.BetNumberPattern = new string(dto.BetNumberPattern.Where(char.IsDigit).ToArray());
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
    /// Get allowed game type codes for given draw IDs.
    /// Returns the union of game types across all selected draws.
    /// </summary>
    [HttpGet("draw-game-types")]
    public async Task<ActionResult> GetDrawGameTypes([FromQuery] string? drawIds)
    {
        try
        {
            var ids = new List<int>();
            if (!string.IsNullOrWhiteSpace(drawIds))
            {
                ids = drawIds.Split(',')
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : 0)
                    .Where(id => id > 0)
                    .ToList();
            }

            if (ids.Count == 0 || ids.Count > 50)
            {
                // No draws or too many — return all game types
                var allCodes = await _context.GameTypes
                    .AsNoTracking()
                    .Where(gt => gt.IsActive && gt.GameTypeCode != "PANAMA")
                    .OrderBy(gt => gt.DisplayOrder)
                    .Select(gt => gt.GameTypeCode)
                    .ToListAsync();
                return Ok(allCodes);
            }

            // Get the union of game types across all selected draws
            // (any game type supported by at least one selected draw)
            var codes = await _context.Set<DrawGameCompatibility>()
                .AsNoTracking()
                .Where(dgc => ids.Contains(dgc.DrawId) && dgc.IsActive)
                .Where(dgc => dgc.GameType != null && dgc.GameType.GameTypeCode != "PANAMA")
                .Select(dgc => dgc.GameType!.GameTypeCode)
                .Distinct()
                .ToListAsync();

            return Ok(codes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting draw game types");
            return StatusCode(500, new { message = "Error al obtener tipos de juego" });
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

            // Get betting pools with zone info
            var bettingPools = await _context.BettingPools
                .Where(bp => bp.IsActive && bp.DeletedAt == null)
                .OrderBy(bp => bp.BettingPoolName)
                .Select(bp => new BettingPoolSelectOption
                {
                    Value = bp.BettingPoolId,
                    Label = bp.BettingPoolName,
                    Code = bp.BettingPoolCode,
                    ZoneId = bp.ZoneId,
                    ZoneName = bp.Zone != null ? bp.Zone.ZoneName : null
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
    /// Delete a single game type amount from a limit rule.
    /// If no amounts remain, the rule itself is deleted.
    /// </summary>
    [HttpDelete("{id}/amounts/{gameTypeId}")]
    public async Task<ActionResult> DeleteAmount(int id, int gameTypeId)
    {
        try
        {
            var amount = await _context.LimitRuleAmounts
                .FirstOrDefaultAsync(a => a.LimitRuleId == id && a.GameTypeId == gameTypeId);
            if (amount == null)
                return NotFound(new { message = "Monto no encontrado" });

            _context.LimitRuleAmounts.Remove(amount);
            await _context.SaveChangesAsync();

            // If no amounts left, delete the rule too
            var remaining = await _context.LimitRuleAmounts.CountAsync(a => a.LimitRuleId == id);
            if (remaining == 0)
            {
                var rule = await _context.LimitRules.FindAsync(id);
                if (rule != null)
                {
                    _context.LimitRules.Remove(rule);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Monto eliminado" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting amount for rule {Id}, gameType {GameTypeId}", id, gameTypeId);
            return StatusCode(500, new { message = "Error al eliminar monto" });
        }
    }

    /// <summary>
    /// Update a single game type amount on a limit rule
    /// </summary>
    [HttpPut("{id}/amounts/{gameTypeId}")]
    public async Task<ActionResult> UpdateAmount(int id, int gameTypeId, [FromBody] UpdateAmountDto dto)
    {
        try
        {
            var amount = await _context.LimitRuleAmounts
                .FirstOrDefaultAsync(a => a.LimitRuleId == id && a.GameTypeId == gameTypeId);
            if (amount == null)
                return NotFound(new { message = "Monto no encontrado" });

            amount.MaxAmount = dto.Amount;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Monto actualizado", amount = amount.MaxAmount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating amount for rule {Id}, gameType {GameTypeId}", id, gameTypeId);
            return StatusCode(500, new { message = "Error al actualizar monto" });
        }
    }

    /// <summary>
    /// Delete all limit rules for a specific draw + type combination
    /// </summary>
    [HttpDelete("by-draw")]
    public async Task<ActionResult> DeleteByDraw(
        [FromQuery] int drawId,
        [FromQuery] int limitType,
        [FromQuery] int? zoneId = null,
        [FromQuery] int? bettingPoolId = null)
    {
        try
        {
            var query = _context.LimitRules
                .Where(r => r.DrawId == drawId && r.LimitType == (LimitType)limitType && r.IsActive);

            if (zoneId.HasValue)
                query = query.Where(r => r.ZoneId == zoneId.Value);
            if (bettingPoolId.HasValue)
                query = query.Where(r => r.BettingPoolId == bettingPoolId.Value);

            var rules = await query.ToListAsync();
            if (rules.Count == 0)
                return NotFound(new { message = "No se encontraron límites" });

            _context.LimitRules.RemoveRange(rules);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{rules.Count} límites eliminados", deletedCount = rules.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting limits by draw");
            return StatusCode(500, new { message = "Error al eliminar límites" });
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

    /// <summary>
    /// Validate that proposed limit amounts don't exceed parent limits
    /// </summary>
    // Frontend camelCase key -> game_type_id mapping
    private static readonly Dictionary<string, string> FrontendKeyToDbCode = new(StringComparer.OrdinalIgnoreCase)
    {
        ["directo"] = "DIRECTO", ["pale"] = "PALE", ["tripleta"] = "TRIPLETA",
        ["cash3Straight"] = "CASH3_STRAIGHT", ["cash3Box"] = "CASH3_BOX",
        ["cash3FrontStraight"] = "CASH3_FRONT_STRAIGHT", ["cash3FrontBox"] = "CASH3_FRONT_BOX",
        ["cash3BackStraight"] = "CASH3_BACK_STRAIGHT", ["cash3BackBox"] = "CASH3_BACK_BOX",
        ["play4Straight"] = "PLAY4_STRAIGHT", ["play4Box"] = "PLAY4_BOX",
        ["pick5Straight"] = "PICK5_STRAIGHT", ["pick5Box"] = "PICK5_BOX",
        ["superPale"] = "SUPER_PALE", ["pickTwo"] = "PICK2",
        ["pickTwoFront"] = "PICK2_FRONT", ["pickTwoBack"] = "PICK2_BACK",
        ["pickTwoMiddle"] = "PICK2_MIDDLE",
        ["bolita1"] = "BOLITA", ["bolita2"] = "BOLITA",
        ["singulacion1"] = "SINGULACION", ["singulacion2"] = "SINGULACION", ["singulacion3"] = "SINGULACION"
    };

    private async Task<Dictionary<int, string>> GetGameTypeCodeToIdMapAsync()
    {
        var gameTypes = await _context.GameTypes.AsNoTracking()
            .Where(gt => gt.IsActive)
            .Select(gt => new { gt.GameTypeId, gt.GameTypeCode })
            .ToListAsync();
        return gameTypes.ToDictionary(gt => gt.GameTypeId, gt => gt.GameTypeCode);
    }

    /// <summary>
    /// Resolve frontend camelCase key to game_type_id
    /// </summary>
    private int? ResolveFrontendKeyToGameTypeId(string feKey, Dictionary<string, int> codeToId)
    {
        if (FrontendKeyToDbCode.TryGetValue(feKey, out var dbCode) && codeToId.TryGetValue(dbCode, out var gtId))
            return gtId;
        return null;
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ValidateLimitResultDto>> ValidateParentLimits([FromBody] ValidateLimitDto dto)
    {
        try
        {
            var limitType = (LimitType)dto.LimitType;
            var violations = new List<LimitViolationDto>();

            if (dto.Amounts == null || dto.Amounts.Count == 0)
                return Ok(new ValidateLimitResultDto { IsValid = true });

            // Build code -> id map
            var gameTypes = await _context.GameTypes.AsNoTracking()
                .Where(gt => gt.IsActive)
                .Select(gt => new { gt.GameTypeId, gt.GameTypeCode, gt.GameName })
                .ToListAsync();
            var codeToId = gameTypes.ToDictionary(gt => gt.GameTypeCode, gt => gt.GameTypeId, StringComparer.OrdinalIgnoreCase);
            var idToName = gameTypes.ToDictionary(gt => gt.GameTypeId, gt => gt.GameName);

            // Get parent amounts keyed by game_type_id
            var parentAmounts = await GetParentAmountsByGameTypeId(limitType, dto.DrawId, dto.ZoneId, dto.BettingPoolId);

            if (parentAmounts != null)
            {
                foreach (var (feKey, childAmount) in dto.Amounts)
                {
                    var gtId = ResolveFrontendKeyToGameTypeId(feKey, codeToId);
                    if (gtId == null) continue;

                    if (parentAmounts.TryGetValue(gtId.Value, out var parentAmount) && childAmount > parentAmount)
                    {
                        violations.Add(new LimitViolationDto
                        {
                            GameType = idToName.GetValueOrDefault(gtId.Value, feKey),
                            ChildAmount = childAmount,
                            ParentAmount = parentAmount,
                            ParentType = GetParentTypeName(limitType)
                        });
                    }
                }
            }

            return Ok(new ValidateLimitResultDto
            {
                IsValid = violations.Count == 0,
                Violations = violations
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating parent limits");
            return StatusCode(500, new { message = "Error al validar límites" });
        }
    }

    /// <summary>
    /// Get parent limit amounts keyed by game_type_id
    /// </summary>
    private async Task<Dictionary<int, decimal>?> GetParentAmountsByGameTypeId(LimitType childType, int drawId, int? zoneId, int? bettingPoolId)
    {
        LimitType parentType;
        int? parentZoneId = null;

        switch (childType)
        {
            case LimitType.GeneralForZone:
            case LimitType.ByNumberForGroup:
                parentType = LimitType.GeneralForGroup;
                break;
            case LimitType.GeneralForBettingPool:
                parentType = LimitType.GeneralForZone;
                if (bettingPoolId.HasValue)
                {
                    parentZoneId = await _context.BettingPools
                        .Where(bp => bp.BettingPoolId == bettingPoolId.Value)
                        .Select(bp => (int?)bp.ZoneId)
                        .FirstOrDefaultAsync();
                }
                else if (zoneId.HasValue)
                {
                    parentZoneId = zoneId;
                }
                break;
            case LimitType.LocalForBettingPool:
                parentType = LimitType.GeneralForGroup;
                break;
            case LimitType.ByNumberForZone:
                parentType = LimitType.GeneralForZone;
                parentZoneId = zoneId;
                break;
            case LimitType.ByNumberForBettingPool:
                parentType = LimitType.GeneralForBettingPool;
                break;
            default:
                return null;
        }

        var parentQuery = _context.LimitRules
            .AsNoTracking()
            .Where(r => r.LimitType == parentType && r.IsActive)
            .Where(r => r.DrawId == drawId || r.DrawId == null)
            .Where(r => r.EffectiveTo == null || r.EffectiveTo >= DateTime.UtcNow);

        if (parentType == LimitType.GeneralForZone && parentZoneId.HasValue)
        {
            parentQuery = parentQuery.Where(r => r.ZoneId == parentZoneId.Value);
        }
        else if (parentType == LimitType.GeneralForBettingPool && bettingPoolId.HasValue)
        {
            parentQuery = parentQuery.Where(r => r.BettingPoolId == bettingPoolId.Value);
        }

        var parentRule = await parentQuery.FirstOrDefaultAsync();
        if (parentRule == null) return null;

        var amounts = await _context.LimitRuleAmounts
            .AsNoTracking()
            .Where(a => a.LimitRuleId == parentRule.LimitRuleId)
            .ToListAsync();

        return amounts.ToDictionary(a => a.GameTypeId, a => a.MaxAmount);
    }

    private static string GetParentTypeName(LimitType childType)
    {
        return childType switch
        {
            LimitType.GeneralForZone => "Limite Global",
            LimitType.GeneralForBettingPool => "Limite Zona",
            LimitType.LocalForBettingPool => "Limite Global",
            LimitType.ByNumberForGroup => "Limite Global",
            LimitType.ByNumberForZone => "Limite Zona",
            LimitType.ByNumberForBettingPool => "Limite Banca",
            _ => "Limite Superior"
        };
    }

    private record TargetEntity(int Id, int? ZoneId = null);

    private async Task<List<TargetEntity>> ResolveTargetEntities(CreateLimitDto dto, LimitType limitType)
    {
        switch (limitType)
        {
            case LimitType.GeneralForGroup:
            case LimitType.ByNumberForGroup:
                return new List<TargetEntity> { new(0) }; // Single global rule

            case LimitType.GeneralForZone:
            case LimitType.ByNumberForZone:
            {
                var zoneIds = dto.ZoneIds ?? (dto.ZoneId.HasValue ? new List<int> { dto.ZoneId.Value } : new List<int>());
                return zoneIds.Select(z => new TargetEntity(z)).ToList();
            }

            case LimitType.GeneralForBettingPool:
            case LimitType.LocalForBettingPool:
            case LimitType.ByNumberForBettingPool:
            {
                var mode = dto.BancaSelectionMode ?? "specific";
                switch (mode)
                {
                    case "all":
                        return await _context.BettingPools
                            .Where(bp => bp.IsActive && bp.DeletedAt == null)
                            .Select(bp => new TargetEntity(bp.BettingPoolId, bp.ZoneId))
                            .ToListAsync();

                    case "byZone":
                        var zoneIds = dto.BancaZoneIds ?? new List<int>();
                        return await _context.BettingPools
                            .Where(bp => bp.IsActive && bp.DeletedAt == null && zoneIds.Contains(bp.ZoneId))
                            .Select(bp => new TargetEntity(bp.BettingPoolId, bp.ZoneId))
                            .ToListAsync();

                    default: // "specific"
                        var bpIds = dto.BettingPoolIds ?? (dto.BettingPoolId.HasValue ? new List<int> { dto.BettingPoolId.Value } : new List<int>());
                        return await _context.BettingPools
                            .Where(bp => bpIds.Contains(bp.BettingPoolId))
                            .Select(bp => new TargetEntity(bp.BettingPoolId, bp.ZoneId))
                            .ToListAsync();
                }
            }

            default:
                return new List<TargetEntity> { new(0) };
        }
    }

    private async Task<List<LimitViolationDto>> ValidateParentAmounts(
        LimitType limitType, List<int> drawIds, List<TargetEntity> entities, Dictionary<string, decimal> amounts)
    {
        var violations = new List<LimitViolationDto>();
        if (limitType == LimitType.GeneralForGroup) return violations;

        var drawId = drawIds.FirstOrDefault();
        if (drawId == 0) return violations;

        // Build code -> id map
        var gameTypes = await _context.GameTypes.AsNoTracking()
            .Where(gt => gt.IsActive)
            .Select(gt => new { gt.GameTypeId, gt.GameTypeCode, gt.GameName })
            .ToListAsync();
        var codeToId = gameTypes.ToDictionary(gt => gt.GameTypeCode, gt => gt.GameTypeId, StringComparer.OrdinalIgnoreCase);
        var idToName = gameTypes.ToDictionary(gt => gt.GameTypeId, gt => gt.GameName);

        int? sampleZoneId = entities.FirstOrDefault()?.ZoneId;
        int? sampleBpId = entities.FirstOrDefault()?.Id;

        var parentAmounts = await GetParentAmountsByGameTypeId(limitType, drawId,
            sampleZoneId, sampleBpId > 0 ? sampleBpId : null);

        if (parentAmounts == null) return violations;

        foreach (var (feKey, childAmount) in amounts)
        {
            var gtId = ResolveFrontendKeyToGameTypeId(feKey, codeToId);
            if (gtId == null) continue;

            if (parentAmounts.TryGetValue(gtId.Value, out var parentAmount) && childAmount > parentAmount)
            {
                violations.Add(new LimitViolationDto
                {
                    GameType = idToName.GetValueOrDefault(gtId.Value, feKey),
                    ChildAmount = childAmount,
                    ParentAmount = parentAmount,
                    ParentType = GetParentTypeName(limitType)
                });
            }
        }

        return violations;
    }

    private async Task PopulateAmountsAsync(List<LimitRuleDto> dtos)
    {
        var ids = dtos.Select(d => d.LimitRuleId).ToList();
        if (ids.Count == 0) return;

        var amounts = await _context.LimitRuleAmounts
            .AsNoTracking()
            .Where(a => ids.Contains(a.LimitRuleId))
            .Include(a => a.GameType)
            .ToListAsync();

        var grouped = amounts.GroupBy(a => a.LimitRuleId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(a => new LimitAmountDto
                {
                    GameTypeId = a.GameTypeId,
                    GameTypeName = a.GameType?.GameName ?? $"GameType#{a.GameTypeId}",
                    Amount = a.MaxAmount
                }).ToList());

        foreach (var dto in dtos)
        {
            if (grouped.TryGetValue(dto.LimitRuleId, out var amts) && amts.Count > 0)
                dto.Amounts = amts;
        }
    }

    private async Task PopulateAmountsAsync(LimitRuleDto? dto)
    {
        if (dto == null) return;
        await PopulateAmountsAsync(new List<LimitRuleDto> { dto });
    }

    private LimitRule CreateLimitRuleFromDto(CreateLimitDto dto, int? daysOfWeek, int? drawId)
    {
        // Generate default name if not provided
        var ruleName = dto.RuleName;
        if (string.IsNullOrWhiteSpace(ruleName))
        {
            var limitTypeName = LimitTypeNames.GetValueOrDefault((LimitType)dto.LimitType, "Límite");
            ruleName = $"{limitTypeName} - {DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        return new LimitRule
        {
            RuleName = ruleName,
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

    // ==================== LIMIT DEFAULTS ====================

    /// <summary>
    /// Get limit defaults for zona and banca.
    /// </summary>
    [HttpGet("defaults")]
    public async Task<ActionResult> GetLimitDefaults()
    {
        var defaults = await _context.LimitDefaults
            .AsNoTracking()
            .Include(d => d.GameType)
            .OrderBy(d => d.DefaultType)
            .ThenBy(d => d.GameTypeId)
            .ToListAsync();

        var result = defaults.Select(d => new
        {
            d.LimitDefaultId,
            d.DefaultType,
            d.GameTypeId,
            gameTypeName = d.GameType?.GameName ?? "",
            d.MaxAmount,
            d.UpdatedAt
        });

        return Ok(result);
    }

    /// <summary>
    /// Update limit defaults. Requires MANAGE_LIMIT_DEFAULTS permission.
    /// </summary>
    [HttpPut("defaults")]
    public async Task<ActionResult> UpdateLimitDefaults([FromBody] UpdateLimitDefaultsDto dto)
    {
        // Permission check
        var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var userId))
        {
            var hasPermission = await _context.UserPermissions
                .AnyAsync(up => up.UserId == userId && up.IsActive &&
                    up.Permission != null && up.Permission.PermissionCode == "MANAGE_LIMIT_DEFAULTS");
            if (!hasPermission)
                return Forbid();
        }

        foreach (var item in dto.Defaults)
        {
            var existing = await _context.LimitDefaults
                .FirstOrDefaultAsync(d => d.DefaultType == item.DefaultType && d.GameTypeId == item.GameTypeId);

            if (existing != null)
            {
                existing.MaxAmount = item.MaxAmount;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.LimitDefaults.Add(new LimitDefault
                {
                    DefaultType = item.DefaultType,
                    GameTypeId = item.GameTypeId,
                    MaxAmount = item.MaxAmount,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Valores por defecto actualizados" });
    }
}

public class UpdateLimitDefaultsDto
{
    public List<LimitDefaultItemDto> Defaults { get; set; } = new();
}

public class LimitDefaultItemDto
{
    public string DefaultType { get; set; } = string.Empty;
    public int GameTypeId { get; set; }
    public decimal MaxAmount { get; set; }
}
