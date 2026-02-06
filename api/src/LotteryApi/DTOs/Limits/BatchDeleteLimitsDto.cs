namespace LotteryApi.DTOs.Limits;

/// <summary>
/// DTO for batch deleting limit rules
/// </summary>
public class BatchDeleteLimitsDto
{
    /// <summary>
    /// List of limit rule IDs to delete
    /// </summary>
    public List<int>? LimitRuleIds { get; set; }

    /// <summary>
    /// Alternative: Filter to match rules to delete
    /// </summary>
    public LimitFilterDto? Filter { get; set; }
}

/// <summary>
/// Response for batch delete operation
/// </summary>
public class BatchDeleteResponseDto
{
    public bool Success { get; set; }
    public int DeletedCount { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<int>? DeletedIds { get; set; }
    public List<string>? Errors { get; set; }
}
