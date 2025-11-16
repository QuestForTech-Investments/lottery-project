using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("betting_pools")]
public class BettingPool
{
    [Key]
    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("betting_pool_code")]
    public string BettingPoolCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("betting_pool_name")]
    public string BettingPoolName { get; set; } = string.Empty;

    [Column("zone_id")]
    public int ZoneId { get; set; }

    [Column("bank_id")]
    public int? BankId { get; set; }

    [MaxLength(255)]
    [Column("address")]
    public string? Address { get; set; }

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(255)]
    [Column("location")]
    public string? Location { get; set; }

    [MaxLength(255)]
    [Column("reference")]
    public string? Reference { get; set; }

    [Column("comment", TypeName = "text")]
    public string? Comment { get; set; }

    [MaxLength(100)]
    [Column("username")]
    public string? Username { get; set; }

    [MaxLength(255)]
    [Column("password_hash")]
    public string? PasswordHash { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [Column("deleted_by")]
    public int? DeletedBy { get; set; }

    [MaxLength(500)]
    [Column("deletion_reason")]
    public string? DeletionReason { get; set; }

    // Navigation properties
    [ForeignKey("ZoneId")]
    public virtual Zone? Zone { get; set; }

    [ForeignKey("BankId")]
    public virtual Bank? Bank { get; set; }

    public virtual Balance? Balance { get; set; }
    public virtual BettingPoolConfig? Config { get; set; }
    public virtual BettingPoolPrintConfig? PrintConfig { get; set; }
    public virtual BettingPoolDiscountConfig? DiscountConfig { get; set; }
    public virtual BettingPoolFooter? Footer { get; set; }
    public virtual BettingPoolStyle? Style { get; set; }

    public virtual ICollection<BettingPoolPrizesCommission> PrizesCommissions { get; set; } = new List<BettingPoolPrizesCommission>();
    public virtual ICollection<BettingPoolSchedule> Schedules { get; set; } = new List<BettingPoolSchedule>();
    public virtual ICollection<BettingPoolSortition> Sortitions { get; set; } = new List<BettingPoolSortition>();
    public virtual ICollection<BettingPoolDraw> BettingPoolDraws { get; set; } = new List<BettingPoolDraw>();
    public virtual ICollection<BettingPoolAutomaticExpense> AutomaticExpenses { get; set; } = new List<BettingPoolAutomaticExpense>();
    public virtual ICollection<UserBettingPool> UserBettingPools { get; set; } = new List<UserBettingPool>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
