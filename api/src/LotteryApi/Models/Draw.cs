using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("draws")]
public class Draw
{
    [Key]
    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("lottery_id")]
    public int LotteryId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("draw_name")]
    public string DrawName { get; set; } = string.Empty;

    [Required]
    [Column("draw_time")]
    public TimeSpan DrawTime { get; set; }

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(10)]
    [Column("abbreviation")]
    public string? Abbreviation { get; set; }

    [MaxLength(7)]
    [Column("display_color")]
    public string? DisplayColor { get; set; }

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

    public virtual ICollection<Result> Results { get; set; } = new List<Result>();
    public virtual ICollection<BettingPoolDraw> BettingPoolDraws { get; set; } = new List<BettingPoolDraw>();
    public virtual ICollection<TicketLine> TicketLines { get; set; } = new List<TicketLine>();
}
