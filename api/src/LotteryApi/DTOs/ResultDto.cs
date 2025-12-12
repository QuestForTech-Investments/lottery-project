namespace LotteryApi.DTOs;

/// <summary>
/// DTO for displaying results in the frontend
/// </summary>
public class ResultDto
{
    public int ResultId { get; set; }
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string WinningNumber { get; set; } = string.Empty;
    public string? AdditionalNumber { get; set; }
    public int? Position { get; set; }
    public DateTime ResultDate { get; set; }
    public DateTime? CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public int? ApprovedBy { get; set; }

    // Parsed numbers for display
    public string Num1 { get; set; } = string.Empty;
    public string Num2 { get; set; } = string.Empty;
    public string Num3 { get; set; } = string.Empty;
    public string Cash3 { get; set; } = string.Empty;
    public string Play4 { get; set; } = string.Empty;
    public string Pick5 { get; set; } = string.Empty;
}

/// <summary>
/// DTO for creating/updating a result
/// </summary>
public class CreateResultDto
{
    public int DrawId { get; set; }
    public string WinningNumber { get; set; } = string.Empty;
    public string? AdditionalNumber { get; set; }
    public int? Position { get; set; }
    public DateTime ResultDate { get; set; }
}

/// <summary>
/// DTO for result logs (audit trail)
/// </summary>
public class ResultLogDto
{
    public int LogId { get; set; }
    public int ResultId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? Details { get; set; }
    public string? OldWinningNumber { get; set; }
    public string? NewWinningNumber { get; set; }
    public string? OldAdditionalNumber { get; set; }
    public string? NewAdditionalNumber { get; set; }
    public int? DrawId { get; set; }
    public DateTime? ResultDate { get; set; }
    public string? Username { get; set; }
    public string? DrawName { get; set; }
    // For backward compatibility
    public string WinningNumbers { get; set; } = string.Empty;

    // Parsed individual numbers for display
    public string Num1 { get; set; } = string.Empty;
    public string Num2 { get; set; } = string.Empty;
    public string Num3 { get; set; } = string.Empty;

    // USA lottery additional bet types
    public string Cash3 { get; set; } = string.Empty;
    public string Play4 { get; set; } = string.Empty;
    public string Pick5 { get; set; } = string.Empty;
}

/// <summary>
/// DTO for creating a result log entry
/// </summary>
public class CreateResultLogDto
{
    public int ResultId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? Details { get; set; }
    public string? OldWinningNumber { get; set; }
    public string? NewWinningNumber { get; set; }
    public string? OldAdditionalNumber { get; set; }
    public string? NewAdditionalNumber { get; set; }
    public int? DrawId { get; set; }
    public DateTime? ResultDate { get; set; }
}

/// <summary>
/// DTO for syncing results from external source (scraped data)
/// </summary>
public class SyncResultItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Num1 { get; set; } = string.Empty;
    public string Num2 { get; set; } = string.Empty;
    public string Num3 { get; set; } = string.Empty;
    public string? Cash3 { get; set; }
    public string? Play4 { get; set; }
    public string? Pick5 { get; set; }
}

/// <summary>
/// DTO for sync request
/// </summary>
public class SyncResultsRequestDto
{
    public DateTime Date { get; set; }
    public List<SyncResultItemDto> Results { get; set; } = new();
}

/// <summary>
/// DTO for sync response
/// </summary>
public class SyncResultsResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int TotalReceived { get; set; }
    public int Matched { get; set; }
    public int Updated { get; set; }
    public int Created { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<SyncResultDetailDto> Details { get; set; } = new();
}

/// <summary>
/// DTO for sync detail
/// </summary>
public class SyncResultDetailDto
{
    public string DrawName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // "updated", "created", "skipped", "error"
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? Error { get; set; }
}
