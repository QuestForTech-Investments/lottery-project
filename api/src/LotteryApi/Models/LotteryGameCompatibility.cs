using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("lottery_game_compatibility")]
public class LotteryGameCompatibility
{
    [Key]
    [Column("compatibility_id")]
    public int CompatibilityId { get; set; }

    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [Column("game_type_id")]
    public int GameTypeId { get; set; }

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

    // Navigation properties
    [ForeignKey("LotteryId")]
    public virtual Lottery? Lottery { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
