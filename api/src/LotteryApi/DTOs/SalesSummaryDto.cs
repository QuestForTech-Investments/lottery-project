namespace LotteryApi.DTOs;

public class SalesSummaryDto
{
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal Fall { get; set; }
    public decimal AccumulatedFall { get; set; }
    public decimal TotalNet { get; set; }

    /// <summary>
    /// Net after deducting the caída (central's share) — `TotalNet − Fall`.
    /// This is what the banca actually keeps for the period.
    /// </summary>
    public decimal Final { get; set; }

    public decimal BenefitPercentage { get; set; }
    public decimal Credits { get; set; }
    public decimal Balance { get; set; }
    /// <summary>
    /// "Balance del día anterior" — closing balance of yesterday adjusted by
    /// today's approved transactions, with today's in-progress sales excluded.
    /// Matches the value shown in /balances/betting-pools and the dashboard
    /// widgets. Only populated for single-banca queries.
    /// </summary>
    public decimal BalanceOfTheDay { get; set; }
}
