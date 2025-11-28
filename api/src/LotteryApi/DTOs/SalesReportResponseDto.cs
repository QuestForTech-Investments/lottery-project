namespace LotteryApi.DTOs;

public class SalesReportResponseDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalNet { get; set; }
    public List<BettingPoolSalesDto> BettingPools { get; set; } = new List<BettingPoolSalesDto>();
    public int TotalCount { get; set; }
    public SalesSummaryDto Summary { get; set; } = new SalesSummaryDto();
}
