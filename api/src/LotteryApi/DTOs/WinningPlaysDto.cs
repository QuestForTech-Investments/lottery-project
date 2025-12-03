namespace LotteryApi.DTOs;

/// <summary>
/// DTO for a single winning play (jugada ganadora)
/// Based on Vue.js original app columns: Tipo de jugada, Jugada, Venta, Premio, Total
/// </summary>
public class WinningPlayDto
{
    public long LineId { get; set; }
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string BetTypeName { get; set; } = string.Empty;
    public string BetTypeCode { get; set; } = string.Empty;
    public string BetNumber { get; set; } = string.Empty;
    public decimal SalesAmount { get; set; }
    public decimal PrizeAmount { get; set; }
    public decimal Total { get; set; }

    // Additional info
    public int DrawId { get; set; }
    public string DrawName { get; set; } = string.Empty;
    public DateTime DrawDate { get; set; }
    public TimeSpan DrawTime { get; set; }
    public int? WinningPosition { get; set; }
    public string? ResultNumber { get; set; }
    public int BettingPoolId { get; set; }
    public string BettingPoolName { get; set; } = string.Empty;
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
}

/// <summary>
/// DTO for winning plays filter request
/// Based on Vue.js original app: Fecha inicial, Fecha final, Sorteo, Zonas
/// </summary>
public class WinningPlaysFilterDto
{
    public DateTime StartDate { get; set; } = DateTime.Today;
    public DateTime EndDate { get; set; } = DateTime.Today;
    public int? DrawId { get; set; }
    public List<int>? ZoneIds { get; set; }
    public int? BettingPoolId { get; set; }
    public bool? IsPaid { get; set; }

    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 100;
}

/// <summary>
/// DTO for winning plays response with totals
/// </summary>
public class WinningPlaysResponseDto
{
    public List<WinningPlayDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    // Summary totals (shown at bottom of table)
    public decimal TotalSales { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal GrandTotal { get; set; }
}

/// <summary>
/// DTO for winning plays parameters (filters dropdown data)
/// Based on Vue.js original app: GET /api/v1/winning-plays/params
/// </summary>
public class WinningPlaysParamsDto
{
    public List<DrawParamDto> Draws { get; set; } = new();
    public List<ZoneParamDto> Zones { get; set; } = new();
}
