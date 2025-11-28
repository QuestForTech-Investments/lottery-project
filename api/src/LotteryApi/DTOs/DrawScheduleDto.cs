using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// Weekly schedule for a specific day
/// </summary>
public class DayScheduleDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool Enabled { get; set; } = true;
}

/// <summary>
/// Complete weekly schedule for a draw
/// </summary>
public class WeeklyScheduleDto
{
    public DayScheduleDto? Monday { get; set; }
    public DayScheduleDto? Tuesday { get; set; }
    public DayScheduleDto? Wednesday { get; set; }
    public DayScheduleDto? Thursday { get; set; }
    public DayScheduleDto? Friday { get; set; }
    public DayScheduleDto? Saturday { get; set; }
    public DayScheduleDto? Sunday { get; set; }
}

/// <summary>
/// Draw with its weekly schedule information
/// </summary>
public class DrawScheduleDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? Timezone { get; set; }
    public string? DisplayColor { get; set; }
    public string? LogoUrl { get; set; }

    // Default draw time (when not using weekly schedules)
    public TimeSpan? DefaultDrawTime { get; set; }

    // Flag to indicate if using weekly schedules
    public bool UseWeeklySchedule { get; set; }

    // Weekly schedule (only populated if UseWeeklySchedule = true)
    public WeeklyScheduleDto? WeeklySchedule { get; set; }
}

/// <summary>
/// Update request for draw schedules
/// </summary>
public class UpdateDrawSchedulesDto
{
    [Required]
    public List<UpdateDrawScheduleDto> Schedules { get; set; } = new();
}

/// <summary>
/// Update request for a single draw schedule
/// </summary>
public class UpdateDrawScheduleDto
{
    [Required]
    public int DrawId { get; set; }

    [Required]
    public bool UseWeeklySchedule { get; set; }

    public WeeklyScheduleDto? WeeklySchedule { get; set; }
}

/// <summary>
/// Lottery with its draws grouped together
/// </summary>
public class LotterySchedulesDto
{
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? Timezone { get; set; }
    public List<DrawScheduleDto> Draws { get; set; } = new();
}
