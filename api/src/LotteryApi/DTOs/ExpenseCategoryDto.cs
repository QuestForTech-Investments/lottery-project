using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class ExpenseCategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateExpenseCategoryDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(150, ErrorMessage = "El nombre no puede exceder 150 caracteres")]
    public string CategoryName { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }
}

public class UpdateExpenseCategoryDto
{
    [StringLength(150)]
    public string? CategoryName { get; set; }

    public int? ParentCategoryId { get; set; }

    public bool? IsActive { get; set; }
}
