using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using LotteryApi.Data;
using LotteryApi.DTOs;
using LotteryApi.Models;

namespace LotteryApi.Services.ExternalResults;

/// <summary>
/// Main service for coordinating external lottery results
/// </summary>
public interface IExternalResultsService
{
    /// <summary>
    /// Fetch results from all configured providers for a date
    /// </summary>
    Task<ResultFetchResponse> FetchAndProcessResultsAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetch results for a specific draw
    /// </summary>
    Task<ResultFetchResponse> FetchResultsForDrawAsync(int drawId, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process pending tickets against available results
    /// </summary>
    Task<int> ProcessPendingTicketsAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get draw mappings configuration
    /// </summary>
    List<DrawMapping> GetDrawMappings();
}

public class ExternalResultsService : IExternalResultsService
{
    private readonly LotteryDbContext _context;
    private readonly IEnumerable<ILotteryResultProvider> _providers;
    private readonly ILogger<ExternalResultsService> _logger;
    private readonly ExternalResultsSettings _settings;

    public ExternalResultsService(
        LotteryDbContext context,
        IEnumerable<ILotteryResultProvider> providers,
        ILogger<ExternalResultsService> logger,
        IOptions<ExternalResultsSettings> settings)
    {
        _context = context;
        _providers = providers;
        _logger = logger;
        _settings = settings.Value;
    }

    public async Task<ResultFetchResponse> FetchAndProcessResultsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var response = new ResultFetchResponse { Success = true };

        _logger.LogInformation("Starting result fetch for {Date}", date.ToString("yyyy-MM-dd"));

        // Fetch from all providers
        foreach (var provider in _providers)
        {
            try
            {
                if (!await provider.IsAvailableAsync())
                {
                    _logger.LogWarning("Provider {Provider} is not available", provider.ProviderName);
                    continue;
                }

                var results = await provider.FetchResultsAsync(date, cancellationToken);
                response.Results.AddRange(results);
                response.ResultsFetched += results.Count;

                _logger.LogInformation("Fetched {Count} results from {Provider}", results.Count, provider.ProviderName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching from {Provider}", provider.ProviderName);
                response.Errors.Add($"Error from {provider.ProviderName}: {ex.Message}");
            }
        }

        // Save results to database
        var savedCount = await SaveResultsAsync(response.Results, cancellationToken);
        response.ResultsSaved = savedCount;

        // Process tickets to find winners
        var (ticketsProcessed, winnersFound) = await ProcessTicketsAsync(date, cancellationToken);
        response.TicketsProcessed = ticketsProcessed;
        response.WinnersFound = winnersFound;

        response.Message = $"Fetched {response.ResultsFetched} results, saved {savedCount}, processed {ticketsProcessed} tickets, found {winnersFound} winners";

        _logger.LogInformation(response.Message);

        return response;
    }

    public async Task<ResultFetchResponse> FetchResultsForDrawAsync(int drawId, DateTime date, CancellationToken cancellationToken = default)
    {
        var response = new ResultFetchResponse { Success = true };

        // Get draw information
        var draw = await _context.Draws
            .Include(d => d.Lottery)
            .FirstOrDefaultAsync(d => d.DrawId == drawId, cancellationToken);

        if (draw == null)
        {
            response.Success = false;
            response.Message = $"Draw {drawId} not found";
            return response;
        }

        // Find mapping for this draw
        var mapping = _settings.DrawMappings
            .FirstOrDefault(m => m.InternalDrawId == drawId);

        if (mapping == null)
        {
            response.Success = false;
            response.Message = $"No external mapping configured for draw {draw.DrawName}";
            return response;
        }

        // Fetch from appropriate provider
        foreach (var provider in _providers)
        {
            try
            {
                if (!await provider.IsAvailableAsync())
                    continue;

                if (!provider.SupportedRegions.Any(r =>
                    mapping.ExternalLotteryName.Contains(r, StringComparison.OrdinalIgnoreCase)))
                    continue;

                var results = await provider.FetchResultsForLotteryAsync(
                    mapping.ExternalLotteryName, date, cancellationToken);

                // Filter to matching draw time
                var matchingResult = results.FirstOrDefault(r =>
                    MatchesDrawTime(r, mapping.ExternalDrawTime));

                if (matchingResult != null)
                {
                    response.Results.Add(matchingResult);
                    response.ResultsFetched = 1;
                    break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching for draw {DrawId}", drawId);
                response.Errors.Add(ex.Message);
            }
        }

        // Save and process
        if (response.Results.Any())
        {
            response.ResultsSaved = await SaveResultsAsync(response.Results, cancellationToken);
            var (tickets, winners) = await ProcessTicketsForDrawAsync(drawId, date, cancellationToken);
            response.TicketsProcessed = tickets;
            response.WinnersFound = winners;
        }

        response.Message = $"Draw {draw.DrawName}: fetched {response.ResultsFetched}, saved {response.ResultsSaved}, {response.WinnersFound} winners";

        return response;
    }

    public async Task<int> ProcessPendingTicketsAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var (_, winnersFound) = await ProcessTicketsAsync(date, cancellationToken);
        return winnersFound;
    }

