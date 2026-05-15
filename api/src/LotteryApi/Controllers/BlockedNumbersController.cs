using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[Authorize]
[ApiController]
[Route("api/blocked-numbers")]
public class BlockedNumbersController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BlockedNumbersController> _logger;
    private readonly IZoneScopeService _zoneScope;

    public BlockedNumbersController(LotteryDbContext context, ILogger<BlockedNumbersController> logger, IZoneScopeService zoneScope)
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

    /// <summary>
    /// Get all active blocked numbers (optionally include expired).
    /// Scoped admin sees global blocks (zone_id IS NULL) + blocks in their zones.
    /// Super-admin sees all.
    /// Requires MANAGE_BLOCKED_NUMBERS or BLOCK_NUMBERS_QUICK (quick-block widget needs the list to dedupe).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] bool includeExpired = false)
    {
        if (!await HasPermissionAsync("MANAGE_BLOCKED_NUMBERS")
            && !await HasPermissionAsync("BLOCK_NUMBERS_QUICK"))
        {
            return Forbid();
        }

        var now = DateTime.UtcNow;
        var query = _context.BlockedNumbers
            .AsNoTracking()
            .Include(b => b.Draw)
            .Include(b => b.GameType)
            .Where(b => b.IsActive);

        if (!includeExpired)
            query = query.Where(b => b.ExpirationDate == null || b.ExpirationDate > now);

        var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
        if (allowedZones != null)
        {
            query = query.Where(b => b.ZoneId == null || allowedZones.Contains(b.ZoneId.Value));
        }

        var data = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.BlockedNumberId,
                b.DrawId,
                DrawName = b.Draw != null ? b.Draw.DrawName : null,
                b.GameTypeId,
                GameTypeName = b.GameType != null ? b.GameType.GameName : null,
                b.BetNumber,
                b.ZoneId,
                b.ExpirationDate,
                b.CreatedAt,
                IsExpired = b.ExpirationDate != null && b.ExpirationDate <= now
            })
            .ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Create a blocked number (or multiple at once).
    ///
    /// Scope rules:
    /// - Super-admin (no zones): may pass an explicit ZoneId (scoped) or omit it (global).
    /// - Scoped admin: ZoneId is forced to their zone. If they have multiple zones, the
    ///   payload may specify which one; otherwise we default to the only one.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateBlockedNumbersRequest dto)
    {
        // Either MANAGE_BLOCKED_NUMBERS (full page) or BLOCK_NUMBERS_QUICK (dashboard widget).
        if (!await HasPermissionAsync("MANAGE_BLOCKED_NUMBERS")
            && !await HasPermissionAsync("BLOCK_NUMBERS_QUICK"))
        {
            return Forbid();
        }

        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest(new { message = "Debe enviar al menos un número" });

        var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
        var userId = GetUserId();
        var now = DateTime.UtcNow;
        var created = new List<BlockedNumber>();

        foreach (var item in dto.Items)
        {
            if (string.IsNullOrWhiteSpace(item.BetNumber))
                continue;

            // Strip non-digits so it matches ticket line storage format ("10-10" -> "1010")
            var normalizedNumber = new string(item.BetNumber.Where(char.IsDigit).ToArray());
            if (string.IsNullOrEmpty(normalizedNumber)) continue;

            int? zoneId = item.ZoneId;
            if (allowedZones != null)
            {
                // Scoped admin — must use one of their zones. Default to first if not specified.
                if (zoneId == null)
                {
                    zoneId = allowedZones.Count == 1 ? allowedZones[0] : (int?)null;
                }
                if (zoneId == null || !allowedZones.Contains(zoneId.Value))
                {
                    return Forbid();
                }
            }

            var block = new BlockedNumber
            {
                DrawId = item.DrawId,
                GameTypeId = item.GameTypeId,
                BetNumber = normalizedNumber,
                ZoneId = zoneId,
                ExpirationDate = item.ExpirationDate,
                IsActive = true,
                CreatedAt = now,
                CreatedBy = userId
            };
            _context.BlockedNumbers.Add(block);
            created.Add(block);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Created {Count} blocked numbers by user {UserId}", created.Count, userId);

        return Ok(new { created = created.Count });
    }

    /// <summary>
    /// Unblock a number (soft delete).
    /// Scoped admin can only unblock numbers in their zones; super-admin can unblock anything.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        if (!await HasPermissionAsync("MANAGE_BLOCKED_NUMBERS")) return Forbid();

        var block = await _context.BlockedNumbers.FirstOrDefaultAsync(b => b.BlockedNumberId == id);
        if (block == null)
            return NotFound(new { message = "Número bloqueado no encontrado" });

        var allowedZones = await _zoneScope.GetAllowedZoneIdsAsync();
        if (allowedZones != null)
        {
            // Scoped admin cannot touch global blocks or blocks in other zones.
            if (block.ZoneId == null || !allowedZones.Contains(block.ZoneId.Value))
                return Forbid();
        }

        block.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Número desbloqueado" });
    }

    private int? GetUserId()
    {
        var claim = User?.FindFirst("userId")?.Value ?? User?.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(claim) && int.TryParse(claim, out var id)) return id;
        return null;
    }
}

public class CreateBlockedNumbersRequest
{
    public List<BlockedNumberItem> Items { get; set; } = new();
}

public class BlockedNumberItem
{
    public int DrawId { get; set; }
    public int GameTypeId { get; set; }
    public string BetNumber { get; set; } = string.Empty;
    public DateTime? ExpirationDate { get; set; }

    /// <summary>
    /// Optional zone scope. Null = global (super-admin only).
    /// For scoped admins, defaults to their assigned zone.
    /// </summary>
    public int? ZoneId { get; set; }
}
