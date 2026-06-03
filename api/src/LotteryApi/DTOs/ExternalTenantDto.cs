using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// Read shape returned by the ExternalTenants endpoints. The <c>api_key</c>
/// is intentionally NEVER exposed — admins regenerate it via a dedicated
/// endpoint instead of editing it as a string.
/// </summary>
public class ExternalTenantDto
{
    public int ExternalTenantId { get; set; }
    public string TenantCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string ApiBaseUrl { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool CanViewTodaySales { get; set; }
    public bool ShareResults { get; set; }
    /// <summary>Last 4 characters of the api_key, for quick visual id without leaking the secret.</summary>
    public string ApiKeyHint { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateExternalTenantDto
{
    [Required, MaxLength(50)]
    public string TenantCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    [Url]
    public string ApiBaseUrl { get; set; } = string.Empty;

    /// <summary>The partner's inbound key — what we'll send as X-Central-Key when calling them.</summary>
    [Required, MaxLength(500), MinLength(16)]
    public string ApiKey { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool CanViewTodaySales { get; set; }
    public bool ShareResults { get; set; }
}

public class UpdateExternalTenantDto
{
    [Required, MaxLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    [Url]
    public string ApiBaseUrl { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool CanViewTodaySales { get; set; }
    public bool ShareResults { get; set; }
}

public class RotateApiKeyDto
{
    [Required, MaxLength(500), MinLength(16)]
    public string ApiKey { get; set; } = string.Empty;
}
