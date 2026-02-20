using System.ComponentModel.DataAnnotations;

namespace LotteryApi.DTOs;

/// <summary>
/// DTO for creating a new ticket line (jugada)
/// </summary>
public class CreateTicketLineDto
{
    // LotteryId no es necesario, se obtiene a través de Draw.LotteryId

    [Required(ErrorMessage = "El ID de sorteo es requerido")]
    public int DrawId { get; set; }

    [Required(ErrorMessage = "El número de apuesta es requerido")]
    [StringLength(20, ErrorMessage = "El número de apuesta no puede exceder 20 caracteres")]
    public string BetNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "El ID de tipo de apuesta es requerido")]
    public int BetTypeId { get; set; }

    [Range(0.01, 999999.99, ErrorMessage = "El monto debe estar entre 0.01 y 999,999.99")]
    public decimal BetAmount { get; set; }

    public decimal Multiplier { get; set; } = 1.00m;
    public int? Position { get; set; }
    public bool IsLuckyPick { get; set; } = false;
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for creating a new ticket
/// </summary>
public class CreateTicketDto
{
    [Required(ErrorMessage = "El ID de banca es requerido")]
    public int BettingPoolId { get; set; }

    [Required(ErrorMessage = "El ID de usuario es requerido")]
    public int UserId { get; set; }

    /// <summary>
    /// Date for the ticket. Defaults to today if not provided.
    /// Can be up to MaxFutureDays in the future (configured per betting pool).
    /// </summary>
    public DateTime? TicketDate { get; set; }

    [Required(ErrorMessage = "Debe incluir al menos una línea de apuesta")]
    [MinLength(1, ErrorMessage = "Debe incluir al menos una línea de apuesta")]
    public List<CreateTicketLineDto> Lines { get; set; } = new();

    public decimal GlobalMultiplier { get; set; } = 1.00m;
    public decimal GlobalDiscount { get; set; } = 0.00m;
    public bool ApplyDiscount { get; set; } = false;

    /// <summary>
    /// When true, allows creating a ticket with yesterday's draw date.
    /// Requires TICKET_PREVIOUS_DAY_SALE permission.
    /// </summary>
    public bool AllowPastDate { get; set; } = false;

    /// <summary>
    /// When true, allows creating a ticket for draws that have already closed.
    /// Requires SELL_OUT_OF_HOURS permission.
    /// </summary>
    public bool AllowClosedDraw { get; set; } = false;

    public string? TerminalId { get; set; }
    public string? IpAddress { get; set; }

