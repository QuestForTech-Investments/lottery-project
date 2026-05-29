using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// One row per "Monitoreo de Jugadas" delivery attempt. Used by the publication
/// trigger to know whether an email was already sent for a given
/// (receiver, draw, date) and to surface failures to ops.
/// </summary>
[Table("email_send_log")]
public class EmailSendLog
{
    [Key]
    [Column("send_log_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SendLogId { get; set; }

    [Required]
    [Column("email_receiver_id")]
    public int EmailReceiverId { get; set; }

    [Required]
    [Column("draw_id")]
    public int DrawId { get; set; }

    [Required]
    [Column("result_date")]
    public DateTime ResultDate { get; set; }

    /// <summary>'SENT' | 'FAILED' | 'SKIPPED_EMPTY'.</summary>
    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("subject")]
    public string? Subject { get; set; }

    [MaxLength(2000)]
    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [Required]
    [Column("sent_at")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Nav
    [ForeignKey("EmailReceiverId")]
    public virtual EmailReceiver? EmailReceiver { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }
}

/// <summary>Stable string constants for the status column.</summary>
public static class EmailSendStatus
{
    public const string Sent = "SENT";
    public const string Failed = "FAILED";
    public const string SkippedEmpty = "SKIPPED_EMPTY";
}
