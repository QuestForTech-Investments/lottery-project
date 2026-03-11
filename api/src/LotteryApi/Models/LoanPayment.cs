using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("loan_payments")]
public class LoanPayment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("loan_id")]
    public int LoanId { get; set; }

    [Column("payment_date")]
    public DateTime PaymentDate { get; set; }

    [Column("amount_paid", TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [ForeignKey("LoanId")]
    public virtual Loan? Loan { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User? CreatedByUser { get; set; }
}
