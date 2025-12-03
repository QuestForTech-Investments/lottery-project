using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// Filter parameters for play summary query
/// </summary>
public class PlaySummaryFilterDto
{
    [Required]
    public int DrawId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Optional list of zone IDs to filter by (comma-separated in query string)
    /// </summary>
    public List<int>? ZoneIds { get; set; }

    /// <summary>
    /// Optional betting pool ID to filter by
    /// </summary>
    public int? BettingPoolId { get; set; }
}

/// <summary>
/// Summary of sales for a specific bet number
/// </summary>
public class PlaySummaryDto
{
    /// <summary>
    /// The bet number (e.g., "00", "01", "99")
    /// </summary>
    public string BetNumber { get; set; } = string.Empty;

    /// <summary>
    /// Total sales amount for this bet number
    /// </summary>
    public decimal SalesAmount { get; set; }

    /// <summary>
    /// Configured limit amount for this bet number
    /// </summary>
    public decimal LimitAmount { get; set; }

    /// <summary>
    /// Available amount (LimitAmount - SalesAmount)
    /// </summary>
    public decimal AvailableAmount { get; set; }

    /// <summary>
    /// Percentage of limit used (SalesAmount / LimitAmount * 100)
    /// </summary>
    public decimal Percentage { get; set; }
}

/// <summary>
/// Response wrapper for play summary with totals
/// </summary>
public class PlaySummaryResponseDto
{
    /// <summary>
    /// List of play summaries grouped by bet number
    /// </summary>
    public List<PlaySummaryDto> Items { get; set; } = new();

    /// <summary>
    /// Total count of unique bet numbers
    /// </summary>
    public int TotalNumbers { get; set; }

    /// <summary>
    /// Total sales amount across all bet numbers
    /// </summary>
    public decimal TotalSales { get; set; }

    /// <summary>
    /// Draw name for reference
    /// </summary>
    public string? DrawName { get; set; }

    /// <summary>
    /// Date of the summary
    /// </summary>
    public DateTime Date { get; set; }
}
