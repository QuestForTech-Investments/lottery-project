namespace LotteryApi.Services.Loans;

public static class LoanPaymentServiceExtensions
{
    public static IServiceCollection AddLoanPaymentServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<LoanPaymentSettings>(
            configuration.GetSection(LoanPaymentSettings.SectionName));

        var settings = configuration.GetSection(LoanPaymentSettings.SectionName)
            .Get<LoanPaymentSettings>();

        if (settings?.Enabled != false)
        {
            services.AddHostedService<LoanPaymentWorker>();
        }

        return services;
    }
}