    // Customer information (optional)
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerIdNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for ticket line in responses
/// </summary>
public class TicketLineDto
{
    public long LineId { get; set; }
    public long TicketId { get; set; }
    public int LineNumber { get; set; }
    public int LotteryId { get; set; }
    public string? LotteryName { get; set; }
    public int DrawId { get; set; }
    public string? DrawName { get; set; }
    public DateTime DrawDate { get; set; }
    public TimeSpan DrawTime { get; set; }
    public string BetNumber { get; set; } = string.Empty;
    public int BetTypeId { get; set; }
    public string? BetTypeCode { get; set; }
    public string? BetTypeName { get; set; }
    public int? Position { get; set; }
    public decimal BetAmount { get; set; }
    public decimal Multiplier { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalWithMultiplier { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal? PrizeMultiplier { get; set; }
    public decimal PrizeAmount { get; set; }
    public bool IsWinner { get; set; }
    public int? WinningPosition { get; set; }
    public string? ResultNumber { get; set; }
    public DateTime? ResultCheckedAt { get; set; }
    public string LineStatus { get; set; } = "pending";
    public bool ExceedsLimit { get; set; }
    public bool IsLuckyPick { get; set; }
    public bool IsHotNumber { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for ticket list (simplified view)
/// </summary>
public class TicketListDto
{
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalLines { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal TotalPrize { get; set; }
    public int WinningLines { get; set; }
    public string Status { get; set; } = "pending";
    /// <summary>
    /// Estado del ticket según resultados: P=Pending, W=Winner, L=Loser
    /// </summary>
    [System.Text.Json.Serialization.JsonInclude]
    public string TicketState { get; set; } = "P";
    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public DateTime? EarliestDrawTime { get; set; }
    public DateTime? LatestDrawTime { get; set; }
    public int PrintCount { get; set; }
    public bool IsOutOfScheduleSale { get; set; }
}

/// <summary>
/// DTO for ticket detail (complete view with lines)
/// </summary>
public class TicketDetailDto
{
    public long TicketId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int BettingPoolId { get; set; }
    public string? BettingPoolName { get; set; }
    public string? BettingPoolCode { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? TerminalId { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal GlobalMultiplier { get; set; }
    public decimal GlobalDiscount { get; set; }
    public string CurrencyCode { get; set; } = "DOP";

    // Totals
    public int TotalLines { get; set; }
    public decimal TotalBetAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal TotalSubtotal { get; set; }
    public decimal TotalWithMultiplier { get; set; }
    public decimal TotalCommission { get; set; }
    public decimal TotalNet { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal TotalPrize { get; set; }
    public int WinningLines { get; set; }

    // Status
    public string Status { get; set; } = "pending";
    /// <summary>
    /// Estado del ticket según resultados: P=Pending, W=Winner, L=Loser
    /// </summary>
    public string TicketState { get; set; } = "P";
    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public int? CancelledBy { get; set; }
    public string? CancelledByName { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }
    public int? PaidBy { get; set; }
    public string? PaidByName { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentReference { get; set; }

    // Customer info
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerIdNumber { get; set; }

    // Lottery info
    public string? LotteryIds { get; set; }
    public int TotalLotteries { get; set; }
    public DateTime? EarliestDrawTime { get; set; }
    public DateTime? LatestDrawTime { get; set; }

    // Audit
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
    public int PrintCount { get; set; }
    public DateTime? LastPrintedAt { get; set; }
    public string? Notes { get; set; }
    public string? SpecialFlags { get; set; }

    // Lines
    public List<TicketLineDto> Lines { get; set; } = new();
}

/// <summary>
/// DTO for canceling a ticket
/// </summary>
public class CancelTicketDto
{
    [Required(ErrorMessage = "La razón de cancelación es requerida")]
    [StringLength(200, ErrorMessage = "La razón no puede exceder 200 caracteres")]
    public string CancellationReason { get; set; } = string.Empty;

    [Required(ErrorMessage = "El ID del usuario que cancela es requerido")]
    public int CancelledBy { get; set; }
}

/// <summary>
/// DTO for paying a prize
/// </summary>
public class PayTicketDto
{
    [Required(ErrorMessage = "El ID del usuario que paga es requerido")]
    public int PaidBy { get; set; }

    [Required(ErrorMessage = "El método de pago es requerido")]
    [StringLength(50, ErrorMessage = "El método de pago no puede exceder 50 caracteres")]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "La referencia de pago no puede exceder 100 caracteres")]
    public string? PaymentReference { get; set; }
}

/// <summary>
/// DTO for ticket filter/search request
/// Based on real Vue.js app analysis: PATCH /api/v1/tickets
/// </summary>
public class TicketFilterDto
{
    public DateTime? Date { get; set; }
    public int? BettingPoolId { get; set; }
    public int? LotteryId { get; set; }
    public int? BetTypeId { get; set; }
    public string? BetNumber { get; set; }
    public List<int>? ZoneIds { get; set; }
    public bool? PendingPayment { get; set; }
    public bool? WinnersOnly { get; set; }
    public string? Status { get; set; }  // all, winner, pending, loser, cancelled
    public string? Search { get; set; }  // Quick search (ticket code, customer name, etc.)

    // Pagination
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

/// <summary>
/// DTO for ticket list response with pagination and totals
/// Based on real Vue.js app analysis
/// </summary>
public class TicketListResponseDto
{
    public List<TicketListDto> Tickets { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    // Aggregated totals
    public decimal TotalAmount { get; set; }
    public decimal TotalPrizes { get; set; }
    public decimal TotalPending { get; set; }

    // Count by status
    public int TotalTickets { get; set; }
    public int WinnerTickets { get; set; }
    public int PendingTickets { get; set; }
    public int LoserTickets { get; set; }
    public int CancelledTickets { get; set; }
}

/// <summary>
/// DTO for ticket creation parameters
/// Based on real Vue.js app: GET /api/v1/tickets/params/create
/// </summary>
public class TicketCreationParamsDto
{
    public BettingPoolParamDto? CurrentBettingPool { get; set; }
    public List<DrawParamDto> AvailableDraws { get; set; } = new();
    public List<BetTypeParamDto> BetTypes { get; set; } = new();
    public List<TicketLimitDto> Limits { get; set; } = new();
    public TicketStatsDto? Stats { get; set; }
}

/// <summary>
/// DTO for betting pool in creation parameters
/// </summary>
public class BettingPoolParamDto
{
    public int BettingPoolId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal DiscountPercentage { get; set; }
    public string DiscountMode { get; set; } = "OFF";
    public decimal? DiscountAmount { get; set; }
    public int? DiscountPerEvery { get; set; }
}

/// <summary>
/// DTO for draw in creation parameters
/// </summary>
public class DrawParamDto
{
    public int DrawId { get; set; }
    public int LotteryId { get; set; }
    public string LotteryName { get; set; } = string.Empty;
    public string? LotteryCode { get; set; }
    public DateTime DrawDate { get; set; }
    public TimeSpan DrawTime { get; set; }
    public DateTime? CutoffTime { get; set; }
    public bool IsActive { get; set; }
    public bool IsClosed { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// DTO for bet type in creation parameters
/// </summary>
public class BetTypeParamDto
{
    public int BetTypeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MinDigits { get; set; }
    public int MaxDigits { get; set; }
    public decimal DefaultMultiplier { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for ticket limits
/// </summary>
public class TicketLimitDto
{
    public int LimitId { get; set; }
    public int? BettingPoolId { get; set; }
    public int? DrawId { get; set; }
    public int? BetTypeId { get; set; }
    public string? BetNumber { get; set; }
    public decimal MaxBetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for ticket statistics
/// </summary>
public class TicketStatsDto
{
    public int TotalTicketsToday { get; set; }
    public decimal TotalSoldInGroup { get; set; }
    public decimal TotalSoldInBettingPool { get; set; }
}

/// <summary>
/// DTO for monitor parameters
/// Based on real Vue.js app: GET /api/v1/tickets/params/index
/// </summary>
public class TicketMonitorParamsDto
{
    public List<BettingPoolParamDto> BettingPools { get; set; } = new();
    public List<DrawParamDto> Lotteries { get; set; } = new();
    public List<BetTypeParamDto> BetTypes { get; set; } = new();
    public List<ZoneParamDto> Zones { get; set; } = new();
}

/// <summary>
/// DTO for zone in monitor parameters
/// </summary>
public class ZoneParamDto
{
    public int ZoneId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public bool IsActive { get; set; }
}
