namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for filtering limit rules in list queries
/// </summary>
public class LimitFilterDto
{
    /// <summary>
    /// Filter by limit types (1-10 based on LimitType enum)
    /// </summary>
    public List<int>? LimitTypes { get; set; }

    /// <summary>
    /// Filter by lottery IDs
    /// </summary>
    public List<int>? LotteryIds { get; set; }

    /// <summary>
    /// Filter by draw IDs
    /// </summary>
    public List<int>? DrawIds { get; set; }

    /// <summary>
    /// Filter by game type IDs
    /// </summary>
    public List<int>? GameTypeIds { get; set; }

    /// <summary>
    /// Filter by days of week bitmask values
    /// </summary>
    public List<int>? DaysOfWeek { get; set; }

    /// <summary>
    /// Filter by specific betting pool ID
    /// </summary>
    public int? BettingPoolId { get; set; }

    /// <summary>
    /// Filter by specific zone ID
    /// </summary>
    public int? ZoneId { get; set; }

    /// <summary>
    /// Filter by specific group ID
    /// </summary>
    public int? GroupId { get; set; }

    /// <summary>
    /// Filter by active status
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Search by rule name or bet number pattern
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Filter by effective date (rules that are active on this date)
    /// </summary>
    public DateTime? EffectiveDate { get; set; }
}
