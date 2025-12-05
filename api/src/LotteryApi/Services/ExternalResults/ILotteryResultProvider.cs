using LotteryApi.DTOs;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Interface for external lottery result providers
/// </summary>
public interface ILotteryResultProvider
{
    /// <summary>
    /// Provider name for identification
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Supported lottery types (e.g., "USA", "Dominican")
    /// </summary>
    string[] SupportedRegions { get; }

    /// <summary>
    /// Check if the provider is available and configured
    /// </summary>
    Task<bool> IsAvailableAsync();

    /// <summary>
    /// Fetch results for a specific date
    /// </summary>
    /// <param name="date">The date to fetch results for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of external results</returns>
    Task<List<ExternalResultDto>> FetchResultsAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetch results for a specific lottery and date
    /// </summary>
    /// <param name="lotteryName">Name of the lottery (e.g., "Florida", "Loteka")</param>
    /// <param name="date">The date to fetch results for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of external results</returns>
    Task<List<ExternalResultDto>> FetchResultsForLotteryAsync(string lotteryName, DateTime date, CancellationToken cancellationToken = default);
}
