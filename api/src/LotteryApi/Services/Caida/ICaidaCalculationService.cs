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

    /// <summary>
    /// Recalculate real-time caída and accumulated_fall for a banca based on current day's net.
    /// Called after ticket creation to keep display values up-to-date.
    /// Does NOT credit balance — that happens at end of day.
    /// </summary>
    Task UpdateRealtimeCaidaAsync(int bettingPoolId, CancellationToken ct = default);

    /// <summary>
    /// Get current caída and accumulated fall for a banca (real-time, for display).
    /// </summary>
    Task<(decimal caida, decimal accumulatedFall)> GetRealtimeCaidaAsync(int bettingPoolId, DateTime date, CancellationToken ct = default);
}
