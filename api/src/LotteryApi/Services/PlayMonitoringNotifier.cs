using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services;

/// <summary>
/// Fires the "Monitoreo de Jugadas" email when a lottery result is published
/// for a specific <c>(drawId, resultDate)</c> pair. One email per receiver
/// whose zones include at least one banca that played in that draw — empty
/// receivers get a SKIPPED_EMPTY row instead of a real send.
///
/// Idempotent: if a SENT row already exists for the same
/// <c>(receiver, draw, date)</c>, that receiver is silently skipped. So if
/// the result is updated/re-saved, no duplicate email goes out.
/// </summary>
public class PlayMonitoringNotifier
{
    private readonly LotteryDbContext _context;
    private readonly PlayMonitoringReportService _reportService;
    private readonly IEmailService _emailService;
    private readonly ILogger<PlayMonitoringNotifier> _logger;

    public PlayMonitoringNotifier(
        LotteryDbContext context,
        PlayMonitoringReportService reportService,
        IEmailService emailService,
        ILogger<PlayMonitoringNotifier> logger)
    {
        _context = context;
        _reportService = reportService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task NotifyResultPublishedAsync(
        int drawId,
        DateTime resultDate,
        CancellationToken cancellationToken = default)
    {
        var dateOnly = resultDate.Date;
        _logger.LogInformation("Notify result published — draw {DrawId} on {Date}", drawId, dateOnly);

        var receivers = await _context.EmailReceivers
            .AsNoTracking()
            .Include(r => r.Zones)
            .Where(r => r.IsActive
                && r.NotificationType == "MONITOREO_JUGADAS")
            .ToListAsync(cancellationToken);

        if (receivers.Count == 0)
        {
            _logger.LogInformation("No active MONITOREO_JUGADAS receivers; nothing to send");
            return;
        }

        // Receivers already notified for this (draw, date) — skip them to keep
        // the operation idempotent across retries / re-saves.
        var alreadySent = await _context.EmailSendLogs
            .AsNoTracking()
            .Where(s => s.DrawId == drawId
                && s.ResultDate == dateOnly
                && s.Status == EmailSendStatus.Sent)
            .Select(s => s.EmailReceiverId)
            .ToListAsync(cancellationToken);
        var alreadySentSet = new HashSet<int>(alreadySent);

        foreach (var receiver in receivers)
        {
            if (alreadySentSet.Contains(receiver.EmailReceiverId))
            {
                _logger.LogDebug("Receiver {Id} already notified for draw {DrawId} on {Date} — skipping",
                    receiver.EmailReceiverId, drawId, dateOnly);
                continue;
            }

            try
            {
                await SendToReceiverAsync(receiver, drawId, dateOnly, cancellationToken);
            }
            catch (Exception ex)
            {
                // SendToReceiverAsync already logs its own failures into the
                // send log; this catch is for truly unexpected (e.g. DB) errors
                // that escape the per-receiver scope.
                _logger.LogError(ex, "Unexpected error notifying receiver {Id}", receiver.EmailReceiverId);
            }
        }
    }

    private async Task SendToReceiverAsync(
        EmailReceiver receiver,
        int drawId,
        DateTime dateOnly,
        CancellationToken cancellationToken)
    {
        var zoneIds = receiver.Zones.Select(z => z.ZoneId).ToList();
        var model = await _reportService.BuildAsync(dateOnly, zoneIds, drawId);

        // Even when there are no plays, we still send — the builder shows
        // "No hay jugadas registradas para este sorteo" so the receiver gets
        // a positive confirmation that the publication happened. Useful as a
        // "heartbeat" for ops to know the system is alive.
        //
        // When there are no draws in the model (e.g. drawId not in the data),
        // fall back to a minimal model with the requested draw so the header
        // still names the sorteo correctly.
        if (model.Draws.Count == 0)
        {
            model.Draws.Add(await BuildEmptyDrawAsync(drawId, cancellationToken));
        }

        var subject = PlayMonitoringEmailBuilder.BuildSubject(model);
        var html = PlayMonitoringEmailBuilder.BuildHtml(model);

        var result = await _emailService.SendAsync(receiver.Email, subject, html, cancellationToken);

        _context.EmailSendLogs.Add(new EmailSendLog
        {
            EmailReceiverId = receiver.EmailReceiverId,
            DrawId = drawId,
            ResultDate = dateOnly,
            Status = result.Success ? EmailSendStatus.Sent : EmailSendStatus.Failed,
            Subject = subject,
            // Trim to fit the column; full stack lives in the regular logger sink.
            ErrorMessage = result.ErrorMessage?.Length > 2000
                ? result.ErrorMessage[..2000]
                : result.ErrorMessage,
            SentAt = DateTime.UtcNow,
        });
        await _context.SaveChangesAsync(cancellationToken);

        if (!result.Success)
        {
            _logger.LogWarning("Email to {Email} failed: {Error}", receiver.Email, result.ErrorMessage);
        }
    }

    /// <summary>
    /// Builds a placeholder <see cref="PlayMonitoringEmailBuilder.ReportDraw"/>
    /// when the report has no plays for the requested draw, so the email's
    /// single-draw header still shows the right lottery name + logo.
    /// </summary>
    private async Task<PlayMonitoringEmailBuilder.ReportDraw> BuildEmptyDrawAsync(
        int drawId, CancellationToken cancellationToken)
    {
        var meta = await _context.Draws
            .AsNoTracking()
            .Where(d => d.DrawId == drawId)
            .Select(d => new
            {
                d.DrawName,
                d.DisplayColor,
                d.Abbreviation,
                LogoUrl = d.Lottery!.ImageUrl,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return new PlayMonitoringEmailBuilder.ReportDraw
        {
            DrawId = drawId,
            DrawName = meta?.DrawName ?? $"Sorteo {drawId}",
            LogoUrl = meta?.LogoUrl,
            Color = meta?.DisplayColor,
            Abbreviation = meta?.Abbreviation,
            Total = 0m,
            BetTypes = new List<PlayMonitoringEmailBuilder.ReportBetType>(),
        };
    }
}
