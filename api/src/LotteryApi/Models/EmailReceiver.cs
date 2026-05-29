using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// A configured recipient of automated reports/notifications by email. Each
/// receiver subscribes to one notification type (currently only
/// "MONITOREO_JUGADAS") and a set of zones — the report is generated from
/// the betting pools inside those zones.
/// </summary>
[Table("email_receivers")]
public class EmailReceiver
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("email_receiver_id")]
    public int EmailReceiverId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// String key identifying which automated email this receiver gets.
    /// Stored as a string so we can add types without a DB migration.
    /// Current value: "MONITOREO_JUGADAS".
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("notification_type")]
    public string NotificationType { get; set; } = string.Empty;

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

    public virtual ICollection<EmailReceiverZone> Zones { get; set; } = new List<EmailReceiverZone>();
}
