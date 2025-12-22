using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("lottery_bet_type_compatibility")]
public class LotteryBetTypeCompatibility
{
    [Key]
    [Column("compatibility_id")]
    public int CompatibilityId { get; set; }

    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [Column("bet_type_id")]
    public int BetTypeId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }

    [ForeignKey("BetTypeId")]
    public virtual BetType? BetType { get; set; }
}
