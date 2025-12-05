namespace LotteryApi.DTOs;

/// <summary>
/// DTO for external lottery result data
/// </summary>
public class ExternalResultDto
{
    /// <summary>
    /// The lottery/state name (e.g., "Florida", "New York", "Loteka")
    /// </summary>
    public string LotteryName { get; set; } = string.Empty;

    /// <summary>
    /// The game/draw name (e.g., "Pick 3 Midday", "Pick 4 Evening")
    /// </summary>
    public string GameName { get; set; } = string.Empty;

    /// <summary>
    /// The draw time identifier (e.g., "Midday", "Evening", "AM", "PM")
    /// </summary>
    public string DrawTime { get; set; } = string.Empty;

    /// <summary>
    /// The date of the draw
    /// </summary>
    public DateTime DrawDate { get; set; }

    /// <summary>
    /// The winning numbers as a single string (e.g., "123", "4567")
    /// </summary>
    public string WinningNumber { get; set; } = string.Empty;

    /// <summary>
    /// Additional/bonus number if applicable
    /// </summary>
    public string? AdditionalNumber { get; set; }

    /// <summary>
    /// Individual winning numbers as array (e.g., ["1", "2", "3"])
    /// </summary>
    public string[] Numbers { get; set; } = Array.Empty<string>();

    /// <summary>
    /// Source provider name (e.g., "RapidAPI", "Loteka Scraper")
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// When the result was fetched
    /// </summary>
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Configuration for external lottery provider
/// </summary>
public class LotteryProviderConfig
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "api" or "scraper"
    public string BaseUrl { get; set; } = string.Empty;
    public string? ApiKey { get; set; }
    public int PollingIntervalMinutes { get; set; } = 5;
    public bool IsEnabled { get; set; } = true;
    public List<DrawMapping> DrawMappings { get; set; } = new();
}

/// <summary>
/// Maps external lottery names to internal draw IDs
/// </summary>
public class DrawMapping
{
    /// <summary>
    /// External lottery name (from API/scraper)
    /// </summary>
    public string ExternalLotteryName { get; set; } = string.Empty;

    /// <summary>
    /// External game name (from API/scraper)
    /// </summary>
    public string ExternalGameName { get; set; } = string.Empty;

    /// <summary>
    /// External draw time identifier
    /// </summary>
    public string ExternalDrawTime { get; set; } = string.Empty;

    /// <summary>
    /// Our internal Draw ID
    /// </summary>
    public int InternalDrawId { get; set; }

    /// <summary>
    /// Our internal Draw name (for reference)
    /// </summary>
    public string InternalDrawName { get; set; } = string.Empty;
}

/// <summary>
/// Result of fetching and processing external results
/// </summary>
public class ResultFetchResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ResultsFetched { get; set; }
    public int ResultsSaved { get; set; }
    public int TicketsProcessed { get; set; }
    public int WinnersFound { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<ExternalResultDto> Results { get; set; } = new();
}
