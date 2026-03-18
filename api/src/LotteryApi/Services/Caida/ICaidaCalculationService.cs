namespace LotteryApi.Services.Caida;

public interface ICaidaCalculationService
{
    /// <summary>
    /// Process scheduled caída for all eligible bancas (DAILY, WEEKLY, MONTHLY, ANNUAL).
    /// Called by the background worker after lotteries close.
    /// </summary>
    Task ProcessScheduledCaidaAsync(DateTime date, CancellationToken ct = default);

    /// <summary>
    /// Process COBRO caída for a specific banca when a collection is approved.
    /// </summary>
    Task<decimal> ProcessCobroCaidaAsync(int bettingPoolId, decimal cobroAmount, int? userId = null, CancellationToken ct = default);
}
