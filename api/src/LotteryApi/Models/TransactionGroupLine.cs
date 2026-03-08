using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("transaction_group_lines")]
public class TransactionGroupLine
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("line_id")]
    public int LineId { get; set; }

    [Column("group_id")]
    public int GroupId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("transaction_type")]
    public string TransactionType { get; set; } = string.Empty;

    // Entity 1
    [Required]
    [MaxLength(20)]
    [Column("entity1_type")]
    public string Entity1Type { get; set; } = string.Empty;

    [Column("entity1_id")]
    public int Entity1Id { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("entity1_name")]
    public string Entity1Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("entity1_code")]
    public string Entity1Code { get; set; } = string.Empty;

    [Column("entity1_initial_balance", TypeName = "decimal(12,2)")]
    public decimal Entity1InitialBalance { get; set; }

    [Column("entity1_final_balance", TypeName = "decimal(12,2)")]
    public decimal Entity1FinalBalance { get; set; }

    // Entity 2
    [MaxLength(20)]
    [Column("entity2_type")]
    public string? Entity2Type { get; set; }

    [Column("entity2_id")]
    public int? Entity2Id { get; set; }

    [MaxLength(150)]
    [Column("entity2_name")]
    public string? Entity2Name { get; set; }

    [MaxLength(50)]
    [Column("entity2_code")]
    public string? Entity2Code { get; set; }

    [Column("entity2_initial_balance", TypeName = "decimal(12,2)")]
    public decimal Entity2InitialBalance { get; set; }

    [Column("entity2_final_balance", TypeName = "decimal(12,2)")]
    public decimal Entity2FinalBalance { get; set; }

    // Amounts
    [Column("debit", TypeName = "decimal(12,2)")]
    public decimal Debit { get; set; }

    [Column("credit", TypeName = "decimal(12,2)")]
    public decimal Credit { get; set; }

    // Extra
    [MaxLength(150)]
    [Column("expense_category")]
    public string? ExpenseCategory { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("show_in_banca")]
    public bool ShowInBanca { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    // Navigation
    [ForeignKey("GroupId")]
    public virtual TransactionGroup? Group { get; set; }
}
