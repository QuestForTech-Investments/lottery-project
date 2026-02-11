using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("tickets")]
public class Ticket
{
    [Key]
    [Column("ticket_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long TicketId { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("ticket_code")]
    public string TicketCode { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("barcode")]
    public string? Barcode { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [MaxLength(20)]
    [Column("terminal_id")]
    public string? TerminalId { get; set; }

    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("global_multiplier", TypeName = "decimal(5,2)")]
    public decimal GlobalMultiplier { get; set; } = 1.00m;

    [Column("global_discount", TypeName = "decimal(5,2)")]
    public decimal GlobalDiscount { get; set; } = 0.00m;

    [MaxLength(10)]
    [Column("discount_mode")]
    public string DiscountMode { get; set; } = "OFF";

    [MaxLength(3)]
    [Column("currency_code")]
    public string CurrencyCode { get; set; } = "DOP";

    [Column("total_lines")]
    public int TotalLines { get; set; } = 0;

    [Column("total_bet_amount", TypeName = "decimal(18,2)")]
    public decimal TotalBetAmount { get; set; } = 0.00m;

    [Column("total_discount", TypeName = "decimal(18,2)")]
    public decimal TotalDiscount { get; set; } = 0.00m;

    [Column("total_subtotal", TypeName = "decimal(18,2)")]
    public decimal TotalSubtotal { get; set; } = 0.00m;

    [Column("total_with_multiplier", TypeName = "decimal(18,2)")]
    public decimal TotalWithMultiplier { get; set; } = 0.00m;

    [Column("total_commission", TypeName = "decimal(18,2)")]
    public decimal TotalCommission { get; set; } = 0.00m;

    [Column("total_net", TypeName = "decimal(18,2)")]
    public decimal TotalNet { get; set; } = 0.00m;

    [Column("grand_total", TypeName = "decimal(18,2)")]
    public decimal GrandTotal { get; set; } = 0.00m;

    [Column("total_prize", TypeName = "decimal(18,2)")]
    public decimal TotalPrize { get; set; } = 0.00m;

    [Column("winning_lines")]
    public int WinningLines { get; set; } = 0;

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "pending";

    /// <summary>
    /// Estado del ticket según resultados: P=Pending, W=Winner, L=Loser
    /// </summary>
    [MaxLength(1)]
    [Column("ticket_state")]
    public string TicketState { get; set; } = "P";

    [Column("is_cancelled")]
    public bool IsCancelled { get; set; } = false;

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }

    [Column("cancelled_by")]
    public int? CancelledBy { get; set; }

    [MaxLength(200)]
    [Column("cancellation_reason")]
    public string? CancellationReason { get; set; }

    [Column("is_paid")]
    public bool IsPaid { get; set; } = false;

    [Column("paid_at")]
    public DateTime? PaidAt { get; set; }

    [Column("paid_by")]
    public int? PaidBy { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [MaxLength(100)]
    [Column("payment_reference")]
    public string? PaymentReference { get; set; }

    [Column("customer_id")]
    public int? CustomerId { get; set; }

    [MaxLength(100)]
    [Column("customer_name")]
    public string? CustomerName { get; set; }

    [MaxLength(20)]
    [Column("customer_phone")]
    public string? CustomerPhone { get; set; }

    [MaxLength(100)]
    [Column("customer_email")]
    public string? CustomerEmail { get; set; }

    [MaxLength(50)]
    [Column("customer_id_number")]
    public string? CustomerIdNumber { get; set; }

    [MaxLength(500)]
    [Column("lottery_ids")]
    public string? LotteryIds { get; set; }

    [Column("total_lotteries")]
    public int TotalLotteries { get; set; } = 0;

    [Column("earliest_draw_time")]
    public DateTime? EarliestDrawTime { get; set; }

    [Column("latest_draw_time")]
    public DateTime? LatestDrawTime { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("print_count")]
    public int PrintCount { get; set; } = 0;

    [Column("last_printed_at")]
    public DateTime? LastPrintedAt { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    [MaxLength(200)]
    [Column("special_flags")]
    public string? SpecialFlags { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    public virtual ICollection<TicketLine> TicketLines { get; set; } = new List<TicketLine>();
}
