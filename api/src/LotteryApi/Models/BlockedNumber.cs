using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("blocked_numbers")]
public class BlockedNumber
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("blocked_number_id")]
    public int BlockedNumberId { get; set; }

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Column("game_type_id")]
    public int GameTypeId { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("bet_number")]
    public string BetNumber { get; set; } = string.Empty;

    [Column("expiration_date")]
    public DateTime? ExpirationDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("GameTypeId")]
    public virtual GameType? GameType { get; set; }
}
