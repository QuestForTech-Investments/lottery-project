using LotteryApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/auth/blocked-sessions")]
[Authorize]
public class BlockedSessionsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BlockedSessionsController> _logger;

    public BlockedSessionsController(LotteryDbContext context, ILogger<BlockedSessionsController> logger)
    {
        _context = context;
        _logger = logger;
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

    public class BlockedSessionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Identifier { get; set; } = string.Empty;
        public string? Username { get; set; }
        public string? Ip { get; set; }
        public DateTime BlockedAt { get; set; }
        public string? Reason { get; set; }
    }

    /// <summary>
    /// GET /api/auth/blocked-sessions?type=password|pin|ip
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<BlockedSessionDto>>> GetBlocked([FromQuery] string type = "password")
    {
        if (!await HasPermissionAsync("VIEW_LOGIN_SESSIONS")) return Forbid();

        switch (type)
        {
            case "password":
            {
                var rows = await _context.Users.AsNoTracking()
                    .Where(u => u.IsPasswordLocked)
                    .Select(u => new BlockedSessionDto
                    {
                        Id = "u:" + u.UserId,
                        Identifier = u.Username,
                        Username = u.Username,
                        Ip = u.PasswordLockedIp,
                        BlockedAt = u.PasswordLockedAt ?? DateTime.UtcNow,
                        Reason = "Password"
                    })
                    .OrderByDescending(r => r.BlockedAt)
                    .ToListAsync();
                return Ok(rows);
            }
            case "pin":
            {
                var rows = await _context.Users.AsNoTracking()
                    .Where(u => u.IsPinLocked)
                    .Select(u => new BlockedSessionDto
                    {
                        Id = "u:" + u.UserId,
                        Identifier = u.Username,
                        Username = u.Username,
                        Ip = u.PinLockedIp,
                        BlockedAt = u.PinLockedAt ?? DateTime.UtcNow,
                        Reason = "PIN"
                    })
                    .OrderByDescending(r => r.BlockedAt)
                    .ToListAsync();
                return Ok(rows);
            }
            case "ip":
            {
                var rows = await _context.BlockedIps.AsNoTracking()
                    .Select(b => new BlockedSessionDto
                    {
                        Id = "ip:" + b.IpAddress,
                        Identifier = b.IpAddress,
                        Username = b.LastUsername,
                        Ip = b.IpAddress,
                        BlockedAt = b.BlockedAt,
                        Reason = b.Reason
                    })
                    .OrderByDescending(r => r.BlockedAt)
                    .ToListAsync();
                return Ok(rows);
            }
            default:
                return BadRequest(new { message = "type must be password, pin or ip" });
        }
    }

    public class UnblockRequest
    {
        public string Id { get; set; } = string.Empty;  // "u:<userId>" or "ip:<address>"
        public string Type { get; set; } = "password";  // password | pin | ip
    }

    /// <summary>
    /// POST /api/auth/blocked-sessions/unblock
    /// Clears the lock flag on a user (password|pin) or removes a blocked IP.
    /// </summary>
    [HttpPost("unblock")]
    public async Task<IActionResult> Unblock([FromBody] UnblockRequest req)
    {
        if (!await HasPermissionAsync("VIEW_LOGIN_SESSIONS")) return Forbid();

        if (req == null || string.IsNullOrWhiteSpace(req.Id))
        {
            return BadRequest(new { message = "id required" });
        }

        if (req.Id.StartsWith("u:") && int.TryParse(req.Id.Substring(2), out var userId))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound(new { message = "User not found" });

            if (req.Type == "pin")
            {
                user.IsPinLocked = false;
                user.PinLockedAt = null;
                user.PinLockedIp = null;
            }
            else
            {
                user.IsPasswordLocked = false;
                user.PasswordLockedAt = null;
                user.PasswordLockedIp = null;
            }
            await _context.SaveChangesAsync();
            _logger.LogInformation("Unblocked user {UserId} ({Username}) for {Type}",
                user.UserId, user.Username, req.Type);
            return Ok(new { success = true });
        }

        if (req.Id.StartsWith("ip:"))
        {
            var ip = req.Id.Substring(3);
            var row = await _context.BlockedIps.FirstOrDefaultAsync(b => b.IpAddress == ip);
            if (row == null) return NotFound(new { message = "IP not found" });
            _context.BlockedIps.Remove(row);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Unblocked IP {Ip}", ip);
            return Ok(new { success = true });
        }

        return BadRequest(new { message = "Invalid id format" });
    }
}
