namespace LotteryApi.Services.BalanceCutoff;

public static class BalanceCutoffServiceExtensions
{
    public static IServiceCollection AddBalanceCutoffServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<BalanceCutoffSettings>(
            configuration.GetSection(BalanceCutoffSettings.SectionName));

        services.AddScoped<IBalanceCutoffService, BalanceCutoffService>();

        var settings = configuration.GetSection(BalanceCutoffSettings.SectionName)
            .Get<BalanceCutoffSettings>();

        if (settings?.Enabled != false)
        {
            services.AddHostedService<DailyBalanceCutoffWorker>();
        }

        return services;
    }
}
