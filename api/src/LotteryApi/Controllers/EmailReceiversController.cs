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

    public EmailReceiversController(LotteryDbContext context, ILogger<EmailReceiversController> logger)
    {
        _context = context;
        _logger = logger;
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

        var model = await BuildReportModelAsync(targetDate, parsedZoneIds, drawId);
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

        var model = await BuildReportModelAsync(targetDate, zoneIds, drawId);
        var html = PlayMonitoringEmailBuilder.BuildHtml(model);
        return Content(html, "text/html");
    }

    /// <summary>
    /// Aggregates active plays for the given date+zones, grouped
    /// Draw → BetType → (number, amount), and packages them into the email
    /// builder's model. Mirrors the BlackboardController filtering (cancelled
    /// tickets/lines excluded) but additionally splits by draw.
    /// </summary>
    private async Task<PlayMonitoringEmailBuilder.ReportModel> BuildReportModelAsync(
        DateTime targetDate, List<int> zoneIds, int? drawId = null)
    {
        var utcStart = DateTimeHelper.GetUtcStartOfDay(targetDate);
        var utcEnd = DateTimeHelper.GetUtcEndOfDay(targetDate);

        var query = _context.TicketLines
            .AsNoTracking()
            .Where(tl => !tl.Ticket!.IsCancelled
                && tl.LineStatus != "cancelled"
                && tl.Ticket.CreatedAt >= utcStart
                && tl.Ticket.CreatedAt < utcEnd
                && tl.BetTypeCode != null);

        // Scope to a single lottery when requested — this is the real per-draw
        // email; without it the preview shows the whole day.
        if (drawId.HasValue)
        {
            query = query.Where(tl => tl.DrawId == drawId.Value);
        }

        if (zoneIds.Count > 0)
        {
            var bpIds = await _context.BettingPools
                .AsNoTracking()
                .Where(bp => zoneIds.Contains(bp.ZoneId))
                .Select(bp => bp.BettingPoolId)
                .ToListAsync();

            // No bancas in those zones → empty report.
            if (bpIds.Count == 0)
            {
                return new PlayMonitoringEmailBuilder.ReportModel
                {
                    Date = targetDate,
                    ZoneNames = await ZoneNamesAsync(zoneIds),
                };
            }
            query = query.Where(tl => bpIds.Contains(tl.Ticket!.BettingPoolId));
        }

        var grouped = await query
            .GroupBy(tl => new { tl.DrawId, tl.BetTypeCode, tl.BetNumber })
            .Select(g => new
            {
                g.Key.DrawId,
                g.Key.BetTypeCode,
                g.Key.BetNumber,
                TotalAmount = g.Sum(x => x.BetAmount),
            })
            .ToListAsync();

        var model = new PlayMonitoringEmailBuilder.ReportModel
        {
            Date = targetDate,
            ZoneNames = await ZoneNamesAsync(zoneIds),
        };

        if (grouped.Count == 0)
        {
            return model;
        }

        // Lookup tables for display names + ordering. Pulls the lottery icon so
        // the email can show the draw's logo (with a colored-abbreviation fallback).
        var drawIds = grouped.Select(g => g.DrawId).Distinct().ToList();
        var drawMeta = await _context.Draws
            .AsNoTracking()
            .Where(d => drawIds.Contains(d.DrawId))
            .Select(d => new
            {
                d.DrawId,
                d.DrawName,
                d.DisplayColor,
                d.Abbreviation,
                LogoUrl = d.Lottery!.ImageUrl,
            })
            .ToDictionaryAsync(d => d.DrawId);

        var codes = grouped.Select(g => g.BetTypeCode!).Distinct().ToList();
        var gameTypes = await _context.GameTypes
            .AsNoTracking()
            .Where(gt => codes.Contains(gt.GameTypeCode))
            .ToDictionaryAsync(gt => gt.GameTypeCode, gt => new { gt.GameName, gt.DisplayOrder });

        // Build the nested Draw → BetType → Plays structure.
        var draws = grouped
            .GroupBy(g => g.DrawId)
            .Select(drawGroup =>
            {
                var betTypes = drawGroup
                    .GroupBy(x => x.BetTypeCode!)
                    .Select(btGroup =>
                    {
                        var meta = gameTypes.TryGetValue(btGroup.Key, out var m) ? m : null;
                        return new PlayMonitoringEmailBuilder.ReportBetType
                        {
                            Code = btGroup.Key,
                            Name = meta?.GameName ?? btGroup.Key,
                            Total = btGroup.Sum(x => x.TotalAmount),
                            Plays = btGroup
                                .OrderBy(x => x.BetNumber)
                                .Select(x => new PlayMonitoringEmailBuilder.ReportPlay
                                {
                                    BetNumber = x.BetNumber,
                                    Amount = x.TotalAmount,
                                })
                                .ToList(),
                            // Stash order for sorting below.
                            DisplayOrder = meta?.DisplayOrder ?? 9999,
                        };
                    })
                    .OrderBy(bt => bt.DisplayOrder)
                    .ThenBy(bt => bt.Name)
                    .ToList();

                var meta = drawMeta.TryGetValue(drawGroup.Key, out var dm) ? dm : null;
                return new PlayMonitoringEmailBuilder.ReportDraw
                {
                    DrawId = drawGroup.Key,
                    DrawName = meta?.DrawName ?? $"Sorteo {drawGroup.Key}",
                    LogoUrl = meta?.LogoUrl,
                    Color = meta?.DisplayColor,
                    Abbreviation = meta?.Abbreviation,
                    Total = betTypes.Sum(bt => bt.Total),
                    BetTypes = betTypes,
                };
            })
            .OrderBy(d => d.DrawName)
            .ToList();

        model.Draws = draws;
        model.GrandTotal = draws.Sum(d => d.Total);
        model.TotalPlays = grouped.Count;
        model.DistinctNumbers = grouped.Select(g => g.BetNumber).Distinct().Count();
        return model;
    }

    private async Task<List<string>> ZoneNamesAsync(List<int> zoneIds)
    {
        if (zoneIds.Count == 0) return new List<string>();
        return await _context.Zones
            .AsNoTracking()
            .Where(z => zoneIds.Contains(z.ZoneId))
            .OrderBy(z => z.ZoneName)
            .Select(z => z.ZoneName)
            .ToListAsync();
    }
}
