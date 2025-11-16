using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Configuración de premios específica por sorteo y banca
/// </summary>
[Table("draw_prize_configs")]
public class DrawPrizeConfig
{
    [Key]
    [Column("config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ConfigId { get; set; }

    [Required]
    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    [Required]
    [Column("draw_id")]
    public int DrawId { get; set; }

    [Required]
    [Column("prize_type_id")]
    public int PrizeTypeId { get; set; }

    /// <summary>
    /// Alias for PrizeTypeId - used by controllers for backward compatibility
    /// </summary>
    [NotMapped]
    public int PrizeFieldId
    {
        get => PrizeTypeId;
        set => PrizeTypeId = value;
    }

    [Required]
    [Column("custom_value", TypeName = "decimal(10,2)")]
    public decimal CustomValue { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

    [ForeignKey("DrawId")]
    public virtual Draw? Draw { get; set; }

    [ForeignKey("PrizeTypeId")]
    public virtual PrizeType? PrizeType { get; set; }

    /// <summary>
    /// Alias for PrizeType - used by controllers for backward compatibility
    /// </summary>
    [NotMapped]
    public virtual PrizeType? PrizeField
    {
        get => PrizeType;
        set => PrizeType = value;
    }
}
