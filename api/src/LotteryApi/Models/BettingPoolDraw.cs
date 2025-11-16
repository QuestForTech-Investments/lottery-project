using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_draws")]
public class BettingPoolDraw
{
    [Key]
    [Column("betting_pool_draw_id")]
    public int BettingPoolDrawId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("anticipated_closing_minutes")]
    public int? AnticipatedClosingMinutes { get; set; }

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

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }
}
