using LotteryApi.Data;
using LotteryApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LotteryApi.Services.Transactions;

public class AutomaticTransactionService : IAutomaticTransactionService
{
    private readonly LotteryDbContext _context;
    private readonly ILogger<AutomaticTransactionService> _logger;

    public AutomaticTransactionService(
        LotteryDbContext context,
        ILogger<AutomaticTransactionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task RecordAsync(
        int bettingPoolId,
        string transactionType,
        decimal debit,
        decimal credit,
        decimal initialBalance,
        decimal finalBalance,
        string notes,
        string? expenseCategory = null,
        CancellationToken ct = default)
    {
        // Snapshot the banca's identifying fields (name/code/zone) so the
        // transaction row keeps the values that were in effect at the time
        // of the movement, matching how manual groups capture them.
        var bp = await _context.BettingPools
            .AsNoTracking()
            .Where(b => b.BettingPoolId == bettingPoolId)
            .Select(b => new
            {
                b.BettingPoolId,
                b.BettingPoolCode,
                b.BettingPoolName,
                b.ZoneId
            })
            .FirstOrDefaultAsync(ct);

        if (bp == null)
        {
            _logger.LogWarning(
                "Skipping automatic transaction for missing banca {BettingPoolId}",
                bettingPoolId);
            return;
        }

        // group_number uses an AUTO- prefix so it's trivially distinguishable
        // from operator-created TG-#### numbers in listing/filter UIs.
        var nextSeq = (await _context.TransactionGroups
            .OrderByDescending(g => g.GroupId)
            .Select(g => (int?)g.GroupId)
            .FirstOrDefaultAsync(ct)) ?? 0;
        var groupNumber = $"AUTO-{nextSeq + 1:D6}";

        var now = DateTime.UtcNow;
        var group = new TransactionGroup
        {
            GroupNumber = groupNumber,
            ZoneId = bp.ZoneId,
            Notes = notes,
            IsAutomatic = true,
            Status = "Aprobado",
            CreatedAt = now,
            CreatedBy = null,
            ApprovedBy = null,
            ApprovedAt = now,
        };
        _context.TransactionGroups.Add(group);

        var line = new TransactionGroupLine
        {
            Group = group,
            TransactionType = transactionType,
            Entity1Type = "bettingPool",
            Entity1Id = bp.BettingPoolId,
            Entity1Name = bp.BettingPoolName,
            Entity1Code = bp.BettingPoolCode,
            Entity1InitialBalance = initialBalance,
            Entity1FinalBalance = finalBalance,
            Entity2InitialBalance = 0m,
            Entity2FinalBalance = 0m,
            Debit = debit,
            Credit = credit,
            ExpenseCategory = expenseCategory,
            Notes = notes,
            ShowInBanca = true,
            CreatedAt = now,
        };
        _context.TransactionGroupLines.Add(line);
    }
}
