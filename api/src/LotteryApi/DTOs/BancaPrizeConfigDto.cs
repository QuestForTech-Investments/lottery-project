using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO para guardar configuración de premios de una banca
/// </summary>
public class SaveBancaPrizeConfigRequest
{
    /// <summary>
    /// Array de configuraciones de premios a guardar
    /// Cada item contiene: prizeFieldId, fieldCode, value
    /// </summary>
    [Required]
    public List<BancaPrizeConfigItemDto> PrizeConfigs { get; set; } = new();
}

/// <summary>
/// Item individual de configuración de premio
/// </summary>
public class BancaPrizeConfigItemDto
{
    /// <summary>
    /// ID del campo de premio (desde prize_fields table)
    /// </summary>
    [Required]
    public int PrizeTypeId { get; set; }

    /// <summary>
    /// Código del campo (ej: "DIRECTO_PRIMER_PAGO")
    /// </summary>
    [Required]
    [StringLength(100)]
    public string FieldCode { get; set; } = string.Empty;

    /// <summary>
    /// Valor personalizado para este campo en esta banca
    /// </summary>
    [Required]
    [Range(0, 999999.99)]
    public decimal Value { get; set; }
}

/// <summary>
/// Respuesta al guardar configuración de premios
/// </summary>
public class BancaPrizeConfigResponse
{
    /// <summary>
    /// ID de la banca
    /// </summary>
    public int BettingPoolId { get; set; }

    /// <summary>
    /// Cantidad de configuraciones guardadas
    /// </summary>
    public int SavedCount { get; set; }

    /// <summary>
    /// Cantidad de configuraciones actualizadas
    /// </summary>
    public int UpdatedCount { get; set; }

    /// <summary>
    /// Mensaje de resultado
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Lista de configuraciones guardadas
    /// </summary>
    public List<BancaPrizeConfigDto> SavedConfigs { get; set; } = new();
}

/// <summary>
/// DTO de configuración de premio individual
/// </summary>
public class BancaPrizeConfigDto
{
    public int ConfigId { get; set; }
    public int BettingPoolId { get; set; }
    public int PrizeTypeId { get; set; }
    public string FieldCode { get; set; } = string.Empty;
    public decimal CustomValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
