using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// Body for <c>POST /api/public/v1/results/inbound</c>. Partners use this to
/// push a published result for a draw they share with us. Auth is via
/// <c>X-Central-Key</c> AND the partner row must have <c>share_results=true</c>.
/// </summary>
public class PublicResultInboundDto
{
    /// <summary>Sender's tenant_code. Validated against external_tenants.</summary>
    [Required, MaxLength(50)]
    public string PartnerCode { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string LotteryCode { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string DrawCode { get; set; } = string.Empty;

    /// <summary>Date the draw was held, in the lottery's timezone (YYYY-MM-DD).</summary>
    [Required]
    public DateTime ResultDate { get; set; }

    /// <summary>Primary winning number. Field name aligns with Result.WinningNumber.</summary>
    [Required, MaxLength(20)]
    public string Num1 { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Num2 { get; set; }

    [MaxLength(20)]
    public string? Num3 { get; set; }

    /// <summary>1, 2, 3 — match the position field in Result. Optional.</summary>
    public int? Position { get; set; }

    public DateTime? PublishedAt { get; set; }

    [MaxLength(200)]
    public string? PublishedBy { get; set; }
}

/// <summary>Returned by the inbound endpoint so the partner can confirm what we did.</summary>
public class PublicResultInboundResultDto
{
    /// <summary>"received" (created locally), "noop" (already matched), or "conflict" (logged).</summary>
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
}
