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

    /// <summary>
    /// Blocked numbers are global config (no zone/banca scope on the row).
    /// Only super-admin (no zones assigned) can mutate them — a scoped admin
    /// should not be able to affect bancas outside their group.
    /// </summary>
    private async Task<bool> IsSuperAdminAsync() =>
        await _zoneScope.GetAllowedZoneIdsAsync() == null;

    /// <summary>
    /// Get all active blocked numbers (optionally include expired).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] bool includeExpired = false)
    {
        var now = DateTime.UtcNow;
        var query = _context.BlockedNumbers
            .AsNoTracking()
            .Include(b => b.Draw)
            .Include(b => b.GameType)
            .Where(b => b.IsActive);

        if (!includeExpired)
            query = query.Where(b => b.ExpirationDate == null || b.ExpirationDate > now);

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
                b.ExpirationDate,
                b.CreatedAt,
                IsExpired = b.ExpirationDate != null && b.ExpirationDate <= now
            })
            .ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Create a blocked number (or multiple at once).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateBlockedNumbersRequest dto)
    {
        if (!await IsSuperAdminAsync()) return Forbid();

        if (dto.Items == null || dto.Items.Count == 0)
            return BadRequest(new { message = "Debe enviar al menos un número" });

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

            var block = new BlockedNumber
            {
                DrawId = item.DrawId,
                GameTypeId = item.GameTypeId,
                BetNumber = normalizedNumber,
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
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        if (!await IsSuperAdminAsync()) return Forbid();

        var block = await _context.BlockedNumbers.FirstOrDefaultAsync(b => b.BlockedNumberId == id);
        if (block == null)
            return NotFound(new { message = "Número bloqueado no encontrado" });

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
}
