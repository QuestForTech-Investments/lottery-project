using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("prizes")]
public class Prize
{
    [Key]
    [Column("prize_id")]
    public int PrizeId { get; set; }

    [Column("result_id")]
    public int ResultId { get; set; }

    [Column("line_id")]
    public long LineId { get; set; }

    [Column("prize_amount", TypeName = "decimal(10,2)")]
    public decimal PrizeAmount { get; set; } = 0.00m;

    [MaxLength(50)]
    [Column("prize_type")]
    public string? PrizeType { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("paid_at")]
    public DateTime? PaidAt { get; set; }

    [Column("paid_by")]
    public int? PaidBy { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [MaxLength(100)]
    [Column("payment_reference")]
    public string? PaymentReference { get; set; }

    // Navigation properties
    [ForeignKey("ResultId")]
    public virtual Result? Result { get; set; }

    [ForeignKey("LineId")]
    public virtual TicketLine? TicketLine { get; set; }
}
