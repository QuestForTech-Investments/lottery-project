using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/accountable-entities")]
public class AccountableEntitiesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<AccountableEntitiesController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public AccountableEntitiesController(LotteryDbContext context, ILogger<AccountableEntitiesController> logger, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _zoneScope = zoneScope;
    }

    /// <summary>Returns true if the current user holds the given permission code.</summary>
    private async Task<bool> HasPermissionAsync(string code)
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(raw, out var userId)) return false;

        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountableEntityDto>>> GetEntities(
        [FromQuery] string? search = null,
        [FromQuery] string? entityType = null,
        [FromQuery] int? zoneId = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var query = _context.AccountableEntities
                .AsNoTracking()
                .AsQueryable();

            // Zone scope: scoped admin only sees entities in their zones (entities
            // without a zone — global — also stay visible).
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
            if (allowedZones != null)
            {
                query = query.Where(e => e.ZoneId == null || allowedZones.Contains(e.ZoneId.Value));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(e => e.EntityName.Contains(search) || e.EntityCode.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(e => e.EntityType == entityType);
            }

            if (zoneId.HasValue)
            {
                query = query.Where(e => e.ZoneId == zoneId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(e => e.IsActive == isActive.Value);
            }

            var results = await query
                .OrderBy(e => e.EntityName)
                .Select(e => new AccountableEntityDto
                {
                    EntityId = e.EntityId,
                    EntityName = e.EntityName,
                    EntityCode = e.EntityCode,
                    EntityType = e.EntityType,
                    ZoneId = e.ZoneId,
                    ZoneName = e.Zone != null ? e.Zone.ZoneName : null,
                    CurrentBalance = e.CurrentBalance,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting accountable entities");
            return StatusCode(500, new { error = "Error al obtener entidades contables" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountableEntityDto>> GetEntity(int id)
    {
        try
        {
            var entity = await _context.AccountableEntities
                .AsNoTracking()
                .Where(e => e.EntityId == id)
                .Select(e => new AccountableEntityDto
                {
                    EntityId = e.EntityId,
                    EntityName = e.EntityName,
                    EntityCode = e.EntityCode,
                    EntityType = e.EntityType,
                    ZoneId = e.ZoneId,
                    ZoneName = e.Zone != null ? e.Zone.ZoneName : null,
                    CurrentBalance = e.CurrentBalance,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (entity == null)
                return NotFound(new { message = "Entidad no encontrada" });

            return Ok(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting accountable entity {Id}", id);
            return StatusCode(500, new { error = "Error al obtener entidad contable" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<AccountableEntityDto>> CreateEntity([FromBody] CreateAccountableEntityDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_ACCOUNTING_ENTITIES")) return Forbid();
        // Zone scope — if a zone is set on the new entity, it must be in scope.
        if (dto.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(dto.ZoneId.Value)) return Forbid();
        try
        {
            // Check for duplicate code
            var exists = await _context.AccountableEntities
                .AnyAsync(e => e.EntityCode == dto.EntityCode);
            if (exists)
                return BadRequest(new { message = "Ya existe una entidad con ese código" });

            var entity = new AccountableEntity
            {
                EntityName = dto.EntityName,
                EntityCode = dto.EntityCode,
                EntityType = dto.EntityType,
                ZoneId = dto.ZoneId,
                CurrentBalance = 0m,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.AccountableEntities.Add(entity);
            await _context.SaveChangesAsync();

            var result = new AccountableEntityDto
            {
                EntityId = entity.EntityId,
                EntityName = entity.EntityName,
                EntityCode = entity.EntityCode,
                EntityType = entity.EntityType,
                ZoneId = entity.ZoneId,
                CurrentBalance = entity.CurrentBalance,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt
            };

            return CreatedAtAction(nameof(GetEntity), new { id = entity.EntityId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating accountable entity");
            return StatusCode(500, new { error = "Error al crear entidad contable" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AccountableEntityDto>> UpdateEntity(int id, [FromBody] UpdateAccountableEntityDto dto)
    {
        if (!await HasPermissionAsync("MANAGE_ACCOUNTING_ENTITIES")) return Forbid();
        try
        {
            var entity = await _context.AccountableEntities.FindAsync(id);
            if (entity == null)
                return NotFound(new { message = "Entidad no encontrada" });

            // Zone scope — both the entity's current zone and any new zone must be in scope.
            if (entity.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(entity.ZoneId.Value)) return Forbid();
            if (dto.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(dto.ZoneId.Value)) return Forbid();

            if (dto.EntityName != null) entity.EntityName = dto.EntityName;
            if (dto.EntityCode != null)
            {
                var codeExists = await _context.AccountableEntities
                    .AnyAsync(e => e.EntityCode == dto.EntityCode && e.EntityId != id);
                if (codeExists)
                    return BadRequest(new { message = "Ya existe una entidad con ese código" });
                entity.EntityCode = dto.EntityCode;
            }
            if (dto.EntityType != null) entity.EntityType = dto.EntityType;
            if (dto.ZoneId.HasValue) entity.ZoneId = dto.ZoneId;
            if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new AccountableEntityDto
            {
                EntityId = entity.EntityId,
                EntityName = entity.EntityName,
                EntityCode = entity.EntityCode,
                EntityType = entity.EntityType,
                ZoneId = entity.ZoneId,
                CurrentBalance = entity.CurrentBalance,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating accountable entity {Id}", id);
            return StatusCode(500, new { error = "Error al actualizar entidad contable" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEntity(int id)
    {
        if (!await HasPermissionAsync("MANAGE_ACCOUNTING_ENTITIES")) return Forbid();
        try
        {
            var entity = await _context.AccountableEntities.FindAsync(id);
            if (entity == null)
                return NotFound(new { message = "Entidad no encontrada" });

            if (entity.ZoneId.HasValue && !await _zoneScope.IsZoneAllowedAsync(entity.ZoneId.Value)) return Forbid();

            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Entidad desactivada" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting accountable entity {Id}", id);
            return StatusCode(500, new { error = "Error al eliminar entidad contable" });
        }
    }
}
