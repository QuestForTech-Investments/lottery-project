using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LotteryApi.Models.Enums;

namespace LotteryApi.Models;

[Table("limit_rules")]
public class LimitRule
{
    [Key]
    [Column("limit_rule_id")]
    public int LimitRuleId { get; set; }

    [MaxLength(100)]
    [Column("rule_name")]
    public string? RuleName { get; set; }

    [Column("limit_type")]
    public LimitType LimitType { get; set; } = LimitType.GeneralForGroup;

    [Column("lottery_id")]
    public int? LotteryId { get; set; }

    [Column("draw_id")]
    public int? DrawId { get; set; }

    [Column("game_type_id")]
    public int? GameTypeId { get; set; }

    [Column("zone_id")]
    public int? ZoneId { get; set; }

    [Column("group_id")]
    public int? GroupId { get; set; }

    [Column("betting_pool_id")]
    public int? BettingPoolId { get; set; }

    [MaxLength(50)]
    [Column("bet_number_pattern")]
    public string? BetNumberPattern { get; set; }

    [Column("max_bet_per_number", TypeName = "decimal(18,2)")]
    public decimal? MaxBetPerNumber { get; set; }

    [Column("max_bet_per_ticket", TypeName = "decimal(18,2)")]
    public decimal? MaxBetPerTicket { get; set; }

    [Column("max_bet_per_betting_pool", TypeName = "decimal(18,2)")]
    public decimal? MaxBetPerBettingPool { get; set; }

    [Column("max_bet_global", TypeName = "decimal(18,2)")]
    public decimal? MaxBetGlobal { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("priority")]
    public int? Priority { get; set; }

    /// <summary>
    /// Bitmask for days of week: 1=Mon, 2=Tue, 4=Wed, 8=Thu, 16=Fri, 32=Sat, 64=Sun
    /// Null means all days
    /// </summary>
    [Column("days_of_week")]
    public int? DaysOfWeek { get; set; }

    [Column("effective_from")]
    public DateTime? EffectiveFrom { get; set; }

    [Column("effective_to")]
    public DateTime? EffectiveTo { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }

    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }

    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    public virtual ICollection<LimitConsumption> LimitConsumptions { get; set; } = new List<LimitConsumption>();
}
