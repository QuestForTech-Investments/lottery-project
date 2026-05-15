using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Services;
using LotteryApi.Services.Caida;
using System.Security.Claims;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/transaction-groups")]
public class TransactionGroupsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<TransactionGroupsController> _logger;
    private readonly ICaidaCalculationService _caidaService;
    private readonly IZoneScopeService _zoneScope;

    public TransactionGroupsController(LotteryDbContext context, ILogger<TransactionGroupsController> logger, ICaidaCalculationService caidaService, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _caidaService = caidaService;
        _zoneScope = zoneScope;
    }

    /// <summary>Returns true if the current user holds the given permission code.</summary>
    private async Task<bool> HasPermissionCodeAsync(string code)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    /// <summary>
    /// Map a transaction-line type (Pago/Cobro/Ajuste/Retiro) to the permission needed to create it.
    /// </summary>
    private static string PermissionForTransactionType(string transactionType) => transactionType?.Trim().ToUpperInvariant() switch
    {
        "PAGO" => "CREATE_PAYMENTS",
        "COBRO" => "CREATE_COLLECTIONS",
        "AJUSTE" => "CREATE_ADJUSTMENTS",
        "RETIRO" => "CREATE_WITHDRAWALS",
        _ => "MANAGE_TRANSACTIONS"
    };

    [HttpGet]
    public async Task<ActionResult<List<TransactionGroupDto>>> GetGroups(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] string? search = null,
        [FromQuery] int? tzOffset = null)
    {
        if (!await HasPermissionCodeAsync("VIEW_ALL_TRANSACTION_GROUPS")) return Forbid();
        try
        {
            var query = _context.TransactionGroups
                .AsNoTracking()
                .AsQueryable();

            // Zone scope — only groups for the admin's assigned zones.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                query = query.Where(g => g.ZoneId.HasValue && allowedZones.Contains(g.ZoneId.Value));
            }

            var offset = TimeSpan.FromMinutes(tzOffset ?? 0);

            if (DateTime.TryParse(startDate, out var start))
            {
                var startUtc = start.Date.Add(offset);
                query = query.Where(g => g.CreatedAt >= startUtc);
            }

            if (DateTime.TryParse(endDate, out var end))
            {
                var endUtc = end.Date.AddDays(1).Add(offset);
                query = query.Where(g => g.CreatedAt < endUtc);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(g =>
                    g.GroupNumber.Contains(search) ||
                    (g.Notes != null && g.Notes.Contains(search)));
            }

            var results = await query
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new TransactionGroupDto
                {
                    GroupId = g.GroupId,
                    GroupNumber = g.GroupNumber,
                    ZoneId = g.ZoneId,
                    ZoneName = g.Zone != null ? g.Zone.ZoneName : null,
                    Notes = g.Notes,
                    IsAutomatic = g.IsAutomatic,
                    Status = g.Status,
                    CreatedAt = g.CreatedAt,
                    CreatedBy = g.CreatedBy,
                    CreatedByName = g.CreatedByUser != null ? g.CreatedByUser.Username : null,
                    Entities = string.Join(", ", g.Lines.Select(l => l.Entity1Code).Distinct()),
                    ApprovedBy = g.ApprovedBy,
                    ApprovedByName = g.ApprovedByUser != null ? g.ApprovedByUser.Username : null,
                    ApprovedAt = g.ApprovedAt,
                    RejectionReason = g.RejectionReason
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction groups");
            return StatusCode(500, new { error = "Error al obtener grupos de transacciones" });
        }
    }

    [HttpGet("pending-approvals")]
    public async Task<ActionResult<List<TransactionGroupDto>>> GetPendingApprovals(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] int? tzOffset = null)
    {
        if (!await HasPermissionCodeAsync("TRANSACTION_APPROVE")) return Forbid();
        try
        {
            var query = _context.TransactionGroups
                .AsNoTracking()
                .Where(g => g.Status == "PendienteAprobacion" || g.Status == "PendienteEliminacion");

            // Zone scope.
            var allowedZonesP = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZonesP != null)
            {
                query = query.Where(g => g.ZoneId.HasValue && allowedZonesP.Contains(g.ZoneId.Value));
            }

            var offset = TimeSpan.FromMinutes(tzOffset ?? 0);

            if (DateTime.TryParse(startDate, out var start))
            {
                var startUtc = start.Date.Add(offset);
                query = query.Where(g => g.CreatedAt >= startUtc);
            }

            if (DateTime.TryParse(endDate, out var end))
            {
                var endUtc = end.Date.AddDays(1).Add(offset);
                query = query.Where(g => g.CreatedAt < endUtc);
            }

            var results = await query
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new TransactionGroupDto
                {
                    GroupId = g.GroupId,
                    GroupNumber = g.GroupNumber,
                    ZoneId = g.ZoneId,
                    ZoneName = g.Zone != null ? g.Zone.ZoneName : null,
                    Notes = g.Notes,
                    IsAutomatic = g.IsAutomatic,
                    Status = g.Status,
                    CreatedAt = g.CreatedAt,
                    CreatedBy = g.CreatedBy,
                    CreatedByName = g.CreatedByUser != null ? g.CreatedByUser.Username : null,
                    Entities = string.Join(", ", g.Lines.Select(l => l.Entity1Code).Distinct()),
                    Lines = g.Lines.Select(l => new TransactionGroupLineDto
                    {
                        LineId = l.LineId,
                        TransactionType = l.TransactionType,
                        Entity1Type = l.Entity1Type,
                        Entity1Id = l.Entity1Id,
                        Entity1Name = l.Entity1Name,
                        Entity1Code = l.Entity1Code,
                        Entity1InitialBalance = l.Entity1InitialBalance,
                        Entity1FinalBalance = l.Entity1FinalBalance,
                        Entity2Type = l.Entity2Type,
                        Entity2Id = l.Entity2Id,
                        Entity2Name = l.Entity2Name,
                        Entity2Code = l.Entity2Code,
                        Entity2InitialBalance = l.Entity2InitialBalance,
                        Entity2FinalBalance = l.Entity2FinalBalance,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        ExpenseCategory = l.ExpenseCategory,
                        Notes = l.Notes,
                        ShowInBanca = l.ShowInBanca
                    }).ToList()
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending approvals");
            return StatusCode(500, new { error = "Error al obtener aprobaciones pendientes" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionGroupDto>> GetGroup(int id)
    {
        if (!await HasPermissionCodeAsync("VIEW_ALL_TRANSACTION_GROUPS")
            && !await HasPermissionCodeAsync("MANAGE_TRANSACTIONS"))
        {
            return Forbid();
        }
        try
        {
            var group = await _context.TransactionGroups
                .AsNoTracking()
                .Where(g => g.GroupId == id)
                .Select(g => new TransactionGroupDto
                {
                    GroupId = g.GroupId,
                    GroupNumber = g.GroupNumber,
                    ZoneId = g.ZoneId,
                    ZoneName = g.Zone != null ? g.Zone.ZoneName : null,
                    Notes = g.Notes,
                    IsAutomatic = g.IsAutomatic,
                    Status = g.Status,
                    CreatedAt = g.CreatedAt,
                    CreatedBy = g.CreatedBy,
                    CreatedByName = g.CreatedByUser != null ? g.CreatedByUser.Username : null,
                    ApprovedBy = g.ApprovedBy,
                    ApprovedByName = g.ApprovedByUser != null ? g.ApprovedByUser.Username : null,
                    ApprovedAt = g.ApprovedAt,
                    RejectionReason = g.RejectionReason,
                    Lines = g.Lines.Select(l => new TransactionGroupLineDto
                    {
                        LineId = l.LineId,
                        TransactionType = l.TransactionType,
                        Entity1Type = l.Entity1Type,
                        Entity1Id = l.Entity1Id,
                        Entity1Name = l.Entity1Name,
                        Entity1Code = l.Entity1Code,
                        Entity1InitialBalance = l.Entity1InitialBalance,
                        Entity1FinalBalance = l.Entity1FinalBalance,
                        Entity2Type = l.Entity2Type,
                        Entity2Id = l.Entity2Id,
                        Entity2Name = l.Entity2Name,
                        Entity2Code = l.Entity2Code,
                        Entity2InitialBalance = l.Entity2InitialBalance,
                        Entity2FinalBalance = l.Entity2FinalBalance,
                        Debit = l.Debit,
                        Credit = l.Credit,
                        ExpenseCategory = l.ExpenseCategory,
                        Notes = l.Notes,
                        ShowInBanca = l.ShowInBanca
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (group == null)
                return NotFound(new { message = "Grupo de transacciones no encontrado" });

            return Ok(group);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction group {Id}", id);
            return StatusCode(500, new { error = "Error al obtener grupo de transacciones" });
        }
    }

    [HttpGet("lines/filter-options")]
    public async Task<ActionResult> GetLineFilterOptions()
    {
        try
        {
            var entityTypes = await _context.TransactionGroupLines
                .AsNoTracking()
                .Select(l => l.Entity1Type)
                .Union(_context.TransactionGroupLines.Where(l => l.Entity2Type != null).Select(l => l.Entity2Type!))
                .Distinct()
                .OrderBy(t => t)
                .ToListAsync();

            var transactionTypes = await _context.TransactionGroupLines
                .AsNoTracking()
                .Select(l => l.TransactionType)
                .Distinct()
                .OrderBy(t => t)
                .ToListAsync();

            var createdByUsers = await _context.TransactionGroups
                .AsNoTracking()
                .Where(g => g.CreatedByUser != null)
                .Select(g => g.CreatedByUser!.Username)
                .Distinct()
                .OrderBy(u => u)
                .ToListAsync();

            return Ok(new { entityTypes, transactionTypes, createdByUsers });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting filter options");
            return StatusCode(500, new { error = "Error al obtener opciones de filtro" });
        }
    }

    [HttpGet("lines/entities")]
    public async Task<ActionResult> GetEntitiesByType([FromQuery] string entityType)
    {
        try
        {
            var entity1s = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity1Type == entityType)
                .Select(l => new { name = l.Entity1Name, code = l.Entity1Code, id = l.Entity1Id })
                .Distinct()
                .ToListAsync();

            var entity2s = await _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Entity2Type == entityType)
                .Select(l => new { name = l.Entity2Name!, code = l.Entity2Code!, id = l.Entity2Id!.Value })
                .Distinct()
                .ToListAsync();

            var all = entity1s.Union(entity2s)
                .GroupBy(e => e.id)
                .Select(g => g.First())
                .OrderBy(e => e.name)
                .ToList();

            // For bettingPool entities, enrich with current reference from DB
            if (entityType == "bettingPool")
            {
                var bpIds = all.Select(e => e.id).ToList();
                var references = await _context.BettingPools
                    .AsNoTracking()
                    .Where(bp => bpIds.Contains(bp.BettingPoolId))
                    .Select(bp => new { bp.BettingPoolId, bp.BettingPoolCode, bp.Reference })
                    .ToListAsync();

                var refMap = references.ToDictionary(r => r.BettingPoolId);
                var enriched = all.Select(e =>
                {
                    var code = refMap.TryGetValue(e.id, out var bp)
                        ? (string.IsNullOrEmpty(bp.Reference) ? bp.BettingPoolCode : $"{bp.BettingPoolCode} ({bp.Reference})")
                        : e.code;
                    return new { e.name, code, e.id };
                }).ToList();

                return Ok(enriched);
            }

            return Ok(all);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting entities by type");
            return StatusCode(500, new { error = "Error al obtener entidades" });
        }
    }

    [HttpGet("lines")]
    public async Task<ActionResult<List<TransactionLineReportDto>>> GetLines(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? transactionType = null,
        [FromQuery] string? entityName = null,
        [FromQuery] string? createdBy = null,
        [FromQuery] int? limit = null,
        [FromQuery] int? tzOffset = null)
    {
        if (!await HasPermissionCodeAsync("MANAGE_TRANSACTIONS")) return Forbid();
        try
        {
            var query = _context.TransactionGroupLines
                .AsNoTracking()
                .Include(l => l.Group)
                    .ThenInclude(g => g!.CreatedByUser)
                .Where(l => l.Group!.Status != "Eliminado" && l.Group!.Status != "Rechazado")
                .AsQueryable();

            var offset = TimeSpan.FromMinutes(tzOffset ?? 0);

            if (DateTime.TryParse(startDate, out var start))
            {
                var startUtc = start.Date.Add(offset);
                query = query.Where(l => l.Group!.CreatedAt >= startUtc);
            }

            if (DateTime.TryParse(endDate, out var end))
            {
                var endUtc = end.Date.AddDays(1).Add(offset);
                query = query.Where(l => l.Group!.CreatedAt < endUtc);
            }

            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(l =>
                    l.Entity1Type == entityType ||
                    (l.Entity2Type != null && l.Entity2Type == entityType));
            }

            if (!string.IsNullOrWhiteSpace(transactionType))
            {
                query = query.Where(l => l.TransactionType == transactionType);
            }

            if (!string.IsNullOrWhiteSpace(entityName))
            {
                query = query.Where(l =>
                    l.Entity1Name.Contains(entityName) ||
                    (l.Entity2Name != null && l.Entity2Name.Contains(entityName)));
            }

            if (!string.IsNullOrWhiteSpace(createdBy))
            {
                query = query.Where(l => l.Group!.CreatedByUser != null && l.Group.CreatedByUser.Username.Contains(createdBy));
            }

            var ordered = query
                .OrderByDescending(l => l.Group!.CreatedAt)
                .ThenBy(l => l.LineId);

            // Apply limit (default 10 when no filters provided)
            var hasFilters = startDate != null || endDate != null ||
                !string.IsNullOrWhiteSpace(entityType) ||
                !string.IsNullOrWhiteSpace(transactionType) ||
                !string.IsNullOrWhiteSpace(entityName) ||
                !string.IsNullOrWhiteSpace(createdBy);
            var take = limit ?? (hasFilters ? 500 : 10);

            var results = await ordered
                .Take(take)
                .Select(l => new TransactionLineReportDto
                {
                    LineId = l.LineId,
                    GroupId = l.GroupId,
                    GroupNumber = l.Group!.GroupNumber,
                    TransactionType = l.TransactionType,
                    CreatedAt = l.Group.CreatedAt,
                    CreatedByName = l.Group.CreatedByUser != null ? l.Group.CreatedByUser.Username : null,
                    Entity1Name = l.Entity1Name,
                    Entity1Code = l.Entity1Code,
                    Entity2Name = l.Entity2Name,
                    Entity2Code = l.Entity2Code,
                    Entity1InitialBalance = l.Entity1InitialBalance,
                    Entity2InitialBalance = l.Entity2InitialBalance,
                    Debit = l.Debit,
                    Credit = l.Credit,
                    Entity1FinalBalance = l.Entity1FinalBalance,
                    Entity2FinalBalance = l.Entity2FinalBalance,
                    Notes = l.Notes
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction lines report");
            return StatusCode(500, new { error = "Error al obtener reporte de transacciones" });
        }
    }

    /// <summary>
    /// Get transaction lines for a specific betting pool on a specific day (business timezone).
    /// Returns lines where the banca is either entity1 or entity2.
    /// </summary>
    [HttpGet("by-betting-pool")]
    public async Task<ActionResult<List<TransactionLineReportDto>>> GetByBettingPool(
        [FromQuery] int bettingPoolId,
        [FromQuery] DateTime? date = null)
    {
        if (!await HasPermissionCodeAsync("MANAGE_TRANSACTIONS")) return Forbid();
        try
        {
            if (bettingPoolId <= 0)
            {
                return BadRequest(new { error = "bettingPoolId es requerido" });
            }

            var targetDate = (date ?? Helpers.DateTimeHelper.TodayInBusinessTimezone()).Date;
            var utcStart = Helpers.DateTimeHelper.GetUtcStartOfDay(targetDate);
            var utcEnd = Helpers.DateTimeHelper.GetUtcEndOfDay(targetDate);

            var results = await _context.TransactionGroupLines
                .AsNoTracking()
                .Include(l => l.Group)
                    .ThenInclude(g => g!.CreatedByUser)
                .Where(l => l.Group!.Status != "Eliminado" && l.Group!.Status != "Rechazado")
                .Where(l => l.Group!.CreatedAt >= utcStart && l.Group!.CreatedAt < utcEnd)
                .Where(l =>
                    (l.Entity1Type == "bettingPool" && l.Entity1Id == bettingPoolId) ||
                    (l.Entity2Type == "bettingPool" && l.Entity2Id == bettingPoolId))
                .OrderByDescending(l => l.Group!.CreatedAt)
                .ThenBy(l => l.LineId)
                .Select(l => new TransactionLineReportDto
                {
                    LineId = l.LineId,
                    GroupId = l.GroupId,
                    GroupNumber = l.Group!.GroupNumber,
                    TransactionType = l.TransactionType,
                    CreatedAt = l.Group.CreatedAt,
                    CreatedByName = l.Group.CreatedByUser != null ? l.Group.CreatedByUser.Username : null,
                    Entity1Name = l.Entity1Name,
                    Entity1Code = l.Entity1Code,
                    Entity2Name = l.Entity2Name,
                    Entity2Code = l.Entity2Code,
                    Entity1InitialBalance = l.Entity1InitialBalance,
                    Entity2InitialBalance = l.Entity2InitialBalance,
                    Debit = l.Debit,
                    Credit = l.Credit,
                    Entity1FinalBalance = l.Entity1FinalBalance,
                    Entity2FinalBalance = l.Entity2FinalBalance,
                    Notes = l.Notes
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transactions by betting pool");
            return StatusCode(500, new { error = "Error al obtener transacciones por banca" });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryResponseDto>> GetSummary(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] string? zoneIds = null,
        [FromQuery] int? bettingPoolId = null,
        [FromQuery] int? tzOffset = null)
    {
        if (!await HasPermissionCodeAsync("MANAGE_TRANSACTIONS")) return Forbid();
        try
        {
            var offset = TimeSpan.FromMinutes(tzOffset ?? 0);

            // Parse zone IDs
            var zoneIdList = new List<int>();
            if (!string.IsNullOrWhiteSpace(zoneIds))
            {
                zoneIdList = zoneIds.Split(',')
                    .Select(s => int.TryParse(s.Trim(), out var id) ? id : 0)
                    .Where(id => id > 0)
                    .ToList();
            }

            // --- 1. Aggregate transaction lines (Cobros/Pagos) per BettingPool ---
            var txQuery = _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Group!.Status == "Aprobado" || l.Group!.Status == "Eliminado")
                .Where(l => l.Entity1Type == "bettingPool")
                .Where(l => l.TransactionType == "Cobro" || l.TransactionType == "Pago");

            if (DateTime.TryParse(startDate, out var txStart))
            {
                var startUtc = txStart.Date.Add(offset);
                txQuery = txQuery.Where(l => l.Group!.CreatedAt >= startUtc);
            }
            if (DateTime.TryParse(endDate, out var txEnd))
            {
                var endUtc = txEnd.Date.AddDays(1).Add(offset);
                txQuery = txQuery.Where(l => l.Group!.CreatedAt < endUtc);
            }

            if (bettingPoolId.HasValue)
            {
                txQuery = txQuery.Where(l => l.Entity1Id == bettingPoolId.Value);
            }
            else if (zoneIdList.Count > 0)
            {
                txQuery = txQuery.Where(l =>
                    _context.BettingPools.Any(bp => bp.BettingPoolId == l.Entity1Id && zoneIdList.Contains(bp.ZoneId)));
            }

            var txData = await txQuery
                .GroupBy(l => l.Entity1Id)
                .Select(g => new
                {
                    BettingPoolId = g.Key,
                    Collections = g.Where(l => l.TransactionType == "Cobro").Sum(l => l.Credit),
                    Payments = g.Where(l => l.TransactionType == "Pago").Sum(l => l.Debit)
                })
                .ToListAsync();

            var txMap = txData.ToDictionary(t => t.BettingPoolId);

            // --- 2. Aggregate ticket sales (Resultados de Sorteo) per BettingPool ---
            var ticketQuery = _context.Tickets
                .AsNoTracking()
                .Where(t => !t.IsCancelled);

            if (DateTime.TryParse(startDate, out var saleStart))
            {
                var startUtc = saleStart.Date.Add(offset);
                ticketQuery = ticketQuery.Where(t => t.CreatedAt >= startUtc);
            }
            if (DateTime.TryParse(endDate, out var saleEnd))
            {
                var endUtc = saleEnd.Date.AddDays(1).Add(offset);
                ticketQuery = ticketQuery.Where(t => t.CreatedAt < endUtc);
            }

            if (bettingPoolId.HasValue)
            {
                ticketQuery = ticketQuery.Where(t => t.BettingPoolId == bettingPoolId.Value);
            }
            else if (zoneIdList.Count > 0)
            {
                ticketQuery = ticketQuery.Where(t =>
                    _context.BettingPools.Any(bp => bp.BettingPoolId == t.BettingPoolId && zoneIdList.Contains(bp.ZoneId)));
            }

            var salesData = await ticketQuery
                .GroupBy(t => t.BettingPoolId)
                .Select(g => new
                {
                    BettingPoolId = g.Key,
                    TotalSold = g.Sum(t => t.GrandTotal),
                    TotalPrizes = g.Sum(t => t.TotalPrize)
                })
                .ToListAsync();

            var salesMap = salesData.ToDictionary(s => s.BettingPoolId);

            // --- 3. Get all relevant betting pool IDs and pool info ---
            var allBpIds = txMap.Keys.Union(salesMap.Keys).ToList();
            // When filtering by single BP, always include it even if no data
            if (bettingPoolId.HasValue && !allBpIds.Contains(bettingPoolId.Value))
                allBpIds.Add(bettingPoolId.Value);

            var bpInfo = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => allBpIds.Contains(bp.BettingPoolId))
                .Select(bp => new
                {
                    bp.BettingPoolId,
                    bp.BettingPoolCode,
                    bp.BettingPoolName,
                    ZoneName = bp.Zone != null ? bp.Zone.ZoneName : ""
                })
                .ToListAsync();

            // --- 3b. Pre-compute real-time caída per banca (correct period per fall type) ---
            var bpIds = bpInfo.Select(bp => bp.BettingPoolId).ToList();
            var txTargetDate = Helpers.DateTimeHelper.TodayInBusinessTimezone();
            var txCaidaValues = new Dictionary<int, (decimal fall, decimal accumulatedFall)>();
            foreach (var bpId in bpIds)
            {
                var (f, a) = await _caidaService.GetRealtimeCaidaAsync(bpId, txTargetDate);
                if (f != 0 || a != 0)
                    txCaidaValues[bpId] = (f, a);
            }

            // --- 4. Build summary items ---
            var items = bpInfo
                .Select(bp =>
                {
                    var hasTx = txMap.TryGetValue(bp.BettingPoolId, out var tx);
                    var hasSales = salesMap.TryGetValue(bp.BettingPoolId, out var sales);

                    var collections = hasTx ? tx!.Collections : 0m;
                    var payments = hasTx ? tx!.Payments : 0m;
                    var drawDebit = hasSales ? sales!.TotalSold : 0m;
                    var drawCredit = hasSales ? sales!.TotalPrizes : 0m;
                    var drawNet = drawDebit - drawCredit;

                    txCaidaValues.TryGetValue(bp.BettingPoolId, out var caida);

                    return new TransactionSummaryItemDto
                    {
                        Code = bp.BettingPoolCode,
                        BettingPoolName = bp.BettingPoolName,
                        ZoneName = bp.ZoneName,
                        Collections = collections,
                        Payments = payments,
                        CashFlowNet = collections - payments,
                        DrawDebit = drawDebit,
                        DrawCredit = drawCredit,
                        DrawNet = drawNet,
                        Fall = caida.fall,
                        AccumulatedFall = caida.accumulatedFall
                    };
                })
                .OrderBy(i => i.Code)
                .ToList();

            // --- 5. Other transactions (Ajustes, Retiros) ---
            var otherQuery = _context.TransactionGroupLines
                .AsNoTracking()
                .Where(l => l.Group!.Status == "Aprobado" || l.Group!.Status == "Eliminado")
                .Where(l => l.TransactionType == "Ajuste" || l.TransactionType == "Retiro");

            if (DateTime.TryParse(startDate, out var otherStart))
            {
                var startUtc = otherStart.Date.Add(offset);
                otherQuery = otherQuery.Where(l => l.Group!.CreatedAt >= startUtc);
            }
            if (DateTime.TryParse(endDate, out var otherEnd))
            {
                var endUtc = otherEnd.Date.AddDays(1).Add(offset);
                otherQuery = otherQuery.Where(l => l.Group!.CreatedAt < endUtc);
            }

            if (bettingPoolId.HasValue)
            {
                otherQuery = otherQuery.Where(l =>
                    (l.Entity1Type == "bettingPool" && l.Entity1Id == bettingPoolId.Value) ||
                    (l.Entity2Type == "bettingPool" && l.Entity2Id == bettingPoolId.Value));
            }
            else if (zoneIdList.Count > 0)
            {
                otherQuery = otherQuery.Where(l =>
                    (l.Entity1Type == "bettingPool" && _context.BettingPools.Any(bp => bp.BettingPoolId == l.Entity1Id && zoneIdList.Contains(bp.ZoneId))) ||
                    (l.Entity2Type == "bettingPool" && l.Entity2Id.HasValue && _context.BettingPools.Any(bp => bp.BettingPoolId == l.Entity2Id.Value && zoneIdList.Contains(bp.ZoneId))));
            }

            var otherData = await otherQuery
                .GroupBy(l => 1)
                .Select(g => new OtherTransactionsSummaryDto
                {
                    CashWithdrawals = g.Where(l => l.TransactionType == "Retiro").Sum(l => l.Credit),
                    Debit = g.Sum(l => l.Debit),
                    Credit = g.Sum(l => l.Credit)
                })
                .FirstOrDefaultAsync() ?? new OtherTransactionsSummaryDto();

            return Ok(new TransactionSummaryResponseDto
            {
                Items = items,
                OtherTransactions = otherData
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transaction summary");
            return StatusCode(500, new { error = "Error al obtener resumen de transacciones" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TransactionGroupDto>> CreateGroup([FromBody] CreateTransactionGroupDto dto)
    {
        // Zone scope — admin can only create transaction groups for their assigned zones.
        if (dto.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(dto.ZoneId.Value)) return Forbid();

        // Per-line permission gating: every transaction type in the group must be
        // creatable by the current user. (Pago→CREATE_PAYMENTS, Cobro→CREATE_COLLECTIONS, etc.)
        if (dto.Lines != null && dto.Lines.Count > 0)
        {
            var requiredPerms = dto.Lines
                .Select(l => PermissionForTransactionType(l.TransactionType))
                .Distinct()
                .ToList();
            foreach (var perm in requiredPerms)
            {
                if (!await HasPermissionCodeAsync(perm)) return Forbid();
            }
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get current user
            var userId = GetCurrentUserId();

            // Check if user has auto-approve permission
            var hasAutoApprove = userId.HasValue && await HasPermission(userId.Value, "TRANSACTION_AUTO_APPROVE");

            // Generate group number
            var lastGroup = await _context.TransactionGroups
                .OrderByDescending(g => g.GroupId)
                .FirstOrDefaultAsync();
            var nextNumber = (lastGroup?.GroupId ?? 0) + 1;
            var groupNumber = $"TG-{nextNumber:D4}";

            var group = new TransactionGroup
            {
                GroupNumber = groupNumber,
                ZoneId = dto.ZoneId,
                Notes = dto.Notes,
                IsAutomatic = false,
                Status = hasAutoApprove ? "Aprobado" : "PendienteAprobacion",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId,
                ApprovedBy = hasAutoApprove ? userId : null,
                ApprovedAt = hasAutoApprove ? DateTime.UtcNow : null
            };

            _context.TransactionGroups.Add(group);
            await _context.SaveChangesAsync();

            // Process each line
            foreach (var lineDto in dto.Lines)
            {
                var line = new TransactionGroupLine
                {
                    GroupId = group.GroupId,
                    TransactionType = lineDto.TransactionType,
                    Entity1Type = lineDto.Entity1Type,
                    Entity1Id = lineDto.Entity1Id,
                    Entity1Name = lineDto.Entity1Name,
                    Entity1Code = lineDto.Entity1Code,
                    Entity1InitialBalance = lineDto.Entity1InitialBalance,
                    Entity1FinalBalance = lineDto.Entity1FinalBalance,
                    Entity2Type = lineDto.Entity2Type,
                    Entity2Id = lineDto.Entity2Id,
                    Entity2Name = lineDto.Entity2Name,
                    Entity2Code = lineDto.Entity2Code,
                    Entity2InitialBalance = lineDto.Entity2InitialBalance,
                    Entity2FinalBalance = lineDto.Entity2FinalBalance,
                    Debit = lineDto.Debit,
                    Credit = lineDto.Credit,
                    ExpenseCategory = lineDto.ExpenseCategory,
                    Notes = lineDto.Notes,
                    ShowInBanca = lineDto.ShowInBanca,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TransactionGroupLines.Add(line);

                // Only apply balances if auto-approved
                if (hasAutoApprove)
                {
                    // Entity1: +debit -credit
                    var entity1Delta = lineDto.Debit - lineDto.Credit;
                    await UpdateEntityBalance(lineDto.Entity1Type, lineDto.Entity1Id, entity1Delta);

                    // Entity2: -debit +credit
                    if (lineDto.Entity2Id.HasValue && !string.IsNullOrEmpty(lineDto.Entity2Type))
                    {
                        var entity2Delta = lineDto.Credit - lineDto.Debit;
                        await UpdateEntityBalance(lineDto.Entity2Type, lineDto.Entity2Id.Value, entity2Delta);
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Process COBRO caída for auto-approved cobros
            if (hasAutoApprove)
            {
                await ProcessCobroCaidaForLinesAsync(dto.Lines, userId);
            }

            var result = new TransactionGroupDto
            {
                GroupId = group.GroupId,
                GroupNumber = group.GroupNumber,
                ZoneId = group.ZoneId,
                Notes = group.Notes,
                IsAutomatic = group.IsAutomatic,
                Status = group.Status,
                CreatedAt = group.CreatedAt,
                CreatedBy = group.CreatedBy
            };

            return CreatedAtAction(nameof(GetGroup), new { id = group.GroupId }, result);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating transaction group");
            return StatusCode(500, new { error = "Error al crear grupo de transacciones" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGroup(int id)
    {
        if (!await HasPermissionCodeAsync("MANAGE_TRANSACTIONS")) return Forbid();

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var group = await _context.TransactionGroups
                .Include(g => g.Lines)
                .FirstOrDefaultAsync(g => g.GroupId == id);

            if (group == null)
                return NotFound(new { message = "Grupo no encontrado" });

            if (group.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(group.ZoneId.Value)) return Forbid();

            if (group.Status == "Eliminado" || group.Status == "PendienteEliminacion" || group.Status == "Rechazado")
                return BadRequest(new { message = "No se puede eliminar un grupo con estado " + group.Status });

            // Get current user
            var userId = GetCurrentUserId();

            // Check auto-approve permission
            var hasAutoApprove = userId.HasValue && await HasPermission(userId.Value, "TRANSACTION_AUTO_APPROVE");

            if (group.Status == "PendienteAprobacion")
            {
                // No balances were applied, just delete directly
                group.Status = "Eliminado";
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Grupo eliminado exitosamente" });
            }

            // Group is "Aprobado" — balances are applied
            if (hasAutoApprove)
            {
                // Reverse balance changes immediately
                foreach (var line in group.Lines)
                {
                    decimal entity1Delta = line.Debit - line.Credit;
                    decimal entity2Delta = line.Credit - line.Debit;

                    await UpdateEntityBalance(line.Entity1Type, line.Entity1Id, -entity1Delta);
                    if (line.Entity2Type != null && line.Entity2Id.HasValue)
                    {
                        await UpdateEntityBalance(line.Entity2Type, line.Entity2Id.Value, -entity2Delta);
                    }
                }

                group.Status = "Eliminado";
                group.ApprovedBy = userId;
                group.ApprovedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Grupo eliminado exitosamente" });
            }
            else
            {
                // Request deletion approval
                group.Status = "PendienteEliminacion";
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Solicitud de eliminación enviada para aprobación" });
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting transaction group {Id}", id);
            return StatusCode(500, new { error = "Error al eliminar grupo de transacciones" });
        }
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult> ApproveGroup(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue || !await HasPermission(userId.Value, "TRANSACTION_APPROVE"))
                return StatusCode(403, new { message = "No tiene permiso para aprobar transacciones" });

            var group = await _context.TransactionGroups
                .Include(g => g.Lines)
                .FirstOrDefaultAsync(g => g.GroupId == id);

            if (group == null)
                return NotFound(new { message = "Grupo no encontrado" });

            if (group.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(group.ZoneId.Value)) return Forbid();

            if (group.Status == "PendienteAprobacion")
            {
                // Approve creation: recalculate current balances and apply
                foreach (var line in group.Lines)
                {
                    // Get current balance for entity1
                    var currentBalance1 = await GetCurrentEntityBalance(line.Entity1Type, line.Entity1Id);
                    line.Entity1InitialBalance = currentBalance1;
                    var entity1Delta = line.Debit - line.Credit;
                    line.Entity1FinalBalance = currentBalance1 + entity1Delta;
                    await UpdateEntityBalance(line.Entity1Type, line.Entity1Id, entity1Delta);

                    // Get current balance for entity2
                    if (line.Entity2Id.HasValue && !string.IsNullOrEmpty(line.Entity2Type))
                    {
                        var currentBalance2 = await GetCurrentEntityBalance(line.Entity2Type, line.Entity2Id.Value);
                        line.Entity2InitialBalance = currentBalance2;
                        var entity2Delta = line.Credit - line.Debit;
                        line.Entity2FinalBalance = currentBalance2 + entity2Delta;
                        await UpdateEntityBalance(line.Entity2Type, line.Entity2Id.Value, entity2Delta);
                    }
                }

                group.Status = "Aprobado";
                group.ApprovedBy = userId;
                group.ApprovedAt = DateTime.UtcNow;
                group.RejectionReason = null;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Process COBRO caída for approved cobro lines
                await ProcessCobroCaidaForApprovedGroupAsync(group, userId);

                return Ok(new { message = "Grupo aprobado exitosamente" });
            }
            else if (group.Status == "PendienteEliminacion")
            {
                // Approve deletion: reverse balances
                foreach (var line in group.Lines)
                {
                    decimal entity1Delta = line.Debit - line.Credit;
                    decimal entity2Delta = line.Credit - line.Debit;

                    await UpdateEntityBalance(line.Entity1Type, line.Entity1Id, -entity1Delta);
                    if (line.Entity2Type != null && line.Entity2Id.HasValue)
                    {
                        await UpdateEntityBalance(line.Entity2Type, line.Entity2Id.Value, -entity2Delta);
                    }
                }

                group.Status = "Eliminado";
                group.ApprovedBy = userId;
                group.ApprovedAt = DateTime.UtcNow;
                group.RejectionReason = null;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Eliminación aprobada exitosamente" });
            }
            else
            {
                return BadRequest(new { message = $"No se puede aprobar un grupo con estado '{group.Status}'" });
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error approving transaction group {Id}", id);
            return StatusCode(500, new { error = "Error al aprobar grupo de transacciones" });
        }
    }

    [HttpPut("{id}/reject")]
    public async Task<ActionResult> RejectGroup(int id, [FromBody] RejectTransactionGroupDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue || !await HasPermission(userId.Value, "TRANSACTION_APPROVE"))
                return StatusCode(403, new { message = "No tiene permiso para rechazar transacciones" });

            var group = await _context.TransactionGroups
                .FirstOrDefaultAsync(g => g.GroupId == id);

            if (group == null)
                return NotFound(new { message = "Grupo no encontrado" });

            if (group.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(group.ZoneId.Value)) return Forbid();

            if (group.Status == "PendienteAprobacion")
            {
                // Reject creation: no balance changes needed
                group.Status = "Rechazado";
                group.RejectionReason = dto.RejectionReason;
                group.ApprovedBy = userId;
                group.ApprovedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Grupo rechazado exitosamente" });
            }
            else if (group.Status == "PendienteEliminacion")
            {
                // Reject deletion: restore to Aprobado, no balance changes
                group.Status = "Aprobado";
                group.RejectionReason = dto.RejectionReason;
                group.ApprovedBy = userId;
                group.ApprovedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Solicitud de eliminación rechazada" });
            }
            else
            {
                return BadRequest(new { message = $"No se puede rechazar un grupo con estado '{group.Status}'" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting transaction group {Id}", id);
            return StatusCode(500, new { error = "Error al rechazar grupo de transacciones" });
        }
    }

    private async Task UpdateEntityBalance(string entityType, int entityId, decimal delta)
    {
        if (delta == 0) return;

        if (entityType == "bettingPool")
        {
            var balance = await _context.Balances
                .FirstOrDefaultAsync(b => b.BettingPoolId == entityId);
            if (balance != null)
            {
                balance.CurrentBalance += delta;
                balance.LastUpdated = DateTime.UtcNow;
            }
        }
        else if (entityType == "accountableEntity")
        {
            var entity = await _context.AccountableEntities
                .FirstOrDefaultAsync(e => e.EntityId == entityId);
            if (entity != null)
            {
                entity.CurrentBalance += delta;
                entity.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    private async Task<bool> HasPermission(int userId, string permissionCode)
    {
        var hasUserPerm = await _context.UserPermissions
            .AnyAsync(up => up.UserId == userId
                && up.Permission!.PermissionCode == permissionCode
                && up.IsActive);
        if (hasUserPerm) return true;

        return await _context.RolePermissions
            .AnyAsync(rp => rp.Permission!.PermissionCode == permissionCode
                && rp.IsActive
                && _context.Users.Any(u => u.UserId == userId && u.RoleId == rp.RoleId));
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("userId")?.Value;
        return int.TryParse(userIdClaim, out var uid) ? uid : null;
    }

    private async Task<decimal> GetCurrentEntityBalance(string entityType, int entityId)
    {
        if (entityType == "bettingPool")
        {
            var balance = await _context.Balances
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BettingPoolId == entityId);
            return balance?.CurrentBalance ?? 0;
        }
        else if (entityType == "accountableEntity")
        {
            var entity = await _context.AccountableEntities
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EntityId == entityId);
            return entity?.CurrentBalance ?? 0;
        }
        return 0;
    }

    /// <summary>
    /// Process COBRO caída for auto-approved transaction lines (CreateGroup path).
    /// </summary>
    private async Task ProcessCobroCaidaForLinesAsync(IEnumerable<CreateTransactionGroupLineDto> lines, int? userId)
    {
        foreach (var line in lines)
        {
            if (line.TransactionType == "Cobro" && line.Entity1Type == "bettingPool" && line.Credit > 0)
            {
                try
                {
                    await _caidaService.ProcessCobroCaidaAsync(line.Entity1Id, line.Credit, userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing COBRO caída for bettingPool {Id}", line.Entity1Id);
                }
            }
        }
    }

    /// <summary>
    /// Process COBRO caída for manually approved transaction group.
    /// </summary>
    private async Task ProcessCobroCaidaForApprovedGroupAsync(TransactionGroup group, int? userId)
    {
        foreach (var line in group.Lines)
        {
            if (line.TransactionType == "Cobro" && line.Entity1Type == "bettingPool" && line.Credit > 0)
            {
                try
                {
                    await _caidaService.ProcessCobroCaidaAsync(line.Entity1Id, line.Credit, userId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing COBRO caída for bettingPool {Id}", line.Entity1Id);
                }
            }
        }
    }
}
