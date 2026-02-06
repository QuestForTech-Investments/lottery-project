using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs.HotNumbers;

/// <summary>
/// DTO for returning hot number limit data in API responses
/// </summary>
public class HotNumberLimitDto
{
    public int Id { get; set; }
    public List<int> DrawIds { get; set; } = new();
    public decimal Directo { get; set; }
    public decimal Pale1Caliente { get; set; }
    public decimal Pale2Caliente { get; set; }
    public decimal Tripleta1Caliente { get; set; }
    public decimal Tripleta2Caliente { get; set; }
    public decimal Tripleta3Caliente { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new hot number limit
/// </summary>
public class CreateHotNumberLimitDto
{
    /// <summary>
    /// List of draw IDs this limit applies to
    /// </summary>
    [Required(ErrorMessage = "Los sorteos son requeridos")]
    public List<int> DrawIds { get; set; } = new();

    /// <summary>
    /// Maximum bet amount for Directo when hot number is involved
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Directo debe ser mayor o igual a 0")]
    public decimal Directo { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 1 number is hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Pale (1 caliente) debe ser mayor o igual a 0")]
    public decimal Pale1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 2 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Pale (2 calientes) debe ser mayor o igual a 0")]
    public decimal Pale2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 1 number is hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (1 caliente) debe ser mayor o igual a 0")]
    public decimal Tripleta1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 2 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (2 calientes) debe ser mayor o igual a 0")]
    public decimal Tripleta2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 3 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (3 calientes) debe ser mayor o igual a 0")]
    public decimal Tripleta3Caliente { get; set; }
}

/// <summary>
/// DTO for updating an existing hot number limit
/// </summary>
public class UpdateHotNumberLimitDto
{
    /// <summary>
    /// List of draw IDs this limit applies to
    /// </summary>
    public List<int>? DrawIds { get; set; }

    /// <summary>
    /// Maximum bet amount for Directo when hot number is involved
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Directo debe ser mayor o igual a 0")]
    public decimal? Directo { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 1 number is hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Pale (1 caliente) debe ser mayor o igual a 0")]
    public decimal? Pale1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Pale when 2 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Pale (2 calientes) debe ser mayor o igual a 0")]
    public decimal? Pale2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 1 number is hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (1 caliente) debe ser mayor o igual a 0")]
    public decimal? Tripleta1Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 2 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (2 calientes) debe ser mayor o igual a 0")]
    public decimal? Tripleta2Caliente { get; set; }

    /// <summary>
    /// Maximum bet amount for Tripleta when 3 numbers are hot
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "El monto de Tripleta (3 calientes) debe ser mayor o igual a 0")]
    public decimal? Tripleta3Caliente { get; set; }
}
