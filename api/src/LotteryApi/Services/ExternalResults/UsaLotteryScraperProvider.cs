using System.Text.RegularExpressions;
using LotteryApi.DTOs;
using Microsoft.Extensions.Options;
using HtmlAgilityPack;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Provider for USA state lottery results using web scraping from lotteryusa.com
/// Supports: Florida Pick 3/4, Georgia Cash 3/4, NY Numbers, Texas Pick 3, and other state lotteries
/// </summary>
public class UsaLotteryScraperProvider : ILotteryResultProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<UsaLotteryScraperProvider> _logger;
    private readonly UsaLotteryScraperSettings _settings;

    public string ProviderName => "USA Lottery Scraper (lotteryusa.com)";
    public string[] SupportedRegions => new[]
    {
        "Florida", "Georgia", "New York", "Texas", "California", "Pennsylvania",
        "New Jersey", "Massachusetts", "Michigan", "Illinois", "Ohio", "Virginia",
        "North Carolina", "South Carolina", "Maryland", "Connecticut", "Delaware"
    };

    // Base URL for lotteryusa.com
    private const string LOTTERY_USA_BASE = "https://www.lotteryusa.com";

    // State lottery URLs mapping - VERIFIED against lotteryusa.com Dec 2025
    // Format: (game, midPath, evePath, nightPath, morningPath, dayPath)
    // Only Pick 3 games are included since the draw mappings are for Pick 3 results
    // Texas has 4 draws: Morning, Day, Evening, Night
    // Georgia has 3 draws: Midday, Evening, Night
    // Most states have 2 draws: Midday, Evening
    private static readonly Dictionary<string, List<(string game, string midPath, string evePath, string nightPath, string morningPath, string dayPath)>> StateGames = new()
    {
        ["Florida"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/florida/midday-pick-3/", "/florida/pick-3/", "", "", "")
        },
        ["Georgia"] = new List<(string, string, string, string, string, string)>
        {
            ("Cash 3", "/georgia/midday-3/", "/georgia/cash-3-evening/", "/georgia/cash-3/", "", "")
        },
        ["New York"] = new List<(string, string, string, string, string, string)>
        {
            ("Numbers", "/new-york/midday-numbers/", "/new-york/numbers/", "", "", "")
        },
        // Texas has 4 draws per day: Morning, Day, Evening, Night
        ["Texas"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "", "/texas/evening-pick-3/", "/texas/pick-3/", "/texas/morning-pick-3/", "/texas/midday-pick-3/")
        },
        ["New Jersey"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/new-jersey/midday-pick-3/", "/new-jersey/pick-3/", "", "", "")
        },
        ["Pennsylvania"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/pennsylvania/midday-pick-3/", "/pennsylvania/pick-3/", "", "", "")
        },
        ["Massachusetts"] = new List<(string, string, string, string, string, string)>
        {
            ("Numbers", "/massachusetts/midday-numbers/", "/massachusetts/numbers/", "", "", "")
        },
        ["Illinois"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/illinois/midday-3/", "/illinois/daily-3/", "", "", "")
        },
        ["Virginia"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/virginia/midday-3/", "/virginia/pick-3/", "", "", "")
        },
        ["North Carolina"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/north-carolina/midday-3/", "/north-carolina/pick-3/", "", "", "")
        },
        ["South Carolina"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/south-carolina/midday-pick-3/", "/south-carolina/pick-3/", "", "", "")
        },
        ["Maryland"] = new List<(string, string, string, string, string, string)>
        {
            ("Pick 3", "/maryland/midday-pick-3/", "/maryland/pick-3/", "", "", "")
        },
        ["Connecticut"] = new List<(string, string, string, string, string, string)>
        {
            ("Play 3", "/connecticut/midday-3/", "/connecticut/play-3/", "", "", "")
        },
        ["Delaware"] = new List<(string, string, string, string, string, string)>
        {
            ("Play 3", "/delaware/play-3-midday/", "/delaware/play-3/", "", "", "")
        }
    };

    public UsaLotteryScraperProvider(
        HttpClient httpClient,
        ILogger<UsaLotteryScraperProvider> logger,
        IOptions<UsaLotteryScraperSettings> settings)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = settings.Value;

        // Configure HTTP client with browser-like headers
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        _httpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        _httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public Task<bool> IsAvailableAsync()
    {
        return Task.FromResult(_settings.IsEnabled);
    }

    public async Task<List<ExternalResultDto>> FetchResultsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        _logger.LogInformation("Starting USA lottery scraping for {Date}", date.ToString("yyyy-MM-dd"));

        // Fetch from configured states in parallel (with a limit)
        var enabledStates = _settings.EnabledStates?.Any() == true
            ? StateGames.Where(kv => _settings.EnabledStates.Contains(kv.Key, StringComparer.OrdinalIgnoreCase))
            : StateGames;

        var semaphore = new SemaphoreSlim(3); // Limit concurrent requests
        var tasks = new List<Task<List<ExternalResultDto>>>();

        foreach (var state in enabledStates)
        {
            foreach (var game in state.Value)
            {
                tasks.Add(FetchGameResultsWithSemaphore(semaphore, state.Key, game.game, game.midPath, game.evePath, game.nightPath, game.morningPath, game.dayPath, date, cancellationToken));
            }
        }

        try
        {
            var allResults = await Task.WhenAll(tasks);
            foreach (var gameResults in allResults)
            {
                results.AddRange(gameResults);
            }

            // Remove duplicates
            results = results
                .GroupBy(r => $"{r.LotteryName}_{r.GameName}_{r.DrawTime}")
                .Select(g => g.First())
                .ToList();

            _logger.LogInformation("Total USA results fetched: {Count}", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching USA lottery results");
        }

        return results;
    }

    public async Task<List<ExternalResultDto>> FetchResultsForLotteryAsync(string lotteryName, DateTime date, CancellationToken cancellationToken = default)
    {
        var results = new List<ExternalResultDto>();

        // Find matching state
        var matchingState = StateGames.FirstOrDefault(kv =>
            lotteryName.Contains(kv.Key, StringComparison.OrdinalIgnoreCase));

        if (matchingState.Key != null)
        {
            foreach (var game in matchingState.Value)
            {
                var gameResults = await FetchGameResults(matchingState.Key, game.game, game.midPath, game.evePath, game.nightPath, game.morningPath, game.dayPath, date, cancellationToken);
                results.AddRange(gameResults);
            }
        }

        return results;
    }

    private async Task<List<ExternalResultDto>> FetchGameResultsWithSemaphore(
        SemaphoreSlim semaphore,
        string stateName,
        string gameName,
        string midPath,
        string evePath,
        string nightPath,
        string morningPath,
        string dayPath,
        DateTime date,
        CancellationToken cancellationToken)
    {
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            return await FetchGameResults(stateName, gameName, midPath, evePath, nightPath, morningPath, dayPath, date, cancellationToken);
        }
        finally
        {
            semaphore.Release();
        }
    }

    private async Task<List<ExternalResultDto>> FetchGameResults(
        string stateName,
        string gameName,
        string midPath,
        string evePath,
        string nightPath,
        string morningPath,
        string dayPath,
        DateTime date,
        CancellationToken cancellationToken)
    {
        var results = new List<ExternalResultDto>();

        // Fetch each draw time with its specific URL
        // Texas has 4 draws: Morning, Day, Evening, Night
        // Georgia has 3 draws: Midday, Evening, Night
        // Most states have 2 draws: Midday (AM), Evening (PM)
        var drawPaths = new (string path, string drawTime)[]
        {
            (morningPath, "MORNING"),    // Texas only
            (midPath, "AM"),              // Midday/Day
            (dayPath, "DAY"),             // Texas only
            (evePath, "PM"),              // Evening
            (nightPath, "NIGHT")          // Georgia/Texas Night
        };

        foreach (var (path, drawTime) in drawPaths)
        {
            if (string.IsNullOrEmpty(path))
                continue;

            try
            {
                var url = $"{LOTTERY_USA_BASE}{path}";

                _logger.LogDebug("Fetching {State} {Game} {DrawTime} from {Url}", stateName, gameName, drawTime, url);

                var html = await _httpClient.GetStringAsync(url, cancellationToken);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var result = ParseLotteryUsaPage(doc, stateName, gameName, drawTime, date);
                if (result != null)
                {
                    results.Add(result);
                    _logger.LogInformation("Found result for {State} {Game} {DrawTime}: {Number}",
                        stateName, gameName, drawTime, result.WinningNumber);
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning("HTTP error fetching {State} {Game} {DrawTime}: {Message}", stateName, gameName, drawTime, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error fetching {State} {Game} {DrawTime}", stateName, gameName, drawTime);
            }
        }

        return results;
    }

    private ExternalResultDto? ParseLotteryUsaPage(HtmlDocument doc, string stateName, string gameName, string drawTime, DateTime date)
    {
        try
        {
            // lotteryusa.com structure (Dec 2025):
            // <table><tbody>
            //   <tr>
            //     <th><time datetime="...">Wednesday, Dec 3, 2025</time></th>
            //     <td><ul><li>0</li><li>0</li><li>2</li></ul> FB : 5</td>
            //     <td>$500</td>
            //   </tr>
            // </tbody></table>

            // Find all table rows with result data
            var rows = doc.DocumentNode.SelectNodes("//table//tbody//tr");

            if (rows == null || rows.Count == 0)
            {
                // Try alternative selectors
                rows = doc.DocumentNode.SelectNodes("//table//tr[th/time] | //table//tr[td/time]");
            }

            if (rows == null || rows.Count == 0)
            {
                // Try result card structure
                return ParseResultCard(doc, stateName, gameName, drawTime, date);
            }

            foreach (var row in rows)
            {
                // Get date from th or td with time element
                var timeNode = row.SelectSingleNode(".//time[@datetime]");
                var dateCell = row.SelectSingleNode(".//th | .//td[time]");

                string rowDateText;
                if (timeNode != null)
                {
                    // Try datetime attribute first (more reliable)
                    var dateTimeAttr = timeNode.GetAttributeValue("datetime", "");
                    rowDateText = !string.IsNullOrEmpty(dateTimeAttr) ? dateTimeAttr : timeNode.InnerText.Trim();
                }
                else if (dateCell != null)
                {
                    rowDateText = dateCell.InnerText.Trim();
                }
                else
                {
                    continue;
                }

                // Check if date matches
                if (!IsDateMatch(rowDateText, date))
                    continue;

                // Get numbers from td with ul/li structure
                var numbersCell = row.SelectSingleNode(".//td[ul]") ?? row.SelectSingleNode(".//td[2]");
                if (numbersCell == null)
                    continue;

                var numbers = ExtractNumbersFromLotteryUsa(numbersCell);
                if (numbers.Length == 0)
                    continue;

                return new ExternalResultDto
                {
                    LotteryName = stateName,
                    GameName = $"{stateName} {gameName}",
                    DrawTime = NormalizeDrawTime(drawTime),
                    DrawDate = date,
                    WinningNumber = string.Join("", numbers),
                    Numbers = numbers,
                    Source = "lotteryusa.com",
                    FetchedAt = DateTime.UtcNow
                };
            }

            // If no exact date match, try to get the latest result from first row
            if (rows.Count > 0)
            {
                return ParseLatestResultFromTable(rows[0], stateName, gameName, drawTime, date);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error parsing {State} {Game} page", stateName, gameName);
            return null;
        }
    }

    private ExternalResultDto? ParseResultCard(HtmlDocument doc, string stateName, string gameName, string drawTime, DateTime date)
    {
        try
        {
            // Try to find result in card/header structure
            var resultContainer = doc.DocumentNode.SelectSingleNode(
                "//div[contains(@class, 'result-header')] | " +
                "//div[contains(@class, 'winning-numbers')] | " +
                "//div[contains(@class, 'latest-result')]");

            if (resultContainer == null)
                return null;

            // Get numbers
            var numberNodes = resultContainer.SelectNodes(".//span[contains(@class, 'ball')] | .//span[@class] | .//div[contains(@class, 'number')]");
            var numbers = new List<string>();

            if (numberNodes != null)
            {
                foreach (var node in numberNodes)
                {
                    var text = node.InnerText.Trim();
                    if (Regex.IsMatch(text, @"^\d+$"))
                    {
                        numbers.Add(text.PadLeft(2, '0'));
                    }
                }
            }

            if (numbers.Count == 0)
            {
                // Try to extract from text
                var text = resultContainer.InnerText;
                numbers = ExtractNumbers(resultContainer).ToList();
            }

            if (numbers.Count == 0)
                return null;

            return new ExternalResultDto
            {
                LotteryName = stateName,
                GameName = $"{stateName} {gameName}",
                DrawTime = NormalizeDrawTime(drawTime),
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers.ToArray(),
                Source = "lotteryusa.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    private ExternalResultDto? ParseLatestResultFromTable(HtmlNode row, string stateName, string gameName, string drawTime, DateTime date)
    {
        try
        {
            // Get numbers from td with ul/li structure
            var numbersCell = row.SelectSingleNode(".//td[ul]") ?? row.SelectSingleNode(".//td[1]");
            if (numbersCell == null)
                return null;

            var numbers = ExtractNumbersFromLotteryUsa(numbersCell);
            if (numbers.Length == 0)
                return null;

            return new ExternalResultDto
            {
                LotteryName = stateName,
                GameName = $"{stateName} {gameName}",
                DrawTime = NormalizeDrawTime(drawTime),
                DrawDate = date,
                WinningNumber = string.Join("", numbers),
                Numbers = numbers,
                Source = "lotteryusa.com",
                FetchedAt = DateTime.UtcNow
            };
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Extract numbers from lotteryusa.com's ul/li structure
    /// Structure: <td><ul><li>0</li><li>0</li><li>2</li></ul> FB : 5</td>
    /// </summary>
    private string[] ExtractNumbersFromLotteryUsa(HtmlNode node)
    {
        if (node == null)
            return Array.Empty<string>();

        var numbers = new List<string>();

        // Primary method: Get numbers from li elements inside ul
        var listItems = node.SelectNodes(".//ul/li | .//ol/li");
        if (listItems != null && listItems.Count > 0)
        {
            foreach (var li in listItems)
            {
                var text = li.InnerText.Trim();
                // Only accept single or double digit numbers
                if (Regex.IsMatch(text, @"^\d{1,2}$"))
                {
                    numbers.Add(text);
                }
            }

            if (numbers.Count >= 3)
            {
                return numbers.ToArray();
            }
        }

        // Fallback: Try span elements
        var spans = node.SelectNodes(".//span[contains(@class, 'ball')] | .//span[@class]");
        if (spans != null)
        {
            foreach (var span in spans)
            {
                var text = span.InnerText.Trim();
                if (Regex.IsMatch(text, @"^\d{1,2}$"))
                {
                    numbers.Add(text);
                }
            }

            if (numbers.Count >= 3)
            {
                return numbers.ToArray();
            }
        }

        // Last resort: Extract numbers from text, but exclude Fireball
        var fullText = System.Net.WebUtility.HtmlDecode(node.InnerText);

        // Remove Fireball/FB bonus numbers (they appear after main numbers)
        fullText = Regex.Replace(fullText, @"FB\s*:\s*\d+", "", RegexOptions.IgnoreCase);
        fullText = Regex.Replace(fullText, @"Fireball\s*:\s*\d+", "", RegexOptions.IgnoreCase);

        var matches = Regex.Matches(fullText, @"\b\d{1,2}\b");
        if (matches.Count >= 3)
        {
            return matches
                .Cast<Match>()
                .Take(5) // Pick 3, 4, or 5 games
                .Select(m => m.Value)
                .ToArray();
        }

        return numbers.ToArray();
    }

    #region Helper Methods

    private bool IsDateMatch(string rowDateText, DateTime targetDate)
    {
        if (string.IsNullOrEmpty(rowDateText))
            return false;

        rowDateText = rowDateText.Trim();

        // Try various date formats including ISO format from datetime attribute
        var formats = new[]
        {
            "yyyy-MM-dd",              // 2025-12-04 (ISO from datetime attribute)
            "yyyy-MM-ddTHH:mm:ss",     // 2025-12-04T00:00:00
            "dddd, MMMM d, yyyy",      // Wednesday, December 4, 2025
            "dddd, MMM d, yyyy",       // Wednesday, Dec 4, 2025
            "MMMM d, yyyy",            // December 4, 2025
            "MMM d, yyyy",             // Dec 4, 2025
            "M/d/yyyy",                // 12/4/2025
            "d MMM yyyy",              // 4 Dec 2025
            "MM/dd/yyyy"               // 12/04/2025
        };

        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(rowDateText, format,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var parsedDate))
            {
                return parsedDate.Date == targetDate.Date;
            }
        }

        // Try general date parsing (handles various formats)
        if (DateTime.TryParse(rowDateText, System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var generalParsed))
        {
            return generalParsed.Date == targetDate.Date;
        }

        // Partial match (contains day number and month)
        var dayStr = targetDate.Day.ToString();
        var monthNames = new[] { targetDate.ToString("MMMM"), targetDate.ToString("MMM") };

        return monthNames.Any(m => rowDateText.Contains(m, StringComparison.OrdinalIgnoreCase)) &&
               Regex.IsMatch(rowDateText, $@"\b{dayStr}\b");
    }

    private string[] ExtractNumbers(HtmlNode node)
    {
        if (node == null)
            return Array.Empty<string>();

        // First try to find individual number elements
        var numberNodes = node.SelectNodes(".//span | .//div[contains(@class, 'number')]");
        if (numberNodes != null)
        {
            var numbers = new List<string>();
            foreach (var numNode in numberNodes)
            {
                var text = numNode.InnerText.Trim();
                if (Regex.IsMatch(text, @"^\d{1,2}$"))
                {
                    numbers.Add(text.PadLeft(2, '0'));
                }
            }
            if (numbers.Count > 0)
                return numbers.ToArray();
        }

        // Fall back to regex extraction from text
        var allText = System.Net.WebUtility.HtmlDecode(node.InnerText);

        // Remove "Fireball" or bonus numbers after main numbers (usually marked differently)
        allText = Regex.Replace(allText, @"Fireball[:\s]*\d+", "", RegexOptions.IgnoreCase);

        var matches = Regex.Matches(allText, @"\d{1,2}");
        if (matches.Count == 0)
            return Array.Empty<string>();

        // Take main numbers (typically 3-5 for Pick 3/4/5 games)
        return matches
            .Cast<Match>()
            .Take(5)
            .Select(m => m.Value.PadLeft(2, '0'))
            .ToArray();
    }

    private string NormalizeDrawTime(string drawTime)
    {
        var lower = drawTime.ToLower();

        return lower switch
        {
            "midday" or "day" or "morning" => "AM",
            "evening" or "night" => "PM",
            _ when lower.Contains("mid") || lower.Contains("day") || lower.Contains("morn") => "AM",
            _ when lower.Contains("eve") || lower.Contains("night") => "PM",
            _ => drawTime.ToUpper()
        };
    }

    #endregion
}

/// <summary>
/// Settings for USA Lottery scraper
/// </summary>
public class UsaLotteryScraperSettings
{
    public const string SectionName = "ExternalLotteries:UsaLotteryScraper";

    public bool IsEnabled { get; set; } = true;

    /// <summary>
    /// List of enabled states. If empty/null, all states are enabled.
    /// </summary>
    public List<string> EnabledStates { get; set; } = new()
    {
        "Florida", "Georgia", "New York", "Texas", "New Jersey"
    };

    /// <summary>
    /// Delay between requests in milliseconds to avoid rate limiting
    /// </summary>
    public int RequestDelayMs { get; set; } = 500;
}
