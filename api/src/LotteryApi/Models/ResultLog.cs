using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Audit log for lottery result operations
/// Tracks all create, update, delete, and approval actions on results
/// </summary>
[Table("result_logs")]
public class ResultLog
{
    [Key]
    [Column("log_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LogId { get; set; }

    /// <summary>
    /// ID of the result being logged
    /// </summary>
    [Required]
    [Column("result_id")]
    public int ResultId { get; set; }

    /// <summary>
    /// ID of the user who performed the action
    /// </summary>
    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    /// <summary>
    /// Type of action performed: CREATED, UPDATED, DELETED, APPROVED, REJECTED
    /// </summary>
    [Required]
    [MaxLength(20)]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the action was performed
    /// </summary>
    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// IP address of the user who performed the action
    /// </summary>
    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    /// <summary>
    /// Additional details stored as JSON or text
    /// Example: {"field": "winning_number", "old_value": "123", "new_value": "456"}
    /// Or: {"reason": "Correction requested by lottery operator"}
    /// </summary>
    [Column("details")]
    public string? Details { get; set; }

    /// <summary>
    /// Previous winning number (for UPDATE actions)
    /// </summary>
    [MaxLength(20)]
    [Column("old_winning_number")]
    public string? OldWinningNumber { get; set; }

    /// <summary>
    /// New winning number (for CREATE/UPDATE actions)
    /// </summary>
    [MaxLength(20)]
    [Column("new_winning_number")]
    public string? NewWinningNumber { get; set; }

    /// <summary>
    /// Previous additional number (for UPDATE actions)
    /// </summary>
    [MaxLength(10)]
    [Column("old_additional_number")]
    public string? OldAdditionalNumber { get; set; }

    /// <summary>
    /// New additional number (for CREATE/UPDATE actions)
    /// </summary>
    [MaxLength(10)]
    [Column("new_additional_number")]
    public string? NewAdditionalNumber { get; set; }

    /// <summary>
    /// Draw ID (duplicated for quick access)
    /// </summary>
    [Column("draw_id")]
    public int? DrawId { get; set; }

    /// <summary>
    /// Result date (duplicated for quick access)
    /// </summary>
    [Column("result_date")]
    public DateTime? ResultDate { get; set; }

    // Navigation properties
    [ForeignKey("ResultId")]
    public virtual Result? Result { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}

/// <summary>
/// Constants for result log action types
/// </summary>
public static class ResultLogActions
{
    public const string Created = "CREATED";
    public const string Updated = "UPDATED";
    public const string Deleted = "DELETED";
    public const string Approved = "APPROVED";
    public const string Rejected = "REJECTED";
}
