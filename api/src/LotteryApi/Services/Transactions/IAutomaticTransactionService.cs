namespace LotteryApi.Services.Transactions;

/// <summary>
/// Records system-generated balance movements (caída, loan installments,
/// automatic expenses) as approved <c>transaction_groups</c> with a single
/// line, so they're queryable from the same endpoints reporting manual
/// Cobros / Pagos / Retiros.
/// </summary>
public interface IAutomaticTransactionService
{
    /// <summary>
    /// Adds a single-line <c>TransactionGroup</c> (already <c>Aprobado</c>,
    /// <c>IsAutomatic=true</c>) describing the movement that just landed on
    /// the banca's <c>current_balance</c>. The caller must have already
    /// applied the balance change; this method only writes the audit row.
    /// Caller is responsible for SaveChanges/commit — entries are added to
    /// the shared <c>DbContext</c> but not persisted here.
    /// </summary>
    /// <param name="bettingPoolId">Target banca.</param>
    /// <param name="transactionType">"Pago" | "Cobro" | "Retiro".</param>
    /// <param name="debit">Amount the banca received (0 if pure credit).</param>
    /// <param name="credit">Amount the banca paid out (0 if pure debit).</param>
    /// <param name="initialBalance">Banca's balance BEFORE the movement.</param>
    /// <param name="finalBalance">Banca's balance AFTER the movement.</param>
    /// <param name="notes">Free-text describing the source.</param>
    /// <param name="expenseCategory">Optional category for "Retiro" expenses.</param>
    Task RecordAsync(
        int bettingPoolId,
        string transactionType,
        decimal debit,
        decimal credit,
        decimal initialBalance,
        decimal finalBalance,
        string notes,
        string? expenseCategory = null,
        CancellationToken ct = default);
}
