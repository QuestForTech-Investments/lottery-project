namespace LotteryApi.DTOs;

/// <summary>
/// Sales data for a betting pool broken down by draw
/// Used in "Banca por sorteo" tab of DailySales
/// </summary>
public class BettingPoolDrawSalesDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public List<DrawSalesDetailDto> DrawSales { get; set; } = new();
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
}

/// <summary>
/// Sales detail for a specific draw within a betting pool
/// </summary>
public class DrawSalesDetailDto
{
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public decimal Sold { get; set; }
    public decimal Prizes { get; set; }
    public decimal Commissions { get; set; }
    public decimal Net { get; set; }
}

/// <summary>
/// Response for betting pool by draw report
/// </summary>
public class BettingPoolDrawSalesResponseDto
{
    public DateTime Date { get; set; }
    public List<BettingPoolDrawSalesDto> BettingPools { get; set; } = new();
    public List<DrawSalesDto> DrawTotals { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}
