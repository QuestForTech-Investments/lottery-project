using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("blocked_ips")]
public class BlockedIp
{
    [Key]
    [MaxLength(64)]
    [Column("ip_address")]
    public string IpAddress { get; set; } = string.Empty;

    [Column("blocked_at")]
    public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    [Column("last_username")]
    public string? LastUsername { get; set; }

    [MaxLength(255)]
    [Column("reason")]
    public string? Reason { get; set; }
}
