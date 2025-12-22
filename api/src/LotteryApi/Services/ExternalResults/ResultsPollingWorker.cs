using Microsoft.Extensions.Options;
using LotteryApi.Helpers;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Background worker that polls for lottery results periodically
/// </summary>
public class ResultsPollingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ResultsPollingWorker> _logger;
    private readonly ExternalResultsSettings _settings;

    public ResultsPollingWorker(
        IServiceProvider serviceProvider,
        ILogger<ResultsPollingWorker> logger,
        IOptions<ExternalResultsSettings> settings)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Results Polling Worker starting. Interval: {Interval} minutes",
            _settings.PollingIntervalMinutes);

        // Wait a bit on startup before first poll
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PollResultsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in results polling worker");
            }

            // Wait for next poll interval
            await Task.Delay(TimeSpan.FromMinutes(_settings.PollingIntervalMinutes), stoppingToken);
        }

        _logger.LogInformation("Results Polling Worker stopping");
    }

    private async Task PollResultsAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Polling for lottery results...");

        using var scope = _serviceProvider.CreateScope();
        var resultsService = scope.ServiceProvider.GetRequiredService<IExternalResultsService>();

        // Fetch results for today (in business timezone)
        var today = DateTimeHelper.TodayInBusinessTimezone();
        var response = await resultsService.FetchAndProcessResultsAsync(today, stoppingToken);

        if (response.Success)
        {
            _logger.LogInformation(
                "Poll complete: {Fetched} fetched, {Saved} saved, {Winners} winners found",
                response.ResultsFetched,
                response.ResultsSaved,
                response.WinnersFound);
        }
        else
        {
            _logger.LogWarning("Poll completed with errors: {Message}", response.Message);
            foreach (var error in response.Errors)
            {
                _logger.LogWarning("  - {Error}", error);
            }
        }
    }
}
