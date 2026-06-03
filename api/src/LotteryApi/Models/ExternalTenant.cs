using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// A paired tenant we may exchange data with. Each tenant DB has its own copy
/// of this table — to enable sync with a partner, both tenants must add each
/// other as rows (auth + flag check happen on both sides).
/// </summary>
[Table("external_tenants")]
public class ExternalTenant
{
    [Key]
    [Column("external_tenant_id")]
    public int ExternalTenantId { get; set; }

    [Required, MaxLength(50)]
    [Column("tenant_code")]
    public string TenantCode { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    [Column("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    [Column("api_base_url")]
    public string ApiBaseUrl { get; set; } = string.Empty;

    /// <summary>Key sent as <c>X-Central-Key</c> when calling the partner.</summary>
    [Required, MaxLength(500)]
    [Column("api_key")]
    public string ApiKey { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("logo_url")]
    public string? LogoUrl { get; set; }

    [Column("sort_order")]
    public int SortOrder { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    /// <summary>If true, "Grupo" dropdown in Ventas del Día lists this partner.</summary>
    [Column("can_view_today_sales")]
    public bool CanViewTodaySales { get; set; }

    /// <summary>If true, results published locally are pushed to this partner
    /// AND results pushed from this partner are accepted on inbound.</summary>
    [Column("share_results")]
    public bool ShareResults { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}
