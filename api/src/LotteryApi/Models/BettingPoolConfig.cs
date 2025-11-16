using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_config")]
public class BettingPoolConfig
{
    [Key]
    [Column("config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ConfigId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [MaxLength(50)]
    [Column("fall_type")]
    public string FallType { get; set; } = "OFF";

    [Column("deactivation_balance", TypeName = "decimal(10,2)")]
    public decimal? DeactivationBalance { get; set; }

    [Column("daily_sale_limit", TypeName = "decimal(10,2)")]
    public decimal? DailySaleLimit { get; set; }

    [Column("daily_balance_limit", TypeName = "decimal(10,2)")]
    public decimal? DailyBalanceLimit { get; set; }

    [Column("temporary_additional_balance", TypeName = "decimal(10,2)")]
    public decimal? TemporaryAdditionalBalance { get; set; }

    [Column("enable_temporary_balance")]
    public bool EnableTemporaryBalance { get; set; } = false;

    [Column("credit_limit", TypeName = "decimal(12,2)")]
    public decimal CreditLimit { get; set; } = 0.00m;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("control_winning_tickets")]
    public bool ControlWinningTickets { get; set; } = false;

    [Column("allow_jackpot")]
    public bool AllowJackpot { get; set; } = true;

    [Column("enable_recharges")]
    public bool EnableRecharges { get; set; } = true;

    [Column("allow_password_change")]
    public bool AllowPasswordChange { get; set; } = true;

    [Column("cancel_minutes")]
    public int CancelMinutes { get; set; } = 30;

    [Column("daily_cancel_tickets")]
    public int? DailyCancelTickets { get; set; }

    [Column("max_cancel_amount", TypeName = "decimal(10,2)")]
    public decimal? MaxCancelAmount { get; set; }

    [Column("max_ticket_amount", TypeName = "decimal(10,2)")]
    public decimal? MaxTicketAmount { get; set; }

    [Column("max_daily_recharge", TypeName = "decimal(10,2)")]
    public decimal? MaxDailyRecharge { get; set; }

    [MaxLength(50)]
    [Column("payment_mode")]
    public string PaymentMode { get; set; } = "BANCA";

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
