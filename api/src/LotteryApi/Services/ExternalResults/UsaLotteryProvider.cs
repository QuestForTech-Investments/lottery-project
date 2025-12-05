using System.Text.Json;
using LotteryApi.DTOs;
using Microsoft.Extensions.Options;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Provider for USA lottery results using RapidAPI
/// </summary>
public class UsaLotteryProvider : ILotteryResultProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<UsaLotteryProvider> _logger;
    private readonly UsaLotterySettings _settings;

    public string ProviderName => "USA Lottery API (RapidAPI)";
    public string[] SupportedRegions => new[] { "USA", "Florida", "New York", "Georgia", "California", "Massachusetts" };

    public UsaLotteryProvider(
        HttpClient httpClient,
        ILogger<UsaLotteryProvider> logger,
        IOptions<UsaLotterySettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;

        // Configure HTTP client for RapidAPI
        if (!string.IsNullOrEmpty(_settings.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Key", _settings.ApiKey);
            _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Host", "usa-lottery-result-all-state-api.p.rapidapi.com");
        }
    }

    public Task<bool> IsAvailableAsync()
    {
        return Task.FromResult(!string.IsNullOrEmpty(_settings.ApiKey) && _settings.IsEnabled);
    }

    public async Task<List<ExternalResultDto>> FetchResultsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        // Fetch for all supported states
        var states = new[] { "florida", "new-york", "georgia", "california", "massachusetts" };

        foreach (var state in states)
        {
            try
            {
                var stateResults = await FetchResultsForLotteryAsync(state, date, cancellationToken);
                results.AddRange(stateResults);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch results for {State}", state);
            }
        }

        return results;
    }

    public async Task<List<ExternalResultDto>> FetchResultsForLotteryAsync(string lotteryName, DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        if (!await IsAvailableAsync())
        {
            _logger.LogWarning("USA Lottery provider is not available (API key not configured)");
            return results;
        }

        try
        {
            // Normalize state name for API
            var stateName = NormalizeStateName(lotteryName);
            var dateStr = date.ToString("yyyy-MM-dd");

            // RapidAPI endpoint format
            var url = $"{_settings.BaseUrl}/{stateName}?date={dateStr}";

            _logger.LogInformation("Fetching USA lottery results from {Url}", url);

            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("API returned {StatusCode} for {State}", response.StatusCode, stateName);
                return results;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            // Parse the response - structure varies by API
            results = ParseApiResponse(data, lotteryName, date);

            _logger.LogInformation("Fetched {Count} results for {State} on {Date}", results.Count, stateName, dateStr);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching results for {Lottery}", lotteryName);
        }

        return results;
    }

    private string NormalizeStateName(string name)
    {
        return name.ToLower() switch
        {
            "florida" or "fl" => "florida",
            "new york" or "ny" or "new-york" => "new-york",
            "georgia" or "ga" => "georgia",
            "california" or "ca" => "california",
            "massachusetts" or "mass" or "ma" => "massachusetts",
            _ => name.ToLower().Replace(" ", "-")
        };
    }

    private List<ExternalResultDto> ParseApiResponse(JsonElement data, string lotteryName, DateTime date)
    {
        var results = new List<ExternalResultDto>();

        try
        {
            // Handle different API response formats
            // This is a generic parser - adjust based on actual API response structure

            if (data.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in data.EnumerateArray())
                {
                    var result = ParseResultItem(item, lotteryName, date);
                    if (result != null)
                        results.Add(result);
                }
            }
            else if (data.TryGetProperty("games", out var games))
            {
                foreach (var game in games.EnumerateArray())
                {
                    var result = ParseResultItem(game, lotteryName, date);
                    if (result != null)
                        results.Add(result);
                }
            }
            else if (data.TryGetProperty("results", out var resultsArray))
            {
                foreach (var item in resultsArray.EnumerateArray())
                {
                    var result = ParseResultItem(item, lotteryName, date);
                    if (result != null)
                        results.Add(result);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing API response for {Lottery}", lotteryName);
        }

        return results;
    }

    private ExternalResultDto? ParseResultItem(JsonElement item, string lotteryName, DateTime date)
    {
        try
        {
            // Try to extract game name
            var gameName = GetStringProperty(item, "game", "gameName", "name", "type") ?? "Unknown";

            // Try to extract draw time
            var drawTime = GetStringProperty(item, "drawTime", "time", "session") ?? "";

            // Try to extract winning numbers
            var numbers = GetNumbers(item);
            if (numbers.Length == 0)
                return null;

            // Determine if this is Pick 3 or Pick 4 based on number length
            var winningNumber = string.Join("", numbers);

            return new ExternalResultDto
            {
                LotteryName = lotteryName,
                GameName = gameName,
                DrawTime = drawTime,
                DrawDate = date,
                WinningNumber = winningNumber,
                Numbers = numbers,
                Source = ProviderName,
                FetchedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse result item");
            return null;
        }
    }

    private string? GetStringProperty(JsonElement element, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop))
                return prop.GetString();
        }
        return null;
    }

    private string[] GetNumbers(JsonElement element)
    {
        // Try different property names
        var propertyNames = new[] { "numbers", "winningNumbers", "winning_numbers", "result", "digits" };

        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop))
            {
                if (prop.ValueKind == JsonValueKind.Array)
                {
                    return prop.EnumerateArray()
                        .Select(n => n.ValueKind == JsonValueKind.Number ? n.GetInt32().ToString() : n.GetString() ?? "")
                        .ToArray();
                }
                else if (prop.ValueKind == JsonValueKind.String)
                {
                    var str = prop.GetString() ?? "";
                    return str.ToCharArray().Select(c => c.ToString()).ToArray();
                }
            }
        }

        return Array.Empty<string>();
    }
}

/// <summary>
/// Settings for USA Lottery API
/// </summary>
public class UsaLotterySettings
{
    public const string SectionName = "ExternalLotteries:UsaLottery";

    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://usa-lottery-result-all-state-api.p.rapidapi.com";
    public bool IsEnabled { get; set; } = true;
    public int PollingIntervalMinutes { get; set; } = 5;
}
