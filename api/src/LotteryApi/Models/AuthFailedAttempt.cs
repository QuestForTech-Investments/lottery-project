using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("auth_failed_attempts")]
public class AuthFailedAttempt
{
    [Key]
    [Column("attempt_id")]
    public long AttemptId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [MaxLength(100)]
    [Column("username")]
    public string? Username { get; set; }

    [Required]
    [MaxLength(16)]
    [Column("attempt_type")]
    public string AttemptType { get; set; } = "password";  // "password" or "pin"

    [MaxLength(64)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("attempted_at")]
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
