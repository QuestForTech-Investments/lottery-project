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
[Route("api/[controller]")]
public class ZonesController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<ZonesController> _logger;
    private readonly ICacheService _cache;
    private const string ZONES_CACHE_KEY = "zones:all";
    private static readonly TimeSpan ZONES_CACHE_TTL = TimeSpan.FromMinutes(30);

    public ZonesController(LotteryDbContext context, ILogger<ZonesController> logger, ICacheService cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
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
        try
        {
            // Build cache key based on parameters
            var cacheKey = $"zones:p{page}:ps{pageSize}:s{search ?? ""}:c{countryId}:a{isActive}";

            // Try to get from cache
            var cached = await _cache.GetAsync<PagedResponse<ZoneDto>>(cacheKey);
            if (cached != null)
            {
                _logger.LogDebug("Zones retrieved from cache: {CacheKey}", cacheKey);
                return Ok(cached);
            }

            var query = _context.Zones
                .Include(z => z.Country)
                .AsQueryable();

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

            // Store in cache
            await _cache.SetAsync(cacheKey, result, ZONES_CACHE_TTL);

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
}
