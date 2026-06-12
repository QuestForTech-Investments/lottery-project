using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for updating an existing limit rule
/// </summary>
public class UpdateLimitDto
{
    /// <summary>
    /// Optional new name for the limit rule
    /// </summary>
    [MaxLength(100)]
    public string? RuleName { get; set; }

    /// <summary>
    /// Optional update to limit type (1-10 based on LimitType enum)
    /// </summary>
    [Range(1, 10, ErrorMessage = "El tipo de límite debe estar entre 1 y 10")]
    public int? LimitType { get; set; }

    /// <summary>
    /// Optional lottery ID to apply the limit to
    /// </summary>
    public int? LotteryId { get; set; }

    /// <summary>
    /// Optional draw ID to apply the limit to
    /// </summary>
    public int? DrawId { get; set; }

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
    /// Optional pattern for specific numbers
    /// </summary>
    [MaxLength(50)]
    public string? BetNumberPattern { get; set; }

    /// <summary>
    /// Max bet amount per number
    /// </summary>
    public decimal? MaxBetPerNumber { get; set; }

    /// <summary>
    /// Max bet amount per ticket
    /// </summary>
    public decimal? MaxBetPerTicket { get; set; }

    /// <summary>
    /// Max bet amount per betting pool
    /// </summary>
    public decimal? MaxBetPerBettingPool { get; set; }

    /// <summary>
    /// Max bet amount global
    /// </summary>
    public decimal? MaxBetGlobal { get; set; }

    /// <summary>
    /// Bitmask for days of week
    /// </summary>
    public int? DaysOfWeek { get; set; }

    /// <summary>
    /// Date from which the limit is effective
    /// </summary>
    public DateTime? EffectiveFrom { get; set; }

    /// <summary>
    /// Date until which the limit is effective
    /// </summary>
    public DateTime? EffectiveTo { get; set; }

    /// <summary>
    /// Priority of the limit rule
    /// </summary>
    public int? Priority { get; set; }

    /// <summary>
    /// Whether the limit is active
    /// </summary>
    public bool? IsActive { get; set; }
}

public class UpdateAmountDto
{
    /// <summary>Same-day cap. Optional in the request — when null the existing value is kept.</summary>
    public decimal? Amount { get; set; }

    /// <summary>
    /// Future-sale cap. Optional in the request.
    ///   - omitted (no field at all) → not touched
    ///   - present with a numeric value → set
    ///   - explicitly null → cleared (future sales prohibited under this row)
    /// Use <see cref="FutureAmountProvided"/> to know whether the caller meant
    /// to set it; with C# we can't distinguish "null in JSON" from "missing".
    /// </summary>
    public decimal? FutureAmount { get; set; }

    /// <summary>
    /// Set to true when the request explicitly carried a FutureAmount field
    /// (even if its value is null, meaning "clear it"). Lets the controller
    /// differentiate "leave alone" from "set/clear".
    /// </summary>
    public bool FutureAmountProvided { get; set; }
}
