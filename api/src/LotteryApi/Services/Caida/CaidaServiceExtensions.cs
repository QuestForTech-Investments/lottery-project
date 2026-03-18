namespace LotteryApi.Services.Caida;

public static class CaidaServiceExtensions
{
    public static IServiceCollection AddCaidaServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<ICaidaCalculationService, CaidaCalculationService>();

        services.Configure<CaidaSettings>(
            configuration.GetSection(CaidaSettings.SectionName));

        var settings = configuration.GetSection(CaidaSettings.SectionName)
            .Get<CaidaSettings>();

        if (settings?.Enabled != false)
        {
            services.AddHostedService<CaidaCalculationWorker>();
        }

        return services;
    }
}
