using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("auto_expense_history")]
public class AutoExpenseHistory
{
    [Key]
    [Column("history_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int HistoryId { get; set; }

    [Column("expense_id")]
    public int ExpenseId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("charge_date")]
    public DateTime ChargeDate { get; set; }

    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("ExpenseId")]
    public virtual BettingPoolAutomaticExpense? Expense { get; set; }
}
