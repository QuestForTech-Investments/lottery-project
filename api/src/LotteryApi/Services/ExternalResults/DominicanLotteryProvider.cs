using System.Text.RegularExpressions;
using LotteryApi.DTOs;
using Microsoft.Extensions.Options;
using HtmlAgilityPack;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Provider for Dominican Republic and Caribbean lottery results using web scraping
/// Supports: Loteka, Nacional, Real, La Primera, La Suerte, Gana Más, Lotedom, King Lottery, Anguilla
/// </summary>
public class DominicanLotteryProvider : ILotteryResultProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DominicanLotteryProvider> _logger;
    private readonly DominicanLotterySettings _settings;

    public string ProviderName => "Dominican & Caribbean Lottery Scraper";
    public string[] SupportedRegions => new[]
    {
        "Dominican Republic", "Loteka", "Leidsa", "Nacional", "Real",
        "King Lottery", "La Primera", "La Suerte", "Gana Más", "Lotedom",
        "Anguilla", "Caribbean"
    };

    // Source URLs
    private const string LOTERIAS_DOMINICANAS_URL = "https://loteriasdominicanas.com/";
    private const string EN_LOTERIA_URL = "https://enloteria.com/";
    private const string PAGINAS_AMARILLAS_ANGUILLA_URL = "https://paginasamarillas.com.do/en/lottery/anguilla/74CANGUILLA";
    private const string LOTERIAS_DO_URL = "https://loterias.do/";

    public DominicanLotteryProvider(
        HttpClient httpClient,
        ILogger<DominicanLotteryProvider> logger,
        IOptions<DominicanLotterySettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;

        // Configure HTTP client
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        _httpClient.DefaultRequestHeaders.Add("Accept-Language", "es-ES,es;q=0.9,en;q=0.8");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public Task<bool> IsAvailableAsync()
    {
        return Task.FromResult(_settings.IsEnabled);
    }

    public async Task<List<ExternalResultDto>> FetchResultsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        // Fetch from all sources in parallel
        var tasks = new List<Task<List<ExternalResultDto>>>
        {
            FetchFromLoteriasDominicanas(date, cancellationToken),
            FetchFromEnLoteria(date, cancellationToken),
            FetchFromAnguilla(date, cancellationToken)
        };

        try
        {
            var allResults = await Task.WhenAll(tasks);
            foreach (var sourceResults in allResults)
            {
                results.AddRange(sourceResults);
            }

            // Remove duplicates by lottery name and draw time
            results = results
                .GroupBy(r => $"{r.LotteryName}_{r.DrawTime}")
                .Select(g => g.First())
                .ToList();

            _logger.LogInformation("Total results fetched: {Count} from Dominican/Caribbean sources", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Dominican/Caribbean lottery results");
        }

        return results;
    }

    public async Task<List<ExternalResultDto>> FetchResultsForLotteryAsync(string lotteryName, DateTime date, CancellationToken cancellationToken = default)
    {
        var allResults = await FetchResultsAsync(date, cancellationToken);

        return allResults
            .Where(r => r.LotteryName.Contains(lotteryName, StringComparison.OrdinalIgnoreCase) ||
                       r.GameName.Contains(lotteryName, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    #region LoteriasDominicanas.com Scraper

    /// <summary>
    /// Scrapes results from loteriasdominicanas.com
    /// Covers: Nacional, Loteka, Leidsa, Real, La Primera, Lotedom, King Lottery, Anguilla
    /// </summary>
    private async Task<List<ExternalResultDto>> FetchFromLoteriasDominicanas(DateTime date, CancellationToken cancellationToken)
    {
        var results = new List<ExternalResultDto>();

        try
        {
            _logger.LogInformation("Scraping loteriasdominicanas.com for {Date}", date.ToString("yyyy-MM-dd"));

            var html = await _httpClient.GetStringAsync(LOTERIAS_DOMINICANAS_URL, cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Find all game-block elements which contain individual lottery results
            var gameBlocks = doc.DocumentNode.SelectNodes("//div[contains(@class, 'game-block')]");

            if (gameBlocks == null)
            {
                // Try alternative: look for result containers
                gameBlocks = doc.DocumentNode.SelectNodes("//div[contains(@class, 'lottery-result')] | //div[contains(@class, 'resultado')]");
            }

            if (gameBlocks != null)
            {
                foreach (var block in gameBlocks)
                {
                    var result = ParseLoteriasDominicansBlock(block, date);
                    if (result != null)
                    {
                        results.Add(result);
                    }
                }
            }

            // Also parse the quick results table if available
            var quickResults = doc.DocumentNode.SelectNodes("//table//tr[td]");
            if (quickResults != null)
            {
                foreach (var row in quickResults)
                {
                    var result = ParseTableRow(row, date);
                    if (result != null && !results.Any(r => r.LotteryName == result.LotteryName && r.DrawTime == result.DrawTime))
                    {
                        results.Add(result);
                    }
                }
            }

            _logger.LogInformation("Found {Count} results from loteriasdominicanas.com", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping loteriasdominicanas.com");
        }

        return results;
    }

    private ExternalResultDto? ParseLoteriasDominicansBlock(HtmlNode block, DateTime date)
    {
        try
        {
            // Get lottery name from header or title
            var nameNode = block.SelectSingleNode(".//h2 | .//h3 | .//h4 | .//span[contains(@class, 'lottery-name')] | .//strong | .//a[contains(@class, 'lottery')]");
            var lotteryName = nameNode?.InnerText?.Trim() ?? "";

            if (string.IsNullOrEmpty(lotteryName))
            {
                // Try parent container
                var parent = block.ParentNode;
                nameNode = parent?.SelectSingleNode(".//h2 | .//h3 | .//span[contains(@class, 'company')]");
                lotteryName = nameNode?.InnerText?.Trim() ?? "";
            }

            if (string.IsNullOrEmpty(lotteryName))
                return null;

            // Get numbers - look for various patterns
            var numbersText = "";

            // Pattern 1: Number balls/circles
            var numberNodes = block.SelectNodes(".//span[contains(@class, 'ball')] | .//span[contains(@class, 'number')] | .//div[contains(@class, 'numero')]");
            if (numberNodes != null && numberNodes.Count > 0)
            {
                numbersText = string.Join(" ", numberNodes.Select(n => n.InnerText.Trim()));
            }
            else
            {
                // Pattern 2: Direct text
                var numbersNode = block.SelectSingleNode(".//div[contains(@class, 'numbers')] | .//span[contains(@class, 'result')] | .//td[2]");
                numbersText = numbersNode?.InnerText?.Trim() ?? "";
            }

            if (string.IsNullOrEmpty(numbersText))
                return null;

            var numbers = ExtractDigits(numbersText);
            if (numbers.Length == 0)
                return null;

            // Determine draw time
            var drawTime = DetermineDrawTime(lotteryName, block);

            return new ExternalResultDto
            {
                LotteryName = NormalizeLotteryName(lotteryName),
                GameName = CleanGameName(lotteryName),
                DrawTime = drawTime,
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers,
                Source = "loteriasdominicanas.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    private ExternalResultDto? ParseTableRow(HtmlNode row, DateTime date)
    {
        try
        {
            var cells = row.SelectNodes(".//td");
            if (cells == null || cells.Count < 2)
                return null;

            var lotteryName = cells[0].InnerText.Trim();
            var numbersText = cells.Count > 1 ? cells[1].InnerText.Trim() : "";

            if (string.IsNullOrEmpty(lotteryName) || string.IsNullOrEmpty(numbersText))
                return null;

            var numbers = ExtractDigits(numbersText);
            if (numbers.Length == 0)
                return null;

            return new ExternalResultDto
            {
                LotteryName = NormalizeLotteryName(lotteryName),
                GameName = CleanGameName(lotteryName),
                DrawTime = DetermineDrawTime(lotteryName, null),
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers,
                Source = "loteriasdominicanas.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    #endregion

    #region EnLoteria.com Scraper

    /// <summary>
    /// Scrapes results from enloteria.com
    /// Covers: La Primera, La Suerte, Gana Más, King Lottery
    /// </summary>
    private async Task<List<ExternalResultDto>> FetchFromEnLoteria(DateTime date, CancellationToken cancellationToken)
    {
        var results = new List<ExternalResultDto>();

        try
        {
            _logger.LogInformation("Scraping enloteria.com for {Date}", date.ToString("yyyy-MM-dd"));

            var html = await _httpClient.GetStringAsync(EN_LOTERIA_URL, cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // EnLoteria uses card-based layouts with result_ball classes
            var resultCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'card')] | //article | //div[contains(@class, 'result')]");

            if (resultCards != null)
            {
                foreach (var card in resultCards)
                {
                    var result = ParseEnLoteriaCard(card, date);
                    if (result != null)
                    {
                        results.Add(result);
                    }
                }
            }

            // Also look for schema.org Event data
            var eventNodes = doc.DocumentNode.SelectNodes("//*[@itemtype='http://schema.org/Event']");
            if (eventNodes != null)
            {
                foreach (var eventNode in eventNodes)
                {
                    var result = ParseSchemaOrgEvent(eventNode, date);
                    if (result != null && !results.Any(r => r.LotteryName == result.LotteryName && r.DrawTime == result.DrawTime))
                    {
                        results.Add(result);
                    }
                }
            }

            _logger.LogInformation("Found {Count} results from enloteria.com", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping enloteria.com");
        }

        return results;
    }

    private ExternalResultDto? ParseEnLoteriaCard(HtmlNode card, DateTime date)
    {
        try
        {
            // Get lottery name
            var nameNode = card.SelectSingleNode(".//h2 | .//h3 | .//h4 | .//span[contains(@class, 'title')] | .//div[contains(@class, 'lottery-name')]");
            var lotteryName = nameNode?.InnerText?.Trim() ?? "";

            // Get image alt text as fallback for lottery name
            if (string.IsNullOrEmpty(lotteryName))
            {
                var imgNode = card.SelectSingleNode(".//img");
                lotteryName = imgNode?.GetAttributeValue("alt", "") ?? "";
            }

            if (string.IsNullOrEmpty(lotteryName))
                return null;

            // Skip if this is not a Dominican lottery
            if (!IsDominicanLottery(lotteryName))
                return null;

            // Get numbers from result_ball elements
            var ballNodes = card.SelectNodes(".//span[contains(@class, 'result_ball')] | .//span[contains(@class, 'ball')] | .//div[contains(@class, 'number')]");
            var numbers = new List<string>();

            if (ballNodes != null)
            {
                numbers = ballNodes.Select(n => n.InnerText.Trim()).Where(n => !string.IsNullOrEmpty(n) && Regex.IsMatch(n, @"^\d+$")).ToList();
            }

            if (numbers.Count == 0)
            {
                // Try text extraction
                var numbersNode = card.SelectSingleNode(".//div[contains(@class, 'result')] | .//span[contains(@class, 'numbers')]");
                if (numbersNode != null)
                {
                    numbers = ExtractDigits(numbersNode.InnerText).ToList();
                }
            }

            if (numbers.Count == 0)
                return null;

            // Get time
            var timeNode = card.SelectSingleNode(".//time | .//span[contains(@class, 'time')] | .//div[contains(@class, 'time')]");
            var timeText = timeNode?.InnerText?.Trim() ?? "";

            return new ExternalResultDto
            {
                LotteryName = NormalizeLotteryName(lotteryName),
                GameName = CleanGameName(lotteryName),
                DrawTime = DetermineDrawTimeFromText(lotteryName, timeText),
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers.ToArray(),
                Source = "enloteria.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    private ExternalResultDto? ParseSchemaOrgEvent(HtmlNode eventNode, DateTime date)
    {
        try
        {
            var nameNode = eventNode.SelectSingleNode(".//*[@itemprop='name']");
            var lotteryName = nameNode?.InnerText?.Trim() ?? "";

            if (string.IsNullOrEmpty(lotteryName) || !IsDominicanLottery(lotteryName))
                return null;

            // Get numbers
            var numbersText = "";
            var descNode = eventNode.SelectSingleNode(".//*[@itemprop='description']");
            if (descNode != null)
            {
                numbersText = descNode.InnerText.Trim();
            }

            var numbers = ExtractDigits(numbersText);
            if (numbers.Length == 0)
                return null;

            return new ExternalResultDto
            {
                LotteryName = NormalizeLotteryName(lotteryName),
                GameName = CleanGameName(lotteryName),
                DrawTime = DetermineDrawTime(lotteryName, eventNode),
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers,
                Source = "enloteria.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    #endregion

    #region Anguilla Scraper

    /// <summary>
    /// Scrapes results from paginasamarillas.com.do for Anguilla lottery
    /// Covers: Anguilla 10am, 1pm, 6pm, 9pm
    /// </summary>
    private async Task<List<ExternalResultDto>> FetchFromAnguilla(DateTime date, CancellationToken cancellationToken)
    {
        var results = new List<ExternalResultDto>();

        try
        {
            _logger.LogInformation("Scraping Anguilla lottery for {Date}", date.ToString("yyyy-MM-dd"));

            var html = await _httpClient.GetStringAsync(PAGINAS_AMARILLAS_ANGUILLA_URL, cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Look for result cards - uses yp-result-listing-card class
            var resultCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'yp-result-listing-card')] | //div[contains(@class, 'result-card')]");

            if (resultCards != null)
            {
                foreach (var card in resultCards)
                {
                    var result = ParseAnguillCard(card, date);
                    if (result != null)
                    {
                        results.Add(result);
                    }
                }
            }

            // Also look for tabular data
            var tableRows = doc.DocumentNode.SelectNodes("//table//tr[td]");
            if (tableRows != null)
            {
                foreach (var row in tableRows)
                {
                    var result = ParseAnguillTableRow(row, date);
                    if (result != null && !results.Any(r => r.DrawTime == result.DrawTime))
                    {
                        results.Add(result);
                    }
                }
            }

            _logger.LogInformation("Found {Count} Anguilla results", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error scraping Anguilla lottery");
        }

        return results;
    }

    private ExternalResultDto? ParseAnguillCard(HtmlNode card, DateTime date)
    {
        try
        {
            // Get draw time - morning, midday, evening, night
            var timeText = "";
            var batchNode = card.SelectSingleNode(".//*[contains(text(), 'morning') or contains(text(), 'midday') or contains(text(), 'evening') or contains(text(), 'night')]");
            if (batchNode != null)
            {
                timeText = batchNode.InnerText.ToLower();
            }

            // Map batch to draw time
            var drawTime = timeText switch
            {
                var t when t.Contains("morning") => "10AM",
                var t when t.Contains("midday") => "1PM",
                var t when t.Contains("evening") => "6PM",
                var t when t.Contains("night") => "9PM",
                _ => ""
            };

            // Get numbers - often displayed with asterisks or spaces
            var numbersText = card.InnerText;

            // Extract numbers (look for patterns like **98****22****03**)
            var numbers = ExtractDigits(numbersText);
            if (numbers.Length < 2)
                return null;

            // Take first 3 numbers (quiniela format)
            numbers = numbers.Take(3).ToArray();

            return new ExternalResultDto
            {
                LotteryName = "Anguilla",
                GameName = $"Anguilla {drawTime}",
                DrawTime = drawTime,
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers,
                Source = "paginasamarillas.com.do",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    private ExternalResultDto? ParseAnguillTableRow(HtmlNode row, DateTime date)
    {
        try
        {
            var cells = row.SelectNodes(".//td");
            if (cells == null || cells.Count < 2)
                return null;

            var timeText = cells[0].InnerText.Trim().ToLower();
            var numbersText = cells[1].InnerText.Trim();

            var drawTime = timeText switch
            {
                var t when t.Contains("10") || t.Contains("morning") => "10AM",
                var t when t.Contains("1") || t.Contains("midday") => "1PM",
                var t when t.Contains("6") || t.Contains("evening") => "6PM",
                var t when t.Contains("9") || t.Contains("night") => "9PM",
                _ => timeText.ToUpper()
            };

            var numbers = ExtractDigits(numbersText);
            if (numbers.Length == 0)
                return null;

            return new ExternalResultDto
            {
                LotteryName = "Anguilla",
                GameName = $"Anguilla {drawTime}",
                DrawTime = drawTime,
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers.Take(3).ToArray(),
                Source = "paginasamarillas.com.do",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    #endregion

    #region Helper Methods

    private bool IsDominicanLottery(string name)
    {
        var dominicanLotteries = new[]
        {
            "loteka", "nacional", "real", "leidsa", "primera", "suerte",
            "gana", "lotedom", "king", "anguila", "anguilla"
        };

        var lowerName = name.ToLower();
        return dominicanLotteries.Any(l => lowerName.Contains(l));
    }

    private string DetermineDrawTime(string lotteryName, HtmlNode? node)
    {
        var lowerName = lotteryName.ToLower();

        // Check explicit time markers in name
        if (lowerName.Contains("am") || lowerName.Contains("día") || lowerName.Contains("dia") ||
            lowerName.Contains("midday") || lowerName.Contains("mediodía") || lowerName.Contains("mediodia") ||
            lowerName.Contains("morning") || lowerName.Contains("mañana"))
        {
            return "AM";
        }

        if (lowerName.Contains("pm") || lowerName.Contains("noche") || lowerName.Contains("tarde") ||
            lowerName.Contains("evening") || lowerName.Contains("night"))
        {
            return "PM";
        }

        // Check for specific times
        if (lowerName.Contains("12:") || lowerName.Contains("12 "))
            return "AM";
        if (lowerName.Contains("7:") || lowerName.Contains("8:") || lowerName.Contains("9:"))
            return "PM";

        // Try to extract from node content
        if (node != null)
        {
            var timeNode = node.SelectSingleNode(".//time | .//span[contains(@class, 'time')]");
            var timeText = timeNode?.InnerText?.ToLower() ?? "";

            if (timeText.Contains("am") || timeText.Contains("12:"))
                return "AM";
            if (timeText.Contains("pm") || Regex.IsMatch(timeText, @"[789]:"))
                return "PM";
        }

        return ""; // Unknown
    }

    private string DetermineDrawTimeFromText(string lotteryName, string timeText)
    {
        var combined = $"{lotteryName} {timeText}".ToLower();

        if (combined.Contains("am") || combined.Contains("día") || combined.Contains("dia") ||
            combined.Contains("12:") || combined.Contains("midday"))
        {
            return "AM";
        }

        if (combined.Contains("pm") || combined.Contains("noche") || combined.Contains("tarde") ||
            combined.Contains("7:") || combined.Contains("8:") || combined.Contains("9:"))
        {
            return "PM";
        }

        return "";
    }

    private string[] ExtractDigits(string text)
    {
        if (string.IsNullOrEmpty(text))
            return Array.Empty<string>();

        // Remove HTML entities
        text = System.Net.WebUtility.HtmlDecode(text);

        // Extract all number sequences
        var matches = Regex.Matches(text, @"\d{1,2}");
        if (matches.Count == 0)
            return Array.Empty<string>();

        // Return numbers (pad single digits with leading zero)
        return matches
            .Cast<Match>()
            .Select(m => m.Value.PadLeft(2, '0'))
            .Take(10) // Max 10 numbers
            .ToArray();
    }

    private string NormalizeLotteryName(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        // Clean HTML and extra whitespace
        name = System.Net.WebUtility.HtmlDecode(name);
        name = Regex.Replace(name, @"\s+", " ").Trim();

        var lowerName = name.ToLower();

        // Map to standard names
        return lowerName switch
        {
            var n when n.Contains("loteka") => "Loteka",
            var n when n.Contains("leidsa") => "Leidsa",
            var n when n.Contains("nacional") => "Nacional",
            var n when n.Contains("loto real") || n.Contains("real") => "Loto Real",
            var n when n.Contains("king") => "King Lottery",
            var n when n.Contains("primera") => "La Primera",
            var n when n.Contains("suerte") => "La Suerte",
            var n when n.Contains("gana") => "Gana Más",
            var n when n.Contains("lotedom") => "Lotedom",
            var n when n.Contains("anguila") || n.Contains("anguilla") => "Anguilla",
            var n when n.Contains("florida") => "Florida",
            var n when n.Contains("new york") || n.Contains("ny") => "New York",
            _ => name
        };
    }

    private string CleanGameName(string name)
    {
        // Remove common suffixes/prefixes and clean up
        var cleaned = name;
        cleaned = Regex.Replace(cleaned, @"(?i)(quiniela|palé|pale|tripleta|cuarteta)", "").Trim();
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();
        return string.IsNullOrEmpty(cleaned) ? name : cleaned;
    }

    #endregion
}

/// <summary>
/// Settings for Dominican Lottery scraper
/// </summary>
public class DominicanLotterySettings
{
    public const string SectionName = "ExternalLotteries:DominicanLottery";

    public bool IsEnabled { get; set; } = true;
    public int PollingIntervalMinutes { get; set; } = 5;
    public List<ScrapingSource> Sources { get; set; } = new();
}

/// <summary>
/// Configuration for a scraping source
/// </summary>
public class ScrapingSource
{
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ResultSelector { get; set; } = string.Empty;
    public string? LotteryNameSelector { get; set; }
    public string? NumbersSelector { get; set; }
}
