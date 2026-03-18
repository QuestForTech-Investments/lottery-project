using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("caida_history")]
public class CaidaHistory
{
    [Key]
    [Column("caida_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CaidaId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("calculation_date")]
    public DateTime CalculationDate { get; set; }

    [MaxLength(30)]
    [Column("period_type")]
    public string PeriodType { get; set; } = string.Empty;

    [Column("period_start")]
    public DateTime PeriodStart { get; set; }

    [Column("period_end")]
    public DateTime PeriodEnd { get; set; }

    [Column("total_sales", TypeName = "decimal(18,2)")]
    public decimal TotalSales { get; set; }

    [Column("total_prizes", TypeName = "decimal(18,2)")]
    public decimal TotalPrizes { get; set; }

    [Column("total_commissions", TypeName = "decimal(18,2)")]
    public decimal TotalCommissions { get; set; }

    [Column("total_discounts", TypeName = "decimal(18,2)")]
    public decimal TotalDiscounts { get; set; }

    [Column("net_amount", TypeName = "decimal(18,2)")]
    public decimal NetAmount { get; set; }

    [Column("fall_percentage", TypeName = "decimal(5,2)")]
    public decimal FallPercentage { get; set; }

    [Column("accumulated_fall_before", TypeName = "decimal(18,2)")]
    public decimal AccumulatedFallBefore { get; set; }

    [Column("accumulated_fall_after", TypeName = "decimal(18,2)")]
    public decimal AccumulatedFallAfter { get; set; }

    [Column("caida_amount", TypeName = "decimal(18,2)")]
    public decimal CaidaAmount { get; set; }

    [Column("cobro_amount", TypeName = "decimal(18,2)")]
    public decimal? CobroAmount { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    // Navigation
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User? CreatedByUser { get; set; }
}
