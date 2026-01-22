using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("limit_consumption")]
public class LimitConsumption
{
    [Key]
    [Column("consumption_id")]
    public long ConsumptionId { get; set; }

    [Column("limit_rule_id")]
    public int LimitRuleId { get; set; }

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("draw_date")]
    public DateOnly DrawDate { get; set; }

    [MaxLength(20)]
    [Column("bet_number")]
    public string? BetNumber { get; set; }

    [Column("betting_pool_id")]
    public int? BettingPoolId { get; set; }

    [Column("current_amount", TypeName = "decimal(18,2)")]
    public decimal CurrentAmount { get; set; }

    [Column("bet_count")]
    public int BetCount { get; set; }

    [Column("last_bet_at")]
    public DateTime? LastBetAt { get; set; }

    [Column("is_near_limit")]
    public bool IsNearLimit { get; set; }

    [Column("is_at_limit")]
    public bool IsAtLimit { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("LimitRuleId")]
    public virtual LimitRule? LimitRule { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
