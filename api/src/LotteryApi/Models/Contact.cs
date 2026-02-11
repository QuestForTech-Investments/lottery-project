using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("contacts")]
public class Contact
{
    [Key]
    [Column("contact_id")]
    public int ContactId { get; set; }

    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("contact_name")]
    public string ContactName { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("phone")]
    public string? Phone { get; set; }

    [MaxLength(50)]
    [Column("telegram_chat_id")]
    public string? TelegramChatId { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }
}
