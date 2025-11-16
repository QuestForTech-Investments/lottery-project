using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("banks")]
public class Bank
{
    [Key]
    [Column("bank_id")]
    public int BankId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("bank_name")]
    public string BankName { get; set; } = string.Empty;

    [MaxLength(10)]
    [Column("bank_code")]
    public string? BankCode { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    public virtual ICollection<BettingPool> BettingPools { get; set; } = new List<BettingPool>();
}
