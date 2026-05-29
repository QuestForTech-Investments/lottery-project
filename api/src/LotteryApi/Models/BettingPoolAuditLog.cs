using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Audit log for every change made to a betting pool (banca). Mirrors the
/// `result_logs` pattern: an action verb + JSON payload describing which
/// fields changed, plus the user / IP that performed the change.
///
/// Read pattern is per-banca, most-recent-first — see the index in the
/// migration script.
/// </summary>
[Table("betting_pool_audit_log")]
public class BettingPoolAuditLog
{
    [Key]
    [Column("audit_log_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AuditLogId { get; set; }

    [Required]
    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    /// <summary>User who performed the change (null if anonymous / system).</summary>
    [Column("user_id")]
    public int? UserId { get; set; }

    /// <summary>'CREATED' | 'UPDATED' | 'DELETED'. Kept open so we can add
    /// more verbs later without a schema change.</summary>
    [Required]
    [MaxLength(20)]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// JSON array of `{field, oldValue, newValue}` objects describing the
    /// change. Sensitive fields (password) are recorded as field-changed
    /// without exposing the actual values.
    /// </summary>
    [Column("details")]
    public string? Details { get; set; }

    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}
