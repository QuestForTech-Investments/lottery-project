using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("limit_defaults")]
public class LimitDefault
{
    [Key]
    [Column("limit_default_id")]
    public int LimitDefaultId { get; set; }

    [Column("default_type")]
    [MaxLength(20)]
    public string DefaultType { get; set; } = string.Empty; // "zona" or "banca"

    [Column("game_type_id")]
    public int GameTypeId { get; set; }

    [Column("max_amount")]
    public decimal MaxAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [ForeignKey("GameTypeId")]
    public GameType? GameType { get; set; }
}
