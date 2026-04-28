using LotteryApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services.Warnings;

public class ResultLatenessSettings
{
    public const string SectionName = "ResultLateness";
    public bool Enabled { get; set; } = true;
    /// <summary>Minutes after scheduled draw time before raising the warning.</summary>
    public int LateThresholdMinutes { get; set; } = 30;
    /// <summary>How often (minutes) to scan for late draws.</summary>
    public int CheckEveryMinutes { get; set; } = 10;
}

/// <summary>
/// Periodically checks for draws whose scheduled time has passed but whose
/// result hasn't been published. Records one RESULT_PUBLICATION_LATE warning
/// per (drawId, date) — idempotent.
/// </summary>
public class ResultLatenessWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResultLatenessWorker> _logger;
    private readonly ResultLatenessSettings _settings;

    public ResultLatenessWorker(
        IServiceProvider serviceProvider,
        ILogger<ResultLatenessWorker> logger,
        Microsoft.Extensions.Options.IOptions<ResultLatenessSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "ResultLatenessWorker started. Threshold: {Minutes} min, scan every: {Every} min",
            _settings.LateThresholdMinutes, _settings.CheckEveryMinutes);

        var period = TimeSpan.FromMinutes(Math.Max(1, _settings.CheckEveryMinutes));

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
                _logger.LogError(ex, "Error in ResultLatenessWorker scan");
            }

            try { await Task.Delay(period, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }

        _logger.LogInformation("ResultLatenessWorker stopped");
    }

    private async Task ScanAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();
        var warnings = scope.ServiceProvider.GetRequiredService<IWarningService>();

        var nowUtc = DateTime.UtcNow;
        var threshold = TimeSpan.FromMinutes(_settings.LateThresholdMinutes);

        var draws = await context.Draws
            .AsNoTracking()
            .Include(d => d.Lottery)
            .Include(d => d.WeeklySchedules)
            .Where(d => d.IsActive && d.Lottery!.IsActive)
            .ToListAsync(stoppingToken);

        var checkedCount = 0;
        var raisedCount = 0;

        foreach (var draw in draws)
        {
            if (stoppingToken.IsCancellationRequested) break;

            var tzId = draw.Lottery?.Timezone ?? "America/Santo_Domingo";
            TimeZoneInfo tz;
            try { tz = TimeZoneInfo.FindSystemTimeZoneById(tzId); }
            catch { tz = TimeZoneInfo.FindSystemTimeZoneById("America/Santo_Domingo"); }

            var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, tz);
            var todayLocal = nowLocal.Date;

            // Resolve today's scheduled time honoring weekly schedules.
            // If the draw uses a weekly schedule and today has no active entry,
            // the draw isn't running today — skip.
            TimeSpan? scheduledTimeOfDay;
            if (draw.UseWeeklySchedule)
            {
                var todayDow = (byte)nowLocal.DayOfWeek;
                var todaySchedule = draw.WeeklySchedules?
                    .FirstOrDefault(ws => ws.DayOfWeek == todayDow && ws.IsActive);
                if (todaySchedule == null) continue;
                scheduledTimeOfDay = todaySchedule.EndTime;
            }
            else
            {
                scheduledTimeOfDay = draw.DrawTime;
            }

            var scheduledLocal = todayLocal.Add(scheduledTimeOfDay.Value);
            var deadlineLocal = scheduledLocal.Add(threshold);

            // Has the deadline passed in the draw's timezone?
            if (nowLocal < deadlineLocal) continue;

            checkedCount++;

            // Result already published for today?
            var hasResult = await context.Results
                .AsNoTracking()
                .AnyAsync(r => r.DrawId == draw.DrawId
                    && r.ResultDate.Date == todayLocal,
                    stoppingToken);
            if (hasResult) continue;

            // Idempotency: already raised for this (draw, day)?
            var refId = $"{draw.DrawId}_{todayLocal:yyyy-MM-dd}";
            var alreadyRaised = await warnings.ExistsAsync(
                WarningTypes.ResultPublicationLate, refId, "draw", stoppingToken);
            if (alreadyRaised) continue;

            var minutesLate = (int)Math.Floor((nowLocal - scheduledLocal).TotalMinutes);
            var scheduledTimeLabel = scheduledLocal.ToString("HH:mm");

            await warnings.RecordAsync(
                type: WarningTypes.ResultPublicationLate,
                message: $"El sorteo {draw.DrawName} no se ha publicado (hora programada: {scheduledTimeLabel})",
                bettingPoolId: null,
                userId: null,
                referenceId: refId,
                referenceType: "draw",
                severity: "high",
                metadata: new
                {
                    drawId = draw.DrawId,
                    drawName = draw.DrawName,
                    scheduledTimeLocal = scheduledLocal,
                    scheduledTimeLabel,
                    timezone = tzId,
                    minutesLate
                },
                cancellationToken: stoppingToken);

            raisedCount++;
        }

        if (checkedCount > 0)
        {
            _logger.LogInformation(
                "ResultLateness scan: checked {Checked} draws past deadline, raised {Raised} warnings",
                checkedCount, raisedCount);
        }
    }
}
