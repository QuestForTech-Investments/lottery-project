using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("bet_types")]
public class BetType
{
    [Key]
    [Column("bet_type_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int BetTypeId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("bet_type_code")]
    public string BetTypeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("bet_type_name")]
    public string BetTypeName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<PrizeType> PrizeTypes { get; set; } = new List<PrizeType>();
}
