using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("login_sessions")]
public class LoginSession
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("session_id")]
    public int SessionId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("betting_pool_id")]
    public int? BettingPoolId { get; set; }

    [Column("zone_id")]
    public int? ZoneId { get; set; }

    /// <summary>
    /// Device type: 1=Web, 2=Mobile Browser, 3=App
    /// </summary>
    [Column("device_type")]
    public byte DeviceType { get; set; } = 1;

    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    [Column("user_agent")]
    public string? UserAgent { get; set; }

    [Column("login_at")]
    public DateTime LoginAt { get; set; } = DateTime.UtcNow;

    [Column("logout_at")]
    public DateTime? LogoutAt { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }
}

/// <summary>
/// Device type constants for login sessions
/// </summary>
public static class DeviceTypes
{
    public const byte Web = 1;
    public const byte MobileBrowser = 2;
    public const byte App = 3;

    public static string GetName(byte deviceType) => deviceType switch
    {
        Web => "Web",
        MobileBrowser => "Celular",
        App => "App",
        _ => "Desconocido"
    };
}
