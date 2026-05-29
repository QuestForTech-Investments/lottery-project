using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services;

public class PlayMonitoringScheduledSettings
{
    public const string SectionName = "PlayMonitoringScheduled";

    public bool Enabled { get; set; } = true;

    /// <summary>Seconds after a draw's close time before the email is fired.</summary>
    public int OffsetSeconds { get; set; } = 30;

    /// <summary>How often (seconds) the worker scans for closed draws.</summary>
    public int ScanIntervalSeconds { get; set; } = 30;

    /// <summary>
    /// Look-back window (minutes) — if a draw closed less than this many minutes
    /// ago and hasn't been fired yet, send it. Avoids firing for draws that
    /// closed yesterday/days ago when the worker first starts up.
    /// </summary>
    public int LookbackMinutes { get; set; } = 120;
}

/// <summary>
/// Fires the "Monitoreo de Jugadas" email automatically <c>OffsetSeconds</c>
/// after a draw closes (i.e. its weekly EndTime / DrawTime). Independent from
/// result publication — the email goes out at the close time even if no result
/// has been entered yet, so receivers know exactly what was played for the
/// draw.
///
/// Idempotent: skips draws that already have at least one row in
/// <c>email_send_log</c> for the (drawId, date) pair.
/// </summary>
public class PlayMonitoringScheduledWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PlayMonitoringScheduledWorker> _logger;
    private readonly PlayMonitoringScheduledSettings _settings;

    public PlayMonitoringScheduledWorker(
        IServiceProvider serviceProvider,
        ILogger<PlayMonitoringScheduledWorker> logger,
        Microsoft.Extensions.Options.IOptions<PlayMonitoringScheduledSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("PlayMonitoringScheduledWorker disabled via settings");
            return;
        }

        _logger.LogInformation(
            "PlayMonitoringScheduledWorker started. Fires at close + {Offset}s, scan every {Every}s, lookback {Lookback}m",
            _settings.OffsetSeconds, _settings.ScanIntervalSeconds, _settings.LookbackMinutes);

        var period = TimeSpan.FromSeconds(Math.Max(5, _settings.ScanIntervalSeconds));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ScanAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PlayMonitoringScheduledWorker scan");
            }

            try { await Task.Delay(period, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }

        _logger.LogInformation("PlayMonitoringScheduledWorker stopped");
    }

    private async Task ScanAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();
        var notifier = scope.ServiceProvider.GetRequiredService<PlayMonitoringNotifier>();

        var nowUtc = DateTime.UtcNow;
        var offset = TimeSpan.FromSeconds(_settings.OffsetSeconds);
        var lookback = TimeSpan.FromMinutes(Math.Max(1, _settings.LookbackMinutes));

        var draws = await context.Draws
            .AsNoTracking()
            .Include(d => d.Lottery)
            .Include(d => d.WeeklySchedules)
            .Where(d => d.IsActive && d.Lottery!.IsActive)
            .ToListAsync(stoppingToken);

        var firedCount = 0;

        foreach (var draw in draws)
        {
            if (stoppingToken.IsCancellationRequested) break;

            var tzId = draw.Lottery?.Timezone ?? "America/Santo_Domingo";
            TimeZoneInfo tz;
            try { tz = TimeZoneInfo.FindSystemTimeZoneById(tzId); }
            catch { tz = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo"); }

            var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz);
            var todayLocal = nowLocal.Date;

            // Resolve today's close time. Mirrors ResultLatenessWorker — weekly
            // schedule's EndTime if applicable, otherwise the draw's own time.
            TimeSpan? closeTimeOfDay;
            if (draw.UseWeeklySchedule)
            {
                var todayDow = (byte)nowLocal.DayOfWeek;
                var todaySchedule = draw.WeeklySchedules?
                    .FirstOrDefault(ws => ws.DayOfWeek == todayDow && ws.IsActive);
                if (todaySchedule == null) continue;
                closeTimeOfDay = todaySchedule.EndTime;
            }
            else
            {
                closeTimeOfDay = draw.DrawTime;
            }

            if (!closeTimeOfDay.HasValue) continue;

            var closeLocal = todayLocal.Add(closeTimeOfDay.Value);
            var triggerLocal = closeLocal.Add(offset);

            // Fire only inside the window [triggerLocal, triggerLocal + lookback].
            // The upper bound guards against firing for old draws on first startup.
            if (nowLocal < triggerLocal) continue;
            if (nowLocal > triggerLocal.Add(lookback)) continue;

            // Idempotency — any existing send log row for (draw, today) means
            // the email already fired (some receivers may have failed; those
            // are intentionally not retried by this worker).
            var alreadyFired = await context.EmailSendLogs
                .AsNoTracking()
                .AnyAsync(s => s.DrawId == draw.DrawId && s.ResultDate == todayLocal,
                    stoppingToken);
            if (alreadyFired) continue;

            try
            {
                await notifier.NotifyResultPublishedAsync(draw.DrawId, todayLocal, stoppingToken);
                firedCount++;
                _logger.LogInformation(
                    "Fired monitoring email for draw {DrawId} ({DrawName}) on {Date} — close was {Close} local",
                    draw.DrawId, draw.DrawName, todayLocal.ToString("yyyy-MM-dd"), closeLocal.ToString("HH:mm:ss"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to fire monitoring email for draw {DrawId} on {Date}",
                    draw.DrawId, todayLocal);
            }
        }

        if (firedCount > 0)
        {
            _logger.LogInformation("PlayMonitoringScheduled scan: fired {Count} draws", firedCount);
        }
    }
}
