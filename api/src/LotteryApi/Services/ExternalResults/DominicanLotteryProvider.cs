using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LotteryApi.DTOs;
using Microsoft.Extensions.Options;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Provider for lottery results using external scraper service
/// Consumes the loterias-scraper API running on a separate service
/// </summary>
public class ExternalScraperProvider : ILotteryResultProvider
{
    private readonly ILogger<ExternalScraperProvider> _logger;
    private readonly HttpClient _httpClient;
    private readonly ExternalScraperSettings _settings;

    public string ProviderName => "External Scraper Service";
    public string[] SupportedRegions => new[]
    {
        "Dominican Republic", "USA", "Loteka", "Leidsa", "Nacional", "Real",
        "King Lottery", "La Primera", "La Suerte", "Gana Más", "Lotedom",
        "Florida", "New York", "Texas", "Georgia"
    };

    public ExternalScraperProvider(
        ILogger<ExternalScraperProvider> logger,
        HttpClient httpClient,
        IOptions<ExternalScraperSettings> settings)
    {
        _logger = logger;
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<bool> IsAvailableAsync()
    {
        if (!_settings.IsEnabled)
            return false;

        try
        {
            var response = await _httpClient.GetAsync("/");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "External scraper service not available at {BaseUrl}", _settings.BaseUrl);
            return false;
        }
    }

    public async Task<List<ExternalResultDto>> FetchResultsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        try
        {
            var dateStr = date.ToString("yyyy-MM-dd");
            _logger.LogInformation("Fetching results from external scraper for {Date}", dateStr);

            // Fetch all results (dominican + usa)
            var endpoint = $"/all?fecha={dateStr}";
            var response = await _httpClient.GetAsync(endpoint, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("External scraper returned {StatusCode} for {Endpoint}",
                    response.StatusCode, endpoint);
                return results;
            }

            var scraperResponse = await response.Content.ReadFromJsonAsync<ScraperAllResponse>(
                cancellationToken: cancellationToken);

            if (scraperResponse?.Resultados == null)
            {
                _logger.LogWarning("No results in response from external scraper");
                return results;
            }

            foreach (var r in scraperResponse.Resultados)
            {
                var result = MapToExternalResultDto(r, date);
                if (result != null)
                {
                    results.Add(result);
                }
            }

            _logger.LogInformation("Fetched {Count} results from external scraper ({Dominican} dominican, {Usa} usa)",
                results.Count, scraperResponse.Dominicanas, scraperResponse.Usa);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching results from external scraper");
        }

