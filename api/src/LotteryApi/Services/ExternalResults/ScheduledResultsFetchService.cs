using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Background service that fetches results after each draw time.
/// Instead of polling every X minutes, it schedules fetches based on draw times.
/// </summary>
public class ScheduledResultsFetchService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScheduledResultsFetchService> _logger;
    private readonly TimeSpan _fetchDelay = TimeSpan.FromMinutes(5); // Fetch 5 minutes after draw time
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Check every minute

    public ScheduledResultsFetchService(
        IServiceProvider serviceProvider,
        ILogger<ScheduledResultsFetchService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ScheduledResultsFetchService starting");

        // Wait a bit for app to fully start
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndFetchDueDrawsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in scheduled results fetch");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task CheckAndFetchDueDrawsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();
        var externalService = scope.ServiceProvider.GetRequiredService<IExternalResultsService>();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<ExternalResultsSettings>>().Value;

        var now = DateTime.Now;
        var today = DateTime.Today;
        var currentTime = now.TimeOfDay;

        // Get all configured external draw mappings
        var mappings = settings.DrawMappings;
        if (!mappings.Any())
        {
            return;
        }

        // Get draws that have mappings
        var mappedDrawIds = mappings.Select(m => m.InternalDrawId).ToList();

        var draws = await context.Draws
            .Where(d => d.IsActive && mappedDrawIds.Contains(d.DrawId))
            .ToListAsync(cancellationToken);

        foreach (var draw in draws)
        {
            // Calculate the fetch time (draw time + delay)
            var fetchTime = draw.DrawTime.Add(_fetchDelay);

            // Check if current time is past the fetch time but not more than 30 minutes
            var timeSinceFetchDue = currentTime - fetchTime;

            if (timeSinceFetchDue >= TimeSpan.Zero && timeSinceFetchDue <= TimeSpan.FromMinutes(30))
            {
                // Check if we already have a result for this draw today
                var existingResult = await context.Results
                    .AnyAsync(r => r.DrawId == draw.DrawId && r.ResultDate.Date == today, cancellationToken);

                if (!existingResult)
                {
                    _logger.LogInformation(
                        "Fetching result for {DrawName} (scheduled time: {DrawTime}, fetch time: {FetchTime})",
                        draw.DrawName, draw.DrawTime, fetchTime);

                    try
                    {
                        var result = await externalService.FetchResultsForDrawAsync(draw.DrawId, today, cancellationToken);

                        if (result.Success && result.ResultsFetched > 0)
                        {
                            _logger.LogInformation(
                                "Successfully fetched result for {DrawName}: {Message}",
                                draw.DrawName, result.Message);
                        }
                        else
                        {
                            _logger.LogWarning(
                                "No result found for {DrawName}: {Message}",
                                draw.DrawName, result.Message);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error fetching result for {DrawName}", draw.DrawName);
                    }
                }
            }
        }
    }
}

/// <summary>
/// Response DTO for refresh operations
/// </summary>
public class RefreshResultsResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ResultsFetched { get; set; }
    public int ResultsSaved { get; set; }
    public int TicketsProcessed { get; set; }
    public int WinnersFound { get; set; }
    public List<string> Errors { get; set; } = new();
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}
