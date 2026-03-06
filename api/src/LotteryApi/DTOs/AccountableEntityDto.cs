using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

public class AccountableEntityDto
{
    public int EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string EntityCode { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateAccountableEntityDto
{
    [Required(ErrorMessage = "El nombre es requerido")]
    [StringLength(150, ErrorMessage = "El nombre no puede exceder 150 caracteres")]
    public string EntityName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El código es requerido")]
    [StringLength(50, ErrorMessage = "El código no puede exceder 50 caracteres")]
    public string EntityCode { get; set; } = string.Empty;

    [StringLength(50)]
    public string EntityType { get; set; } = "Banco";

    public int? ZoneId { get; set; }
}

public class UpdateAccountableEntityDto
{
    [StringLength(150)]
    public string? EntityName { get; set; }

    [StringLength(50)]
    public string? EntityCode { get; set; }

    [StringLength(50)]
    public string? EntityType { get; set; }

    public int? ZoneId { get; set; }
    public bool? IsActive { get; set; }
}
