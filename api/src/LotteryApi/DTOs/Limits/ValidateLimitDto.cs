namespace LotteryApi.DTOs.Limits;

public class ValidateLimitDto
{
    public int LimitType { get; set; }
    public int DrawId { get; set; }
    public int? ZoneId { get; set; }
    public int? BettingPoolId { get; set; }
    public Dictionary<string, decimal>? Amounts { get; set; }
}

public class ValidateLimitResultDto
{
    public bool IsValid { get; set; }
    public List<LimitViolationDto> Violations { get; set; } = new();
}

public class LimitViolationDto
{
    public string GameType { get; set; } = string.Empty;
    public decimal ChildAmount { get; set; }
    public decimal ParentAmount { get; set; }
    public string ParentType { get; set; } = string.Empty;
}
