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

    // Navigation
    [ForeignKey("LimitRuleId")]
    public virtual LimitRule? LimitRule { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
