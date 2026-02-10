namespace LotteryApi.DTOs;

/// <summary>
/// Sales data aggregated by Draw (Sorteo)
/// Used in "Por sorteo" tab of DailySales
/// </summary>
public class DrawSalesDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string? LotteryName { get; set; }
    public TimeSpan DrawTime { get; set; }
    public string? DrawColor { get; set; }
    public int TicketCount { get; set; }
    public int LineCount { get; set; }
    public int WinnerCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
}

/// <summary>
/// Response for sales by draw report
/// </summary>
public class DrawSalesResponseDto
{
    public DateTime Date { get; set; }
    public List<DrawSalesDto> Draws { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}
