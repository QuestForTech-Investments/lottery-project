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
/// One row in the "Categoría de premios" report, grouped by the effective primer-pago multiplier.
/// </summary>
public class PayoutGroupDto
{
    public decimal Multiplier { get; set; }
    public string Label { get; set; } = string.Empty;
    public int LineCount { get; set; }
    public int PendingCount { get; set; }
    public int LoserCount { get; set; }
    public int WinnerCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalNet { get; set; }
}

public class PayoutGroupResponseDto
{
    public DateTime Date { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<PayoutGroupDto> Groups { get; set; } = new();
    public SalesSummaryDto Summary { get; set; } = new();
    public int TotalCount { get; set; }
}

/// <summary>
/// One betting pool that uses a given payout multiplier for a category, with its aggregate sales.
/// </summary>
public class PayoutBancaDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public string? ZoneName { get; set; }
    public int LineCount { get; set; }
    public int PendingCount { get; set; }
    public int LoserCount { get; set; }
    public int WinnerCount { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalNet { get; set; }
}

public class PayoutBancasResponseDto
{
    public decimal Multiplier { get; set; }
    public string Category { get; set; } = string.Empty;
    public List<PayoutBancaDto> Bancas { get; set; } = new();
    public int TotalCount { get; set; }
}

/// <summary>
/// One (banca, game type) cell in the "Premios por tipo de jugada" report.
/// </summary>
public class PrizesByBancaGameTypeDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public int GameTypeId { get; set; }
    public string GameTypeCode { get; set; } = string.Empty;
    public string GameTypeName { get; set; } = string.Empty;
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
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
