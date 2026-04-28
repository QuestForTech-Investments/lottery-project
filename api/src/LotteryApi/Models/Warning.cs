using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("warnings")]
public class Warning
{
    [Key]
    [Column("warning_id")]
    public long WarningId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("warning_type")]
    public string WarningType { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("severity")]
    public string Severity { get; set; } = "medium";

    [Column("betting_pool_id")]
    public int? BettingPoolId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [MaxLength(50)]
    [Column("reference_id")]
    public string? ReferenceId { get; set; }

    [MaxLength(30)]
    [Column("reference_type")]
    public string? ReferenceType { get; set; }

    [MaxLength(500)]
    [Column("message")]
    public string? Message { get; set; }

    [Column("metadata_json")]
    public string? MetadataJson { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}
