using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Per-recipient delivery state for a notification. One row per
/// (notification, recipient) so we can track read/unread and dismiss.
/// </summary>
[Table("notification_reads")]
public class NotificationRead
{
    [Key]
    [Column("notification_read_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long NotificationReadId { get; set; }

    [Required]
    [Column("notification_id")]
    public long NotificationId { get; set; }

    /// <summary>"banca" or "admin".</summary>
    [Required]
    [MaxLength(20)]
    [Column("recipient_type")]
    public string RecipientType { get; set; } = "banca";

    /// <summary>betting_pool_id when type=banca, user_id when type=admin.</summary>
    [Required]
    [Column("recipient_id")]
    public int RecipientId { get; set; }

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("read_at")]
    public DateTime? ReadAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("NotificationId")]
    public virtual Notification? Notification { get; set; }
}
