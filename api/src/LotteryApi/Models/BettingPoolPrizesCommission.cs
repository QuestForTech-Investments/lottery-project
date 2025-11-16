using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_prizes_commissions")]
public class BettingPoolPrizesCommission
{
    [Key]
    [Column("prize_commission_id")]
    public int PrizeCommissionId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("lottery_id")]
    public int? LotteryId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("game_type")]
    public string GameType { get; set; } = string.Empty;

    [Column("prize_payment_1", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment1 { get; set; }

    [Column("prize_payment_2", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment2 { get; set; }

    [Column("prize_payment_3", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment3 { get; set; }

    [Column("prize_payment_4", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment4 { get; set; }

    [Column("commission_discount_1", TypeName = "decimal(5,2)")]
    public decimal? CommissionDiscount1 { get; set; }

    [Column("commission_discount_2", TypeName = "decimal(5,2)")]
    public decimal? CommissionDiscount2 { get; set; }

    [Column("commission_discount_3", TypeName = "decimal(5,2)")]
    public decimal? CommissionDiscount3 { get; set; }

    [Column("commission_discount_4", TypeName = "decimal(5,2)")]
    public decimal? CommissionDiscount4 { get; set; }

    [Column("commission_2_discount_1", TypeName = "decimal(5,2)")]
    public decimal? Commission2Discount1 { get; set; }

    [Column("commission_2_discount_2", TypeName = "decimal(5,2)")]
    public decimal? Commission2Discount2 { get; set; }

    [Column("commission_2_discount_3", TypeName = "decimal(5,2)")]
    public decimal? Commission2Discount3 { get; set; }

    [Column("commission_2_discount_4", TypeName = "decimal(5,2)")]
    public decimal? Commission2Discount4 { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }
}
