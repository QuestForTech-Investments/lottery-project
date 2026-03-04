namespace LotteryApi.DTOs;

public class BettingPoolBalanceDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolCode { get; set; } = string.Empty;
    public string BettingPoolName { get; set; } = string.Empty;
    public string? Users { get; set; }
    public string? Reference { get; set; }
    public int ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public decimal Balance { get; set; }
    public decimal Loans { get; set; }
    public DateTime? LastUpdated { get; set; }
}
