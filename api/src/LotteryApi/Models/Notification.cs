using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("notifications")]
public class Notification
{
    [Key]
    [Column("notification_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long NotificationId { get; set; }

    /// <summary>CSV of audience tags: "banca", "admin", or "banca,admin".</summary>
    [Required]
    [MaxLength(50)]
    [Column("audience")]
    public string Audience { get; set; } = "banca";

    /// <summary>CSV of betting_pool_id when the notification targets bancas.</summary>
    [Column("banca_ids")]
    public string? BancaIds { get; set; }

    /// <summary>CSV of zone_id when targeting bancas in those zones.</summary>
    [Column("zone_ids")]
    public string? ZoneIds { get; set; }

    /// <summary>CSV of user_id when the notification targets specific admins.</summary>
    [Column("admin_user_ids")]
    public string? AdminUserIds { get; set; }

    /// <summary>low / medium / high.</summary>
    [Required]
    [MaxLength(20)]
    [Column("priority")]
    public string Priority { get; set; } = "medium";

    /// <summary>mark_as_read / expiration_date.</summary>
    [Required]
    [MaxLength(50)]
    [Column("notification_type")]
    public string NotificationType { get; set; } = "mark_as_read";

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
