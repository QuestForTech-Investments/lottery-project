namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for returning form parameters for creating/editing limits
/// </summary>
public class LimitParamsDto
{
    /// <summary>
    /// Available limit types
    /// </summary>
    public List<SelectOption> LimitTypes { get; set; } = new();

    /// <summary>
    /// Available lotteries
    /// </summary>
    public List<SelectOption> Lotteries { get; set; } = new();

    /// <summary>
    /// Available draws
    /// </summary>
    public List<DrawSelectOption> Draws { get; set; } = new();

    /// <summary>
    /// Available game types
    /// </summary>
    public List<SelectOption> GameTypes { get; set; } = new();

    /// <summary>
    /// Available betting pools
    /// </summary>
    public List<SelectOption> BettingPools { get; set; } = new();

    /// <summary>
    /// Available zones
    /// </summary>
    public List<SelectOption> Zones { get; set; } = new();

    /// <summary>
    /// Days of week options
    /// </summary>
    public List<DayOfWeekOption> DaysOfWeek { get; set; } = new();
}

/// <summary>
/// Simple select option for dropdowns
/// </summary>
public class SelectOption
{
    public int Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

/// <summary>
/// Draw select option with additional lottery info
/// </summary>
public class DrawSelectOption
{
    public int Value { get; set; }
    public string Label { get; set; } = string.Empty;
    public int LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public string? DisplayColor { get; set; }
}

/// <summary>
/// Day of week option with bitmask value
/// </summary>
public class DayOfWeekOption
{
    public int Value { get; set; }
    public string Label { get; set; } = string.Empty;
    public string ShortLabel { get; set; } = string.Empty;
}
