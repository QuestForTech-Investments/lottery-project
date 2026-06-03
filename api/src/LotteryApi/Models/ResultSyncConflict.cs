using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

public static class ResultSyncConflictResolution
{
    public const string Pending = "pending";
    public const string KeptLocal = "kept_local";
    public const string AcceptedPartner = "accepted_partner";
    public const string Reviewed = "reviewed";
}

/// <summary>
/// Records a discrepancy when a partner pushed a result for a (lottery, draw,
/// date) that already exists locally with different numbers. The local row
/// is NEVER overwritten by the sync — the operator decides via the
/// ResultSyncLogPage UI.
/// </summary>
[Table("result_sync_conflicts")]
public class ResultSyncConflict
{
    [Key]
    [Column("conflict_id")]
    public int ConflictId { get; set; }

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

    [MaxLength(20)]
    [Column("local_num1")]
    public string? LocalNum1 { get; set; }

    [MaxLength(20)]
    [Column("local_num2")]
    public string? LocalNum2 { get; set; }

    [MaxLength(20)]
    [Column("local_num3")]
    public string? LocalNum3 { get; set; }

    [MaxLength(20)]
    [Column("partner_num1")]
    public string? PartnerNum1 { get; set; }

    [MaxLength(20)]
    [Column("partner_num2")]
    public string? PartnerNum2 { get; set; }

    [MaxLength(20)]
    [Column("partner_num3")]
    public string? PartnerNum3 { get; set; }

    [Required, MaxLength(20)]
    [Column("resolution")]
    public string Resolution { get; set; } = ResultSyncConflictResolution.Pending;

    [Column("resolved_by")]
    public int? ResolvedBy { get; set; }

    [Column("resolved_at")]
    public DateTime? ResolvedAt { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
