namespace LotteryApi.DTOs;

/// <summary>
/// Sales data aggregated by Zone
/// Used in "Por zona" tab of DailySales
/// </summary>
public class ZoneSalesDto
{
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int BettingPoolCount { get; set; }
    public int TicketCount { get; set; }
    public int LineCount { get; set; }
    public int WinnerCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalNet { get; set; }
    public decimal Fall { get; set; }
    public decimal Final { get; set; }
    public decimal Balance { get; set; }
}

/// <summary>
/// Response for sales by zone report
/// </summary>
public class ZoneSalesResponseDto
{
    public DateTime Date { get; set; }
    public List<ZoneSalesDto> Zones { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}
