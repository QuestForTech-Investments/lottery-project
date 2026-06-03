using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

public static class ResultSyncDirection
{
    public const string Outbound = "outbound";
    public const string Inbound = "inbound";
}

public static class ResultSyncStatus
{
    public const string Sent = "sent";          // outbound: partner accepted
    public const string Received = "received";  // inbound: stored locally
    public const string Noop = "noop";          // already had matching result; nothing to do
    public const string Conflict = "conflict";  // numbers differ; logged for review
    public const string Failed = "failed";      // outbound: network/HTTP error
}

/// <summary>
/// Audit row for every cross-tenant result sync attempt (push or inbound).
/// Powers the "Log de sincronización" admin page and "Reintentar" actions.
/// </summary>
[Table("result_sync_log")]
public class ResultSyncLog
{
    [Key]
    [Column("sync_log_id")]
    public int SyncLogId { get; set; }

    [Required, MaxLength(10)]
    [Column("direction")]
    public string Direction { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    [Column("partner_code")]
    public string PartnerCode { get; set; } = string.Empty;

    [Column("result_date")]
    public DateTime ResultDate { get; set; }

    [Required, MaxLength(50)]
    [Column("lottery_code")]
    public string LotteryCode { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    [Column("draw_code")]
    public string DrawCode { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(2000)]
    [Column("error_message")]
    public string? ErrorMessage { get; set; }

    [MaxLength(64)]
    [Column("payload_hash")]
    public string? PayloadHash { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
