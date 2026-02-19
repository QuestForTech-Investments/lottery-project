namespace LotteryApi.DTOs;

public class BettingPoolSalesDto
{
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public string BettingPoolCode { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalNet { get; set; }

    /// <summary>
    /// Count of tickets with Pending state (ticket_state = 'P')
    /// </summary>
    [System.Text.Json.Serialization.JsonInclude]
    public int PendingCount { get; set; }

    /// <summary>
    /// Count of tickets with Winner state (ticket_state = 'W')
    /// </summary>
    [System.Text.Json.Serialization.JsonInclude]
    public int WinnerCount { get; set; }

    /// <summary>
    /// Count of tickets with Loser state (ticket_state = 'L')
    /// </summary>
    [System.Text.Json.Serialization.JsonInclude]
    public int LoserCount { get; set; }
}
