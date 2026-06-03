namespace LotteryApi.DTOs;

/// <summary>
/// Daily sales summary returned by <c>GET /api/public/v1/today-sales</c>.
/// Cross-tenant payload — consumed by La Central's "Grupo" dropdown in
/// Ventas del Día. Keep the shape stable; add fields rather than rename.
/// </summary>
public class PublicTodaySalesDto
{
    public string TenantCode { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    /// <summary>YYYY-MM-DD in the business timezone of the responding tenant.</summary>
    public string Date { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";

    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalNet { get; set; }
    public int TicketCount { get; set; }
}

/// <summary>Banca-level breakdown for the cross-tenant "Grupo" view.
/// Field set mirrors <c>BettingPoolSalesDto</c> so the consumer can render
/// the same table as the local view (P/L/W counts, balance, caída).
/// </summary>
public class PublicTodaySalesByBancaRow
{
    public int BettingPoolId { get; set; }
    public string BettingPoolCode { get; set; } = string.Empty;
    public string BettingPoolName { get; set; } = string.Empty;
    /// <summary>The "ref" / "Banca" label most tenants use as the human-friendly identifier.</summary>
    public string? Reference { get; set; }
    public int? ZoneId { get; set; }
    public string? ZoneName { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalNet { get; set; }
    public int TicketCount { get; set; }
    // Ticket-state counts (P=pending, W=winner, L=loser).
    public int PendingCount { get; set; }
    public int WinnerCount { get; set; }
    public int LoserCount { get; set; }
    public decimal Balance { get; set; }
    public decimal Fall { get; set; }
    public decimal AccumulatedFall { get; set; }
}

/// <summary>Draw-level breakdown for the cross-tenant "Grupo" view.</summary>
public class PublicTodaySalesByDrawRow
{
    public int DrawId { get; set; }
    public string DrawCode { get; set; } = string.Empty;
    public string DrawName { get; set; } = string.Empty;
    public string? LotteryCode { get; set; }
    public string? LotteryName { get; set; }
    public decimal TotalSold { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalCommissions { get; set; }
    public decimal TotalNet { get; set; }
    public int TicketCount { get; set; }
}

