using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("user_permissions")]
public class UserPermission
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("user_permission_id")]
    public int UserPermissionId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("permission_id")]
    public int PermissionId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("granted_by")]
    public int? GrantedBy { get; set; }

    [MaxLength(500)]
    [Column("grant_reason")]
    public string? GrantReason { get; set; }

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    [ForeignKey("PermissionId")]
    public virtual Permission? Permission { get; set; }
}
