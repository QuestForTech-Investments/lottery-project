using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("draw_game_compatibility")]
public class DrawGameCompatibility
{
    [Key]
    [Column("compatibility_id")]
    public int CompatibilityId { get; set; }

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("game_type_id")]
    public int GameTypeId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
