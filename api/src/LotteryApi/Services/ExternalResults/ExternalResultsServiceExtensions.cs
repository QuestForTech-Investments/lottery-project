namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Extension methods for registering external results services
/// </summary>
public static class ExternalResultsServiceExtensions
{
    /// <summary>
    /// Add external lottery results services to the DI container
    /// </summary>
    public static IServiceCollection AddExternalResultsServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register settings
        services.Configure<ExternalResultsSettings>(
            configuration.GetSection(ExternalResultsSettings.SectionName));
        services.Configure<UsaLotterySettings>(
            configuration.GetSection(UsaLotterySettings.SectionName));
        services.Configure<DominicanLotterySettings>(
            configuration.GetSection(DominicanLotterySettings.SectionName));
        services.Configure<UsaLotteryScraperSettings>(
            configuration.GetSection(UsaLotteryScraperSettings.SectionName));

        // Register HTTP clients for providers
        services.AddHttpClient<UsaLotteryProvider>();
        services.AddHttpClient<DominicanLotteryProvider>();
        services.AddHttpClient<UsaLotteryScraperProvider>();

        // Register providers
        services.AddScoped<ILotteryResultProvider, UsaLotteryProvider>();
        services.AddScoped<ILotteryResultProvider, DominicanLotteryProvider>();
        services.AddScoped<ILotteryResultProvider, UsaLotteryScraperProvider>();

        // Register main service
        services.AddScoped<IExternalResultsService, ExternalResultsService>();

        // Register background worker based on configuration
        var settings = configuration.GetSection(ExternalResultsSettings.SectionName).Get<ExternalResultsSettings>();

        if (settings?.UseScheduledFetch == true)
        {
            // Use draw-time-based scheduled fetching (more efficient for paid APIs)
            services.AddHostedService<ScheduledResultsFetchService>();
        }
        else if (settings?.PollingIntervalMinutes > 0)
        {
            // Use periodic polling (works for free scraping)
            services.AddHostedService<ResultsPollingWorker>();
        }

        return services;
    }
}
