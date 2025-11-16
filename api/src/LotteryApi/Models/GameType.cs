using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("game_types")]
public class GameType
{
    [Key]
    [Column("game_type_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int GameTypeId { get; set; }

    [Column("category_id")]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("game_type_code")]
    public string GameTypeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("game_name")]
    public string GameName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("prize_multiplier", TypeName = "decimal(10,2)")]
    public decimal PrizeMultiplier { get; set; } = 1.00m;

    [Column("requires_additional_number")]
    public bool RequiresAdditionalNumber { get; set; } = false;

    [Column("number_length")]
    public int NumberLength { get; set; } = 4;

    [Column("display_order")]
    public int? DisplayOrder { get; set; }

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

    // Navigation properties
    [ForeignKey("CategoryId")]
    public virtual GameCategory? Category { get; set; }

    public virtual ICollection<LotteryGameCompatibility> LotteryGameCompatibilities { get; set; } = new List<LotteryGameCompatibility>();
    public virtual ICollection<TicketLine> TicketLines { get; set; } = new List<TicketLine>();
}
