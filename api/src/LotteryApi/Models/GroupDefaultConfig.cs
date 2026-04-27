using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("group_default_configs")]
public class GroupDefaultConfig
{
    [Key]
    [Column("config_id")]
    public int ConfigId { get; set; }

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

    [Column("prize_payment_5", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment5 { get; set; }

    [Column("prize_payment_6", TypeName = "decimal(10,2)")]
    public decimal? PrizePayment6 { get; set; }

    [Column("commission_1", TypeName = "decimal(10,2)")]
    public decimal? Commission1 { get; set; }

    [Column("commission_2", TypeName = "decimal(10,2)")]
    public decimal? Commission2 { get; set; }

    [Column("commission_3", TypeName = "decimal(10,2)")]
    public decimal? Commission3 { get; set; }

    [Column("commission_4", TypeName = "decimal(10,2)")]
    public decimal? Commission4 { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }
}
