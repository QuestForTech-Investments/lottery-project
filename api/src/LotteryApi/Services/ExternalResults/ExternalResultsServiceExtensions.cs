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

        // Get scraper settings with environment variable overrides
        var scraperSettings = ExternalScraperSettings.FromConfiguration(configuration);

        // Register settings as singleton for injection
        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(scraperSettings));

        // Register External Scraper Provider with typed HttpClient
        services.AddHttpClient<ExternalScraperProvider>(client =>
        {
            client.BaseAddress = new Uri(scraperSettings.BaseUrl);
            client.Timeout = TimeSpan.FromSeconds(scraperSettings.TimeoutSeconds);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        // Register as ILotteryResultProvider
        services.AddSingleton<ILotteryResultProvider>(sp =>
            sp.GetRequiredService<ExternalScraperProvider>());

        // Register main service
        services.AddScoped<IExternalResultsService, ExternalResultsService>();

        // Register background worker based on configuration
        var settings = configuration
            .GetSection(ExternalResultsSettings.SectionName)
            .Get<ExternalResultsSettings>();

        if (settings?.UseScheduledFetch == true)
        {
            // Use draw-time-based scheduled fetching
            services.AddHostedService<ScheduledResultsFetchService>();
        }
        else if (settings?.PollingIntervalMinutes > 0)
        {
            // Use periodic polling
            services.AddHostedService<ResultsPollingWorker>();
        }

        // Register Lotocompany sync worker (syncs from original app every 5 minutes)
        services.Configure<LotocompanySettings>(
            configuration.GetSection(LotocompanySettings.SectionName));

        var lotocompanySettings = configuration
            .GetSection(LotocompanySettings.SectionName)
            .Get<LotocompanySettings>();

        if (lotocompanySettings?.IsEnabled == true)
        {
            // Register HttpClient for Lotocompany
            services.AddHttpClient("Lotocompany", client =>
            {
                client.BaseAddress = new Uri(lotocompanySettings.BaseUrl);
                client.Timeout = TimeSpan.FromSeconds(lotocompanySettings.TimeoutSeconds);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            });

            // Register sync worker
            services.AddHostedService<LotocompanySyncWorker>();
        }

        return services;
    }
}
