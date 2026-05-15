using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;
using LotteryApi.Models.Enums;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ZonesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<ZonesController> _logger;
    private readonly ICacheService _cache;
    private readonly IZoneScopeService _zoneScope;
    private const string ZONES_CACHE_KEY = "zones:all";
    private static readonly TimeSpan ZONES_CACHE_TTL = TimeSpan.FromMinutes(30);

    public ZonesController(LotteryDbContext context, ILogger<ZonesController> logger, ICacheService cache, IZoneScopeService zoneScope)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
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

    /// <summary>
    /// Get all zones with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResponse<ZoneDto>>> GetZones(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] int? countryId = null,
        [FromQuery] bool? isActive = null)
    {
        // No permission gate on read — zones are lookup data used in filters across the app
        // (sales, bancas, users, etc.). Zone scope still hides zones outside the admin's scope.

        try
        {
            // Cache disabled — list is small and writes (create/update/delete) need to
            // be immediately visible after the redirect from the form page.
            var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();

            var query = _context.Zones
                .Include(z => z.Country)
                .AsQueryable();

            if (allowedZones != null)
            {
                query = query.Where(z => allowedZones.Contains(z.ZoneId));
            }

            // Apply filters
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(z => z.ZoneName.Contains(search));
            }

            if (countryId.HasValue)
            {
                query = query.Where(z => z.CountryId == countryId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(z => z.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var zones = await query
                .OrderBy(z => z.ZoneName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(z => new ZoneDto
                {
                    ZoneId = z.ZoneId,
                    ZoneName = z.ZoneName,
                    CountryId = z.CountryId,
                    CountryName = z.Country != null ? z.Country.CountryName : null,
                    IsActive = z.IsActive,
                    CreatedAt = z.CreatedAt,
                    UpdatedAt = z.UpdatedAt,
                    UserCount = _context.UserZones.Count(uz => uz.ZoneId == z.ZoneId && uz.IsActive),
                    BettingPoolCount = _context.BettingPools.Count(bp => bp.ZoneId == z.ZoneId)
                })
                .ToListAsync();

            var result = new PagedResponse<ZoneDto>
            {
                Items = zones,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting zones");
            return StatusCode(500, new { message = "Error retrieving zones" });
        }
    }

    /// <summary>
    /// Get zone by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ZoneDto>> GetZone(int id)
    {
        // No permission gate on read — zones are lookup data. Zone scope still applies.
        if (!await _zoneScope.IsZoneAllowedAsync(id)) return NotFound(new { message = "Zona no encontrada" });
        try
        {
            var zone = await _context.Zones
                .Include(z => z.Country)
                .Where(z => z.ZoneId == id)
                .Select(z => new ZoneDto
                {
                    ZoneId = z.ZoneId,
                    ZoneName = z.ZoneName,
                    CountryId = z.CountryId,
                    CountryName = z.Country != null ? z.Country.CountryName : null,
                    IsActive = z.IsActive,
                    CreatedAt = z.CreatedAt,
                    UpdatedAt = z.UpdatedAt,
                    UserCount = _context.UserZones.Count(uz => uz.ZoneId == z.ZoneId && uz.IsActive),
                    BettingPoolCount = _context.BettingPools.Count(bp => bp.ZoneId == z.ZoneId)
                })
                .FirstOrDefaultAsync();

            if (zone == null)
            {
                return NotFound(new { message = $"Zone with ID {id} not found" });
            }

            return Ok(zone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting zone {ZoneId}", id);
            return StatusCode(500, new { message = "Error retrieving zone" });
        }
    }

    /// <summary>
    /// Create a new zone
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ZoneDto>> CreateZone([FromBody] CreateZoneDto createDto)
    {
        if (!await HasPermissionAsync("CREATE_ZONES")) return Forbid();
        // Creating a zone is admin-level config — a scoped admin must not be able
        // to grow the set of zones (would let them self-escalate scope).
        if (await _zoneScope.GetAllowedZoneIdsAsync() != null) return Forbid();
        try
        {
            // Verify country exists only if CountryId is provided
            if (createDto.CountryId.HasValue)
            {
                var countryExists = await _context.Countries.AnyAsync(c => c.CountryId == createDto.CountryId.Value);
                if (!countryExists)
                {
                    return BadRequest(new { message = $"Country with ID {createDto.CountryId} not found" });
                }
            }

            // Get next zone ID (since it's not auto-increment)
            var maxZoneId = await _context.Zones.AnyAsync()
                ? await _context.Zones.MaxAsync(z => z.ZoneId)
                : 0;

            var zone = new Zone
            {
                ZoneId = maxZoneId + 1,
                ZoneName = createDto.ZoneName,
                CountryId = createDto.CountryId,
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Zones.Add(zone);
            await _context.SaveChangesAsync();

            // Auto-create zona limit rules from defaults for all draws that have global limits
            await AutoCreateZonaLimits(zone.ZoneId);

            // Invalidate zones cache
            await _cache.RemoveByPrefixAsync("zones:");

            var zoneDto = await _context.Zones
                .Where(z => z.ZoneId == zone.ZoneId)
                .Include(z => z.Country)
                .Select(z => new ZoneDto
                {
                    ZoneId = z.ZoneId,
                    ZoneName = z.ZoneName,
                    CountryId = z.CountryId,
                    CountryName = z.Country != null ? z.Country.CountryName : null,
                    IsActive = z.IsActive,
                    CreatedAt = z.CreatedAt,
                    UpdatedAt = z.UpdatedAt,
                    UserCount = 0,
                    BettingPoolCount = 0
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetZone), new { id = zone.ZoneId }, zoneDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating zone");
            return StatusCode(500, new { message = "Error creating zone" });
        }
    }

    /// <summary>
    /// Update a zone
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ZoneDto>> UpdateZone(int id, [FromBody] UpdateZoneDto updateDto)
    {
        if (!await HasPermissionAsync("MANAGE_ZONES")) return Forbid();
        if (!await _zoneScope.IsZoneAllowedAsync(id)) return Forbid();
        try
        {
            var zone = await _context.Zones.FindAsync(id);
            if (zone == null)
            {
                return NotFound(new { message = $"Zone with ID {id} not found" });
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(updateDto.ZoneName))
            {
                zone.ZoneName = updateDto.ZoneName;
            }

            if (updateDto.CountryId.HasValue)
            {
                // Verify country exists
                var countryExists = await _context.Countries.AnyAsync(c => c.CountryId == updateDto.CountryId.Value);
                if (!countryExists)
                {
                    return BadRequest(new { message = $"Country with ID {updateDto.CountryId} not found" });
                }
                zone.CountryId = updateDto.CountryId.Value;
            }

            if (updateDto.IsActive.HasValue)
            {
                zone.IsActive = updateDto.IsActive.Value;
            }

            zone.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Invalidate zones cache
            await _cache.RemoveByPrefixAsync("zones:");

            var zoneDto = await _context.Zones
                .Where(z => z.ZoneId == id)
                .Include(z => z.Country)
                .Select(z => new ZoneDto
                {
                    ZoneId = z.ZoneId,
                    ZoneName = z.ZoneName,
                    CountryId = z.CountryId,
                    CountryName = z.Country != null ? z.Country.CountryName : null,
                    IsActive = z.IsActive,
                    CreatedAt = z.CreatedAt,
                    UpdatedAt = z.UpdatedAt,
                    UserCount = _context.UserZones.Count(uz => uz.ZoneId == z.ZoneId && uz.IsActive),
                    BettingPoolCount = _context.BettingPools.Count(bp => bp.ZoneId == z.ZoneId)
                })
                .FirstAsync();

            return Ok(zoneDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating zone {ZoneId}", id);
            return StatusCode(500, new { message = "Error updating zone" });
        }
    }

    /// <summary>
    /// Delete (deactivate) a zone
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteZone(int id)
    {
        if (!await HasPermissionAsync("MANAGE_ZONES")) return Forbid();
        if (!await _zoneScope.IsZoneAllowedAsync(id)) return Forbid();
        try
        {
            var zone = await _context.Zones.FindAsync(id);
            if (zone == null)
            {
                return NotFound(new { message = $"Zone with ID {id} not found" });
            }

            // Soft delete: just deactivate
            zone.IsActive = false;
            zone.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Invalidate zones cache
            await _cache.RemoveByPrefixAsync("zones:");

            return Ok(new { message = $"Zone '{zone.ZoneName}' deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting zone {ZoneId}", id);
            return StatusCode(500, new { message = "Error deleting zone" });
        }
    }

    /// <summary>
    /// Get users assigned to a zone (N:M relationship)
    /// </summary>
    [HttpGet("{id}/users")]
    public async Task<ActionResult<ZoneWithUsersDto>> GetZoneUsers(int id)
    {
        if (!await HasPermissionAsync("MANAGE_ZONES")) return Forbid();

        try
        {
            var zone = await _context.Zones
                .Include(z => z.Country)
                .FirstOrDefaultAsync(z => z.ZoneId == id);

            if (zone == null)
            {
                return NotFound(new { message = $"Zone with ID {id} not found" });
            }

            var users = await _context.UserZones
                .Where(uz => uz.ZoneId == id && uz.IsActive)
                .Include(uz => uz.User)
                .Select(uz => new UserBasicDto
                {
                    UserId = uz.User!.UserId,
                    Username = uz.User.Username,
                    FullName = uz.User.FullName,
                    Email = uz.User.Email,
                    IsActive = uz.User.IsActive
                })
                .ToListAsync();

            var result = new ZoneWithUsersDto
            {
                ZoneId = zone.ZoneId,
                ZoneName = zone.ZoneName,
                CountryId = zone.CountryId,
                CountryName = zone.Country?.CountryName,
                IsActive = zone.IsActive,
                Users = users
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users for zone {ZoneId}", id);
            return StatusCode(500, new { message = "Error retrieving zone users" });
        }
    }

    /// <summary>
    /// Assign users to a zone (N:M relationship)
    /// </summary>
    [HttpPost("{id}/users")]
    public async Task<ActionResult> AssignUsersToZone(int id, [FromBody] AssignUsersToZoneDto assignDto)
    {
        if (!await HasPermissionAsync("MANAGE_ZONES")) return Forbid();

        try
        {
            var zone = await _context.Zones.FindAsync(id);
            if (zone == null)
            {
                return NotFound(new { message = $"Zone with ID {id} not found" });
            }

            // Verify all users exist
            var existingUserIds = await _context.Users
                .Where(u => assignDto.UserIds.Contains(u.UserId))
                .Select(u => u.UserId)
                .ToListAsync();

            var missingUserIds = assignDto.UserIds.Except(existingUserIds).ToList();
            if (missingUserIds.Any())
            {
                return BadRequest(new { message = $"Users not found: {string.Join(", ", missingUserIds)}" });
            }

            // Get or create user-zone relationships
            var existingAssignments = await _context.UserZones
                .Where(uz => uz.ZoneId == id && assignDto.UserIds.Contains(uz.UserId))
                .ToListAsync();

            var newUserIds = assignDto.UserIds
                .Except(existingAssignments.Select(uz => uz.UserId))
                .ToList();

            // Reactivate existing inactive assignments
            foreach (var assignment in existingAssignments.Where(uz => !uz.IsActive))
            {
                assignment.IsActive = true;
                assignment.UpdatedAt = DateTime.UtcNow;
            }

            // Add new assignments (UserZoneId is auto-increment)
            var newAssignments = newUserIds.Select(userId => new UserZone
            {
                UserId = userId,
                ZoneId = id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }).ToList();

            if (newAssignments.Any())
            {
                _context.UserZones.AddRange(newAssignments);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"{assignDto.UserIds.Count} users assigned to zone '{zone.ZoneName}'",
                newAssignments = newAssignments.Count,
                reactivated = existingAssignments.Count(uz => uz.IsActive)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning users to zone {ZoneId}", id);
            return StatusCode(500, new { message = "Error assigning users to zone" });
        }
    }

    /// <summary>
    /// Remove a user from a zone (deactivate N:M relationship)
    /// </summary>
    [HttpDelete("{id}/users/{userId}")]
    public async Task<ActionResult> RemoveUserFromZone(int id, int userId)
    {
        if (!await HasPermissionAsync("MANAGE_ZONES")) return Forbid();

        try
        {
            var assignment = await _context.UserZones
                .FirstOrDefaultAsync(uz => uz.ZoneId == id && uz.UserId == userId);

            if (assignment == null)
            {
                return NotFound(new { message = $"User {userId} is not assigned to zone {id}" });
            }

            // Soft delete: deactivate the relationship
            assignment.IsActive = false;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {userId} removed from zone {id}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {UserId} from zone {ZoneId}", userId, id);
            return StatusCode(500, new { message = "Error removing user from zone" });
        }
    }

    /// <summary>
    /// Auto-create zona limit rules from defaults for all draws that have global limits.
    /// Called when a new zone is created.
    /// </summary>
    private async Task AutoCreateZonaLimits(int zoneId)
    {
        try
        {
            // Get zona defaults
            var zonaDefaults = await _context.LimitDefaults
                .Where(d => d.DefaultType == "zona")
                .ToListAsync();

            if (zonaDefaults.Count == 0) return;

            // Get all draws that have active global limits (limit_type = 1)
            var globalDrawIds = await _context.LimitRules
                .Where(r => r.LimitType == LimitType.GeneralForGroup && r.IsActive && r.DrawId.HasValue)
                .Select(r => r.DrawId!.Value)
                .Distinct()
                .ToListAsync();

            if (globalDrawIds.Count == 0) return;

            // Get draw game type compatibility to only save relevant amounts
            var drawGameTypes = await _context.Set<DrawGameCompatibility>()
                .Where(dgc => dgc.IsActive && globalDrawIds.Contains(dgc.DrawId))
                .GroupBy(dgc => dgc.DrawId)
                .Select(g => new { DrawId = g.Key, GameTypeIds = g.Select(x => x.GameTypeId).ToList() })
                .ToListAsync();

            var drawGameTypeMap = drawGameTypes.ToDictionary(x => x.DrawId, x => new HashSet<int>(x.GameTypeIds));

            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");

            foreach (var drawId in globalDrawIds)
            {
                drawGameTypeMap.TryGetValue(drawId, out var allowedGameTypes);

                var rule = new LimitRule
                {
                    RuleName = $"Límite Zona (auto) - {timestamp}",
                    LimitType = LimitType.GeneralForZone,
                    DrawId = drawId,
                    ZoneId = zoneId,
                    DaysOfWeek = 127, // All days
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.LimitRules.Add(rule);
                await _context.SaveChangesAsync(); // Save to get the ID

                foreach (var def in zonaDefaults)
                {
                    // Only save if draw supports this game type (or no restrictions)
                    if (allowedGameTypes != null && !allowedGameTypes.Contains(def.GameTypeId))
                        continue;

                    _context.LimitRuleAmounts.Add(new LimitRuleAmount
                    {
                        LimitRuleId = rule.LimitRuleId,
                        GameTypeId = def.GameTypeId,
                        MaxAmount = def.MaxAmount
                    });
                }
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Auto-created zona limits for zone {ZoneId} across {DrawCount} draws", zoneId, globalDrawIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error auto-creating zona limits for zone {ZoneId}", zoneId);
            // Don't throw — zone creation should succeed even if limit auto-creation fails
        }
    }
}
