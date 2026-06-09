using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("limit_rule_amounts")]
public class LimitRuleAmount
{
    [Key]
    [Column("limit_rule_amount_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LimitRuleAmountId { get; set; }

    [Column("limit_rule_id")]
    public int LimitRuleId { get; set; }

    [Column("game_type_id")]
    public int GameTypeId { get; set; }

    [Column("max_amount", TypeName = "decimal(18,2)")]
    public decimal MaxAmount { get; set; }

    /// <summary>
    /// Cap for FUTURE sales (lines whose draw_date is greater than today).
    /// Tracked in a separate consumption bucket so future reservations don't
    /// eat into the same-day limit. NULL or 0 = future sales prohibited
    /// under this rule (opt-in policy — admin must configure a positive
    /// value to allow future sales).
    /// </summary>
    [Column("future_max_amount", TypeName = "decimal(10,2)")]
    public decimal? FutureMaxAmount { get; set; }

    // Navigation
    [ForeignKey("LimitRuleId")]
    public virtual LimitRule? LimitRule { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
