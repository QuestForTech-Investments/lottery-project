using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_automatic_expenses")]
public class BettingPoolAutomaticExpense
{
    [Key]
    [Column("expense_id")]
    public int ExpenseId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("expense_type")]
    public string ExpenseType { get; set; } = string.Empty;

    [Column("amount", TypeName = "decimal(10,2)")]
    public decimal? Amount { get; set; }

    [Column("percentage", TypeName = "decimal(5,2)")]
    public decimal? Percentage { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("frequency")]
    public string Frequency { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