        return results;
    }

    public async Task<List<ExternalResultDto>> FetchResultsForLotteryAsync(
        string lotteryName, DateTime date, CancellationToken cancellationToken = default)
    {
        var allResults = await FetchResultsAsync(date, cancellationToken);

        return allResults
            .Where(r => r.LotteryName.Contains(lotteryName, StringComparison.OrdinalIgnoreCase) ||
                       r.GameName.Contains(lotteryName, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private ExternalResultDto? MapToExternalResultDto(ScraperResult r, DateTime date)
    {
        if (string.IsNullOrEmpty(r.Sorteo))
            return null;

        // Parse numbers from primera, segunda, tercera
        var numbers = new List<string>();
        if (!string.IsNullOrEmpty(r.Primera)) numbers.Add(r.Primera);
        if (!string.IsNullOrEmpty(r.Segunda)) numbers.Add(r.Segunda);
        if (!string.IsNullOrEmpty(r.Tercera)) numbers.Add(r.Tercera);

        var winningNumber = string.Join("", numbers);

        // Determine draw time from sorteo name
        var drawTime = DetermineDrawTime(r.Sorteo);

        // Normalize lottery name
        var (lotteryName, gameName) = NormalizeLotteryName(r.Sorteo, r.Abreviacion);

        return new ExternalResultDto
        {
            LotteryName = lotteryName,
            GameName = gameName,
            DrawTime = drawTime,
            DrawDate = date,
            WinningNumber = winningNumber,
            Numbers = numbers.ToArray(),
            Source = r.Fuente ?? "external-scraper",
            FetchedAt = DateTime.UtcNow
        };
    }

    private string DetermineDrawTime(string sorteo)
    {
        var lower = sorteo.ToLower();

        if (lower.Contains("pm") || lower.Contains("noche") || lower.Contains("evening") || lower.Contains("night"))
            return "PM";
        if (lower.Contains("am") || lower.Contains("morning") || lower.Contains("día") || lower.Contains("dia") || lower.Contains("midday"))
            return "AM";

        return "";
    }

    private (string LotteryName, string GameName) NormalizeLotteryName(string sorteo, string? abreviacion)
    {
        var lower = sorteo.ToLower();

        // Dominican lotteries
        if (lower.Contains("loteka")) return ("Loteka", sorteo);
        if (lower.Contains("leidsa") && !lower.Contains("real")) return ("Leidsa", sorteo);
        if (lower.Contains("nacional")) return ("Nacional", sorteo);
        if (lower.Contains("loto real") || (lower.Contains("real") && !lower.Contains("leidsa"))) return ("Loto Real", sorteo);
        if (lower.Contains("king")) return ("King Lottery", sorteo);
        if (lower.Contains("primera")) return ("La Primera", sorteo);
        if (lower.Contains("suerte")) return ("La Suerte", sorteo);
        if (lower.Contains("gana")) return ("Gana Más", sorteo);
        if (lower.Contains("lotedom")) return ("Lotedom", sorteo);

        // USA lotteries
        if (lower.Contains("florida")) return ("Florida", sorteo);
        if (lower.Contains("new york") || lower.Contains("ny ")) return ("New York", sorteo);
        if (lower.Contains("texas")) return ("Texas", sorteo);
        if (lower.Contains("georgia")) return ("Georgia", sorteo);

        return (sorteo, sorteo);
    }
}

/// <summary>
/// Response from /all endpoint of external scraper
/// </summary>
public class ScraperAllResponse
{
    [JsonPropertyName("fecha")]
    public string? Fecha { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("dominicanas")]
    public int Dominicanas { get; set; }

    [JsonPropertyName("usa")]
    public int Usa { get; set; }

    [JsonPropertyName("resultados")]
    public List<ScraperResult>? Resultados { get; set; }
}

/// <summary>
/// Individual result from external scraper
/// </summary>
public class ScraperResult
{
    [JsonPropertyName("sorteo")]
    public string? Sorteo { get; set; }

    [JsonPropertyName("abreviacion")]
    public string? Abreviacion { get; set; }

    [JsonPropertyName("primera")]
    public string? Primera { get; set; }

    [JsonPropertyName("segunda")]
    public string? Segunda { get; set; }

    [JsonPropertyName("tercera")]
    public string? Tercera { get; set; }

    [JsonPropertyName("fuente")]
    public string? Fuente { get; set; }
}

/// <summary>
/// Settings for external scraper service
/// Supports environment variables: SCRAPER_API_URL, SCRAPER_API_ENABLED, SCRAPER_API_TIMEOUT
/// </summary>
public class ExternalScraperSettings
{
    public const string SectionName = "ExternalLotteries:ExternalScraper";

    public bool IsEnabled { get; set; } = true;
    public string BaseUrl { get; set; } = "http://localhost:4050";
    public int TimeoutSeconds { get; set; } = 120;

    /// <summary>
    /// Creates settings from configuration with environment variable overrides
    /// Priority: Environment Variables > appsettings.{Environment}.json > appsettings.json
    /// </summary>
    public static ExternalScraperSettings FromConfiguration(IConfiguration configuration)
    {
        var settings = configuration
            .GetSection(SectionName)
            .Get<ExternalScraperSettings>() ?? new ExternalScraperSettings();

        // Override with environment variables if present
        var envUrl = Environment.GetEnvironmentVariable("SCRAPER_API_URL");
        if (!string.IsNullOrEmpty(envUrl))
            settings.BaseUrl = envUrl;

        var envEnabled = Environment.GetEnvironmentVariable("SCRAPER_API_ENABLED");
        if (!string.IsNullOrEmpty(envEnabled))
            settings.IsEnabled = envEnabled.Equals("true", StringComparison.OrdinalIgnoreCase);

        var envTimeout = Environment.GetEnvironmentVariable("SCRAPER_API_TIMEOUT");
        if (!string.IsNullOrEmpty(envTimeout) && int.TryParse(envTimeout, out var timeout))
            settings.TimeoutSeconds = timeout;

        return settings;
    }
}
