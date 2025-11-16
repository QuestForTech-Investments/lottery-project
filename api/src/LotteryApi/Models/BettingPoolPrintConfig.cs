using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pool_print_config")]
public class BettingPoolPrintConfig
{
    [Key]
    [Column("print_config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PrintConfigId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [MaxLength(50)]
    [Column("print_mode")]
    public string PrintMode { get; set; } = "DRIVER";

    [Column("print_enabled")]
    public bool PrintEnabled { get; set; } = true;

    [Column("print_ticket_copy")]
    public bool PrintTicketCopy { get; set; } = true;

    [Column("print_recharge_receipt")]
    public bool PrintRechargeReceipt { get; set; } = true;

    [Column("sms_only")]
    public bool SmsOnly { get; set; } = false;

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
