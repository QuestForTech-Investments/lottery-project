using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("expense_categories")]
public class ExpenseCategory
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("category_name")]
    public string CategoryName { get; set; } = string.Empty;

    [Column("parent_category_id")]
    public int? ParentCategoryId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("ParentCategoryId")]
    public virtual ExpenseCategory? ParentCategory { get; set; }

    public virtual ICollection<ExpenseCategory>? ChildCategories { get; set; }
}
