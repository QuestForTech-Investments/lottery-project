using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_discount_config")]
public class BettingPoolDiscountConfig
{
    [Key]
    [Column("discount_config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DiscountConfigId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [MaxLength(50)]
    [Column("discount_provider")]
    public string DiscountProvider { get; set; } = "GRUPO";

    [MaxLength(50)]
    [Column("discount_mode")]
    public string DiscountMode { get; set; } = "OFF";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
