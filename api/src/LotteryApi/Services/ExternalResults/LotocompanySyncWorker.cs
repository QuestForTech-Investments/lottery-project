using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using LotteryApi.Data;
using LotteryApi.Models;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Settings for Lotocompany API sync
/// </summary>
public class LotocompanySettings
{
    public const string SectionName = "Lotocompany";

    public bool IsEnabled { get; set; } = true;
    public string BaseUrl { get; set; } = "https://api.lotocompany.com";
    public string Username { get; set; } = "oliver";
    public string Password { get; set; } = "oliver0597@";
    public int SyncIntervalMinutes { get; set; } = 5;
    public int TimeoutSeconds { get; set; } = 30;
}

/// <summary>
/// Background worker that syncs lottery results from lotocompany (original app) every 5 minutes
/// </summary>
public class LotocompanySyncWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LotocompanySyncWorker> _logger;
    private readonly LotocompanySettings _settings;
    private readonly HttpClient _httpClient;
    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public LotocompanySyncWorker(
        IServiceProvider serviceProvider,
        ILogger<LotocompanySyncWorker> logger,
        IOptions<LotocompanySettings> settings,
        IHttpClientFactory httpClientFactory)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _settings = settings.Value;
        _httpClient = httpClientFactory.CreateClient("Lotocompany");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.IsEnabled)
        {
            _logger.LogInformation("Lotocompany sync is disabled");
            return;
        }

        _logger.LogInformation("Lotocompany Sync Worker starting. Interval: {Interval} minutes",
            _settings.SyncIntervalMinutes);

        // Wait a bit on startup before first sync
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncResultsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Lotocompany sync worker");
            }

            // Wait for next sync interval
            await Task.Delay(TimeSpan.FromMinutes(_settings.SyncIntervalMinutes), stoppingToken);
        }

        _logger.LogInformation("Lotocompany Sync Worker stopping");
    }

    private async Task SyncResultsAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Starting Lotocompany sync...");

        try
        {
            // Get auth token
            var token = await GetAuthTokenAsync(stoppingToken);
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("Failed to get auth token from Lotocompany");
                return;
            }

            // Fetch results from original app
            var today = DateTime.Today;
            var results = await FetchResultsFromLotocompanyAsync(token, today, stoppingToken);

            if (results == null || !results.Any())
            {
                _logger.LogInformation("No results found from Lotocompany for {Date}", today.ToString("yyyy-MM-dd"));
                return;
            }

            _logger.LogInformation("Fetched {Count} results from Lotocompany", results.Count);

            // Sync to database
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<LotteryDbContext>();

            var created = 0;
            var updated = 0;
            var skipped = 0;

            // Get all active draws for matching
            var draws = await context.Draws
                .Where(d => d.IsActive == true)
                .ToListAsync(stoppingToken);

            foreach (var result in results)
            {
                try
                {
                    // Find matching draw
                    var matchingDraw = FindMatchingDraw(draws, result.Name);

                    if (matchingDraw == null)
                    {
                        _logger.LogDebug("No matching draw found for '{Name}'", result.Name);
                        skipped++;
                        continue;
                    }

                    // Build winning number from num1, num2, num3
                    var winningNumber = BuildWinningNumber(result);
                    if (string.IsNullOrEmpty(winningNumber))
                    {
                        skipped++;
                        continue;
                    }

                    // Check if result exists for this draw and date
                    var existingResult = await context.Results
                        .FirstOrDefaultAsync(r => r.DrawId == matchingDraw.DrawId &&
                                                  r.ResultDate.Date == today.Date,
                            stoppingToken);

                    if (existingResult != null)
                    {
                        // Update only if different
                        if (existingResult.WinningNumber != winningNumber)
                        {
                            existingResult.WinningNumber = winningNumber;
                            existingResult.UpdatedAt = DateTime.UtcNow;
                            updated++;
                            _logger.LogInformation("Updated result for {Draw}: {Old} -> {New}",
                                matchingDraw.DrawName, existingResult.WinningNumber, winningNumber);
                        }
                        else
                        {
                            skipped++;
                        }
                    }
                    else
                    {
                        // Create new result
                        var newResult = new Result
                        {
                            DrawId = matchingDraw.DrawId,
                            WinningNumber = winningNumber,
                            ResultDate = today,
                            CreatedAt = DateTime.UtcNow
                        };

                        // Build additional number if provided
                        if (!string.IsNullOrEmpty(result.Cash3) ||
                            !string.IsNullOrEmpty(result.Play4) ||
                            !string.IsNullOrEmpty(result.Pick5))
                        {
                            newResult.AdditionalNumber = $"{result.Cash3 ?? ""}{result.Play4 ?? ""}{result.Pick5 ?? ""}";
                        }

                        context.Results.Add(newResult);
                        created++;
                        _logger.LogInformation("Created result for {Draw}: {Number}",
                            matchingDraw.DrawName, winningNumber);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error syncing result for {Name}", result.Name);
                }
            }

            await context.SaveChangesAsync(stoppingToken);

            _logger.LogInformation("Lotocompany sync completed: {Created} created, {Updated} updated, {Skipped} skipped",
                created, updated, skipped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync from Lotocompany");
        }
    }

    private async Task<string?> GetAuthTokenAsync(CancellationToken stoppingToken)
    {
        // Return cached token if still valid
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-5))
        {
            return _cachedToken;
        }

        try
        {
            var loginRequest = new
            {
                username = _settings.Username,
                password = _settings.Password,
                deviceType = 1,
                category = 1  // Required field for lottery category
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_settings.BaseUrl}/api/v1/sessions",
                loginRequest,
                stoppingToken);

            var content = await response.Content.ReadAsStringAsync(stoppingToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to authenticate with Lotocompany: {StatusCode}, Response: {Response}",
                    response.StatusCode, content.Length > 500 ? content.Substring(0, 500) : content);
                return null;
            }
            var authResponse = JsonSerializer.Deserialize<LotocompanyAuthResponse>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (authResponse?.Token != null)
            {
                _cachedToken = authResponse.Token;
                // Token typically expires in 45 minutes
                _tokenExpiry = DateTime.UtcNow.AddMinutes(40);
                _logger.LogInformation("Successfully authenticated with Lotocompany");
                return _cachedToken;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authenticating with Lotocompany");
        }

        return null;
    }

    private async Task<List<LotocompanyResultItem>?> FetchResultsFromLotocompanyAsync(
        string token, DateTime date, CancellationToken stoppingToken)
    {
        try
        {
            var dateStr = date.ToString("yyyy-MM-dd");
            var url = $"{_settings.BaseUrl}/api/v1/results?date={dateStr}&currentDate={dateStr}&category=1";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Authorization", $"Bearer {token}");

            var response = await _httpClient.SendAsync(request, stoppingToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch results from Lotocompany: {StatusCode}", response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync(stoppingToken);
            var results = JsonSerializer.Deserialize<List<LotocompanyResultItem>>(content,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching results from Lotocompany");
            return null;
        }
    }

    private Draw? FindMatchingDraw(List<Draw> draws, string name)
    {
        var upperName = name.ToUpperInvariant();

        // Exact match first
        var exact = draws.FirstOrDefault(d =>
            d.DrawName.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (exact != null) return exact;

        // Try contains match
        var contains = draws.FirstOrDefault(d =>
            d.DrawName.ToUpperInvariant().Contains(upperName) ||
            upperName.Contains(d.DrawName.ToUpperInvariant()));
        if (contains != null) return contains;

        // Special mappings for common name variations
        var mappings = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            { "King Lottery AM", new[] { "KING LOTTERY", "KING AM" } },
            { "King Lottery PM", new[] { "KING PM" } },
            { "LA PRIMERA", new[] { "PRIMERA" } },
            { "LA PRIMERA 7PM", new[] { "PRIMERA 7PM", "PRIMERA PM" } },
            { "LA SUERTE", new[] { "SUERTE" } },
            { "LA SUERTE 6:00pm", new[] { "SUERTE 6PM", "SUERTE PM" } },
            { "GANA MAS", new[] { "GANAMAS" } },
            { "Anguila 10am", new[] { "ANGUILA AM", "ANGUILA 10" } },
            { "Anguila 1pm", new[] { "ANGUILA 1PM", "ANGUILA PM" } },
            { "Anguila 6PM", new[] { "ANGUILA NOCHE", "ANGUILA 6" } },
            { "SUPER PALE TARDE", new[] { "SUPER PALE", "PALE TARDE" } },
            { "SUPER PALE NY-FL AM", new[] { "PALE NY FL", "NY FL AM" } },
            { "FL PICK2 AM", new[] { "FLORIDA PICK2", "FL PICK 2" } },
            { "NEW YORK DAY", new[] { "NY DAY", "NEW YORK AM" } },
            { "FLORIDA AM", new[] { "FL AM" } },
            { "TEXAS DAY", new[] { "TX DAY" } },
            { "TEXAS MORNING", new[] { "TX MORNING", "TX AM" } },
            { "GEORGIA-MID AM", new[] { "GEORGIA AM", "GA AM" } },
            { "NEW JERSEY AM", new[] { "NJ AM" } },
            { "CONNECTICUT AM", new[] { "CT AM" } },
            { "PENN MIDDAY", new[] { "PA MIDDAY", "PENN AM" } },
            { "MARYLAND MIDDAY", new[] { "MD MIDDAY", "MARYLAND AM" } },
            { "VIRGINIA AM", new[] { "VA AM" } },
            { "DELAWARE AM", new[] { "DE AM" } },
            { "SOUTH CAROLINA AM", new[] { "SC AM" } },
            { "NORTH CAROLINA AM", new[] { "NC AM" } },
            { "CHICAGO AM", new[] { "IL AM", "ILLINOIS AM" } },
            { "CALIFORNIA AM", new[] { "CA AM" } },
            { "MASS AM", new[] { "MA AM", "MASSACHUSETTS AM" } },
            { "INDIANA MIDDAY", new[] { "IN MIDDAY", "INDIANA AM" } },
            { "DIARIA 11AM", new[] { "DIARIA AM", "DIARIA 11" } },
            { "DIARIA 3PM", new[] { "DIARIA PM", "DIARIA 3" } },
        };

        // Check if input matches any alias
        foreach (var mapping in mappings)
        {
            if (upperName.Contains(mapping.Key.ToUpperInvariant()) ||
                mapping.Value.Any(alias => upperName.Contains(alias.ToUpperInvariant())))
            {
                var match = draws.FirstOrDefault(d =>
                    d.DrawName.Equals(mapping.Key, StringComparison.OrdinalIgnoreCase) ||
                    d.DrawName.ToUpperInvariant().Contains(mapping.Key.ToUpperInvariant()));
                if (match != null) return match;
            }
        }

        return null;
    }

    private string BuildWinningNumber(LotocompanyResultItem result)
    {
        // Build winning number from num1, num2, num3 (each is 2 digits)
        var parts = new List<string>();

        if (!string.IsNullOrEmpty(result.Num1))
            parts.Add(result.Num1.PadLeft(2, '0'));
        if (!string.IsNullOrEmpty(result.Num2))
            parts.Add(result.Num2.PadLeft(2, '0'));
        if (!string.IsNullOrEmpty(result.Num3))
            parts.Add(result.Num3.PadLeft(2, '0'));

        return string.Join("", parts);
    }
}

/// <summary>
/// Lotocompany auth response
/// </summary>
public class LotocompanyAuthResponse
{
    [JsonPropertyName("token")]
    public string? Token { get; set; }
}

/// <summary>
/// Result item from Lotocompany API
/// </summary>
public class LotocompanyResultItem
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("num1")]
    public string? Num1 { get; set; }

    [JsonPropertyName("num2")]
    public string? Num2 { get; set; }

    [JsonPropertyName("num3")]
    public string? Num3 { get; set; }

    [JsonPropertyName("cash3")]
    public string? Cash3 { get; set; }

    [JsonPropertyName("play4")]
    public string? Play4 { get; set; }

    [JsonPropertyName("pick5")]
    public string? Pick5 { get; set; }
}
