using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("balances")]
public class Balance
{
    [Key]
    [Column("balance_id")]
    public int BalanceId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("current_balance", TypeName = "decimal(12,2)")]
    public decimal CurrentBalance { get; set; } = 0.00m;

    [Column("last_updated")]
    public DateTime? LastUpdated { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
