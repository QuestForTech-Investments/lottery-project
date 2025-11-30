using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("lotteries")]
public class Lottery
{
    [Key]
    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [Column("country_id")]
    public int CountryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("lottery_name")]
    public string LotteryName { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("lottery_type")]
    public string? LotteryType { get; set; }

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [MaxLength(7)]
    [Column("colour")]
    public string? Colour { get; set; }

    [MaxLength(50)]
    [Column("timezone")]
    public string Timezone { get; set; } = "America/Santo_Domingo";

    [MaxLength(500)]
    [Column("image_url")]
    public string? ImageUrl { get; set; }

    // Navigation properties
    [ForeignKey("CountryId")]
    public virtual Country? Country { get; set; }

    public virtual ICollection<Draw> Draws { get; set; } = new List<Draw>();
    public virtual ICollection<LotteryGameCompatibility> LotteryGameCompatibilities { get; set; } = new List<LotteryGameCompatibility>();
    public virtual ICollection<BettingPoolPrizesCommission> BettingPoolPrizesCommissions { get; set; } = new List<BettingPoolPrizesCommission>();
}
