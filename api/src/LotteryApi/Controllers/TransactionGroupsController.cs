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
[Route("api/transaction-groups")]
public class TransactionGroupsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<TransactionGroupsController> _logger;

    public TransactionGroupsController(LotteryDbContext context, ILogger<TransactionGroupsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<TransactionGroupDto>>> GetGroups(
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] string? search = null,
        [FromQuery] int? tzOffset = null)
    {
        try
        {
            var query = _context.TransactionGroups
                .AsNoTracking()
                .AsQueryable();

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
                    CreatedByName = g.CreatedByUser != null ? g.CreatedByUser.Username : null
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

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionGroupDto>> GetGroup(int id)
    {
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
        try
        {
            var query = _context.TransactionGroupLines
                .AsNoTracking()
                .Include(l => l.Group)
                    .ThenInclude(g => g!.CreatedByUser)
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

    [HttpPost]
    public async Task<ActionResult<TransactionGroupDto>> CreateGroup([FromBody] CreateTransactionGroupDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get current user
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("userId")?.Value;
            int? userId = int.TryParse(userIdClaim, out var uid) ? uid : null;

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
                Status = "Pendiente",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
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

                // Update Entity1 balance
                // Entity1: +debit -credit
                var entity1Delta = lineDto.Debit - lineDto.Credit;
                await UpdateEntityBalance(lineDto.Entity1Type, lineDto.Entity1Id, entity1Delta);

                // Update Entity2 balance (if it's a real entity, not text)
                // Entity2: -debit +credit
                if (lineDto.Entity2Id.HasValue && !string.IsNullOrEmpty(lineDto.Entity2Type))
                {
                    var entity2Delta = lineDto.Credit - lineDto.Debit;
                    await UpdateEntityBalance(lineDto.Entity2Type, lineDto.Entity2Id.Value, entity2Delta);
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

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
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var group = await _context.TransactionGroups
                .Include(g => g.Lines)
                .FirstOrDefaultAsync(g => g.GroupId == id);

            if (group == null)
                return NotFound(new { message = "Grupo no encontrado" });

            // Reverse balance changes for each line
            foreach (var line in group.Lines)
            {
                decimal entity1Delta = line.Debit - line.Credit;
                decimal entity2Delta = line.Credit - line.Debit;

                // Reverse: subtract what was added
                await UpdateEntityBalance(line.Entity1Type, line.Entity1Id, -entity1Delta);
                if (line.Entity2Type != null && line.Entity2Id.HasValue)
                {
                    await UpdateEntityBalance(line.Entity2Type, line.Entity2Id.Value, -entity2Delta);
                }
            }

            _context.TransactionGroupLines.RemoveRange(group.Lines);
            _context.TransactionGroups.Remove(group);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Grupo eliminado exitosamente" });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting transaction group {Id}", id);
            return StatusCode(500, new { error = "Error al eliminar grupo de transacciones" });
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
}
