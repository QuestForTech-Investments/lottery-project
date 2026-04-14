namespace LotteryApi.Services.AutoExpenses;

public static class AutoExpenseServiceExtensions
{
    public static IServiceCollection AddAutoExpenseServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<AutoExpenseSettings>(
            configuration.GetSection(AutoExpenseSettings.SectionName));

        var settings = configuration.GetSection(AutoExpenseSettings.SectionName)
            .Get<AutoExpenseSettings>();

        if (settings?.Enabled != false)
        {
            services.AddHostedService<AutoExpenseWorker>();
        }

        return services;
    }
}
