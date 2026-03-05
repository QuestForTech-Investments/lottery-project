using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("balance_history")]
public class BalanceHistory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("balance_history_id")]
    public int BalanceHistoryId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("balance_date", TypeName = "date")]
    public DateTime BalanceDate { get; set; }

    [Column("balance_amount", TypeName = "decimal(12,2)")]
    public decimal BalanceAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
