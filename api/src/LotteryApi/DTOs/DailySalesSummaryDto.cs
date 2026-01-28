namespace LotteryApi.DTOs;

/// <summary>
/// Daily sales summary for a specific date
/// Used by the "Ventas por fecha" report
/// </summary>
public class DailySalesSummaryDto
{
    /// <summary>
    /// The date for this summary
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Total sales amount (sum of all ticket GrandTotals)
    /// </summary>
    public decimal TotalSold { get; set; }

    /// <summary>
    /// Total prizes paid out
    /// </summary>
    public decimal TotalPrizes { get; set; }

    /// <summary>
    /// Total commissions paid to betting pools
    /// </summary>
    public decimal TotalCommissions { get; set; }

    /// <summary>
    /// Total discounts applied
    /// </summary>
    public decimal TotalDiscounts { get; set; }

    /// <summary>
    /// Fall amount (business-specific calculation)
    /// </summary>
    public decimal Fall { get; set; }

    /// <summary>
    /// Net amount (TotalSold - TotalCommissions - TotalPrizes)
    /// </summary>
    public decimal TotalNet { get; set; }
}
