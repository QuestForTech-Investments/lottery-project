using Microsoft.EntityFrameworkCore;
using LotteryApi.Data;
using LotteryApi.Models;
using LotteryApi.Helpers;

namespace LotteryApi.Services.BalanceCutoff;

public interface IBalanceCutoffService
{
    Task<int> RunCutoffAsync(DateTime date, CancellationToken cancellationToken = default);
}

public class BalanceCutoffService : IBalanceCutoffService
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<BalanceCutoffService> _logger;

    public BalanceCutoffService(LotteryDbContext context, ILogger<BalanceCutoffService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Snapshot all active betting pool balances for the given business date.
    /// Skips pools that already have a snapshot for that date.
    /// Returns the number of snapshots created.
    /// </summary>
    public async Task<int> RunCutoffAsync(DateTime date, CancellationToken cancellationToken = default)
    {
        var balanceDate = date.Date;

        _logger.LogInformation("Running balance cutoff for {Date}", balanceDate);

        // Get pools that already have a snapshot for this date
        var existingPoolIds = await _context.BalanceHistories
            .Where(bh => bh.BalanceDate == balanceDate)
            .Select(bh => bh.BettingPoolId)
            .ToListAsync(cancellationToken);

        // Get all active betting pools with their current balance
        var pools = await _context.BettingPools
            .AsNoTracking()
            .Where(bp => bp.IsActive && bp.DeletedAt == null)
            .Where(bp => !existingPoolIds.Contains(bp.BettingPoolId))
            .Select(bp => new
            {
                bp.BettingPoolId,
                Balance = bp.Balance != null ? bp.Balance.CurrentBalance : 0m
            })
            .ToListAsync(cancellationToken);

        if (pools.Count == 0)
        {
            _logger.LogInformation("No new snapshots needed for {Date} (already exists or no pools)", balanceDate);
            return 0;
        }

        var snapshots = pools.Select(p => new BalanceHistory
        {
            BettingPoolId = p.BettingPoolId,
            BalanceDate = balanceDate,
            BalanceAmount = p.Balance,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.BalanceHistories.AddRange(snapshots);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Balance cutoff complete for {Date}: {Count} snapshots created", balanceDate, snapshots.Count);
        return snapshots.Count;
    }
}
