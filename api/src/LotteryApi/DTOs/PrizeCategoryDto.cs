namespace LotteryApi.DTOs;

/// <summary>
/// Sales and prizes aggregated by bet type category
/// Used in "Categoría de Premios" tab of DailySales
/// </summary>
public class PrizeCategoryDto
{
    public int BetTypeId { get; set; }
    public string BetTypeName { get; set; } = string.Empty;
    public string? BetTypeCode { get; set; }
    public int LineCount { get; set; }
    public int WinnerCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalNet { get; set; }
    public decimal ProfitPercentage { get; set; }
}

/// <summary>
/// Response for prize category report
/// </summary>
public class PrizeCategoryResponseDto
{
    public DateTime Date { get; set; }
    public int? DrawId { get; set; }
    public string? DrawName { get; set; }
    public List<PrizeCategoryDto> Categories { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}

/// <summary>
/// Combination sales data (number + draw combination)
/// Used in "Combinaciones" tab of DailySales
/// </summary>
public class CombinationSalesDto
{
    public string BetNumber { get; set; } = string.Empty;
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public int BetTypeId { get; set; }
    public string BetTypeName { get; set; } = string.Empty;
    public int LineCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal Balance { get; set; }
}

/// <summary>
/// Response for combinations report
/// </summary>
public class CombinationSalesResponseDto
{
    public DateTime Date { get; set; }
    public int? DrawId { get; set; }
    public List<CombinationSalesDto> Combinations { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}
