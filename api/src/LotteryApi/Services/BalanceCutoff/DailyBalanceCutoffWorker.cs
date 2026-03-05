using LotteryApi.Helpers;

namespace LotteryApi.Services.BalanceCutoff;

public class BalanceCutoffSettings
{
    public const string SectionName = "BalanceCutoff";
    public bool Enabled { get; set; } = true;
    public string CutoffTimeLocal { get; set; } = "23:59";
    public string TimezoneId { get; set; } = "America/Santo_Domingo";
}

public class DailyBalanceCutoffWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyBalanceCutoffWorker> _logger;
    private readonly BalanceCutoffSettings _settings;

    public DailyBalanceCutoffWorker(
        IServiceProvider serviceProvider,
        ILogger<DailyBalanceCutoffWorker> logger,
        Microsoft.Extensions.Options.IOptions<BalanceCutoffSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyBalanceCutoffWorker started. Cutoff time: {Time} ({Tz})",
            _settings.CutoffTimeLocal, _settings.TimezoneId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var delay = GetDelayUntilNextCutoff();
                _logger.LogInformation("Next balance cutoff in {Minutes:F1} minutes", delay.TotalMinutes);

                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                await RunCutoffAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DailyBalanceCutoffWorker");
                // Wait 5 minutes before retrying
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("DailyBalanceCutoffWorker stopped");
    }

    private TimeSpan GetDelayUntilNextCutoff()
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(_settings.TimezoneId);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

        var timeParts = _settings.CutoffTimeLocal.Split(':');
        var cutoffHour = int.Parse(timeParts[0]);
        var cutoffMinute = int.Parse(timeParts[1]);

        var todayCutoff = new DateTime(nowLocal.Year, nowLocal.Month, nowLocal.Day,
            cutoffHour, cutoffMinute, 0, DateTimeKind.Unspecified);

        // If cutoff time already passed today, schedule for tomorrow
        if (nowLocal >= todayCutoff)
        {
            todayCutoff = todayCutoff.AddDays(1);
        }

        var cutoffUtc = TimeZoneInfo.ConvertTimeToUtc(todayCutoff, tz);
        return cutoffUtc - DateTime.UtcNow;
    }

    private async Task RunCutoffAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var cutoffService = scope.ServiceProvider.GetRequiredService<IBalanceCutoffService>();

        var today = DateTimeHelper.TodayInBusinessTimezone();
        var count = await cutoffService.RunCutoffAsync(today, stoppingToken);

        _logger.LogInformation("Daily cutoff executed: {Count} snapshots for {Date}", count, today);
    }
}
