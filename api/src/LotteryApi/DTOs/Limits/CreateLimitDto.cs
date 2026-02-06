using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for creating a new limit rule
/// </summary>
public class CreateLimitDto
{
    /// <summary>
    /// The type of limit (1-10 based on LimitType enum)
    /// </summary>
    [Required(ErrorMessage = "El tipo de límite es requerido")]
    [Range(1, 10, ErrorMessage = "El tipo de límite debe estar entre 1 y 10")]
    public int LimitType { get; set; }

    /// <summary>
    /// Optional name for the limit rule
    /// </summary>
    [MaxLength(100)]
    public string? RuleName { get; set; }

    /// <summary>
    /// Optional lottery ID to apply the limit to
    /// </summary>
    public int? LotteryId { get; set; }

    /// <summary>
    /// Optional list of draw IDs to apply the limit to.
    /// If multiple draws are specified, a limit rule will be created for each.
    /// </summary>
    public List<int>? DrawIds { get; set; }

    /// <summary>
    /// Optional game type ID to apply the limit to
    /// </summary>
    public int? GameTypeId { get; set; }

    /// <summary>
    /// Optional zone ID (for zone-level limits)
    /// </summary>
    public int? ZoneId { get; set; }

    /// <summary>
    /// Optional group ID (for group-level limits)
    /// </summary>
    public int? GroupId { get; set; }

    /// <summary>
    /// Optional betting pool ID (for betting pool-level limits)
    /// </summary>
    public int? BettingPoolId { get; set; }

    /// <summary>
    /// Optional pattern for specific numbers (e.g., "1234", "12*", "**34")
    /// </summary>
    [MaxLength(50)]
    public string? BetNumberPattern { get; set; }

    /// <summary>
    /// Dictionary of amounts by game type code (e.g., {"directo": 1000, "pale": 500})
    /// </summary>
    public Dictionary<string, decimal>? Amounts { get; set; }

    /// <summary>
    /// Direct amount for max bet per number (if Amounts is not used)
    /// </summary>
    public decimal? MaxBetPerNumber { get; set; }

    /// <summary>
    /// Direct amount for max bet per ticket
    /// </summary>
    public decimal? MaxBetPerTicket { get; set; }

    /// <summary>
    /// Direct amount for max bet per betting pool
    /// </summary>
    public decimal? MaxBetPerBettingPool { get; set; }

    /// <summary>
    /// Direct amount for max bet global
    /// </summary>
    public decimal? MaxBetGlobal { get; set; }

    /// <summary>
    /// Bitmask for days of week: 1=Mon, 2=Tue, 4=Wed, 8=Thu, 16=Fri, 32=Sat, 64=Sun
    /// Null means all days
    /// </summary>
    public int? DaysOfWeek { get; set; }

    /// <summary>
    /// Optional list of day names (convenience field, converted to bitmask)
    /// </summary>
    public List<string>? DaysOfWeekNames { get; set; }

    /// <summary>
    /// Date from which the limit is effective
    /// </summary>
    public DateTime? EffectiveFrom { get; set; }

    /// <summary>
    /// Date until which the limit is effective
    /// </summary>
    public DateTime? EffectiveTo { get; set; }

    /// <summary>
    /// Priority of the limit rule (higher priority rules are evaluated first)
    /// </summary>
    public int? Priority { get; set; }

    /// <summary>
    /// Whether the limit is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
