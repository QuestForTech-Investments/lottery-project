using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

[Table("prize_types")]
public class PrizeType
{
    [Key]
    [Column("prize_type_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PrizeTypeId { get; set; }

    /// <summary>
    /// Alias for PrizeTypeId - used by controllers and DTOs for backward compatibility
    /// </summary>
    [NotMapped]
    public int PrizeFieldId
    {
        get => PrizeTypeId;
        set => PrizeTypeId = value;
    }

    [Column("bet_type_id")]
    public int BetTypeId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("field_code")]
    public string FieldCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [Column("field_name")]
    public string FieldName { get; set; } = string.Empty;

    [Column("default_multiplier", TypeName = "decimal(10,2)")]
    public decimal DefaultMultiplier { get; set; } = 0m;

    [Column("min_multiplier", TypeName = "decimal(10,2)")]
    public decimal MinMultiplier { get; set; } = 0m;

    [Column("max_multiplier", TypeName = "decimal(10,2)")]
    public decimal MaxMultiplier { get; set; } = 0m;

    [Column("display_order")]
    public int DisplayOrder { get; set; } = 1;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("BetTypeId")]
    public virtual BetType? BetType { get; set; }
}
