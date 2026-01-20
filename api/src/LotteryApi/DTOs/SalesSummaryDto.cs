namespace LotteryApi.DTOs;

public class SalesSummaryDto
{
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
    public decimal BenefitPercentage { get; set; }
    public decimal Credits { get; set; }
    public decimal Balance { get; set; }
}
