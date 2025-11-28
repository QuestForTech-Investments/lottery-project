namespace LotteryApi.DTOs;

public class BettingPoolSalesDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
}
