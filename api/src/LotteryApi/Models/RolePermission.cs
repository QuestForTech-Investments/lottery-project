using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("role_permissions")]
public class RolePermission
{
    [Key]
    [Column("role_permission_id")]
    public int RolePermissionId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("permission_id")]
    public int PermissionId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    // Navigation properties
    [ForeignKey("RoleId")]
    public virtual Role? Role { get; set; }

    [ForeignKey("PermissionId")]
    public virtual Permission? Permission { get; set; }
}
