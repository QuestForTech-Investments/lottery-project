using LotteryApi.Helpers;

namespace LotteryApi.Services.Caida;

public class CaidaSettings
{
    public const string SectionName = "Caida";
    public bool Enabled { get; set; } = true;
    /// <summary>Time of day (business timezone) to run caída calculations. Should be after all lotteries close.</summary>
    public string ProcessTimeLocal { get; set; } = "23:55";
    public string TimezoneId { get; set; } = "America/Santo_Domingo";
}

public class CaidaCalculationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CaidaCalculationWorker> _logger;
    private readonly CaidaSettings _settings;

    public CaidaCalculationWorker(
        IServiceProvider serviceProvider,
        ILogger<CaidaCalculationWorker> logger,
        Microsoft.Extensions.Options.IOptions<CaidaSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CaidaCalculationWorker started. Process time: {Time} ({Tz})",
            _settings.ProcessTimeLocal, _settings.TimezoneId);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var delay = GetDelayUntilNextRun();
                _logger.LogInformation("Next caída calculation in {Minutes:F1} minutes", delay.TotalMinutes);

                await Task.Delay(delay, stoppingToken);
                if (stoppingToken.IsCancellationRequested) break;

                var today = DateTimeHelper.TodayInBusinessTimezone();
                _logger.LogInformation("Starting caída calculation for {Date}", today);

                using var scope = _serviceProvider.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<ICaidaCalculationService>();
                await service.ProcessScheduledCaidaAsync(today, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CaidaCalculationWorker");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("CaidaCalculationWorker stopped");
    }

    private TimeSpan GetDelayUntilNextRun()
    {
        var tz = TimeZoneInfo.FindSystemTimeZoneById(_settings.TimezoneId);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

        var timeParts = _settings.ProcessTimeLocal.Split(':');
        var hour = int.Parse(timeParts[0]);
        var minute = int.Parse(timeParts[1]);

        var todayRun = new DateTime(nowLocal.Year, nowLocal.Month, nowLocal.Day,
            hour, minute, 0, DateTimeKind.Unspecified);

        if (nowLocal >= todayRun)
        {
            todayRun = todayRun.AddDays(1);
        }

        var runUtc = TimeZoneInfo.ConvertTimeToUtc(todayRun, tz);
        return runUtc - DateTime.UtcNow;
    }
}
