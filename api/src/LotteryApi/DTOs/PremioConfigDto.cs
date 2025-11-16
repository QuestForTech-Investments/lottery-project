using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO for a single prize field with precedence information
/// </summary>
public class PremioFieldDto
{
    public int CampoPremioId { get; set; }
    public string FieldCode { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string BetTypeCode { get; set; } = string.Empty;
    public decimal EffectiveMultiplier { get; set; }
    public decimal SystemDefault { get; set; }
    public decimal? BancaGeneral { get; set; }
    public decimal? SorteoOverride { get; set; }
    public string Source { get; set; } = "SYSTEM_DEFAULT"; // SYSTEM_DEFAULT, BANCA_GENERAL, SORTEO_OVERRIDE
    public decimal MinValue { get; set; }
    public decimal MaxValue { get; set; }
}

/// <summary>
/// DTO for premio configuration response (GET)
/// </summary>
public class PremioConfigResponseDto
{
    public int BancaId { get; set; }
    public int? SorteoId { get; set; }
    public bool IsGeneralConfig { get; set; }
    public List<PremioFieldDto> Fields { get; set; } = new();
}

/// <summary>
/// DTO for updating a single prize field
/// </summary>
public class UpdatePremioFieldRequest
{
    [Required]
    public int CampoPremioId { get; set; }

    [Required]
    [Range(0, 9999999.99)]
    public decimal NewValue { get; set; }
}

/// <summary>
/// DTO for updating premio configuration (PUT)
/// </summary>
public class UpdatePremioConfigRequest
{
    [Required]
    public int BancaId { get; set; }

    public int? SorteoId { get; set; }

    [Required]
    [MinLength(1)]
    public List<UpdatePremioFieldRequest> Fields { get; set; } = new();
}

/// <summary>
/// DTO for sorteo info (used in sorteo selector)
/// </summary>
public class SorteoInfoDto
{
    public int? SorteoId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? DrawTime { get; set; }
    public string DisplayName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for bet type (tipo de apuesta)
/// </summary>
public class BetTypeDto
{
    public int BetTypeId { get; set; }
    public string BetTypeCode { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int PrizeTypesCount { get; set; }
}

/// <summary>
/// DTO for bet type with prize fields
/// </summary>
public class BetTypeWithFieldsDto
{
    public int BetTypeId { get; set; }
    public string BetTypeCode { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PrizeTypeBasicDto> PrizeTypes { get; set; } = new();
}

/// <summary>
/// DTO for prize field basic info (without configuration)
/// </summary>
public class PrizeTypeBasicDto
{
    public int PrizeTypeId { get; set; }
    public int BetTypeId { get; set; }
    public string FieldCode { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public decimal DefaultMultiplier { get; set; }
    public decimal MinMultiplier { get; set; }
    public decimal MaxMultiplier { get; set; }
    public int DisplayOrder { get; set; }
}
