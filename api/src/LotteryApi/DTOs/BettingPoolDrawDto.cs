namespace LotteryApi.DTOs;

/// <summary>
/// DTO for BettingPoolDraw - represents which draws a betting pool accepts
/// </summary>
public class BettingPoolDrawDto
{
    public int BettingPoolDrawId { get; set; }
    public int BettingPoolId { get; set; }
    public int DrawId { get; set; }

    // Draw information
    public string? DrawName { get; set; }
    public string? Abbreviation { get; set; }
    public TimeSpan? DrawTime { get; set; }

    // Lottery information (parent of draw)
    public int? LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public string? CountryName { get; set; }
    public string? LotteryImage { get; set; }
    public string? Color { get; set; }

    // Configuration
    public bool IsActive { get; set; }
    public int? AnticipatedClosingMinutes { get; set; }
    public int DisplayOrder { get; set; }

    public bool? IsDominican { get; set; }

    // Game types enabled for this draw in this betting pool
    public List<GameTypeDto> EnabledGameTypes { get; set; } = new();

    // All available game types for this draw
    public List<GameTypeDto> AvailableGameTypes { get; set; } = new();

    // Weekly schedule for this draw
    public WeeklyScheduleDto? WeeklySchedule { get; set; }
}

/// <summary>
/// DTO for creating a new betting pool draw
/// </summary>
public class CreateBettingPoolDrawDto
{
    public int DrawId { get; set; }

    /// <summary>
    /// Legacy field for V1 frontend compatibility - use LotteryId instead of DrawId
    /// If both are provided, DrawId takes precedence
    /// </summary>
    public int? LotteryId { get; set; }

    public bool IsActive { get; set; } = true;
    public int? AnticipatedClosingMinutes { get; set; }
    public List<int> EnabledGameTypeIds { get; set; } = new();
}

/// <summary>
/// DTO for updating an existing betting pool draw
/// </summary>
public class UpdateBettingPoolDrawDto
{
    public bool? IsActive { get; set; }
    public int? AnticipatedClosingMinutes { get; set; }
    public List<int>? EnabledGameTypeIds { get; set; }
}
