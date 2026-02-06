namespace LotteryApi.DTOs.Limits;

/// <summary>
/// Number control settings for automatic limits
/// </summary>
public class NumberControlSettingsDto
{
    public bool EnableDirecto { get; set; }
    public decimal MontoDirecto { get; set; }
    public bool EnablePale { get; set; }
    public decimal MontoPale { get; set; }
    public bool EnableSuperPale { get; set; }
    public decimal MontoSuperPale { get; set; }
}

/// <summary>
/// Complete automatic limit configuration DTO
/// </summary>
public class AutomaticLimitConfigDto
{
    public NumberControlSettingsDto GeneralNumberControls { get; set; } = new();
    public NumberControlSettingsDto LineControls { get; set; } = new();
}

/// <summary>
/// Random block configuration DTO
/// </summary>
public class RandomBlockConfigDto
{
    public List<int> DrawIds { get; set; } = new();
    public int? BettingPoolId { get; set; }
    public int PalesToBlock { get; set; }
}

/// <summary>
/// Response for random block execution
/// </summary>
public class RandomBlockExecutionResultDto
{
    public int BlockedCount { get; set; }
    public string? Message { get; set; }
    public List<int>? BlockedPales { get; set; }
}
