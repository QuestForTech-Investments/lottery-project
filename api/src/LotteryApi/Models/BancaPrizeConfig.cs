using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LotteryApi.Models;

/// <summary>
/// Configuración personalizada de premios por banca
/// </summary>
[Table("banca_prize_configs")]
public class BancaPrizeConfig
{
    [Key]
    [Column("config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ConfigId { get; set; }

    /// <summary>
    /// ID de la banca (betting pool)
    /// </summary>
    [Required]
    [Column("betting_pool_id")]
    public int BettingPoolId { get; set; }

    /// <summary>
    /// ID del tipo de premio
    /// </summary>
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

    /// <summary>
    /// Valor personalizado para este campo en esta banca
    /// </summary>
    [Required]
    [Column("custom_value", TypeName = "decimal(10,2)")]
    public decimal CustomValue { get; set; }

    /// <summary>
    /// Fecha de creación
    /// </summary>
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Fecha de última actualización
    /// </summary>
    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey("BettingPoolId")]
    public virtual BettingPool? BettingPool { get; set; }

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