    public List<DrawMapping> GetDrawMappings()
    {
        return _settings.DrawMappings;
    }

    private async Task<int> SaveResultsAsync(List<ExternalResultDto> results, CancellationToken cancellationToken)
    {
        var savedCount = 0;

        foreach (var result in results)
        {
            try
            {
                // Find matching internal draw
                var drawId = FindMatchingDrawId(result);
                if (drawId == null)
                {
                    _logger.LogWarning("No matching draw found for {Lottery} {Game} {Time}",
                        result.LotteryName, result.GameName, result.DrawTime);
                    continue;
                }

                // Check if result already exists
                var existingResult = await _context.Results
                    .FirstOrDefaultAsync(r =>
                        r.DrawId == drawId &&
                        r.ResultDate.Date == result.DrawDate.Date,
                        cancellationToken);

                if (existingResult != null)
                {
                    // Update if different
                    if (existingResult.WinningNumber != result.WinningNumber)
                    {
                        existingResult.WinningNumber = result.WinningNumber;
                        existingResult.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("Updated result for draw {DrawId}", drawId);
                    }
                }
                else
                {
                    // Create new result
                    var newResult = new Result
                    {
                        DrawId = drawId.Value,
                        WinningNumber = result.WinningNumber,
                        AdditionalNumber = result.AdditionalNumber,
                        ResultDate = result.DrawDate,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Results.Add(newResult);
                    savedCount++;
                    _logger.LogInformation("Saved new result {Number} for draw {DrawId}",
                        result.WinningNumber, drawId);
                }

                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving result for {Lottery}", result.LotteryName);
            }
        }

        return savedCount;
    }

    private int? FindMatchingDrawId(ExternalResultDto result)
    {
        // First check explicit mappings
        var mapping = _settings.DrawMappings.FirstOrDefault(m =>
            m.ExternalLotteryName.Equals(result.LotteryName, StringComparison.OrdinalIgnoreCase) &&
            MatchesDrawTime(result, m.ExternalDrawTime));

        if (mapping != null)
            return mapping.InternalDrawId;

        // Try to match by name pattern
        var drawName = BuildExpectedDrawName(result);

        var draw = _context.Draws
            .Include(d => d.Lottery)
            .AsEnumerable()
            .FirstOrDefault(d =>
                d.DrawName.Equals(drawName, StringComparison.OrdinalIgnoreCase) ||
                d.DrawName.Contains(result.LotteryName, StringComparison.OrdinalIgnoreCase));

        return draw?.DrawId;
    }

    private string BuildExpectedDrawName(ExternalResultDto result)
    {
        // Build expected draw name like "FLORIDA AM" or "LOTEKA"
        var baseName = result.LotteryName.ToUpper();
        var time = result.DrawTime.ToUpper();

        if (!string.IsNullOrEmpty(time))
            return $"{baseName} {time}";

        return baseName;
    }

    private bool MatchesDrawTime(ExternalResultDto result, string expectedTime)
    {
        if (string.IsNullOrEmpty(expectedTime))
            return true;

        var resultTime = result.DrawTime.ToUpper();
        var expected = expectedTime.ToUpper();

        // Match various formats
        return resultTime.Contains(expected) ||
               expected.Contains(resultTime) ||
               (expected == "AM" && (resultTime.Contains("MIDDAY") || resultTime.Contains("MID") || resultTime.Contains("MORNING"))) ||
               (expected == "PM" && (resultTime.Contains("EVENING") || resultTime.Contains("NIGHT") || resultTime.Contains("EVE")));
    }

    private async Task<(int ticketsProcessed, int winnersFound)> ProcessTicketsAsync(DateTime date, CancellationToken cancellationToken)
    {
        var ticketsProcessed = 0;
        var winnersFound = 0;

        // Get all results for the date
        var results = await _context.Results
            .Where(r => r.ResultDate.Date == date.Date)
            .ToDictionaryAsync(r => r.DrawId, r => r, cancellationToken);

        if (!results.Any())
        {
            _logger.LogInformation("No results found for {Date}", date.ToString("yyyy-MM-dd"));
            return (0, 0);
        }

        // Get pending ticket lines for today's draws
        var pendingLines = await _context.Set<TicketLine>()
            .Include(tl => tl.Ticket)
            .Include(tl => tl.BetType)
            .Where(tl =>
                tl.DrawDate.Date == date.Date &&
                tl.LineStatus == "pending" &&
                !tl.Ticket!.IsCancelled)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Processing {Count} pending ticket lines", pendingLines.Count);

        // Track affected tickets to update their state
        var affectedTicketIds = new HashSet<long>();

        foreach (var line in pendingLines)
        {
            if (!results.TryGetValue(line.DrawId, out var result))
                continue;

            ticketsProcessed++;

            // Check if this line is a winner
            var isWinner = CheckIfWinner(line, result);

            line.ResultNumber = result.WinningNumber;
            line.ResultCheckedAt = DateTime.UtcNow;

            if (isWinner)
            {
                line.IsWinner = true;
                line.LineStatus = "winner";
                winnersFound++;

                // Calculate prize amount based on bet type and prize multiplier
                line.PrizeAmount = CalculatePrize(line);

                // Update ticket totals
                if (line.Ticket != null)
                {
                    line.Ticket.WinningLines++;
                    line.Ticket.TotalPrize += line.PrizeAmount;
                    affectedTicketIds.Add(line.TicketId);
                }

                _logger.LogInformation("Winner found! Ticket {TicketId} Line {LineId}: {BetNumber} matches {Result}",
                    line.TicketId, line.LineId, line.BetNumber, result.WinningNumber);
            }
            else
            {
                line.LineStatus = "lost";
                affectedTicketIds.Add(line.TicketId);
            }
        }

        // Update TicketState for all affected tickets
        if (affectedTicketIds.Any())
        {
            await UpdateTicketStatesAsync(affectedTicketIds, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return (ticketsProcessed, winnersFound);
    }

    private async Task<(int ticketsProcessed, int winnersFound)> ProcessTicketsForDrawAsync(
        int drawId, DateTime date, CancellationToken cancellationToken)
    {
        var ticketsProcessed = 0;
        var winnersFound = 0;

        var result = await _context.Results
            .FirstOrDefaultAsync(r => r.DrawId == drawId && r.ResultDate.Date == date.Date, cancellationToken);

        if (result == null)
            return (0, 0);

        var pendingLines = await _context.Set<TicketLine>()
            .Include(tl => tl.Ticket)
            .Include(tl => tl.BetType)
            .Where(tl =>
                tl.DrawId == drawId &&
                tl.DrawDate.Date == date.Date &&
                tl.LineStatus == "pending" &&
                !tl.Ticket!.IsCancelled)
            .ToListAsync(cancellationToken);

        // Track affected tickets to update their state
        var affectedTicketIds = new HashSet<long>();

        foreach (var line in pendingLines)
        {
            ticketsProcessed++;

            var isWinner = CheckIfWinner(line, result);

            line.ResultNumber = result.WinningNumber;
            line.ResultCheckedAt = DateTime.UtcNow;

            if (isWinner)
            {
                line.IsWinner = true;
                line.LineStatus = "winner";
                winnersFound++;
                line.PrizeAmount = CalculatePrize(line);

                if (line.Ticket != null)
                {
                    line.Ticket.WinningLines++;
                    line.Ticket.TotalPrize += line.PrizeAmount;
                    affectedTicketIds.Add(line.TicketId);
                }
            }
            else
            {
                line.LineStatus = "lost";
                affectedTicketIds.Add(line.TicketId);
            }
        }

        // Update TicketState for all affected tickets
        if (affectedTicketIds.Any())
        {
            await UpdateTicketStatesAsync(affectedTicketIds, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return (ticketsProcessed, winnersFound);
    }

    /// <summary>
    /// Updates the TicketState for tickets based on their lines' status:
    /// - "W" (Winner) if any line is a winner
    /// - "L" (Loser) if all lines are processed and none are winners
    /// - "P" (Pending) if any lines are still pending
    /// </summary>
    private async Task UpdateTicketStatesAsync(HashSet<long> ticketIds, CancellationToken cancellationToken)
    {
        var tickets = await _context.Set<Ticket>()
            .Include(t => t.TicketLines)
            .Where(t => ticketIds.Contains(t.TicketId))
            .ToListAsync(cancellationToken);

        foreach (var ticket in tickets)
        {
            var lines = ticket.TicketLines ?? new List<TicketLine>();

            if (lines.Count == 0)
                continue;

            // Check if any line is a winner
            var hasWinner = lines.Any(l => l.IsWinner == true);

            // Check if all lines are processed (no pending lines)
            var allProcessed = lines.All(l => l.LineStatus == "winner" || l.LineStatus == "lost");

            // Check if any line is still pending
            var hasPending = lines.Any(l => l.LineStatus == "pending");

            string newState;
            if (hasWinner)
            {
                newState = "W"; // Winner - at least one winning line
            }
            else if (allProcessed && !hasPending)
            {
                newState = "L"; // Loser - all lines processed, none won
            }
            else
            {
                newState = "P"; // Pending - some lines not yet processed
            }

            if (ticket.TicketState != newState)
            {
                _logger.LogInformation(
                    "Updating TicketState for ticket {TicketId}: {OldState} -> {NewState}",
                    ticket.TicketId, ticket.TicketState, newState);
                ticket.TicketState = newState;
            }
        }
    }

    private bool CheckIfWinner(TicketLine line, Result result)
    {
        var betNumber = line.BetNumber.Trim();
        var winningNumber = result.WinningNumber.Trim();
        var betTypeCode = line.BetTypeCode?.ToUpper() ?? "";

        // Different matching rules based on bet type
        return betTypeCode switch
        {
            // Directo/Straight - exact match
            "DIRECTO" or "STRAIGHT" or "DIR" =>
                betNumber == winningNumber,

            // Box/Combinado - any permutation matches
            "BOX" or "COMBINADO" or "COMB" =>
                IsBoxMatch(betNumber, winningNumber),

            // Pale - first two digits
            "PALE" or "FIRST2" =>
                winningNumber.StartsWith(betNumber) || winningNumber.EndsWith(betNumber),

            // Tripleta - first three digits
            "TRIPLETA" or "FIRST3" =>
                winningNumber.StartsWith(betNumber),

            // Pulito - last digit matches
            "PULITO" or "LAST1" =>
                winningNumber.EndsWith(betNumber),

            // Default - exact match
            _ => betNumber == winningNumber
        };
    }

    private bool IsBoxMatch(string betNumber, string winningNumber)
    {
        if (betNumber.Length != winningNumber.Length)
            return false;

        var betDigits = betNumber.OrderBy(c => c).ToArray();
        var winDigits = winningNumber.OrderBy(c => c).ToArray();

        return betDigits.SequenceEqual(winDigits);
    }

    private decimal CalculatePrize(TicketLine line)
    {
        // Prize = BetAmount * PrizeMultiplier
        var multiplier = line.PrizeMultiplier ?? 0;
        return line.BetAmount * multiplier;
    }
}

/// <summary>
/// Settings for external results service
/// </summary>
public class ExternalResultsSettings
{
    public const string SectionName = "ExternalLotteries";

    public int PollingIntervalMinutes { get; set; } = 5;
    public bool AutoProcessTickets { get; set; } = true;

    /// <summary>
    /// When true, uses draw-time-based scheduled fetching instead of periodic polling.
    /// More efficient for paid APIs as it only fetches after each draw time.
    /// </summary>
    public bool UseScheduledFetch { get; set; } = false;

    public List<DrawMapping> DrawMappings { get; set; } = new();
}
