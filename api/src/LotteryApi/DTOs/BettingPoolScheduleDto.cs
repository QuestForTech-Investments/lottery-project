using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO for betting pool schedule (daily operating hours)
/// </summary>
public class BettingPoolScheduleDto
{
    /// <summary>
    /// Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    /// </summary>
    [Required]
    [Range(0, 6, ErrorMessage = "Day of week must be between 0 (Sunday) and 6 (Saturday)")]
    public int DayOfWeek { get; set; }

    /// <summary>
    /// Opening time in format "hh:mm tt" (12-hour AM/PM format)
    /// Example: "08:00 AM"
    /// </summary>
    public string? OpeningTime { get; set; }

    /// <summary>
    /// Closing time in format "hh:mm tt" (12-hour AM/PM format)
    /// Example: "10:00 PM"
    /// </summary>
    public string? ClosingTime { get; set; }

    /// <summary>
    /// Whether this schedule is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Request to save multiple schedules for a betting pool
/// </summary>
public class SaveSchedulesRequest
{
    [Required]
    public List<BettingPoolScheduleDto> Schedules { get; set; } = new();
}

/// <summary>
/// Response with saved schedules
/// </summary>
public class SchedulesResponse
{
    public int BettingPoolId { get; set; }
    public List<BettingPoolScheduleDto> Schedules { get; set; } = new();
}
