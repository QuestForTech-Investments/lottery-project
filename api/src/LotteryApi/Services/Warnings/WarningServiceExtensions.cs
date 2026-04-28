namespace LotteryApi.Services.Warnings;

public static class WarningServiceExtensions
{
    public static IServiceCollection AddWarningServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IWarningService, WarningService>();

        services.Configure<ResultLatenessSettings>(
            configuration.GetSection(ResultLatenessSettings.SectionName));

        var settings = configuration.GetSection(ResultLatenessSettings.SectionName)
            .Get<ResultLatenessSettings>();

        if (settings?.Enabled != false)
        {
            services.AddHostedService<ResultLatenessWorker>();
        }

        return services;
    }
}
