namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for returning limit rule data in API responses
/// </summary>
public class LimitRuleDto
{
    public int LimitRuleId { get; set; }
    public string? RuleName { get; set; }
    public int LimitType { get; set; }
    public string LimitTypeName { get; set; } = string.Empty;
    public int? LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public int? DrawId { get; set; }
    public string? DrawName { get; set; }
    public int? GameTypeId { get; set; }
    public string? GameTypeName { get; set; }
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public int? GroupId { get; set; }
    public int? BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public string? BetNumberPattern { get; set; }
    public decimal? MaxBetPerNumber { get; set; }
    public decimal? MaxBetPerTicket { get; set; }
    public decimal? MaxBetPerBettingPool { get; set; }
    public decimal? MaxBetGlobal { get; set; }
    public bool IsActive { get; set; }
    public int? Priority { get; set; }
    public int? DaysOfWeek { get; set; }
    public List<string>? DaysOfWeekNames { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
