using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_draw_game_types")]
public class BettingPoolDrawGameType
{
    [Key]
    [Column("betting_pool_draw_game_type_id")]
    public int BettingPoolDrawGameTypeId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

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
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
