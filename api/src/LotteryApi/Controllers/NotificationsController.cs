using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(LotteryDbContext context, ILogger<NotificationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>Resolve the current user's id from the JWT.</summary>
    private int? CurrentUserId()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var id) ? id : (int?)null;
    }

    private async Task<bool> HasPermissionAsync(string code)
    {
        var userId = CurrentUserId();
        if (userId == null) return false;
        return await _context.UserPermissions.AsNoTracking()
            .AnyAsync(up => up.UserId == userId
                && up.IsActive
                && up.Permission != null
                && up.Permission.IsActive
                && up.Permission.PermissionCode == code);
    }

    public class CreateNotificationDto
    {
        public List<string>? Audience { get; set; }     // ["banca"], ["admin"], or both
        public List<int>? BancaIds { get; set; }
        public List<int>? ZoneIds { get; set; }
        public List<int>? AdminUserIds { get; set; }
        public string? Priority { get; set; }           // low | medium | high
        public string? NotificationType { get; set; }   // mark_as_read | expiration_date
        public DateTime? ExpiresAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>Create a notification and seed the per-recipient delivery rows.</summary>
    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CreateNotificationDto dto)
    {
        if (!await HasPermissionAsync("SEND_NOTIFICATIONS")) return Forbid();

        if (string.IsNullOrWhiteSpace(dto.Message))
        {
            return BadRequest(new { error = "El mensaje es requerido." });
        }
        var audience = dto.Audience ?? new List<string>();
        if (audience.Count == 0)
        {
            return BadRequest(new { error = "Seleccione al menos un destinatario." });
        }

        var toBanca = audience.Contains("banca");
        var toAdmin = audience.Contains("admin");

        if (toBanca && (dto.BancaIds == null || dto.BancaIds.Count == 0)
            && (dto.ZoneIds == null || dto.ZoneIds.Count == 0))
        {
            return BadRequest(new { error = "Seleccione al menos una banca o zona destinataria." });
        }
        if (toAdmin && (dto.AdminUserIds == null || dto.AdminUserIds.Count == 0))
        {
            return BadRequest(new { error = "Seleccione al menos un administrador destinatario." });
        }
        if (string.Equals(dto.NotificationType, "expiration_date", StringComparison.OrdinalIgnoreCase)
            && !dto.ExpiresAt.HasValue)
        {
            return BadRequest(new { error = "La fecha de expiración es requerida." });
        }

        var notif = new Notification
        {
            Audience = string.Join(",", audience),
            BancaIds = toBanca && dto.BancaIds?.Count > 0 ? string.Join(",", dto.BancaIds) : null,
            ZoneIds = toBanca && dto.ZoneIds?.Count > 0 ? string.Join(",", dto.ZoneIds) : null,
            AdminUserIds = toAdmin && dto.AdminUserIds?.Count > 0 ? string.Join(",", dto.AdminUserIds) : null,
            Priority = (dto.Priority ?? "medium").ToLowerInvariant(),
            NotificationType = (dto.NotificationType ?? "mark_as_read").ToLowerInvariant(),
            ExpiresAt = dto.ExpiresAt,
            Message = dto.Message.Trim(),
            CreatedBy = CurrentUserId(),
            CreatedAt = DateTime.UtcNow,
        };

        _context.Notifications.Add(notif);
        await _context.SaveChangesAsync();

        // Resolve banca recipients: explicit bancas + bancas inside selected zones.
        var bancaRecipientIds = new HashSet<int>(dto.BancaIds ?? Enumerable.Empty<int>());
        if (toBanca && dto.ZoneIds is { Count: > 0 })
        {
            var zoneBancaIds = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => bp.IsActive && bp.DeletedAt == null && dto.ZoneIds.Contains(bp.ZoneId))
                .Select(bp => bp.BettingPoolId)
                .ToListAsync();
            foreach (var id in zoneBancaIds) bancaRecipientIds.Add(id);
        }

        // Seed notification_reads rows so the topbar bell can count unread per recipient.
        var rows = new List<NotificationRead>();
        if (toBanca)
        {
            foreach (var bpId in bancaRecipientIds)
            {
                rows.Add(new NotificationRead
                {
                    NotificationId = notif.NotificationId,
                    RecipientType = "banca",
                    RecipientId = bpId,
                });
            }
        }
        if (toAdmin && dto.AdminUserIds != null)
        {
            foreach (var userId in dto.AdminUserIds.Distinct())
            {
                rows.Add(new NotificationRead
                {
                    NotificationId = notif.NotificationId,
                    RecipientType = "admin",
                    RecipientId = userId,
                });
            }
        }
        if (rows.Count > 0)
        {
            _context.NotificationReads.AddRange(rows);
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation(
            "Notification {NotificationId} created — audience={Audience}, bancas={BancaCount}, admins={AdminCount}",
            notif.NotificationId, notif.Audience, bancaRecipientIds.Count, dto.AdminUserIds?.Count ?? 0);

        return Ok(new { notificationId = notif.NotificationId, recipients = rows.Count });
    }

    public class NotificationListItem
    {
        public long NotificationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";
        public string NotificationType { get; set; } = "mark_as_read";
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedByName { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    /// <summary>
    /// Notifications addressed to the current admin user, newest first.
    /// Excludes expired notifications.
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<List<NotificationListItem>>> GetMine()
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var now = DateTime.UtcNow;
        var query =
            from r in _context.NotificationReads.AsNoTracking()
            where r.RecipientType == "admin" && r.RecipientId == userId
            join n in _context.Notifications.AsNoTracking() on r.NotificationId equals n.NotificationId
            where !n.ExpiresAt.HasValue || n.ExpiresAt.Value > now
            join u in _context.Users.AsNoTracking() on n.CreatedBy equals u.UserId into createdBy
            from u in createdBy.DefaultIfEmpty()
            orderby n.CreatedAt descending
            select new NotificationListItem
            {
                NotificationId = n.NotificationId,
                Message = n.Message,
                Priority = n.Priority,
                NotificationType = n.NotificationType,
                ExpiresAt = n.ExpiresAt,
                CreatedAt = n.CreatedAt,
                CreatedByName = u != null ? u.Username : null,
                IsRead = r.IsRead,
                ReadAt = r.ReadAt,
            };

        var items = await query.Take(200).ToListAsync();
        return Ok(items);
    }

    /// <summary>Lightweight unread count for the topbar bell.</summary>
    [HttpGet("me/count")]
    public async Task<ActionResult<object>> GetMyCount()
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var now = DateTime.UtcNow;
        var unread = await (
            from r in _context.NotificationReads.AsNoTracking()
            where r.RecipientType == "admin" && r.RecipientId == userId && !r.IsRead
            join n in _context.Notifications.AsNoTracking() on r.NotificationId equals n.NotificationId
            where !n.ExpiresAt.HasValue || n.ExpiresAt.Value > now
            select r
        ).CountAsync();

        return Ok(new { unread });
    }

    public class MarkReadRequest
    {
        public List<long>? NotificationIds { get; set; }
    }

    /// <summary>
    /// Remove a notification from the current admin's inbox. Only deletes the
    /// per-recipient `notification_reads` row, so other recipients aren't affected.
    /// </summary>
    [HttpDelete("me/{notificationId:long}")]
    public async Task<ActionResult<object>> DeleteFromInbox(long notificationId)
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var row = await _context.NotificationReads
            .FirstOrDefaultAsync(r => r.NotificationId == notificationId
                && r.RecipientType == "admin"
                && r.RecipientId == userId);

        if (row == null)
        {
            return NotFound(new { error = "Notificación no encontrada en su bandeja." });
        }

        _context.NotificationReads.Remove(row);
        await _context.SaveChangesAsync();
        return Ok(new { deleted = 1 });
    }

    /// <summary>
    /// Mark one or more notifications as read for the current admin user.
    /// Pass an empty / missing list to mark every unread one as read.
    /// </summary>
    [HttpPost("me/read")]
    public async Task<ActionResult<object>> MarkRead([FromBody] MarkReadRequest? request)
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var ids = request?.NotificationIds;
        var now = DateTime.UtcNow;

        var query = _context.NotificationReads
            .Where(r => r.RecipientType == "admin" && r.RecipientId == userId && !r.IsRead);
        if (ids != null && ids.Count > 0)
        {
            query = query.Where(r => ids.Contains(r.NotificationId));
        }

        var rows = await query.ToListAsync();
        foreach (var r in rows)
        {
            r.IsRead = true;
            r.ReadAt = now;
        }
        if (rows.Count > 0) await _context.SaveChangesAsync();

        return Ok(new { updated = rows.Count });
    }
}
