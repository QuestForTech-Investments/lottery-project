using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    [MaxLength(200)]
    [Column("full_name")]
    public string? FullName { get; set; }

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [Column("role_id")]
    public int? RoleId { get; set; }

    [Column("commission_rate", TypeName = "decimal(5,2)")]
    public decimal CommissionRate { get; set; } = 0.00m;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("last_login_at")]
    public DateTime? LastLoginAt { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public int? DeletedBy { get; set; }

    [MaxLength(500)]
    [Column("deletion_reason")]
    public string? DeletionReason { get; set; }

    [MaxLength(45)]
    [Column("last_modified_ip")]
    public string? LastModifiedIp { get; set; }

    // Navigation properties
    [ForeignKey("RoleId")]
    public virtual Role? Role { get; set; }

    public virtual ICollection<UserBettingPool> UserBettingPools { get; set; } = new List<UserBettingPool>();
    public virtual ICollection<UserZone> UserZones { get; set; } = new List<UserZone>();
    public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
