using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO para guardar configuración de premios de un sorteo específico en una banca
/// </summary>
public class SaveDrawPrizeConfigRequest
{
    /// <summary>
    /// Array de configuraciones de premios a guardar para este sorteo
    /// </summary>
    [Required]
    public List<DrawPrizeConfigItemDto> PrizeConfigs { get; set; } = new();
}

/// <summary>
/// Item individual de configuración de premio para un sorteo
/// </summary>
public class DrawPrizeConfigItemDto
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
    /// Valor personalizado para este campo en este sorteo de esta banca
    /// </summary>
    [Required]
    [Range(0, 999999.99)]
    public decimal Value { get; set; }
}

/// <summary>
/// Respuesta al guardar configuración de premios por sorteo
/// </summary>
public class DrawPrizeConfigResponse
{
    /// <summary>
    /// ID de la banca
    /// </summary>
    public int BettingPoolId { get; set; }

    /// <summary>
    /// ID del sorteo
    /// </summary>
    public int DrawId { get; set; }

    /// <summary>
    /// Nombre del sorteo
    /// </summary>
    public string DrawName { get; set; } = string.Empty;

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
    public List<DrawPrizeConfigDto> SavedConfigs { get; set; } = new();
}

/// <summary>
/// DTO de configuración de premio individual por sorteo
/// </summary>
public class DrawPrizeConfigDto
{
    public int ConfigId { get; set; }
    public int BettingPoolId { get; set; }
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public int PrizeTypeId { get; set; }
    public string FieldCode { get; set; } = string.Empty;
    public decimal CustomValue { get; set; }

    /// <summary>
    /// Origen del valor: "draw_specific", "banca_default", "system_default"
    /// </summary>
    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
