using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("loans")]
public class Loan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("loan_id")]
    public int LoanId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("loan_number")]
    public string LoanNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("entity_type")]
    public string EntityType { get; set; } = "bettingPool";

    [Column("entity_id")]
    public int EntityId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("entity_name")]
    public string EntityName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("entity_code")]
    public string EntityCode { get; set; } = string.Empty;

    [Column("principal_amount", TypeName = "decimal(18,2)")]
    public decimal PrincipalAmount { get; set; }

    [Column("interest_rate", TypeName = "decimal(5,2)")]
    public decimal InterestRate { get; set; } = 0.00m;

    [Column("installment_amount", TypeName = "decimal(18,2)")]
    public decimal InstallmentAmount { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("frequency")]
    public string Frequency { get; set; } = string.Empty;

    [Column("payment_day")]
    public int? PaymentDay { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("total_paid", TypeName = "decimal(18,2)")]
    public decimal TotalPaid { get; set; } = 0.00m;

    [Column("remaining_balance", TypeName = "decimal(18,2)")]
    public decimal RemainingBalance { get; set; }

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "active";

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<LoanPayment> Payments { get; set; } = new List<LoanPayment>();
}
