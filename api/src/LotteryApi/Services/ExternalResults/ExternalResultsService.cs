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
    /// Recalculate prizes for existing winners (when prize config changes)
    /// </summary>
    Task<(int linesUpdated, decimal totalPrize)> RecalculatePrizesAsync(DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process tickets for a specific draw to find winners.
    /// Called automatically when results are published.
    /// </summary>
    Task<(int ticketsProcessed, int winnersFound)> ProcessTicketsForDrawAsync(int drawId, DateTime date, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get draw mappings configuration
    /// </summary>
    List<DrawMapping> GetDrawMappings();

    /// <summary>
    /// Reprocess all pending tickets that have results available.
    /// Useful for tickets created after results were published.
    /// </summary>
    Task<(int ticketsProcessed, int winnersFound, int ticketsUpdated)> ReprocessPendingTicketsAsync(
        DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
}

public class ExternalResultsService : IExternalResultsService
{
    private readonly LotteryDbContext _context;
    private readonly IEnumerable<ILotteryResultProvider> _providers;
    private readonly ILogger<ExternalResultsService> _logger;
    private readonly ExternalResultsSettings _settings;

    /// <summary>
    /// Maps game_type_id (stored in ticket_lines.bet_type_id) to the actual
    /// bet_type_id used in the prize_types table. These are different numbering
    /// systems: game_types is the play classification while bet_types is the
    /// prize configuration key.
    /// </summary>
    private static readonly Dictionary<int, int> GameTypeToPrizeBetType = new()
    {
        { 1, 1 },    // DIRECTO → Directo
        { 2, 2 },    // PALE → Pale
        { 3, 3 },    // TRIPLETA → Tripleta
        { 4, 4 },    // CASH3_STRAIGHT → Cash3 Straight
        { 5, 5 },    // CASH3_BOX → Cash3 Box
        { 6, 16 },   // CASH3_FRONT_STRAIGHT → Cash3 Front Straight
        { 7, 7 },    // CASH3_FRONT_BOX → Cash3 Front Box
        { 8, 8 },    // CASH3_BACK_STRAIGHT → Cash3 Back Straight
        { 9, 34 },   // CASH3_BACK_BOX → Cash3 Back Box
        { 10, 18 },  // PLAY4_STRAIGHT → Play4 Straight
        { 11, 19 },  // PLAY4_BOX → Play4 Box
        { 12, 30 },  // PICK5_STRAIGHT → Pick5 Straight
        { 13, 31 },  // PICK5_BOX → Pick5 Box
        { 14, 14 },  // SUPER_PALE → Super Pale
        { 15, 32 },  // PICK2 → Pick Two
        { 16, 9 },   // PICK2_FRONT → Pick Two Front
        { 17, 10 },  // PICK2_BACK → Pick Two Back
        { 18, 11 },  // PICK2_MIDDLE → Pick Two Middle
        { 19, 25 },  // BOLITA → Bolita 1
        { 20, 20 },  // SINGULACION → Singulacion
        { 21, 21 },  // PANAMA → Panama
    };

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

    public async Task<(int linesUpdated, decimal totalPrize)> RecalculatePrizesAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var linesUpdated = 0;
        var totalPrize = 0m;

        // Get all winning lines for the date
        var winningLines = await _context.Set<TicketLine>()
            .Include(tl => tl.Ticket)
            .Where(tl =>
                tl.DrawDate.Date == date.Date &&
                tl.IsWinner == true &&
                !tl.Ticket!.IsCancelled)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Recalculating prizes for {Count} winning lines", winningLines.Count);

        // Get all results for the date to determine winning positions
        var results = await _context.Results
            .Where(r => r.ResultDate.Date == date.Date)
            .ToDictionaryAsync(r => r.DrawId, r => r, cancellationToken);

        // Track affected tickets to update their totals
        var ticketPrizes = new Dictionary<long, decimal>();

        foreach (var line in winningLines)
        {
            var oldPrize = line.PrizeAmount;

            // Clear existing prize multiplier to force recalculation
            line.PrizeMultiplier = null;

            // Determine winning position from the result
            int winningPosition = 1; // Default to 1st position
            if (results.TryGetValue(line.DrawId, out var result))
            {
                winningPosition = GetWinningPosition(line, result);
                if (winningPosition == 0)
                {
                    // This shouldn't happen for a winning line, but fallback to position 1
                    _logger.LogWarning("Could not determine winning position for line {LineId}, using position 1", line.LineId);
                    winningPosition = 1;
                }
            }

            // Recalculate prize with the correct position
            line.PrizeAmount = await CalculatePrizeAsync(line, winningPosition);

            if (line.PrizeAmount != oldPrize)
            {
                linesUpdated++;
                _logger.LogInformation("Updated line {LineId}: {OldPrize} -> {NewPrize} (position {Position})",
                    line.LineId, oldPrize, line.PrizeAmount, winningPosition);
            }

            // Accumulate prize per ticket
            if (!ticketPrizes.ContainsKey(line.TicketId))
                ticketPrizes[line.TicketId] = 0;
            ticketPrizes[line.TicketId] += line.PrizeAmount;

            totalPrize += line.PrizeAmount;
        }

        // Update ticket totals
        foreach (var (ticketId, prize) in ticketPrizes)
        {
            var ticket = await _context.Set<Ticket>()
                .FirstOrDefaultAsync(t => t.TicketId == ticketId, cancellationToken);

            if (ticket != null)
            {
                ticket.TotalPrize = prize;
                _logger.LogInformation("Updated ticket {TicketId} total prize: {Prize}", ticketId, prize);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Recalculated {Count} lines, total prize: {Total}",
            linesUpdated, totalPrize);

        return (linesUpdated, totalPrize);
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

            // Check if this line is a winner and get the winning position
            var winningPosition = GetWinningPosition(line, result);

            line.ResultNumber = result.WinningNumber;
            line.ResultCheckedAt = DateTime.UtcNow;

            if (winningPosition > 0)
            {
                line.IsWinner = true;
                line.LineStatus = "winner";
                winnersFound++;

                // Calculate prize amount based on bet type and winning position
                line.PrizeAmount = await CalculatePrizeAsync(line, winningPosition);

                // Update ticket totals
                if (line.Ticket != null)
                {
                    line.Ticket.WinningLines++;
                    line.Ticket.TotalPrize += line.PrizeAmount;
                    affectedTicketIds.Add(line.TicketId);
                }

                _logger.LogInformation("Winner found! Ticket {TicketId} Line {LineId}: {BetNumber} matches position {Position} in {Result}, Prize: {Prize}",
                    line.TicketId, line.LineId, line.BetNumber, winningPosition, result.WinningNumber, line.PrizeAmount);
            }
            else
            {
                line.LineStatus = "loser";
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

    public async Task<(int ticketsProcessed, int winnersFound)> ProcessTicketsForDrawAsync(
        int drawId, DateTime date, CancellationToken cancellationToken = default)
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

            var winningPosition = GetWinningPosition(line, result);

            line.ResultNumber = result.WinningNumber;
            line.ResultCheckedAt = DateTime.UtcNow;

            if (winningPosition > 0)
            {
                line.IsWinner = true;
                line.LineStatus = "winner";
                winnersFound++;
                line.PrizeAmount = await CalculatePrizeAsync(line, winningPosition);

                if (line.Ticket != null)
                {
                    line.Ticket.WinningLines++;
                    line.Ticket.TotalPrize += line.PrizeAmount;
                    affectedTicketIds.Add(line.TicketId);
                }

                _logger.LogInformation("Winner found in draw {DrawId}! Position {Position}, Prize: {Prize}",
                    drawId, winningPosition, line.PrizeAmount);
            }
            else
            {
                line.LineStatus = "loser";
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
            var allProcessed = lines.All(l => l.LineStatus == "winner" || l.LineStatus == "loser");

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

    /// <summary>
    /// Checks if a ticket line is a winner and returns the winning position.
    /// Returns 0 if not a winner, 1-3 for the position where the number matched.
    /// For Dominican lotteries, prizes depend on which position the number appeared.
    /// </summary>
    private int GetWinningPosition(TicketLine line, Result result)
    {
        var betNumber = line.BetNumber.Trim();
        var winningNumber = result.WinningNumber.Trim();
        var additionalNumber = result.AdditionalNumber?.Trim() ?? "";
        var betTypeCode = line.BetTypeCode?.ToUpper() ?? "";

        // Extract individual positions from winning number (format: NNNNNN = num1+num2+num3)
        var num1 = winningNumber.Length >= 2 ? winningNumber.Substring(0, 2) : winningNumber;
        var num2 = winningNumber.Length >= 4 ? winningNumber.Substring(2, 2) : "";
        var num3 = winningNumber.Length >= 6 ? winningNumber.Substring(4, 2) : "";

        // Extract Cash3 (3 digits), Play4 (4 digits), Pick5 (5 digits) from additional number
        var cash3Result = additionalNumber.Length >= 3 ? additionalNumber.Substring(0, 3) : "";
        var play4Result = additionalNumber.Length >= 7 ? additionalNumber.Substring(3, 4) : "";
        var pick5Result = additionalNumber.Length >= 12 ? additionalNumber.Substring(7, 5) : "";

        // Different matching rules based on bet type
        return betTypeCode switch
        {
            // Directo/Straight - 2 digit bet can win in any of the 3 positions
            "DIRECTO" or "STRAIGHT" or "DIR" => GetDirectoPosition(betNumber, num1, num2, num3),

            // Box/Combinado - any permutation of 2 digits matches (check all positions)
            "BOX" or "COMBINADO" or "COMB" => GetCombinadoPosition(betNumber, num1, num2, num3),

            // Palé - 4 digit bet matches two positions (different prizes based on which positions)
            // DisplayOrder 1/2 = 1ra+2da or 1ra+3ra (1000x), DisplayOrder 4 = 2da+3ra (100x)
            "PALE" or "PALÉ" or "FIRST2" => GetPalePosition(betNumber, num1, num2, num3),

            // Tripleta - 6 digit bet, prizes for 3 matches (20000x) or 2 matches (100x)
            "TRIPLETA" or "FIRST3" => GetTripletaPosition(betNumber, num1, num2, num3),

            // Pulito - last digit of bet matches last digit of any position
            "PULITO" or "LAST1" => GetPulitoPosition(betNumber, num1, num2, num3),

            // Super Palé - matches positions 1 and 3 of SAME draw
            // NOTE: According to lottery rules, Super Palé should be between TWO different lotteries.
            // Current implementation checks positions 1 and 3 of the same draw.
            // TODO: Implement cross-lottery Super Palé in future version.
            "SUPER_PALE" or "SUPER PALÉ" or "SUPER_PALÉ" => CheckSuperPaleMatch(betNumber, num1, num3) ? 1 : 0,

            // Cash3 Straight - 3 digit exact match against Cash3 result
            // DisplayOrder 1 = Todos en secuencia (exact match), DisplayOrder 2 = Triples (e.g., 222, 333)
            "CASH3_STRAIGHT" or "CASH3 STRAIGHT" => GetCash3StraightPosition(betNumber, cash3Result),

            // Cash3 Box - 3 digit any-order match against Cash3 result
            // DisplayOrder 1 = 3-Way (2 identical digits), DisplayOrder 2 = 6-Way (3 unique digits)
            "CASH3_BOX" or "CASH3 BOX" => GetCash3BoxPosition(betNumber, cash3Result),

            // Cash3 Front Straight - uses first 3 digits of Play4 result
            "CASH3_FRONT_STRAIGHT" or "CASH3 FRONT STRAIGHT" => GetCash3StraightPosition(betNumber, play4Result.Length >= 3 ? play4Result.Substring(0, 3) : ""),

            // Cash3 Back Straight - uses last 3 digits of Play4 result
            "CASH3_BACK_STRAIGHT" or "CASH3 BACK STRAIGHT" => GetCash3StraightPosition(betNumber, play4Result.Length >= 3 ? play4Result.Substring(1, 3) : ""),

            // Cash3 Front Box - uses first 3 digits of Play4 result, any order
            "CASH3_FRONT_BOX" or "CASH3 FRONT BOX" => GetCash3BoxPosition(betNumber, play4Result.Length >= 3 ? play4Result.Substring(0, 3) : ""),

            // Cash3 Back Box - uses last 3 digits of Play4 result, any order
            "CASH3_BACK_BOX" or "CASH3 BACK BOX" => GetCash3BoxPosition(betNumber, play4Result.Length >= 3 ? play4Result.Substring(1, 3) : ""),

            // Play4 Straight - 4 digit exact match against Play4 result
            // DisplayOrder 1 = Todos en secuencia (exact match), DisplayOrder 2 = Dobles (two pairs, e.g., 1122, 3355)
            "PLAY4 STRAIGHT" or "PLAY4_STRAIGHT" => GetPlay4StraightPosition(betNumber, play4Result),

            // Play4 Box - 4 digit any-order match against Play4 result
            // DisplayOrder 1 = 24-Way (4 unique), 2 = 12-Way (1 pair), 3 = 6-Way (2 pairs), 4 = 4-Way (3 identical)
            "PLAY4 BOX" or "PLAY4_BOX" => GetPlay4BoxPosition(betNumber, play4Result),

            // Bolita 1 - 2 digit bet matches first 2 digits of Cash3 (e.g., Cash3 "915" → Bolita1 = "91")
            "BOLITA 1" or "BOLITA_1" => betNumber == (cash3Result.Length >= 2 ? cash3Result.Substring(0, 2) : "") ? 1 : 0,

            // Bolita 2 - 2 digit bet matches last 2 digits of Cash3 (e.g., Cash3 "915" → Bolita2 = "15")
            "BOLITA 2" or "BOLITA_2" => betNumber == (cash3Result.Length >= 3 ? cash3Result.Substring(1, 2) : "") ? 1 : 0,

            // Singulacion 1 - 1 digit bet matches 1st digit of Cash3 (e.g., Cash3 "915" → "9")
            "SINGULACIÓN 1" or "SINGULACION_1" => betNumber == (cash3Result.Length >= 1 ? cash3Result.Substring(0, 1) : "") ? 1 : 0,

            // Singulacion 2 - 1 digit bet matches 2nd digit of Cash3 (e.g., Cash3 "915" → "1")
            "SINGULACIÓN 2" or "SINGULACION_2" => betNumber == (cash3Result.Length >= 2 ? cash3Result.Substring(1, 1) : "") ? 1 : 0,

            // Singulacion 3 - 1 digit bet matches 3rd digit of Cash3 (e.g., Cash3 "915" → "5")
            "SINGULACIÓN 3" or "SINGULACION_3" => betNumber == (cash3Result.Length >= 3 ? cash3Result.Substring(2, 1) : "") ? 1 : 0,

            // Pick5 Straight - 5 digit exact match against Pick5 result
            // DisplayOrder 1 = Todos en secuencia (5 unique digits), DisplayOrder 2 = Dobles (has repeated digits)
            "PICK5 STRAIGHT" or "PICK5_STRAIGHT" => GetPick5StraightPosition(betNumber, pick5Result),

            // Pick5 Box - 5 digit any-order match against Pick5 result
            // DisplayOrder 1-6 based on digit pattern
            "PICK5 BOX" or "PICK5_BOX" => GetPick5BoxPosition(betNumber, pick5Result),

            // Pick Two - 2 digit box match (any order) against the draw result (num1)
            // DisplayOrder 1 = Primer Pago (non-double), DisplayOrder 2 = Dobles (e.g., 22, 33)
            "PICK TWO" or "PICK_TWO" or "PICK2" => GetPickTwoPosition(betNumber, num1),

            // Pick Two Front - first 2 digits of Play4 (e.g., Play4 "1347" → "13")
            "PICK TWO FRONT" or "PICK_TWO_FRONT" => GetPickTwoPosition(betNumber, play4Result.Length >= 2 ? play4Result.Substring(0, 2) : ""),

            // Pick Two Middle - middle 2 digits of Play4 (e.g., Play4 "1347" → "34")
            "PICK TWO MIDDLE" or "PICK_TWO_MIDDLE" => GetPickTwoPosition(betNumber, play4Result.Length >= 3 ? play4Result.Substring(1, 2) : ""),

            // Pick Two Back - last 2 digits of Play4 (e.g., Play4 "1347" → "47")
            "PICK TWO BACK" or "PICK_TWO_BACK" => GetPickTwoPosition(betNumber, play4Result.Length >= 4 ? play4Result.Substring(2, 2) : ""),

            // Default - check all positions (Directo fallback)
            _ => GetDirectoPosition(betNumber, num1, num2, num3)
        };
    }

    /// <summary>
    /// Returns the position (1, 2, or 3) where the bet number matches for Directo bets.
    /// Returns 0 if no match.
    /// </summary>
    private int GetDirectoPosition(string betNumber, string num1, string num2, string num3)
    {
        if (betNumber == num1) return 1;
        if (betNumber == num2) return 2;
        if (betNumber == num3) return 3;
        return 0;
    }

    /// <summary>
    /// Returns the position for Combinado/Box bets (permutation match).
    /// </summary>
    private int GetCombinadoPosition(string betNumber, string num1, string num2, string num3)
    {
        if (IsBoxMatch(betNumber, num1)) return 1;
        if (IsBoxMatch(betNumber, num2)) return 2;
        if (IsBoxMatch(betNumber, num3)) return 3;
        return 0;
    }

    /// <summary>
    /// Returns the position for Pulito bets (last digit match).
    /// </summary>
    private int GetPulitoPosition(string betNumber, string num1, string num2, string num3)
    {
        if (!string.IsNullOrEmpty(num1) && num1.EndsWith(betNumber)) return 1;
        if (!string.IsNullOrEmpty(num2) && num2.EndsWith(betNumber)) return 2;
        if (!string.IsNullOrEmpty(num3) && num3.EndsWith(betNumber)) return 3;
        return 0;
    }

    /// <summary>
    /// Returns the DisplayOrder for Palé bets based on which positions match.
    /// Palé prizes vary based on the combination:
    /// - 1ra + 2da = DisplayOrder 2 (PRIMER_PAGO, 1000x-1100x)
    /// - 1ra + 3ra = DisplayOrder 3 (SEGUNDO_PAGO, 1000x-1100x)
    /// - 2da + 3ra = DisplayOrder 4 (TERCER_PAGO, 100x) - MUCH LOWER PRIZE
    /// </summary>
    private int GetPalePosition(string betNumber, string num1, string num2, string num3)
    {
        if (betNumber.Length != 4)
            return 0;

        var betFirst = betNumber.Substring(0, 2);
        var betSecond = betNumber.Substring(2, 2);

        // Check which numbers from the result match the bet (any order)
        var hasNum1 = (betFirst == num1 || betSecond == num1);
        var hasNum2 = (betFirst == num2 || betSecond == num2);
        var hasNum3 = (betFirst == num3 || betSecond == num3);

        // 1ra + 2da = DisplayOrder 2 (premio mayor ~1000x)
        if (hasNum1 && hasNum2)
        {
            _logger.LogInformation("Palé match: 1ra+2da ({0}+{1}), DisplayOrder 2", num1, num2);
            return 2;
        }

        // 1ra + 3ra = DisplayOrder 3 (premio mayor ~1000x)
        if (hasNum1 && hasNum3)
        {
            _logger.LogInformation("Palé match: 1ra+3ra ({0}+{1}), DisplayOrder 3", num1, num3);
            return 3;
        }

        // 2da + 3ra = DisplayOrder 4 (premio menor ~100x)
        if (hasNum2 && hasNum3)
        {
            _logger.LogInformation("Palé match: 2da+3ra ({0}+{1}), DisplayOrder 4 (premio menor)", num2, num3);
            return 4;
        }

        return 0; // No match
    }

    /// <summary>
    /// Returns the DisplayOrder for Tripleta bets.
    /// - 3 aciertos = DisplayOrder 1 (premio completo ~20000x)
    /// - 2 aciertos = DisplayOrder 2 (premio parcial ~100x)
    /// </summary>
    private int GetTripletaPosition(string betNumber, string num1, string num2, string num3)
    {
        if (betNumber.Length != 6)
            return 0;

        // Extract the 3 numbers from the bet (format: AABBCC)
        var betNums = new[]
        {
            betNumber.Substring(0, 2),
            betNumber.Substring(2, 2),
            betNumber.Substring(4, 2)
        };

        var winNums = new[] { num1, num2, num3 };

        // Count how many bet numbers appear in the winning numbers (any order)
        var matchCount = betNums.Count(b => winNums.Contains(b));

        if (matchCount == 3)
        {
            _logger.LogInformation("Tripleta: 3 aciertos, DisplayOrder 1 (premio completo)");
            return 1; // Premio completo
        }

        if (matchCount == 2)
        {
            _logger.LogInformation("Tripleta: 2 de 3 aciertos, DisplayOrder 2 (premio parcial)");
            return 2; // Premio parcial
        }

        return 0; // No ganó
    }

    /// <summary>
    /// Checks if Super Palé matches (positions 1 and 3).
    /// </summary>
    private bool CheckSuperPaleMatch(string betNumber, string num1, string num3)
    {
        if (betNumber.Length != 4 || string.IsNullOrEmpty(num1) || string.IsNullOrEmpty(num3))
            return false;

        var betFirst = betNumber.Substring(0, 2);
        var betSecond = betNumber.Substring(2, 2);

        return (betFirst == num1 && betSecond == num3) ||
               (betFirst == num3 && betSecond == num1);
    }

    private bool CheckPaleMatch(string betNumber, string num1, string num2)
    {
        if (betNumber.Length != 4 || string.IsNullOrEmpty(num1) || string.IsNullOrEmpty(num2))
            return false;

        var betFirst = betNumber.Substring(0, 2);
        var betSecond = betNumber.Substring(2, 2);

        // Pale wins if both numbers appear in first two positions (any order)
        return (betFirst == num1 && betSecond == num2) ||
               (betFirst == num2 && betSecond == num1);
    }

    private bool IsBoxMatch(string betNumber, string winningNumber)
    {
        if (betNumber.Length != winningNumber.Length)
            return false;

        var betDigits = betNumber.OrderBy(c => c).ToArray();
        var winDigits = winningNumber.OrderBy(c => c).ToArray();

        return betDigits.SequenceEqual(winDigits);
    }

    /// <summary>
    /// Cash3 Straight: 3-digit exact match.
    /// DisplayOrder 1 = Todos en secuencia (regular straight match)
    /// DisplayOrder 2 = Triples (all 3 digits identical, e.g., 222, 333)
    /// </summary>
    private int GetCash3StraightPosition(string betNumber, string cash3Result)
    {
        if (betNumber.Length != 3 || cash3Result.Length < 3)
            return 0;

        if (betNumber != cash3Result)
            return 0;

        // It's a match - determine if it's a triple
        if (betNumber[0] == betNumber[1] && betNumber[1] == betNumber[2])
        {
            _logger.LogInformation("Cash3 Straight Triple match: {Bet} = {Result}, DisplayOrder 2", betNumber, cash3Result);
            return 2; // Triples
        }

        _logger.LogInformation("Cash3 Straight match: {Bet} = {Result}, DisplayOrder 1", betNumber, cash3Result);
        return 1; // Todos en secuencia
    }

    /// <summary>
    /// Cash3 Box: 3-digit any-order match.
    /// DisplayOrder 1 = 3-Way (2 identical digits, e.g., 112 → 3 permutations)
    /// DisplayOrder 2 = 6-Way (3 unique digits, e.g., 123 → 6 permutations)
    /// </summary>
    private int GetCash3BoxPosition(string betNumber, string cash3Result)
    {
        if (betNumber.Length != 3 || cash3Result.Length < 3)
            return 0;

        if (!IsBoxMatch(betNumber, cash3Result))
            return 0;

        // Determine if 3-way (2 identical) or 6-way (3 unique)
        var distinctDigits = betNumber.Distinct().Count();

        if (distinctDigits == 2)
        {
            _logger.LogInformation("Cash3 Box 3-Way match: {Bet} ~ {Result}, DisplayOrder 1", betNumber, cash3Result);
            return 1; // 3-Way: 2 identical digits
        }

        _logger.LogInformation("Cash3 Box 6-Way match: {Bet} ~ {Result}, DisplayOrder 2", betNumber, cash3Result);
        return 2; // 6-Way: 3 unique digits
    }

    /// <summary>
    /// Play4 Straight: 4-digit exact match against Play4 result.
    /// DisplayOrder 1 = Todos en secuencia (regular straight match)
    /// DisplayOrder 2 = Dobles (two pairs of identical digits, e.g., 1122, 3355)
    /// </summary>
    private int GetPlay4StraightPosition(string betNumber, string play4Result)
    {
        if (betNumber.Length != 4 || play4Result.Length < 4)
            return 0;

        if (betNumber != play4Result)
            return 0;

        // Check if it's a "dobles" (exactly 2 distinct digits, each appearing exactly twice)
        var digitGroups = betNumber.GroupBy(c => c).Select(g => g.Count()).OrderBy(c => c).ToArray();
        if (digitGroups.Length == 2 && digitGroups[0] == 2 && digitGroups[1] == 2)
        {
            _logger.LogInformation("Play4 Straight Dobles match: {Bet} = {Result}, DisplayOrder 2", betNumber, play4Result);
            return 2; // Dobles
        }

        _logger.LogInformation("Play4 Straight match: {Bet} = {Result}, DisplayOrder 1", betNumber, play4Result);
        return 1; // Todos en secuencia
    }

    /// <summary>
    /// Play4 Box: 4-digit any-order match against Play4 result.
    /// DisplayOrder 1 = 24-Way (4 unique digits, e.g., 1234)
    /// DisplayOrder 2 = 12-Way (1 pair of identical digits, e.g., 1123)
    /// DisplayOrder 3 = 6-Way (2 pairs of identical digits, e.g., 1133, 0550)
    /// DisplayOrder 4 = 4-Way (3 identical digits, e.g., 5333)
    /// </summary>
    private int GetPlay4BoxPosition(string betNumber, string play4Result)
    {
        if (betNumber.Length != 4 || play4Result.Length < 4)
            return 0;

        if (!IsBoxMatch(betNumber, play4Result))
            return 0;

        var digitGroups = betNumber.GroupBy(c => c).Select(g => g.Count()).OrderByDescending(c => c).ToArray();

        // 4 unique digits → 24-Way (4! = 24 permutations)
        if (digitGroups.Length == 4)
        {
            _logger.LogInformation("Play4 Box 24-Way match: {Bet} ~ {Result}, DisplayOrder 1", betNumber, play4Result);
            return 1;
        }

        // 3 identical + 1 different → 4-Way (4!/3! = 4 permutations)
        if (digitGroups.Length == 2 && digitGroups[0] == 3)
        {
            _logger.LogInformation("Play4 Box 4-Way match: {Bet} ~ {Result}, DisplayOrder 4", betNumber, play4Result);
            return 4;
        }

        // 2 pairs of identical → 6-Way (4!/(2!×2!) = 6 permutations)
        if (digitGroups.Length == 2 && digitGroups[0] == 2)
        {
            _logger.LogInformation("Play4 Box 6-Way match: {Bet} ~ {Result}, DisplayOrder 3", betNumber, play4Result);
            return 3;
        }

        // 1 pair + 2 unique → 12-Way (4!/2! = 12 permutations)
        if (digitGroups.Length == 3)
        {
            _logger.LogInformation("Play4 Box 12-Way match: {Bet} ~ {Result}, DisplayOrder 2", betNumber, play4Result);
            return 2;
        }

        // Fallback (shouldn't reach here for valid 4-digit numbers)
        _logger.LogWarning("Play4 Box unexpected pattern: {Bet}, defaulting to DisplayOrder 1", betNumber);
        return 1;
    }

    /// <summary>
    /// Pick5 Straight: 5-digit exact match against Pick5 result.
    /// DisplayOrder 1 = Todos en secuencia (5 unique digits)
    /// DisplayOrder 2 = Dobles (has any repeated digits, e.g., 11324, 14425)
    /// </summary>
    private int GetPick5StraightPosition(string betNumber, string pick5Result)
    {
        if (betNumber.Length != 5 || pick5Result.Length < 5)
            return 0;

        if (betNumber != pick5Result)
            return 0;

        // Check if it has any repeated digits (dobles)
        if (betNumber.Distinct().Count() < 5)
        {
            _logger.LogInformation("Pick5 Straight Dobles match: {Bet} = {Result}, DisplayOrder 2", betNumber, pick5Result);
            return 2; // Dobles
        }

        _logger.LogInformation("Pick5 Straight match: {Bet} = {Result}, DisplayOrder 1", betNumber, pick5Result);
        return 1; // Todos en secuencia
    }

    /// <summary>
    /// Pick5 Box: 5-digit any-order match against Pick5 result.
    /// DisplayOrder 1 = 5-Way: 4 identical (AAAAB) → 5!/4! = 5
    /// DisplayOrder 2 = 10-Way: 3 identical + 1 pair (AAABB) → 5!/(3!×2!) = 10
    /// DisplayOrder 3 = 20-Way: 3 identical + 2 unique (AAABC) → 5!/3! = 20
    /// DisplayOrder 4 = 30-Way: 2 pairs + 1 unique (AABBC) → 5!/(2!×2!) = 30
    /// DisplayOrder 5 = 60-Way: 1 pair + 3 unique (AABCD) → 5!/2! = 60
    /// DisplayOrder 6 = 120-Way: 5 unique (ABCDE) → 5! = 120
    /// </summary>
    private int GetPick5BoxPosition(string betNumber, string pick5Result)
    {
        if (betNumber.Length != 5 || pick5Result.Length < 5)
            return 0;

        if (!IsBoxMatch(betNumber, pick5Result))
            return 0;

        var digitGroups = betNumber.GroupBy(c => c).Select(g => g.Count()).OrderByDescending(c => c).ToArray();
        var distinctCount = digitGroups.Length;
        var maxCount = digitGroups[0];

        // 4 identical + 1 different (AAAAB) → 5-Way
        if (distinctCount == 2 && maxCount == 4)
        {
            _logger.LogInformation("Pick5 Box 5-Way match: {Bet} ~ {Result}, DisplayOrder 1", betNumber, pick5Result);
            return 1;
        }

        // 3 identical + 1 pair (AAABB) → 10-Way
        if (distinctCount == 2 && maxCount == 3)
        {
            _logger.LogInformation("Pick5 Box 10-Way match: {Bet} ~ {Result}, DisplayOrder 2", betNumber, pick5Result);
            return 2;
        }

        // 3 identical + 2 unique (AAABC) → 20-Way
        if (distinctCount == 3 && maxCount == 3)
        {
            _logger.LogInformation("Pick5 Box 20-Way match: {Bet} ~ {Result}, DisplayOrder 3", betNumber, pick5Result);
            return 3;
        }

        // 2 pairs + 1 unique (AABBC) → 30-Way
        if (distinctCount == 3 && maxCount == 2)
        {
            _logger.LogInformation("Pick5 Box 30-Way match: {Bet} ~ {Result}, DisplayOrder 4", betNumber, pick5Result);
            return 4;
        }

        // 1 pair + 3 unique (AABCD) → 60-Way
        if (distinctCount == 4)
        {
            _logger.LogInformation("Pick5 Box 60-Way match: {Bet} ~ {Result}, DisplayOrder 5", betNumber, pick5Result);
            return 5;
        }

        // 5 unique (ABCDE) → 120-Way
        if (distinctCount == 5)
        {
            _logger.LogInformation("Pick5 Box 120-Way match: {Bet} ~ {Result}, DisplayOrder 6", betNumber, pick5Result);
            return 6;
        }

        _logger.LogWarning("Pick5 Box unexpected pattern: {Bet}, defaulting to DisplayOrder 6", betNumber);
        return 6;
    }

    /// <summary>
    /// Pick Two: 2-digit box match (order doesn't matter).
    /// DisplayOrder 1 = Primer Pago (non-double, e.g., 12 matches 12 or 21)
    /// DisplayOrder 2 = Dobles (double digits, e.g., 22, 33, 44)
    /// </summary>
    private int GetPickTwoPosition(string betNumber, string resultNumber)
    {
        if (betNumber.Length != 2 || resultNumber.Length < 2)
            return 0;

        if (!IsBoxMatch(betNumber, resultNumber))
            return 0;

        // Check if it's a double (both digits the same)
        if (betNumber[0] == betNumber[1])
        {
            _logger.LogInformation("Pick Two Dobles match: {Bet} ~ {Result}, DisplayOrder 2", betNumber, resultNumber);
            return 2; // Dobles
        }

        _logger.LogInformation("Pick Two match: {Bet} ~ {Result}, DisplayOrder 1", betNumber, resultNumber);
        return 1; // Primer Pago
    }

    /// <summary>
    /// Calculates the prize for a winning ticket line based on the position where the number matched.
    /// For Dominican lotteries:
    /// - Position 1 (1ra) = Higher prize (e.g., 56x)
    /// - Position 2 (2da) = Medium prize (e.g., 12x)
    /// - Position 3 (3ra) = Lower prize (e.g., 4x)
    /// </summary>
    /// <param name="line">The winning ticket line</param>
    /// <param name="winningPosition">The position where the number matched (1, 2, or 3)</param>
    private async Task<decimal> CalculatePrizeAsync(TicketLine line, int winningPosition)
    {
        // First check if line already has a prize multiplier
        if (line.PrizeMultiplier.HasValue && line.PrizeMultiplier.Value > 0)
        {
            return line.BetAmount * line.PrizeMultiplier.Value;
        }

        // Get the betting pool ID from the ticket
        var bettingPoolId = line.Ticket?.BettingPoolId;

        // Resolve the correct prize bet_type_id from the game_type_id mapping.
        // ticket_lines.bet_type_id stores game_type_id, but prize_types.bet_type_id
        // uses a different numbering system.
        var prizeBetTypeId = GameTypeToPrizeBetType.TryGetValue(line.BetTypeId, out var mapped)
            ? mapped
            : line.BetTypeId;

        if (prizeBetTypeId != line.BetTypeId)
        {
            _logger.LogInformation("Mapped game_type_id {GameTypeId} to prize bet_type_id {PrizeBetTypeId} for bet type {BetTypeCode}",
                line.BetTypeId, prizeBetTypeId, line.BetTypeCode);
        }

        // Find the prize type for this bet type based on the winning position
        // DisplayOrder corresponds to the result position:
        // DisplayOrder 1 = Prize for 1st position (Primer Pago)
        // DisplayOrder 2 = Prize for 2nd position (Segundo Pago)
        // DisplayOrder 3 = Prize for 3rd position (Tercer Pago)
        var prizeType = await _context.PrizeTypes
            .Where(pt => pt.BetTypeId == prizeBetTypeId && pt.IsActive && pt.DisplayOrder == winningPosition)
            .FirstOrDefaultAsync();

        // Fallback: if no prize type for this specific position, try to get the first one
        if (prizeType == null)
        {
            prizeType = await _context.PrizeTypes
                .Where(pt => pt.BetTypeId == prizeBetTypeId && pt.IsActive)
                .OrderBy(pt => pt.DisplayOrder)
                .FirstOrDefaultAsync();

            if (prizeType == null)
            {
                _logger.LogWarning("No prize type found for prize bet_type_id {PrizeBetTypeId} (game_type_id {GameTypeId})",
                    prizeBetTypeId, line.BetTypeId);
                return 0;
            }

            _logger.LogWarning("No prize type found for position {Position}, using fallback DisplayOrder {DisplayOrder}",
                winningPosition, prizeType.DisplayOrder);
        }

        decimal multiplier = prizeType.DefaultMultiplier;

        // Prize cascade: draw_specific > banca_default > system_default
        if (bettingPoolId.HasValue)
        {
            // 1. Check draw-specific config (highest priority)
            var drawConfig = await _context.DrawPrizeConfigs
                .FirstOrDefaultAsync(dc =>
                    dc.DrawId == line.DrawId &&
                    dc.BettingPoolId == bettingPoolId.Value &&
                    dc.PrizeTypeId == prizeType.PrizeTypeId);

            if (drawConfig != null)
            {
                multiplier = drawConfig.CustomValue;
                _logger.LogInformation("Using draw-specific multiplier {Multiplier} for draw {DrawId}, pool {PoolId}, position {Position}",
                    multiplier, line.DrawId, bettingPoolId, winningPosition);
            }
            else
            {
                // 2. Check banca default config
                var bancaConfig = await _context.BancaPrizeConfigs
                    .FirstOrDefaultAsync(bc =>
                        bc.BettingPoolId == bettingPoolId.Value &&
                        bc.PrizeTypeId == prizeType.PrizeTypeId);

                if (bancaConfig != null)
                {
                    multiplier = bancaConfig.CustomValue;
                    _logger.LogInformation("Using banca multiplier {Multiplier} for pool {PoolId}, position {Position}",
                        multiplier, bettingPoolId, winningPosition);
                }
            }
            // 3. Otherwise falls through to prizeType.DefaultMultiplier (system default)
        }

        // Store the multiplier in the line for future reference
        line.PrizeMultiplier = multiplier;

        _logger.LogInformation("Prize calculation: {BetAmount} x {Multiplier} = {Prize} for bet type {BetType}, position {Position}",
            line.BetAmount, multiplier, line.BetAmount * multiplier, line.BetTypeCode, winningPosition);

        return line.BetAmount * multiplier;
    }

    /// <summary>
    /// Reprocess all pending tickets that have results available.
    /// This method finds all ticket lines with status "pending" that have a matching result
    /// and processes them to determine winners/losers.
    /// </summary>
    public async Task<(int ticketsProcessed, int winnersFound, int ticketsUpdated)> ReprocessPendingTicketsAsync(
        DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var ticketsProcessed = 0;
        var winnersFound = 0;
        var affectedTicketIds = new HashSet<long>();

        // Default to last 7 days if no dates specified
        var start = startDate ?? DateTime.UtcNow.AddDays(-7).Date;
        var end = endDate ?? DateTime.UtcNow.Date;

        _logger.LogInformation("Reprocessing pending tickets from {Start} to {End}",
            start.ToString("yyyy-MM-dd"), end.ToString("yyyy-MM-dd"));

        // Get all results in the date range
        var results = await _context.Results
            .Where(r => r.ResultDate.Date >= start && r.ResultDate.Date <= end)
            .ToDictionaryAsync(r => (r.DrawId, r.ResultDate.Date), r => r, cancellationToken);

        if (!results.Any())
        {
            _logger.LogInformation("No results found in date range");
            return (0, 0, 0);
        }

        _logger.LogInformation("Found {Count} results to check against", results.Count);

        // Get all pending ticket lines in the date range
        var pendingLines = await _context.Set<TicketLine>()
            .Include(tl => tl.Ticket)
            .Include(tl => tl.BetType)
            .Where(tl =>
                tl.DrawDate.Date >= start &&
                tl.DrawDate.Date <= end &&
                tl.LineStatus == "pending" &&
                !tl.Ticket!.IsCancelled)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} pending ticket lines to process", pendingLines.Count);

        foreach (var line in pendingLines)
        {
            // Check if there's a result for this draw and date
            var key = (line.DrawId, line.DrawDate.Date);
            if (!results.TryGetValue(key, out var result))
                continue;

            ticketsProcessed++;

            // Check if this line is a winner
            var winningPosition = GetWinningPosition(line, result);

            line.ResultNumber = result.WinningNumber;
            line.ResultCheckedAt = DateTime.UtcNow;

            if (winningPosition > 0)
            {
                line.IsWinner = true;
                line.LineStatus = "winner";
                line.WinningPosition = winningPosition;
                winnersFound++;

                // Calculate prize
                line.PrizeAmount = await CalculatePrizeAsync(line, winningPosition);

                if (line.Ticket != null)
                {
                    line.Ticket.WinningLines++;
                    line.Ticket.TotalPrize += line.PrizeAmount;
                    affectedTicketIds.Add(line.TicketId);
                }

                _logger.LogInformation(
                    "Winner found! Ticket {TicketId} Line {LineId}: bet {BetNumber} matches position {Position} in result {Result}, Prize: {Prize}",
                    line.TicketId, line.LineId, line.BetNumber, winningPosition, result.WinningNumber, line.PrizeAmount);
            }
            else
            {
                line.LineStatus = "loser";
                affectedTicketIds.Add(line.TicketId);
            }
        }

        // Update TicketState for all affected tickets
        if (affectedTicketIds.Any())
        {
            await UpdateTicketStatesAsync(affectedTicketIds, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Reprocessing complete: {Processed} lines processed, {Winners} winners found, {Tickets} tickets updated",
            ticketsProcessed, winnersFound, affectedTicketIds.Count);

        return (ticketsProcessed, winnersFound, affectedTicketIds.Count);
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
