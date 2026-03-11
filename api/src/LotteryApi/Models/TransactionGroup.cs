using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("transaction_groups")]
public class TransactionGroup
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("group_id")]
    public int GroupId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("group_number")]
    public string GroupNumber { get; set; } = string.Empty;

    [Column("zone_id")]
    public int? ZoneId { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("is_automatic")]
    public bool IsAutomatic { get; set; } = false;

    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "PendienteAprobacion";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("approved_by")]
    public int? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [MaxLength(500)]
    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User? CreatedByUser { get; set; }

    [ForeignKey("ApprovedBy")]
    public virtual User? ApprovedByUser { get; set; }

    public virtual ICollection<TransactionGroupLine> Lines { get; set; } = new List<TransactionGroupLine>();
}
