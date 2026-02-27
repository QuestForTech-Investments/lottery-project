using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("ticket_lines")]
public class TicketLine
{
    [Key]
    [Column("line_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long LineId { get; set; }

    [Column("ticket_id")]
    public long TicketId { get; set; }

    [Column("line_number")]
    public int LineNumber { get; set; }

    // LotteryId se obtiene a través de Draw.LotteryId (no duplicar datos)

    [Column("draw_id")]
    public int DrawId { get; set; }

    [Required]
    [Column("draw_date")]
    public DateTime DrawDate { get; set; }

    [Required]
    [Column("draw_time")]
    public TimeSpan DrawTime { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("bet_number")]
    public string BetNumber { get; set; } = string.Empty;

    [Column("bet_type_id")]
    public int BetTypeId { get; set; }

    [MaxLength(50)]
    [Column("bet_type_code")]
    public string? BetTypeCode { get; set; }

    [Column("position")]
    public int? Position { get; set; }

    [Column("bet_amount", TypeName = "decimal(18,2)")]
    public decimal BetAmount { get; set; }

    [Column("multiplier", TypeName = "decimal(5,2)")]
    public decimal Multiplier { get; set; } = 1.00m;

    [Column("discount_percentage", TypeName = "decimal(5,2)")]
    public decimal DiscountPercentage { get; set; } = 0.00m;

    [Column("discount_amount", TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0.00m;

    [Column("subtotal", TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column("total_with_multiplier", TypeName = "decimal(18,2)")]
    public decimal TotalWithMultiplier { get; set; }

    [Column("commission_percentage", TypeName = "decimal(5,2)")]
    public decimal CommissionPercentage { get; set; } = 0.00m;

    [Column("commission_amount", TypeName = "decimal(18,2)")]
    public decimal CommissionAmount { get; set; } = 0.00m;

    [Column("net_amount", TypeName = "decimal(18,2)")]
    public decimal NetAmount { get; set; }

    [Column("prize_multiplier", TypeName = "decimal(10,2)")]
    public decimal? PrizeMultiplier { get; set; }

    [Column("prize_amount", TypeName = "decimal(18,2)")]
    public decimal PrizeAmount { get; set; } = 0.00m;

    [Column("is_winner")]
    public bool IsWinner { get; set; } = false;

    [Column("winning_position")]
    public int? WinningPosition { get; set; }

    [MaxLength(20)]
    [Column("result_number")]
    public string? ResultNumber { get; set; }

    [Column("result_checked_at")]
    public DateTime? ResultCheckedAt { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("line_status")]
    public string LineStatus { get; set; } = "pending";

    [Column("limit_rule_id")]
    public int? LimitRuleId { get; set; }

    [Column("exceeds_limit")]
    public bool ExceedsLimit { get; set; } = false;

    [Column("limit_override_by")]
    public int? LimitOverrideBy { get; set; }

    [MaxLength(200)]
    [Column("limit_override_reason")]
    public string? LimitOverrideReason { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("is_lucky_pick")]
    public bool IsLuckyPick { get; set; } = false;

    [Column("is_hot_number")]
    public bool IsHotNumber { get; set; } = false;

    [Column("is_out_of_schedule")]
    public bool IsOutOfScheduleSale { get; set; } = false;

    [Column("sequence_number")]
    public int? SequenceNumber { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    [ForeignKey("TicketId")]
    public virtual Ticket? Ticket { get; set; }

    // Lottery se accede a través de Draw.Lottery (no duplicar navegación)

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("BetTypeId")]
    public virtual GameType? BetType { get; set; }

    public virtual ICollection<Prize> Prizes { get; set; } = new List<Prize>();
}
