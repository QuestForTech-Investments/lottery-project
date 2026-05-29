using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Helpers;
using LotteryApi.Models;
using LotteryApi.Services;

namespace LotteryApi.Controllers;

/// <summary>
/// Manages the configuration of email recipients for automated reports.
///
/// For now there is exactly one notification type ("MONITOREO_JUGADAS").
/// The actual scheduled job that builds and sends the email body lives
/// outside this controller — this is purely the configuration surface used
/// by the admin UI.
/// </summary>
[Authorize]
[ApiController]
[Route("api/email-receivers")]
public class EmailReceiversController : ControllerBase
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<EmailReceiversController> _logger;
    private readonly IEmailService _emailService;
    private readonly PlayMonitoringReportService _reportService;

    public EmailReceiversController(
        LotteryDbContext context,
        ILogger<EmailReceiversController> logger,
        IEmailService emailService,
        PlayMonitoringReportService reportService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _reportService = reportService;
    }

    /// <summary>Resolve the current user id from JWT claims (null if missing).</summary>
    private int? CurrentUserId()
    {
        var raw = User.FindFirst("userId")?.Value
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var id) ? id : (int?)null;
    }

    [HttpGet]
    public async Task<ActionResult<List<EmailReceiverDto>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? notificationType = null)
    {
        try
        {
            var query = _context.EmailReceivers
                .AsNoTracking()
                .Include(r => r.Zones)
                    .ThenInclude(z => z.Zone)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(r => r.Name.Contains(term) || r.Email.Contains(term));
            }

            if (isActive.HasValue)
            {
                query = query.Where(r => r.IsActive == isActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(notificationType))
            {
                query = query.Where(r => r.NotificationType == notificationType);
            }

            var results = await query
                .OrderBy(r => r.Name)
                .Select(r => new EmailReceiverDto
                {
                    EmailReceiverId = r.EmailReceiverId,
                    Name = r.Name,
                    Email = r.Email,
                    NotificationType = r.NotificationType,
                    IsActive = r.IsActive,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    Zones = r.Zones
                        .Where(z => z.Zone != null)
                        .Select(z => new EmailReceiverZoneDto
                        {
                            ZoneId = z.ZoneId,
                            ZoneName = z.Zone!.ZoneName,
                        })
                        .ToList(),
                })
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading email receivers");
            return StatusCode(500, new { message = "Error al cargar los receptores de correo." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmailReceiverDto>> GetById(int id)
    {
        var entity = await _context.EmailReceivers
            .AsNoTracking()
            .Include(r => r.Zones)
                .ThenInclude(z => z.Zone)
            .FirstOrDefaultAsync(r => r.EmailReceiverId == id);

        if (entity == null)
        {
            return NotFound(new { message = "Receptor no encontrado." });
        }

        return Ok(new EmailReceiverDto
        {
            EmailReceiverId = entity.EmailReceiverId,
            Name = entity.Name,
            Email = entity.Email,
            NotificationType = entity.NotificationType,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            Zones = entity.Zones
                .Where(z => z.Zone != null)
                .Select(z => new EmailReceiverZoneDto
                {
                    ZoneId = z.ZoneId,
                    ZoneName = z.Zone!.ZoneName,
                })
                .ToList(),
        });
    }

    [HttpPost]
    public async Task<ActionResult<EmailReceiverDto>> Create([FromBody] CreateEmailReceiverDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate zones exist (any extra IDs in the request would be silently
        // ignored otherwise and the admin wouldn't know which one was wrong).
        if (dto.ZoneIds.Count > 0)
        {
            var found = await _context.Zones
                .Where(z => dto.ZoneIds.Contains(z.ZoneId))
                .Select(z => z.ZoneId)
                .ToListAsync();
            var missing = dto.ZoneIds.Except(found).ToList();
            if (missing.Count > 0)
            {
                return BadRequest(new { message = $"Zonas no encontradas: {string.Join(", ", missing)}" });
            }
        }

        var now = DateTime.UtcNow;
        var userId = CurrentUserId();

        var entity = new EmailReceiver
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            NotificationType = dto.NotificationType.Trim(),
            IsActive = dto.IsActive,
            CreatedAt = now,
            CreatedBy = userId,
        };

        // Dedupe zone ids in case the client sent the same one twice.
        foreach (var zoneId in dto.ZoneIds.Distinct())
        {
            entity.Zones.Add(new EmailReceiverZone
            {
                ZoneId = zoneId,
                CreatedAt = now,
            });
        }

        _context.EmailReceivers.Add(entity);
        await _context.SaveChangesAsync();

        // Re-fetch with includes so the response carries the zone names.
        return await GetById(entity.EmailReceiverId);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmailReceiverDto>> Update(int id, [FromBody] UpdateEmailReceiverDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var entity = await _context.EmailReceivers
            .Include(r => r.Zones)
            .FirstOrDefaultAsync(r => r.EmailReceiverId == id);

        if (entity == null)
        {
            return NotFound(new { message = "Receptor no encontrado." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Name)) entity.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Email)) entity.Email = dto.Email.Trim();
        if (!string.IsNullOrWhiteSpace(dto.NotificationType)) entity.NotificationType = dto.NotificationType.Trim();
        if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

        // Full sync of zones — replace the existing set. Null means leave alone.
        if (dto.ZoneIds != null)
        {
            var requested = dto.ZoneIds.Distinct().ToList();

            if (requested.Count > 0)
            {
                var found = await _context.Zones
                    .Where(z => requested.Contains(z.ZoneId))
                    .Select(z => z.ZoneId)
                    .ToListAsync();
                var missing = requested.Except(found).ToList();
                if (missing.Count > 0)
                {
                    return BadRequest(new { message = $"Zonas no encontradas: {string.Join(", ", missing)}" });
                }
            }

            var existing = entity.Zones.Select(z => z.ZoneId).ToHashSet();
            var requestedSet = requested.ToHashSet();

            // Remove zones no longer in the list.
            var toRemove = entity.Zones.Where(z => !requestedSet.Contains(z.ZoneId)).ToList();
            foreach (var z in toRemove) entity.Zones.Remove(z);

            // Add new ones.
            var now = DateTime.UtcNow;
            foreach (var zoneId in requested.Where(zid => !existing.Contains(zid)))
            {
                entity.Zones.Add(new EmailReceiverZone
                {
                    EmailReceiverId = entity.EmailReceiverId,
                    ZoneId = zoneId,
                    CreatedAt = now,
                });
            }
        }

        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = CurrentUserId();

        await _context.SaveChangesAsync();
        return await GetById(entity.EmailReceiverId);
    }

    /// <summary>Soft delete (sets IsActive = false). Use ?hard=true for a
    /// real DELETE — cascades to email_receiver_zones via the FK.</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id, [FromQuery] bool hard = false)
    {
        var entity = await _context.EmailReceivers
            .Include(r => r.Zones)
            .FirstOrDefaultAsync(r => r.EmailReceiverId == id);

        if (entity == null)
        {
            return NotFound(new { message = "Receptor no encontrado." });
        }

        if (hard)
        {
            _context.EmailReceivers.Remove(entity);
        }
        else
        {
            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = CurrentUserId();
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // -----------------------------------------------------------------------
    // Preview — renders the "Monitoreo de Jugadas" email exactly as it would
    // be sent, so the admin can review the format before we wire up sending.
    // -----------------------------------------------------------------------

    /// <summary>
    /// Preview for arbitrary zones+date. `zoneIds` is a comma-separated list;
    /// empty/omitted means "all zones". `drawId` scopes the report to a single
    /// lottery — which mirrors reality, since one email is sent per draw
    /// publication. Omitting it shows every draw of the day (browse view).
    /// Returns raw HTML so the frontend can drop it straight into an iframe.
    /// </summary>
    [HttpGet("preview")]
    public async Task<ActionResult> Preview(
        [FromQuery] DateTime? date = null,
        [FromQuery] string? zoneIds = null,
        [FromQuery] int? drawId = null)
    {
        var targetDate = (date ?? DateTime.Now).Date;
        var parsedZoneIds = (zoneIds ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s.Trim(), out var v) ? v : 0)
            .Where(v => v > 0)
            .Distinct()
            .ToList();

        var model = await _reportService.BuildAsync(targetDate, parsedZoneIds, drawId);
        var html = PlayMonitoringEmailBuilder.BuildHtml(model);
        return Content(html, "text/html");
    }

    /// <summary>Preview using the zones already configured on a saved receiver.
    /// `drawId` scopes it to a single lottery (one email per draw publication).</summary>
    [HttpGet("{id:int}/preview")]
    public async Task<ActionResult> PreviewForReceiver(
        int id,
        [FromQuery] DateTime? date = null,
        [FromQuery] int? drawId = null)
    {
        var receiver = await _context.EmailReceivers
            .AsNoTracking()
            .Include(r => r.Zones)
            .FirstOrDefaultAsync(r => r.EmailReceiverId == id);

        if (receiver == null)
        {
            return NotFound(new { message = "Receptor no encontrado." });
        }

        var targetDate = (date ?? DateTime.Now).Date;
        var zoneIds = receiver.Zones.Select(z => z.ZoneId).ToList();

        var model = await _reportService.BuildAsync(targetDate, zoneIds, drawId);
        var html = PlayMonitoringEmailBuilder.BuildHtml(model);
        return Content(html, "text/html");
    }

    // -----------------------------------------------------------------------
    // Manual test send — useful to validate the SMTP setup and the receiver's
    // address without waiting for the publication trigger. Uses the same
    // builder + filtering the real send will use, so what shows up in the
    // inbox is exactly the production email for the given date/draw.
    // -----------------------------------------------------------------------

    /// <summary>
    /// Sends the "Monitoreo de Jugadas" email to a single receiver right now,
    /// using their saved zones. Optional `drawId` filters to a single sorteo
    /// (mirrors the real per-publication email). `date` defaults to today.
    /// </summary>
    [HttpPost("{id:int}/test-send")]
    public async Task<ActionResult> TestSend(
        int id,
        [FromQuery] DateTime? date = null,
        [FromQuery] int? drawId = null)
    {
        var receiver = await _context.EmailReceivers
            .AsNoTracking()
            .Include(r => r.Zones)
            .FirstOrDefaultAsync(r => r.EmailReceiverId == id);

        if (receiver == null)
        {
            return NotFound(new { message = "Receptor no encontrado." });
        }

        if (!receiver.IsActive)
        {
            return BadRequest(new { message = "El receptor está inactivo." });
        }

        var targetDate = (date ?? DateTime.Now).Date;
        var zoneIds = receiver.Zones.Select(z => z.ZoneId).ToList();
        var model = await _reportService.BuildAsync(targetDate, zoneIds, drawId);

        var subject = PlayMonitoringEmailBuilder.BuildSubject(model);
        var html = PlayMonitoringEmailBuilder.BuildHtml(model);

        var result = await _emailService.SendAsync(receiver.Email, subject, html);
        if (!result.Success)
        {
            _logger.LogWarning("Test send to {Email} failed: {Error}", receiver.Email, result.ErrorMessage);
            return StatusCode(502, new
            {
                message = "El servidor SMTP rechazó el envío.",
                error = result.ErrorMessage,
            });
        }

        return Ok(new
        {
            sentTo = receiver.Email,
            subject,
            drawsIncluded = model.Draws.Count,
            totalPlays = model.TotalPlays,
        });
    }
}
