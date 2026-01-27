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
        var betTypeCode = line.BetTypeCode?.ToUpper() ?? "";

        // Extract individual positions from winning number (format: NNNNNN = num1+num2+num3)
        var num1 = winningNumber.Length >= 2 ? winningNumber.Substring(0, 2) : winningNumber;
        var num2 = winningNumber.Length >= 4 ? winningNumber.Substring(2, 2) : "";
        var num3 = winningNumber.Length >= 6 ? winningNumber.Substring(4, 2) : "";

        // Different matching rules based on bet type
        return betTypeCode switch
        {
            // Directo/Straight - 2 digit bet can win in any of the 3 positions
            "DIRECTO" or "STRAIGHT" or "DIR" => GetDirectoPosition(betNumber, num1, num2, num3),

            // Box/Combinado - any permutation of 2 digits matches (check all positions)
            "BOX" or "COMBINADO" or "COMB" => GetCombinadoPosition(betNumber, num1, num2, num3),

            // Pale - 4 digit bet (AABB) matches first two positions in any order
            "PALE" or "PALÉ" or "FIRST2" => CheckPaleMatch(betNumber, num1, num2) ? 1 : 0,

            // Tripleta - 6 digit bet matches all three positions exactly
            "TRIPLETA" or "FIRST3" =>
                (betNumber == winningNumber || betNumber == (num1 + num2 + num3)) ? 1 : 0,

            // Pulito - last digit of bet matches last digit of any position
            "PULITO" or "LAST1" => GetPulitoPosition(betNumber, num1, num2, num3),

            // Super Palé - matches positions 1 and 3
            "SUPER_PALE" or "SUPER PALÉ" or "SUPER_PALÉ" => CheckSuperPaleMatch(betNumber, num1, num3) ? 1 : 0,

            // Default - check all positions
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

        // Find the prize type for this bet type based on the winning position
        // DisplayOrder corresponds to the result position:
        // DisplayOrder 1 = Prize for 1st position (Primer Pago)
        // DisplayOrder 2 = Prize for 2nd position (Segundo Pago)
        // DisplayOrder 3 = Prize for 3rd position (Tercer Pago)
        var prizeType = await _context.PrizeTypes
            .Where(pt => pt.BetTypeId == line.BetTypeId && pt.IsActive && pt.DisplayOrder == winningPosition)
            .FirstOrDefaultAsync();

        // Fallback: if no prize type for this specific position, try to get the first one
        if (prizeType == null)
        {
            prizeType = await _context.PrizeTypes
                .Where(pt => pt.BetTypeId == line.BetTypeId && pt.IsActive)
                .OrderBy(pt => pt.DisplayOrder)
                .FirstOrDefaultAsync();

            if (prizeType == null)
            {
                _logger.LogWarning("No prize type found for bet type {BetTypeId}", line.BetTypeId);
                return 0;
            }

            _logger.LogWarning("No prize type found for position {Position}, using fallback DisplayOrder {DisplayOrder}",
                winningPosition, prizeType.DisplayOrder);
        }

        decimal multiplier = prizeType.DefaultMultiplier;

        // Check for custom banca configuration
        if (bettingPoolId.HasValue)
        {
            var bancaConfig = await _context.BancaPrizeConfigs
                .FirstOrDefaultAsync(bc =>
                    bc.BettingPoolId == bettingPoolId.Value &&
                    bc.PrizeTypeId == prizeType.PrizeTypeId);

            if (bancaConfig != null)
            {
                multiplier = bancaConfig.CustomValue;
                _logger.LogInformation("Using custom banca multiplier {Multiplier} for pool {PoolId}, position {Position}",
                    multiplier, bettingPoolId, winningPosition);
            }
        }

        // Store the multiplier in the line for future reference
        line.PrizeMultiplier = multiplier;

        _logger.LogInformation("Prize calculation: {BetAmount} x {Multiplier} = {Prize} for bet type {BetType}, position {Position}",
            line.BetAmount, multiplier, line.BetAmount * multiplier, line.BetTypeCode, winningPosition);

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
