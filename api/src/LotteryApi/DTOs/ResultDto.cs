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
/// DTO for result logs
/// </summary>
public class ResultLogDto
{
    public string DrawName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public DateTime ResultDate { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string WinningNumbers { get; set; } = string.Empty;
}
