namespace LotteryApi.DTOs;

/// <summary>One row in the per-banca change history.</summary>
public class BettingPoolAuditLogDto
{
    public int AuditLogId { get; set; }
    public int BettingPoolId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    /// <summary>Parsed change list — pre-deserialized so the frontend doesn't
    /// have to JSON.parse it.</summary>
    public List<BettingPoolAuditFieldChangeDto> Changes { get; set; } = new();
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BettingPoolAuditFieldChangeDto
{
    public string Field { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}
